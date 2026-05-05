import { type Ros2Sim } from './ros2sim';

let pyodideInstance: any = null;
let loading = false;
let loadPromise: Promise<any> | null = null;
let bridgeInjected = false;

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

export interface ReplResult {
  output: string;
  error: boolean;
}

function getBridgeCode(): string {
  return `
import json, sys
from io import StringIO

# ---- ROS2 Mock Bridge for REPL ----

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

    def create_timer(self, period, callback):
        timer = _SimTimer(period, callback)
        self._timers.append(timer)
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

# Convenience aliases
from rclpy.node import Node as _NodeAlias

# Auto-import helpers
_repl_nodes = {}

def _repl_help():
    print("""Available ROS2 REPL commands:
  Node('name')              Create a ROS2 node
  rclpy.init()              Initialize rclpy
  rclpy.shutdown()          Shutdown rclpy
  rclpy.spin(node)          Spin a node (runs timers)

Message types:
  Twist()                    Velocity command (linear.x, angular.z)
  Pose()                     Position (x, y, theta)

Quick start:
  rclpy.init()
  node = Node('my_node')
  pub = node.create_publisher(Twist, '/turtle1/cmd_vel', 10)
  msg = Twist()
  msg.linear.x = 2.0
  pub.publish(msg)
""")
`;
}

export class PyRepl {
  private ready = false;

  async start(): Promise<void> {
    const pyodide = await loadPyodide();
    if (!bridgeInjected) {
      pyodide.runPython(getBridgeCode());
      bridgeInjected = true;
    }
    this.ready = true;
  }

  async execute(code: string): Promise<ReplResult> {
    if (!this.ready) await this.start();
    const pyodide = pyodideInstance!;

    // Set up capture
    pyodide.runPython(`
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

    let hasError = false;
    try {
      // Try exec first (for statements)
      pyodide.runPython(`
try:
    exec(${JSON.stringify(code)})
except SyntaxError:
    # Might be an expression, try eval
    try:
        _result = eval(${JSON.stringify(code)})
        if _result is not None:
            print(repr(_result))
    except Exception as _e:
        print(f"Error: {_e}", file=sys.stderr)
except Exception as _e:
    print(f"Error: {_e}", file=sys.stderr)
`);
    } catch (err: any) {
      hasError = true;
    }

    const stdout = pyodide.runPython('_stdout_capture.getvalue()');
    const stderr = pyodide.runPython('_stderr_capture.getvalue()');

    // Reset stdout
    try {
      pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
    } catch {}

    if (stderr) hasError = true;

    return {
      output: (stdout || '') + (stderr ? '\n' + stderr : ''),
      error: hasError,
    };
  }

  async executeBlock(code: string): Promise<ReplResult> {
    if (!this.ready) await this.start();
    const pyodide = pyodideInstance!;

    pyodide.runPython(`
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

    let hasError = false;
    try {
      await pyodide.runPythonAsync(code);
    } catch (err: any) {
      hasError = true;
      pyodide.runPython(`
try:
    print(f"${String(err).replace(/"/g, '\\"').replace(/\n/g, '\\n')}", file=sys.stderr)
except:
    pass
`);
    }

    const stdout = pyodide.runPython('_stdout_capture.getvalue()');
    const stderr = pyodide.runPython('_stderr_capture.getvalue()');

    try {
      pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
    } catch {}

    if (stderr) hasError = true;

    return {
      output: (stdout || '') + (stderr ? '\n' + stderr : ''),
      error: hasError,
    };
  }

  reset(): void {
    if (!pyodideInstance) return;
    try {
      pyodideInstance.runPython(`
# Reset all user variables but keep the bridge
for _name in list(globals().keys()):
    if not _name.startswith('_') and _name not in ('rclpy', 'Node', 'Twist', 'Pose', 'String', 'Int32', 'Float32', 'Bool', 'geometry_msgs', 'turtlesim', 'std_msgs', 'example_interfaces', 'json', 'sys', 'StringIO'):
        del globals()[_name]
print("[INFO] [ros2sim]: REPL session reset")
`);
    } catch {}
  }

  isReady(): boolean {
    return this.ready;
  }
}

export const globalRepl = new PyRepl();
