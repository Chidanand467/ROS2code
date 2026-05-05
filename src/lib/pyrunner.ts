import { globalSim, type Ros2Sim } from './ros2sim';

let pyodideInstance: any = null;
let loading = false;
let loadPromise: Promise<any> | null = null;

export async function loadPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (loadPromise) return loadPromise;

  loading = true;
  loadPromise = (async () => {
    try {
      const pyodideModule = await import('pyodide');
      const pyodide = await pyodideModule.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      });
      pyodideInstance = pyodide;
      loading = false;
      return pyodide;
    } catch (e) {
      loading = false;
      loadPromise = null;
      throw e;
    }
  })();

  return loadPromise;
}

export function isPyodideLoading(): boolean {
  return loading;
}

export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}

export interface RunResult {
  success: boolean;
  output: string;
  error: string | null;
  logs: { level: string; message: string; node?: string }[];
  testResults: { name: string; passed: boolean; message: string }[];
}

export async function runPythonCode(
  code: string,
  sim: Ros2Sim,
  testCode?: string,
  timeoutMs: number = 15000
): Promise<RunResult> {
  const pyodide = await loadPyodide();
  const logs: { level: string; message: string; node?: string }[] = [];
  let output = '';

  const unsubLog = sim.onLog((log) => {
    logs.push({ level: log.level, message: log.message, node: log.nodeName });
  });

  sim.reset();
  sim.init();

  try {
    const bridgeCode = buildBridgeCode(sim);

    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

    pyodide.runPython(bridgeCode);

    const wrappedCode = `
${code}

sys.stdout.seek(0)
_stdout = sys.stdout.read()
sys.stdout = sys.__stdout__
_stderr_capture = sys.stderr.getvalue()
`;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timed out')), timeoutMs);
    });

    await Promise.race([
      pyodide.runPythonAsync(wrappedCode),
      timeoutPromise,
    ]);

    output = pyodide.globals.get('_stdout') || '';
    const stderr = pyodide.globals.get('_stderr_capture') || '';

    let testResults: { name: string; passed: boolean; message: string }[] = [];
    if (testCode) {
      try {
        pyodide.runPython(testCode);
        const resultsJson = pyodide.globals.get('_test_results');
        if (resultsJson) {
          testResults = JSON.parse(resultsJson);
        }
      } catch (testErr: any) {
        testResults = [{ name: 'Test execution', passed: false, message: String(testErr) }];
      }
    }

    return {
      success: !stderr,
      output: output + (stderr ? '\n' + stderr : ''),
      error: stderr || null,
      logs,
      testResults,
    };
  } catch (err: any) {
    const errMsg = String(err);
    return {
      success: false,
      output,
      error: errMsg,
      logs,
      testResults: [],
    };
  } finally {
    unsubLog();
    sim.shutdown();
  }
}

function buildBridgeCode(sim: Ros2Sim): string {
  return `
import json

class _Ros2SimBridge:
    def __init__(self):
        self._nodes = []

    def init(self, args=None):
        pass

    def create_node(self, name):
        node = _SimNode(name, self)
        self._nodes.append(node)
        return node

    def shutdown(self):
        pass

    def spin(self, node):
        import time
        time.sleep(0.1)

    def spin_once(self, node, timeout_sec=0.1):
        import time
        time.sleep(timeout_sec)

    def spin_until_future_complete(self, node, future, timeout_sec=5.0):
        import time
        time.sleep(0.1)
        return future

class _SimNode:
    def __init__(self, name, bridge):
        self._name = name
        self._bridge = bridge
        self._timers = []
        self._params = {}

    @property
    def name(self):
        return self._name

    def create_publisher(self, msg_type, topic, qos=10):
        return _SimPublisher(self._name, msg_type, topic, qos)

    def create_subscription(self, msg_type, topic, callback, qos=10):
        return _SimSubscriber(self._name, msg_type, topic, callback, qos)

    def create_service(self, srv_type, name, callback):
        return _SimServiceServer(self._name, srv_type, name, callback)

    def create_client(self, srv_type, name):
        return _SimServiceClient(self._name, srv_type, name)

    def create_action_server(self, action_type, name, callback):
        return _SimActionServer(self._name, action_type, name, callback)

    def create_action_client(self, action_type, name):
        return _SimActionClient(self._name, action_type, name)

    def create_timer(self, period, callback):
        timer = _SimTimer(period, callback)
        self._timers.append(timer)
        return timer

    def declare_parameter(self, name, value):
        self._params[name] = value
        return _SimParameter(name, value)

    def get_parameter(self, name):
        if name in self._params:
            return _SimParameter(name, self._params[name])
        raise KeyError(f"Parameter '{name}' not declared")

    def get_logger(self):
        return _SimLogger(self._name)

    def destroy_node(self):
        pass

class _SimPublisher:
    def __init__(self, node_name, msg_type, topic, qos):
        self._node_name = node_name
        self._msg_type = msg_type
        self.topic = topic
        self._qos = qos

    def publish(self, msg):
        data = {}
        if hasattr(msg, '__dict__'):
            for k, v in msg.__dict__.items():
                if not k.startswith('_'):
                    data[k] = v
        elif isinstance(msg, dict):
            data = msg
        else:
            data = {'value': str(msg)}
        from js import globalSim
        globalSim.publish(self.topic, str(self._msg_type), data)

class _SimSubscriber:
    def __init__(self, node_name, msg_type, topic, callback, qos):
        self._node_name = node_name
        self._msg_type = msg_type
        self.topic = topic
        self.callback = callback
        self._qos = qos

class _SimServiceServer:
    def __init__(self, node_name, srv_type, name, callback):
        self._node_name = node_name
        self._srv_type = srv_type
        self.name = name
        self.callback = callback

class _SimServiceClient:
    def __init__(self, node_name, srv_type, name):
        self._node_name = node_name
        self._srv_type = srv_type
        self.name = name

    def call_async(self, request):
        return _SimFuture(self.name, request)

class _SimActionServer:
    def __init__(self, node_name, action_type, name, callback):
        self._node_name = node_name
        self._action_type = action_type
        self.name = name
        self.callback = callback

class _SimActionClient:
    def __init__(self, node_name, action_type, name):
        self._node_name = node_name
        self._action_type = action_type
        self.name = name

    def send_goal_async(self, goal):
        return _SimActionFuture(self.name, goal)

class _SimTimer:
    def __init__(self, period, callback):
        self.period = period
        self.callback = callback
        self._running = True

    def cancel(self):
        self._running = False

class _SimParameter:
    def __init__(self, name, value):
        self.name = name
        self.value = value
        self.type = type(value).__name__

class _SimLogger:
    def __init__(self, node_name):
        self._node_name = node_name

    def info(self, msg):
        print(f'[INFO] [{self._node_name}]: {msg}')

    def warn(self, msg):
        print(f'[WARN] [{self._node_name}]: {msg}')

    def error(self, msg):
        print(f'[ERROR] [{self._node_name}]: {msg}')

    def debug(self, msg):
        print(f'[DEBUG] [{self._node_name}]: {msg}')

class _SimFuture:
    def __init__(self, service_name, request):
        self._service_name = service_name
        self._request = request
        self._result = None
        self._done = False

    def result(self):
        return self._result

    def done(self):
        return self._done

class _SimActionFuture:
    def __init__(self, action_name, goal):
        self._action_name = action_name
        self._goal = goal
        self._result = None
        self._done = False

    def result(self):
        return self._result

    def done(self):
        return self._done

# Mock message types
class Twist:
    def __init__(self):
        self.linear = _Vector3()
        self.angular = _Vector3()

class Pose:
    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.theta = 0.0
        self.linear_velocity = 0.0
        self.angular_velocity = 0.0

class _Vector3:
    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0

class String:
    def __init__(self, data=''):
        self.data = data

class Int32:
    def __init__(self, data=0):
        self.data = data

class Float32:
    def __init__(self, data=0.0):
        self.data = data

class Bool:
    def __init__(self, data=False):
        self.data = data

# Make rclpy available
rclpy = _Ros2SimBridge()

# Make message types available at module level
geometry_msgs = type('geometry_msgs', (), {'msg': type('msg', (), {'Twist': Twist})})()
turtlesim = type('turtlesim', (), {'msg': type('msg', (), {'Pose': Pose})})()
std_msgs = type('std_msgs', (), {'msg': type('msg', (), {'String': String, 'Int32': Int32, 'Float32': Float32, 'Bool': Bool})})()
example_interfaces = type('example_interfaces', (), {'srv': type('srv', (), {})})()
`;
}
