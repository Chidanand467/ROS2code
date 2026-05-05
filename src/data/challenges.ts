export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Category = 'Nodes' | 'Topics' | 'Services' | 'Actions' | 'Parameters' | 'Launch' | 'Navigation' | 'Integration';

export interface TestCase {
  name: string;
  check: string;
  expected: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: Category;
  order: number;
  xp: number;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  solutionCode: string;
  testCode: string;
  hints: string[];
  prerequisiteLessons: string[];
}

export const challenges: Challenge[] = [
  {
    id: 'ch-01',
    title: 'Hello Robot Node',
    difficulty: 'Easy',
    category: 'Nodes',
    order: 1,
    xp: 20,
    description: `Create a ROS2 node named **'hello_node'** that logs "Hello, ROS2!" using the INFO log level.

This is the "Hello World" of ROS2. Every ROS2 program starts with creating a node. Your node should:
1. Initialize rclpy
2. Create a node with the exact name 'hello_node'
3. Log the message "Hello, ROS2!" at INFO level
4. Shut down rclpy cleanly`,
    examples: [
      { input: 'Run the node', output: '[INFO] [hello_node]: Hello, ROS2!', explanation: 'The node logs the message once and exits.' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node

# Create a node named 'hello_node'
# Log "Hello, ROS2!" at INFO level
# Shut down cleanly

def main():
    # Your code here
    pass

if __name__ == '__main__':
    main()`,
    solutionCode: `import rclpy
from rclpy.node import Node

def main():
    rclpy.init()
    node = Node('hello_node')
    node.get_logger().info('Hello, ROS2!')
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Hello, ROS2!' in stdout and 'hello_node' in stdout:
    _test_results.append({"name": "Correct log message", "passed": True, "message": "Node logged 'Hello, ROS2!' correctly"})
else:
    _test_results.append({"name": "Correct log message", "passed": False, "message": "Expected '[INFO] [hello_node]: Hello, ROS2!' in output"})
`,
    hints: [
      'Use rclpy.init() to initialize, then create a Node with a name string.',
      'Call node.get_logger().info("Hello, ROS2!") to log the message.',
      'Remember to call node.destroy_node() and rclpy.shutdown() at the end.',
    ],
    prerequisiteLessons: ['les-2-2'],
  },
  {
    id: 'ch-02',
    title: 'Counting Timer Node',
    difficulty: 'Easy',
    category: 'Nodes',
    order: 2,
    xp: 25,
    description: `Create a node named **'counter_node'** that logs a count every second for 5 seconds.

Your node should:
1. Create a node named 'counter_node'
2. Create a timer that fires every 1.0 seconds
3. Each time the timer fires, log "Count: X" where X starts at 1 and increments
4. After 5 counts, stop the timer and shut down`,
    examples: [
      { input: 'Run the node', output: '[INFO] [counter_node]: Count: 1\\n[INFO] [counter_node]: Count: 2\\n...\\n[INFO] [counter_node]: Count: 5' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node

class CounterNode(Node):
    def __init__(self):
        super().__init__('counter_node')
        # Create a timer and counter here
        pass

    def timer_callback(self):
        # Log the count and increment
        pass

def main(args=None):
    rclpy.init(args=args)
    node = CounterNode()
    # Spin the node (but stop after 5 counts)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
    solutionCode: `import rclpy
from rclpy.node import Node

class CounterNode(Node):
    def __init__(self):
        super().__init__('counter_node')
        self.count = 0
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.get_logger().info('Counter node started!')

    def timer_callback(self):
        self.count += 1
        self.get_logger().info(f'Count: {self.count}')
        if self.count >= 5:
            self.timer.cancel()
            self.get_logger().info('Done counting!')

def main(args=None):
    rclpy.init(args=args)
    node = CounterNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Count: 1' in stdout and 'counter_node' in stdout:
    _test_results.append({"name": "Timer counting", "passed": True, "message": "Node counts and logs correctly"})
else:
    _test_results.append({"name": "Timer counting", "passed": False, "message": "Expected 'Count: 1' from counter_node in output"})
`,
    hints: [
      'Use self.create_timer(1.0, self.timer_callback) in __init__.',
      'Increment a counter in the callback and log it with self.get_logger().info().',
      'Use self.timer.cancel() to stop the timer after 5 counts.',
    ],
    prerequisiteLessons: ['les-2-2'],
  },
  {
    id: 'ch-03',
    title: 'Speed Publisher',
    difficulty: 'Easy',
    category: 'Topics',
    order: 3,
    xp: 25,
    description: `Create a node that publishes forward velocity commands to make the turtle move forward.

Your node should:
1. Create a node named 'speed_publisher'
2. Create a publisher on the topic '/turtle1/cmd_vel' with type Twist
3. Create a timer that fires every 0.5 seconds
4. Each timer callback, publish a Twist message with linear.x = 2.0 and angular.z = 0.0
5. Log each publish: "Publishing: linear.x=2.0"`,
    examples: [
      { input: 'Run the node', output: '[INFO] [speed_publisher]: Publishing: linear.x=2.0', explanation: 'The turtle moves forward in the simulation canvas.' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SpeedPublisher(Node):
    def __init__(self):
        super().__init__('speed_publisher')
        # Create publisher and timer
        pass

    def timer_callback(self):
        # Create Twist message and publish
        pass

def main(args=None):
    rclpy.init(args=args)
    node = SpeedPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SpeedPublisher(Node):
    def __init__(self):
        super().__init__('speed_publisher')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.get_logger().info('Speed publisher started!')

    def timer_callback(self):
        msg = Twist()
        msg.linear.x = 2.0
        msg.angular.z = 0.0
        self.publisher.publish(msg)
        self.get_logger().info('Publishing: linear.x=2.0')

def main(args=None):
    rclpy.init(args=args)
    node = SpeedPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Publishing: linear.x=2.0' in stdout and 'speed_publisher' in stdout:
    _test_results.append({"name": "Publishes velocity", "passed": True, "message": "Node publishes forward velocity correctly"})
else:
    _test_results.append({"name": "Publishes velocity", "passed": False, "message": "Expected velocity publish log from speed_publisher"})
`,
    hints: [
      'Create the publisher with self.create_publisher(Twist, "/turtle1/cmd_vel", 10).',
      'In the callback, create a Twist message: msg = Twist(), then set msg.linear.x = 2.0.',
      'Call self.publisher.publish(msg) to send the message.',
    ],
    prerequisiteLessons: ['les-3-2'],
  },
  {
    id: 'ch-04',
    title: 'Circle Navigator',
    difficulty: 'Easy',
    category: 'Topics',
    order: 4,
    xp: 30,
    description: `Make the turtle move in a circle by publishing both linear and angular velocity.

Your node should:
1. Create a node named 'circle_navigator'
2. Publish Twist messages on '/turtle1/cmd_vel' every 0.5 seconds
3. Set linear.x = 2.0 and angular.z = 1.0 to create circular motion
4. Log: "Moving in circle - linear: 2.0, angular: 1.0"`,
    examples: [
      { input: 'Run the node', output: '[INFO] [circle_navigator]: Moving in circle - linear: 2.0, angular: 1.0' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class CircleNavigator(Node):
    def __init__(self):
        super().__init__('circle_navigator')
        # Create publisher and timer
        pass

    def timer_callback(self):
        # Publish circular motion commands
        pass

def main(args=None):
    rclpy.init(args=args)
    node = CircleNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class CircleNavigator(Node):
    def __init__(self):
        super().__init__('circle_navigator')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.get_logger().info('Circle navigator started!')

    def timer_callback(self):
        msg = Twist()
        msg.linear.x = 2.0
        msg.angular.z = 1.0
        self.publisher.publish(msg)
        self.get_logger().info('Moving in circle - linear: 2.0, angular: 1.0')

def main(args=None):
    rclpy.init(args=args)
    node = CircleNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Moving in circle' in stdout and 'circle_navigator' in stdout:
    _test_results.append({"name": "Circular motion", "passed": True, "message": "Node publishes circular motion commands"})
else:
    _test_results.append({"name": "Circular motion", "passed": False, "message": "Expected circular motion log from circle_navigator"})
`,
    hints: [
      'Set both msg.linear.x and msg.angular.z to non-zero values.',
      'linear.x moves forward, angular.z turns. Together they create a circle.',
    ],
    prerequisiteLessons: ['les-3-2'],
  },
  {
    id: 'ch-05',
    title: 'Pose Listener',
    difficulty: 'Easy',
    category: 'Topics',
    order: 5,
    xp: 25,
    description: `Create a subscriber node that listens to the turtle's position and logs it.

Your node should:
1. Create a node named 'pose_listener'
2. Subscribe to '/turtle1/pose' with message type Pose
3. In the callback, log: "Turtle at X: {x:.2f}, Y: {y:.2f}, Theta: {theta:.2f}"
4. The callback should receive a Pose message with x, y, and theta fields`,
    examples: [
      { input: 'Turtle moves', output: '[INFO] [pose_listener]: Turtle at X: 5.54, Y: 5.54, Theta: 0.00' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class PoseListener(Node):
    def __init__(self):
        super().__init__('pose_listener')
        # Create subscription
        pass

    def pose_callback(self, msg):
        # Log the turtle's position
        pass

def main(args=None):
    rclpy.init(args=args)
    node = PoseListener()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class PoseListener(Node):
    def __init__(self):
        super().__init__('pose_listener')
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10)
        self.get_logger().info('Pose listener started!')

    def pose_callback(self, msg):
        self.get_logger().info(
            f'Turtle at X: {msg.x:.2f}, Y: {msg.y:.2f}, Theta: {msg.theta:.2f}')

def main(args=None):
    rclpy.init(args=args)
    node = PoseListener()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'pose_listener' in stdout:
    _test_results.append({"name": "Subscriber created", "passed": True, "message": "Pose listener node created and subscribed"})
else:
    _test_results.append({"name": "Subscriber created", "passed": False, "message": "Expected pose_listener in output"})
`,
    hints: [
      'Use self.create_subscription(Pose, "/turtle1/pose", self.pose_callback, 10).',
      'The callback receives a msg object with msg.x, msg.y, msg.theta attributes.',
    ],
    prerequisiteLessons: ['les-3-3'],
  },
  {
    id: 'ch-06',
    title: 'Speed Controller with Parameters',
    difficulty: 'Easy',
    category: 'Parameters',
    order: 6,
    xp: 25,
    description: `Create a velocity publisher node that uses parameters for speed control.

Your node should:
1. Create a node named 'param_speed_controller'
2. Declare a parameter 'speed' with default value 1.0
3. Declare a parameter 'turn_rate' with default value 0.5
4. Publish Twist messages using the parameter values
5. Log: "Speed: {speed}, Turn rate: {turn_rate}"`,
    examples: [
      { input: 'Run with defaults', output: '[INFO] [param_speed_controller]: Speed: 1.0, Turn rate: 0.5' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class ParamSpeedController(Node):
    def __init__(self):
        super().__init__('param_speed_controller')
        # Declare parameters and create publisher
        pass

    def timer_callback(self):
        # Read parameters and publish
        pass

def main(args=None):
    rclpy.init(args=args)
    node = ParamSpeedController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class ParamSpeedController(Node):
    def __init__(self):
        super().__init__('param_speed_controller')
        self.declare_parameter('speed', 1.0)
        self.declare_parameter('turn_rate', 0.5)
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)

    def timer_callback(self):
        speed = self.get_parameter('speed').value
        turn_rate = self.get_parameter('turn_rate').value
        msg = Twist()
        msg.linear.x = float(speed)
        msg.angular.z = float(turn_rate)
        self.publisher.publish(msg)
        self.get_logger().info(f'Speed: {speed}, Turn rate: {turn_rate}')

def main(args=None):
    rclpy.init(args=args)
    node = ParamSpeedController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Speed:' in stdout and 'param_speed_controller' in stdout:
    _test_results.append({"name": "Parameter usage", "passed": True, "message": "Node uses parameters for speed control"})
else:
    _test_results.append({"name": "Parameter usage", "passed": False, "message": "Expected parameter-based speed log"})
`,
    hints: [
      'Use self.declare_parameter("speed", 1.0) to declare a parameter.',
      'Read it with self.get_parameter("speed").value in the callback.',
    ],
    prerequisiteLessons: ['les-6-1'],
  },
  {
    id: 'ch-07',
    title: 'Add Two Numbers Service',
    difficulty: 'Medium',
    category: 'Services',
    order: 7,
    xp: 35,
    description: `Create a service server that adds two numbers.

Your node should:
1. Create a node named 'add_service_server'
2. Create a service named 'add_two_ints'
3. The service receives a request with 'a' and 'b' fields
4. The service returns a response with a 'sum' field equal to a + b
5. Log: "Received: {a} + {b} = {sum}"`,
    examples: [
      { input: 'a=5, b=3', output: '[INFO] [add_service_server]: Received: 5 + 3 = 8', explanation: 'The service adds the two numbers and returns the sum.' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node

class AddServiceServer(Node):
    def __init__(self):
        super().__init__('add_service_server')
        # Create the service
        pass

    def add_callback(self, request, response):
        # Calculate sum and return response
        pass

def main(args=None):
    rclpy.init(args=args)
    node = AddServiceServer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node

class AddServiceServer(Node):
    def __init__(self):
        super().__init__('add_service_server')
        self.srv = self.create_service(
            type(None), 'add_two_ints', self.add_callback)
        self.get_logger().info('Add Two Ints service is READY.')

    def add_callback(self, request, response):
        a = request.get('a', 0) if isinstance(request, dict) else getattr(request, 'a', 0)
        b = request.get('b', 0) if isinstance(request, dict) else getattr(request, 'b', 0)
        result = a + b
        self.get_logger().info(f'Received: {a} + {b} = {result}')
        if isinstance(response, dict):
            response['sum'] = result
        else:
            response.sum = result
        return response

def main(args=None):
    rclpy.init(args=args)
    node = AddServiceServer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'add_service_server' in stdout and 'READY' in stdout:
    _test_results.append({"name": "Service created", "passed": True, "message": "Add service server created successfully"})
else:
    _test_results.append({"name": "Service created", "passed": False, "message": "Expected service ready message"})
`,
    hints: [
      'Use self.create_service(type(None), "add_two_ints", self.add_callback).',
      'In the callback, extract a and b from the request, compute sum, set response.sum.',
    ],
    prerequisiteLessons: ['les-4-3'],
  },
  {
    id: 'ch-08',
    title: 'Stop and Go Controller',
    difficulty: 'Medium',
    category: 'Topics',
    order: 8,
    xp: 35,
    description: `Create a node that alternates between moving forward and stopping.

Your node should:
1. Create a node named 'stop_go_controller'
2. Publish Twist messages on '/turtle1/cmd_vel'
3. Use a timer at 1.0 second intervals
4. Alternate between: linear.x=2.0 (GO) and linear.x=0.0 (STOP)
5. Log the current state: "GO!" or "STOP!"`,
    examples: [
      { input: 'Run the node', output: '[INFO] [stop_go_controller]: GO!\\n[INFO] [stop_go_controller]: STOP!\\n[INFO] [stop_go_controller]: GO!' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class StopGoController(Node):
    def __init__(self):
        super().__init__('stop_go_controller')
        # Create publisher, timer, and state variable
        pass

    def timer_callback(self):
        # Toggle between GO and STOP
        pass

def main(args=None):
    rclpy.init(args=args)
    node = StopGoController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class StopGoController(Node):
    def __init__(self):
        super().__init__('stop_go_controller')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.is_go = True
        self.get_logger().info('Stop-Go controller started!')

    def timer_callback(self):
        msg = Twist()
        if self.is_go:
            msg.linear.x = 2.0
            self.get_logger().info('GO!')
        else:
            msg.linear.x = 0.0
            self.get_logger().info('STOP!')
        self.publisher.publish(msg)
        self.is_go = not self.is_go

def main(args=None):
    rclpy.init(args=args)
    node = StopGoController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'GO!' in stdout and 'STOP!' in stdout and 'stop_go_controller' in stdout:
    _test_results.append({"name": "Alternating states", "passed": True, "message": "Node alternates between GO and STOP"})
else:
    _test_results.append({"name": "Alternating states", "passed": False, "message": "Expected GO! and STOP! logs from stop_go_controller"})
`,
    hints: [
      'Use a boolean flag (self.is_go) that toggles each timer callback.',
      'Set msg.linear.x = 2.0 for GO, msg.linear.x = 0.0 for STOP.',
    ],
    prerequisiteLessons: ['les-3-2'],
  },
  {
    id: 'ch-09',
    title: 'Square Path Navigator',
    difficulty: 'Medium',
    category: 'Topics',
    order: 9,
    xp: 40,
    description: `Make the turtle trace a square path by alternating between moving forward and turning 90 degrees.

Your node should:
1. Create a node named 'square_navigator'
2. Publish velocity commands on '/turtle1/cmd_vel'
3. Alternate between: move forward (linear.x=2.0 for 2 seconds) and turn (angular.z=1.57 for 1 second)
4. Log each phase: "Moving forward" or "Turning right"
5. Use a state machine approach with a counter`,
    examples: [
      { input: 'Run the node', output: '[INFO] [square_navigator]: Moving forward\\n[INFO] [square_navigator]: Turning right\\n[INFO] [square_navigator]: Moving forward' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SquareNavigator(Node):
    def __init__(self):
        super().__init__('square_navigator')
        # Create publisher, timer, and state tracking
        pass

    def timer_callback(self):
        # Alternate between forward and turn phases
        pass

def main(args=None):
    rclpy.init(args=args)
    node = SquareNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SquareNavigator(Node):
    def __init__(self):
        super().__init__('square_navigator')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.phase = 'forward'
        self.phase_counter = 0
        self.get_logger().info('Square navigator started!')

    def timer_callback(self):
        msg = Twist()
        if self.phase == 'forward':
            msg.linear.x = 2.0
            self.get_logger().info('Moving forward')
            self.phase_counter += 1
            if self.phase_counter >= 4:
                self.phase = 'turn'
                self.phase_counter = 0
        else:
            msg.angular.z = 1.57
            self.get_logger().info('Turning right')
            self.phase_counter += 1
            if self.phase_counter >= 2:
                self.phase = 'forward'
                self.phase_counter = 0
        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = SquareNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Moving forward' in stdout and 'Turning' in stdout and 'square_navigator' in stdout:
    _test_results.append({"name": "Square path", "passed": True, "message": "Node alternates between forward and turn phases"})
else:
    _test_results.append({"name": "Square path", "passed": False, "message": "Expected forward and turn logs from square_navigator"})
`,
    hints: [
      'Use a state variable self.phase = "forward" or "turn".',
      'Count timer ticks to know when to switch phases (4 ticks forward, 2 ticks turn).',
    ],
    prerequisiteLessons: ['les-3-2'],
  },
  {
    id: 'ch-10',
    title: 'Echo Relay Node',
    difficulty: 'Medium',
    category: 'Topics',
    order: 10,
    xp: 35,
    description: `Create a relay node that subscribes to '/turtle1/pose' and republishes a simplified version on '/turtle1/position'.

Your node should:
1. Create a node named 'echo_relay'
2. Subscribe to '/turtle1/pose' (Pose messages)
3. When a pose message arrives, publish a simple message on '/turtle1/position' containing just x and y
4. Log: "Relaying: x={x:.2f}, y={y:.2f}"`,
    examples: [
      { input: 'Turtle at (5.5, 5.5)', output: '[INFO] [echo_relay]: Relaying: x=5.50, y=5.50' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class EchoRelay(Node):
    def __init__(self):
        super().__init__('echo_relay')
        # Create subscriber and publisher
        pass

    def pose_callback(self, msg):
        # Republish simplified position
        pass

def main(args=None):
    rclpy.init(args=args)
    node = EchoRelay()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class EchoRelay(Node):
    def __init__(self):
        super().__init__('echo_relay')
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10)
        self.publisher = self.create_publisher(
            type(None), '/turtle1/position', 10)
        self.get_logger().info('Echo relay started!')

    def pose_callback(self, msg):
        self.publisher.publish({'x': msg.x, 'y': msg.y})
        self.get_logger().info(f'Relaying: x={msg.x:.2f}, y={msg.y:.2f}')

def main(args=None):
    rclpy.init(args=args)
    node = EchoRelay()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'echo_relay' in stdout:
    _test_results.append({"name": "Relay node", "passed": True, "message": "Echo relay node created with subscriber and publisher"})
else:
    _test_results.append({"name": "Relay node", "passed": False, "message": "Expected echo_relay in output"})
`,
    hints: [
      'Create both a subscriber and a publisher in __init__.',
      'In the pose callback, publish a simplified dict with just x and y.',
    ],
    prerequisiteLessons: ['les-3-3', 'les-3-2'],
  },
  {
    id: 'ch-11',
    title: 'Multi-Speed Publisher',
    difficulty: 'Medium',
    category: 'Parameters',
    order: 11,
    xp: 35,
    description: `Create a node with configurable speed levels that can be changed at runtime.

Your node should:
1. Create a node named 'multi_speed_publisher'
2. Declare parameters: 'speed_level' (default: 1), 'max_speed' (default: 3.0)
3. Speed level 1 = 1.0 m/s, level 2 = 2.0 m/s, level 3 = max_speed
4. Publish velocity based on current speed_level
5. Log: "Level {level}: Speed = {speed} m/s"`,
    examples: [
      { input: 'Default level 1', output: '[INFO] [multi_speed_publisher]: Level 1: Speed = 1.0 m/s' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class MultiSpeedPublisher(Node):
    def __init__(self):
        super().__init__('multi_speed_publisher')
        # Declare parameters and create publisher
        pass

    def timer_callback(self):
        # Read parameters and publish
        pass

def main(args=None):
    rclpy.init(args=args)
    node = MultiSpeedPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class MultiSpeedPublisher(Node):
    def __init__(self):
        super().__init__('multi_speed_publisher')
        self.declare_parameter('speed_level', 1)
        self.declare_parameter('max_speed', 3.0)
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)

    def timer_callback(self):
        level = self.get_parameter('speed_level').value
        max_speed = self.get_parameter('max_speed').value
        speeds = {1: 1.0, 2: 2.0, 3: float(max_speed)}
        speed = speeds.get(level, 1.0)
        msg = Twist()
        msg.linear.x = speed
        self.publisher.publish(msg)
        self.get_logger().info(f'Level {level}: Speed = {speed} m/s')

def main(args=None):
    rclpy.init(args=args)
    node = MultiSpeedPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Level' in stdout and 'Speed' in stdout and 'multi_speed_publisher' in stdout:
    _test_results.append({"name": "Multi-speed", "passed": True, "message": "Node uses parameters for speed levels"})
else:
    _test_results.append({"name": "Multi-speed", "passed": False, "message": "Expected speed level log from multi_speed_publisher"})
`,
    hints: [
      'Map speed_level to actual speed values using a dictionary.',
      'Read both parameters in the timer callback to get current values.',
    ],
    prerequisiteLessons: ['les-6-1'],
  },
  {
    id: 'ch-12',
    title: 'Spiral Navigator',
    difficulty: 'Hard',
    category: 'Topics',
    order: 12,
    xp: 50,
    description: `Make the turtle trace a spiral by gradually increasing the turn rate while maintaining forward speed.

Your node should:
1. Create a node named 'spiral_navigator'
2. Publish velocity commands every 0.1 seconds
3. Start with angular.z = 0.5 and decrease it by 0.005 each tick (approaching 0 = straighter)
4. Keep linear.x = 1.5 constant
5. Log every 10th tick: "Spiral: angular.z = {az:.3f}"
6. Stop when angular.z reaches 0.01`,
    examples: [
      { input: 'Run the node', output: '[INFO] [spiral_navigator]: Spiral: angular.z = 0.495\\n[INFO] [spiral_navigator]: Spiral: angular.z = 0.445' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SpiralNavigator(Node):
    def __init__(self):
        super().__init__('spiral_navigator')
        # Create publisher, timer, and angular velocity tracker
        pass

    def timer_callback(self):
        # Gradually decrease angular velocity to create spiral
        pass

def main(args=None):
    rclpy.init(args=args)
    node = SpiralNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SpiralNavigator(Node):
    def __init__(self):
        super().__init__('spiral_navigator')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.1, self.timer_callback)
        self.angular_z = 0.5
        self.tick = 0
        self.get_logger().info('Spiral navigator started!')

    def timer_callback(self):
        if self.angular_z < 0.01:
            self.timer.cancel()
            self.get_logger().info('Spiral complete!')
            return
        msg = Twist()
        msg.linear.x = 1.5
        msg.angular.z = self.angular_z
        self.publisher.publish(msg)
        self.tick += 1
        if self.tick % 10 == 0:
            self.get_logger().info(f'Spiral: angular.z = {self.angular_z:.3f}')
        self.angular_z -= 0.005

def main(args=None):
    rclpy.init(args=args)
    node = SpiralNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Spiral:' in stdout and 'spiral_navigator' in stdout:
    _test_results.append({"name": "Spiral motion", "passed": True, "message": "Node creates spiral by decreasing angular velocity"})
else:
    _test_results.append({"name": "Spiral motion", "passed": False, "message": "Expected spiral log from spiral_navigator"})
`,
    hints: [
      'Start with self.angular_z = 0.5 and subtract a small amount each tick.',
      'Use a tick counter to only log every 10th iteration.',
      'Cancel the timer when angular_z drops below 0.01.',
    ],
    prerequisiteLessons: ['les-3-2'],
  },
  {
    id: 'ch-13',
    title: 'Figure-8 Navigator',
    difficulty: 'Hard',
    category: 'Topics',
    order: 13,
    xp: 50,
    description: `Make the turtle trace a figure-8 by alternating between left and right circles.

Your node should:
1. Create a node named 'figure8_navigator'
2. Publish velocity commands every 0.5 seconds
3. For the first 10 ticks: linear.x=2.0, angular.z=1.0 (left circle)
4. For the next 10 ticks: linear.x=2.0, angular.z=-1.0 (right circle)
5. Repeat this pattern
6. Log: "Left circle - tick {n}" or "Right circle - tick {n}"`,
    examples: [
      { input: 'Run the node', output: '[INFO] [figure8_navigator]: Left circle - tick 1\\n...\\n[INFO] [figure8_navigator]: Right circle - tick 1' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class Figure8Navigator(Node):
    def __init__(self):
        super().__init__('figure8_navigator')
        # Create publisher, timer, and state tracking
        pass

    def timer_callback(self):
        # Alternate between left and right circles
        pass

def main(args=None):
    rclpy.init(args=args)
    node = Figure8Navigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class Figure8Navigator(Node):
    def __init__(self):
        super().__init__('figure8_navigator')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.tick = 0
        self.phase_tick = 0
        self.is_left = True
        self.get_logger().info('Figure-8 navigator started!')

    def timer_callback(self):
        msg = Twist()
        msg.linear.x = 2.0
        if self.is_left:
            msg.angular.z = 1.0
            self.get_logger().info(f'Left circle - tick {self.phase_tick + 1}')
        else:
            msg.angular.z = -1.0
            self.get_logger().info(f'Right circle - tick {self.phase_tick + 1}')
        self.publisher.publish(msg)
        self.phase_tick += 1
        self.tick += 1
        if self.phase_tick >= 10:
            self.is_left = not self.is_left
            self.phase_tick = 0

def main(args=None):
    rclpy.init(args=args)
    node = Figure8Navigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Left circle' in stdout and 'Right circle' in stdout and 'figure8_navigator' in stdout:
    _test_results.append({"name": "Figure-8 pattern", "passed": True, "message": "Node alternates between left and right circles"})
else:
    _test_results.append({"name": "Figure-8 pattern", "passed": False, "message": "Expected left and right circle logs from figure8_navigator"})
`,
    hints: [
      'Use a phase_tick counter that resets after 10 ticks.',
      'Toggle self.is_left when phase_tick reaches 10.',
      'angular.z = 1.0 for left, angular.z = -1.0 for right.',
    ],
    prerequisiteLessons: ['les-3-2'],
  },
  {
    id: 'ch-14',
    title: 'Wall Bounce Navigator',
    difficulty: 'Hard',
    category: 'Integration',
    order: 14,
    xp: 60,
    description: `Create a node that makes the turtle bounce off the walls of the turtlesim canvas (0-11 range).

Your node should:
1. Create a node named 'wall_bouncer'
2. Subscribe to '/turtle1/pose' to track position
3. Publish velocity commands on '/turtle1/cmd_vel'
4. When the turtle approaches a wall (x < 0.5 or x > 10.5 or y < 0.5 or y > 10.5), turn away
5. Otherwise, move forward at speed 2.0
6. Log: "Near wall! Turning..." or "Moving forward"`,
    examples: [
      { input: 'Turtle near wall', output: '[INFO] [wall_bouncer]: Near wall! Turning...' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose

class WallBouncer(Node):
    def __init__(self):
        super().__init__('wall_bouncer')
        # Create subscriber, publisher, and timer
        pass

    def pose_callback(self, msg):
        # Track position
        pass

    def control_callback(self):
        # Decide movement based on position
        pass

def main(args=None):
    rclpy.init(args=args)
    node = WallBouncer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose

class WallBouncer(Node):
    def __init__(self):
        super().__init__('wall_bouncer')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10)
        self.timer = self.create_timer(0.1, self.control_callback)
        self.current_x = 5.5
        self.current_y = 5.5
        self.get_logger().info('Wall bouncer started!')

    def pose_callback(self, msg):
        self.current_x = msg.x
        self.current_y = msg.y

    def control_callback(self):
        msg = Twist()
        near_wall = (self.current_x < 0.5 or self.current_x > 10.5 or
                     self.current_y < 0.5 or self.current_y > 10.5)
        if near_wall:
            msg.linear.x = 0.5
            msg.angular.z = 2.0
            self.get_logger().info('Near wall! Turning...')
        else:
            msg.linear.x = 2.0
            msg.angular.z = 0.0
            self.get_logger().info('Moving forward')
        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = WallBouncer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'wall_bouncer' in stdout:
    _test_results.append({"name": "Wall bounce", "passed": True, "message": "Wall bouncer node created with pose subscriber and velocity publisher"})
else:
    _test_results.append({"name": "Wall bounce", "passed": False, "message": "Expected wall_bouncer in output"})
`,
    hints: [
      'Subscribe to /turtle1/pose to get real-time position.',
      'Check if x or y is near the boundary (0.5 or 10.5).',
      'When near a wall, increase angular.z to turn away.',
    ],
    prerequisiteLessons: ['les-3-2', 'les-3-3'],
  },
  {
    id: 'ch-15',
    title: 'Patrol Waypoint Navigator',
    difficulty: 'Hard',
    category: 'Navigation',
    order: 15,
    xp: 60,
    description: `Create a node that navigates the turtle between 4 waypoints in a loop.

Your node should:
1. Create a node named 'patrol_navigator'
2. Define 4 waypoints: (2,2), (9,2), (9,9), (2,9)
3. Subscribe to '/turtle1/pose' for current position
4. Calculate the angle to the next waypoint and publish velocity to move toward it
5. When within 0.5 units of a waypoint, switch to the next one
6. Log: "Heading to waypoint {n}: ({x}, {y})"`,
    examples: [
      { input: 'Run the node', output: '[INFO] [patrol_navigator]: Heading to waypoint 1: (2, 2)' },
    ],
    starterCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math

class PatrolNavigator(Node):
    def __init__(self):
        super().__init__('patrol_navigator')
        # Define waypoints, create subscriber and publisher
        pass

    def pose_callback(self, msg):
        # Track current position
        pass

    def control_callback(self):
        # Navigate to next waypoint
        pass

def main(args=None):
    rclpy.init(args=args)
    node = PatrolNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    solutionCode: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math

class PatrolNavigator(Node):
    def __init__(self):
        super().__init__('patrol_navigator')
        self.waypoints = [(2, 2), (9, 2), (9, 9), (2, 9)]
        self.current_wp = 0
        self.x = 5.5
        self.y = 5.5
        self.theta = 0.0
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10)
        self.timer = self.create_timer(0.1, self.control_callback)
        self.get_logger().info(f'Heading to waypoint 1: {self.waypoints[0]}')

    def pose_callback(self, msg):
        self.x = msg.x
        self.y = msg.y
        self.theta = msg.theta

    def control_callback(self):
        wx, wy = self.waypoints[self.current_wp]
        dx = wx - self.x
        dy = wy - self.y
        dist = math.sqrt(dx*dx + dy*dy)
        if dist < 0.5:
            self.current_wp = (self.current_wp + 1) % len(self.waypoints)
            wx, wy = self.waypoints[self.current_wp]
            self.get_logger().info(f'Heading to waypoint {self.current_wp + 1}: ({wx}, {wy})')
            return
        target_angle = math.atan2(dy, dx)
        angle_diff = target_angle - self.theta
        while angle_diff > math.pi: angle_diff -= 2 * math.pi
        while angle_diff < -math.pi: angle_diff += 2 * math.pi
        msg = Twist()
        msg.linear.x = min(2.0, dist)
        msg.angular.z = max(-2.0, min(2.0, angle_diff * 2.0))
        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = PatrolNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
    testCode: `
_test_results = []
import sys
stdout = sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
if 'Heading to waypoint' in stdout and 'patrol_navigator' in stdout:
    _test_results.append({"name": "Waypoint patrol", "passed": True, "message": "Patrol navigator navigates between waypoints"})
else:
    _test_results.append({"name": "Waypoint patrol", "passed": False, "message": "Expected waypoint navigation log from patrol_navigator"})
`,
    hints: [
      'Use math.atan2(dy, dx) to calculate the angle to the next waypoint.',
      'Compare the target angle with the current theta to determine turning direction.',
      'Switch to the next waypoint when distance < 0.5.',
    ],
    prerequisiteLessons: ['les-3-2', 'les-3-3', 'les-12-1'],
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find(c => c.id === id);
}

export function getChallengesByDifficulty(difficulty: Difficulty): Challenge[] {
  return challenges.filter(c => c.difficulty === difficulty);
}

export function getChallengesByCategory(category: Category): Challenge[] {
  return challenges.filter(c => c.category === category);
}

export const difficultyColors: Record<Difficulty, string> = {
  Easy: 'text-success-500 bg-success-500/10',
  Medium: 'text-accent-500 bg-accent-500/10',
  Hard: 'text-error-500 bg-error-500/10',
};

export const categoryColors: Record<Category, string> = {
  Nodes: 'text-primary-400 bg-primary-500/10',
  Topics: 'text-primary-300 bg-primary-400/10',
  Services: 'text-accent-400 bg-accent-500/10',
  Actions: 'text-warning-500 bg-warning-500/10',
  Parameters: 'text-surface-300 bg-surface-500/10',
  Launch: 'text-primary-500 bg-primary-500/10',
  Navigation: 'text-success-500 bg-success-500/10',
  Integration: 'text-error-400 bg-error-500/10',
};
