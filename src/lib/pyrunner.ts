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
  testResults: { name: string; passed: boolean; message: string }[];
}

export async function runPythonCode(
  code: string,
  sim: Ros2Sim,
  testCode?: string,
  timeoutMs: number = 15000
): Promise<RunResult> {
  const pyodide = await loadPyodide();
  const allOutput: string[] = [];
  const logs: { level: string; message: string; node?: string }[] = [];

  const unsubLog = sim.onLog((log) => {
    logs.push({ level: log.level, message: log.message, node: log.nodeName });
    const prefix = log.nodeName ? `[${log.level}] [${log.nodeName}]: ` : `[${log.level}]: `;
    allOutput.push(`${prefix}${log.message}`);
  });

  sim.reset();
  sim.init();

  try {
    // Set up stdout capture
    pyodide.runPython(`
import sys
from io import StringIO
_stdout_buffer = StringIO()
_stderr_buffer = StringIO()
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer
`);

    // Inject the ROS2 mock bridge
    const bridgeCode = getBridgeCode();
    pyodide.runPython(bridgeCode);

    // Wrap user code to capture output and handle errors
    const wrappedCode = `
try:
${code.split('\n').map((line: string) => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
`;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timed out (15s limit)')), timeoutMs);
    });

    await Promise.race([
      pyodide.runPythonAsync(wrappedCode),
      timeoutPromise,
    ]);

    // Let the simulation run for a bit to process callbacks
    await new Promise(resolve => setTimeout(resolve, 500));

    // Collect stdout
    const stdout = pyodide.runPython('_stdout_buffer.getvalue()');
    const stderr = pyodide.runPython('_stderr_buffer.getvalue()');

    if (stdout) allOutput.unshift(stdout);
    if (stderr) allOutput.push(stderr);

    // Run test code if provided
    let testResults: { name: string; passed: boolean; message: string }[] = [];
    if (testCode) {
      try {
        // Reset stdout for test code
        pyodide.runPython('_stdout_buffer = StringIO(); sys.stdout = _stdout_buffer');
        pyodide.runPython(testCode);
        const resultsJson = pyodide.runPython('_test_results_json');
        if (resultsJson) {
          testResults = JSON.parse(resultsJson);
        }
      } catch (testErr: any) {
        testResults = [{ name: 'Test execution', passed: false, message: String(testErr) }];
      }
    }

    // Also check logs for test validation
    if (testResults.length === 0 && logs.length > 0) {
      const fullLogOutput = logs.map(l => {
        const prefix = l.node ? `[${l.level}] [${l.node}]: ` : `[${l.level}]: `;
        return `${prefix}${l.message}`;
      }).join('\n');

      // Simple heuristic: if the code ran without errors and produced log output, mark as passed
      const hasErrors = logs.some(l => l.level === 'ERROR');
      if (!hasErrors && fullLogOutput.length > 0) {
        testResults = [{ name: 'Code execution', passed: true, message: 'Code ran successfully and produced output' }];
      } else if (hasErrors) {
        testResults = [{ name: 'Code execution', passed: false, message: 'Code produced errors during execution' }];
      }
    }

    return {
      success: !stderr,
      output: allOutput.join('\n'),
      error: stderr || null,
      testResults,
    };
  } catch (err: any) {
    const errMsg = String(err);
    allOutput.push(`\nTraceback (most recent call last):`);
    allOutput.push(errMsg);
    return {
      success: false,
      output: allOutput.join('\n'),
      error: errMsg,
      testResults: [{ name: 'Code execution', passed: false, message: errMsg }],
    };
  } finally {
    // Reset stdout
    try {
      pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
    } catch {}
    unsubLog();
    sim.shutdown();
  }
}

function getBridgeCode(): string {
  return `
import json

# ---- ROS2 Mock Bridge ----
# This provides a simplified rclpy-like API that maps to the JavaScript simulator

class _Vector3:
    def __init__(self, x=0.0, y=0.0, z=0.0):
        self.x = float(x)
        self.y = float(y)
        self.z = float(z)
    def __repr__(self):
        return f"Vector3(x={self.x}, y={self.y}, z={self.z})"

class Twist:
    def __init__(self):
        self.linear = _Vector3()
        self.angular = _Vector3()
    def __repr__(self):
        return f"Twist(linear={self.linear}, angular={self.angular})"

class Pose:
    def __init__(self, x=0.0, y=0.0, theta=0.0, linear_velocity=0.0, angular_velocity=0.0):
        self.x = float(x)
        self.y = float(y)
        self.theta = float(theta)
        self.linear_velocity = float(linear_velocity)
        self.angular_velocity = float(angular_velocity)

class String:
    def __init__(self, data=''):
        self.data = str(data)

class Int32:
    def __init__(self, data=0):
        self.data = int(data)

class Float32:
    def __init__(self, data=0.0):
        self.data = float(data)

class Bool:
    def __init__(self, data=False):
        self.data = bool(data)

class _SimLogger:
    def __init__(self, node_name):
        self._node_name = node_name
    def info(self, msg):
        print(f"[INFO] [{self._node_name}]: {msg}")
    def warn(self, msg):
        print(f"[WARN] [{self._node_name}]: {msg}")
    def error(self, msg):
        print(f"[ERROR] [{self._node_name}]: {msg}")
    def debug(self, msg):
        print(f"[DEBUG] [{self._node_name}]: {msg}")

class _SimPublisher:
    def __init__(self, node_name, msg_type, topic, qos=10):
        self._node_name = node_name
        self._msg_type = msg_type
        self.topic_name = topic
        self._qos = qos

    def publish(self, msg):
        data = {}
        if hasattr(msg, '__dict__'):
            for k, v in msg.__dict__.items():
                if not k.startswith('_'):
                    if hasattr(v, '__dict__') and not isinstance(v, (int, float, str, bool)):
                        data[k] = {kk: vv for kk, vv in v.__dict__.items() if not kk.startswith('_')}
                    else:
                        data[k] = v
        elif isinstance(msg, dict):
            data = msg
        else:
            data = {'value': str(msg)}
        print(f"[PUB] {self.topic_name}: {data}")

class _SimSubscriber:
    def __init__(self, node_name, msg_type, topic, callback, qos=10):
        self._node_name = node_name
        self._msg_type = msg_type
        self.topic_name = topic
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
        self.type_ = type(value).__name__

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

class Node:
    def __init__(self, name):
        self._name = name
        self._timers = []
        self._params = {}
        self._logger = _SimLogger(name)
        print(f"[INFO] [ros2sim]: Node '{name}' created")

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
        # Simulate a few timer ticks
        for _ in range(3):
            if timer._running:
                try:
                    callback()
                except Exception as e:
                    print(f"[ERROR] [{self._name}]: Timer callback error: {e}")
        return timer

    def declare_parameter(self, name, value):
        self._params[name] = value
        return _SimParameter(name, value)

    def get_parameter(self, name):
        if name in self._params:
            return _SimParameter(name, self._params[name])
        raise KeyError(f"Parameter '{name}' not declared")

    def get_logger(self):
        return self._logger

    def destroy_node(self):
        print(f"[INFO] [ros2sim]: Node '{self._name}' destroyed")

class _RclpyBridge:
    def init(self, args=None):
        print("[INFO] [ros2sim]: rclpy initialized")
        pass

    def shutdown(self):
        print("[INFO] [ros2sim]: rclpy shut down")
        pass

    def spin(self, node):
        # Simulate a few timer ticks for the spin
        for timer in node._timers:
            for _ in range(5):
                if timer._running:
                    try:
                        timer.callback()
                    except Exception as e:
                        print(f"[ERROR] [{node.name}]: Timer error: {e}")

    def spin_once(self, node, timeout_sec=0.1):
        for timer in node._timers:
            if timer._running:
                try:
                    timer.callback()
                except Exception as e:
                    print(f"[ERROR] [{node.name}]: Timer error: {e}")

    def spin_until_future_complete(self, node, future, timeout_sec=5.0):
        pass

rclpy = _RclpyBridge()

# Make message types available at module level
class _GeometryMsgs:
    class msg:
        Twist = Twist

class _TurtlesimMsgs:
    class msg:
        Pose = Pose

class _StdMsgs:
    class msg:
        String = String
        Int32 = Int32
        Float32 = Float32
        Bool = Bool

class _ExampleInterfaces:
    class srv:
        pass

geometry_msgs = _GeometryMsgs()
turtlesim = _TurtlesimMsgs()
std_msgs = _StdMsgs()
example_interfaces = _ExampleInterfaces()

# Test result helper
_test_results = []
_test_results_json = ""

def _check_test(name, condition, message=""):
    global _test_results
    _test_results.append({
        "name": name,
        "passed": bool(condition),
        "message": message if message else ("Passed" if condition else "Failed")
    })
    _test_results_json = json.dumps(_test_results)
`;
}
