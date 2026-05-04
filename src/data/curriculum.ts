export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order: number;
  xp: number;
  theory: string;
  key_terms: { term: string; definition: string }[];
  code_example: { language: string; code: string; explanation: string } | null;
  terminal_output: string | null;
  quiz: { question: string; options: string[]; correct_index: number; explanation: string } | null;
  try_it: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  lessons: Lesson[];
}

export const modules: Module[] = [
  {
    id: 'mod-0',
    title: 'What is Robotics and Why ROS2?',
    description: 'Understand what robots are, why they need software, and what ROS2 does - all in plain English.',
    icon: 'Robot',
    order: 0,
    lessons: [
      {
        id: 'les-0-1',
        module_id: 'mod-0',
        title: 'What is a Robot, Really?',
        order: 1,
        xp: 10,
        theory: `Think of a robot as a machine that can **sense**, **think**, and **act**.

- **Sense**: A robot has sensors (cameras, distance sensors, buttons) that let it perceive the world - like your eyes and ears.
- **Think**: A robot runs software that processes sensor data and makes decisions - like your brain deciding to dodge a ball.
- **Act**: A robot has motors and actuators that let it move or do things - like your hands and legs.

A remote-controlled car is NOT a robot (it only acts, no thinking). A washing machine that adjusts cycle time based on load IS a simple robot.

**Why does this matter?** Because ROS2 is the "brain software" that helps robots think and coordinate all three parts.`,
        key_terms: [
          { term: 'Sensor', definition: 'A device that detects something about the environment (light, distance, temperature, etc.)' },
          { term: 'Actuator', definition: 'A device that causes physical movement (motor, servo, piston)' },
          { term: 'Autonomy', definition: 'The ability to make decisions without human input' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Which of these is a robot (not just a remote-controlled machine)?',
          options: [
            'A radio-controlled toy car',
            'A Roomba vacuum that navigates around furniture on its own',
            'A TV remote',
            'A manual wheelchair',
          ],
          correct_index: 1,
          explanation: 'A Roomba senses its environment, makes decisions about where to go, and drives itself - it has all three: sense, think, act.',
        },
        try_it: ['List 3 robots you have seen in real life', 'For each, identify: what does it sense? What does it think about? What does it act on?'],
      },
      {
        id: 'les-0-2',
        module_id: 'mod-0',
        title: 'Why Do Robots Need Special Software?',
        order: 2,
        xp: 10,
        theory: `Imagine you are running a restaurant kitchen with 20 chefs. Each chef is doing something different - chopping, frying, plating. How do they coordinate?

You need:
1. **A way to communicate** - chefs call out orders
2. **A way to synchronize** - the soup must be ready before plating
3. **A way to handle problems** - if the oven breaks, someone needs to adapt

A robot is the same. It has many "workers" (software programs) running at the same time:
- One program reads the camera
- One program plans the path
- One program controls the wheels
- One program monitors the battery

**ROS2 is the communication system** that lets all these programs talk to each other, stay in sync, and handle problems. Without it, every robot company would have to build their own communication system from scratch.`,
        key_terms: [
          { term: 'Middleware', definition: 'Software that sits between programs and helps them communicate' },
          { term: 'Concurrency', definition: 'Multiple programs running at the same time' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'What is the main problem ROS2 solves?',
          options: [
            'It makes robots walk faster',
            'It provides a standard way for robot software programs to communicate with each other',
            'It replaces the need for sensors',
            'It is a programming language for robots',
          ],
          correct_index: 1,
          explanation: 'ROS2 is middleware - it provides a standard communication system so different parts of robot software can talk to each other.',
        },
        try_it: ['Think of 3 programs that would need to run simultaneously on a delivery robot', 'What information would each program need from the others?'],
      },
      {
        id: 'les-0-3',
        module_id: 'mod-0',
        title: 'What is ROS2 and How is it Different from ROS1?',
        order: 3,
        xp: 15,
        theory: `**ROS** stands for **Robot Operating System** - but it is NOT an operating system like Windows or Linux. It is a **framework** (a collection of tools and conventions) that runs ON TOP of Linux.

**ROS1** was created in 2007 at Stanford. It worked, but had problems:
- No built-in security (anyone could talk to your robot)
- Could not handle real-time requirements well
- Only worked on a single computer (no distributed systems)
- The communication system (called "roscore") was a single point of failure

**ROS2** was created to fix all of these:
- Built-in security (only authorized programs can communicate)
- Real-time capable (critical tasks get priority)
- Distributed by default (programs can run on multiple computers)
- No single point of failure (no more roscore)

**Think of it like this:** ROS1 is like walkie-talkies - everyone hears everything, and if the base station goes down, nobody can talk. ROS2 is like a modern cell network - secure, reliable, and works across towers.`,
        key_terms: [
          { term: 'Framework', definition: 'A collection of tools, libraries, and conventions that provide a foundation to build on' },
          { term: 'Real-time', definition: 'Guaranteed response within a strict time limit (e.g., "must react in under 5ms")' },
          { term: 'Distributed', definition: 'Running across multiple computers that work together' },
          { term: 'roscore', definition: 'The central hub in ROS1 that all nodes had to connect to (removed in ROS2)' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Which is a key improvement in ROS2 over ROS1?',
          options: [
            'ROS2 requires a roscore to run',
            'ROS2 can run on multiple computers without a central hub',
            'ROS2 removed security features',
            'ROS2 only works with C++',
          ],
          correct_index: 1,
          explanation: 'ROS2 is distributed by default - no central roscore needed, and programs can run across multiple computers.',
        },
        try_it: ['Search online for "ROS2 distributions" and find which version is the current LTS (Long Term Support)', 'Write down 3 robot types where real-time communication would be critical'],
      },
    ],
  },
  {
    id: 'mod-1',
    title: 'Setting Up Your Environment',
    description: 'Install ROS2, set up your terminal, and run your first ROS2 command.',
    icon: 'Terminal',
    order: 1,
    lessons: [
      {
        id: 'les-1-1',
        module_id: 'mod-1',
        title: 'Installing ROS2',
        order: 1,
        xp: 15,
        theory: `Before we write any code, we need to install ROS2 on your computer.

**Prerequisites:**
- You need **Ubuntu Linux** (22.04 for ROS2 Humble, or 24.04 for ROS2 Jazzy)
- If you are on Windows or Mac, you can use **Docker** or a **Virtual Machine**

**We will use ROS2 Humble** because it is the current Long Term Support (LTS) version, supported until 2027.

The installation steps are:
1. Set up your computer to accept software from ROS2's package repository
2. Install ROS2 packages using apt
3. Set up your terminal to "source" ROS2 (so it knows where ROS2 lives)

**Important concept - "Sourcing":**
When you install ROS2, it does not automatically load into every terminal. You have to **source** it, which means telling your terminal "hey, ROS2 is installed over here, please make its commands available." Think of it like adding a new tool to your toolbox - you have to open the toolbox before you can use the tools.`,
        key_terms: [
          { term: 'apt', definition: "Ubuntu's package manager - like an app store but for terminal commands" },
          { term: 'Source', definition: 'Loading environment variables so your terminal knows where to find ROS2' },
          { term: 'LTS', definition: 'Long Term Support - a version that gets bug fixes and security updates for many years' },
          { term: 'Locale', definition: 'Language/region settings on your computer (ROS2 needs UTF-8)' },
        ],
        code_example: {
          language: 'bash',
          code: `# Step 1: Set up locale (language settings)
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

# Step 2: Add ROS2 apt repository
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \\
  -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \\
  http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" \\
  | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

# Step 3: Install ROS2 Humble
sudo apt update
sudo apt install ros-humble-desktop -y

# Step 4: Source ROS2 (do this every time you open a new terminal)
source /opt/ros/humble/setup.bash

# Tip: Add it to your .bashrc so it auto-sources every time
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc`,
          explanation: 'These commands install ROS2 Humble on Ubuntu 22.04. The last line adds sourcing to your .bashrc so you never have to type it again.',
        },
        terminal_output: `$ source /opt/ros/humble/setup.bash
$ ros2 --version
ros2 cli version: 0.18.5

# If you see the version number, ROS2 is installed correctly!`,
        quiz: {
          question: 'What does "source /opt/ros/humble/setup.bash" do?',
          options: [
            'Installs ROS2 on your computer',
            'Tells your terminal where to find ROS2 commands and libraries',
            'Deletes ROS2 from your computer',
            'Updates ROS2 to the latest version',
          ],
          correct_index: 1,
          explanation: 'Sourcing loads environment variables into your current terminal session so ROS2 commands become available. It does NOT install anything.',
        },
        try_it: ['Install ROS2 Humble on your machine (or set up Docker if not on Linux)', 'Open a terminal, source ROS2, and run: ros2 --version', 'Add the source command to your .bashrc so it auto-loads'],
      },
      {
        id: 'les-1-2',
        module_id: 'mod-1',
        title: 'Your First ROS2 Command',
        order: 2,
        xp: 10,
        theory: `Now that ROS2 is installed, let us run our first command!

The main command you will use is **ros2**. It is like a Swiss Army knife - it has many sub-tools inside it.

Try running:
\`\`\`
ros2 topic list
\`\`\`

Right now, this will show nothing because no ROS2 programs are running yet. That is expected! Think of it like checking your phone for messages when nobody has texted you yet.

**The ros2 command structure:**
\`\`\`
ros2 [category] [action]
\`\`\`

Categories include:
- **topic** - for data streams (like radio channels)
- **node** - for running programs
- **service** - for request/response calls
- **action** - for long-running tasks
- **param** - for configuration values
- **run** - to start a program
- **launch** - to start multiple programs at once

We will explore each of these in detail in upcoming modules. For now, just get comfortable with the ros2 command.`,
        key_terms: [
          { term: 'CLI', definition: 'Command Line Interface - typing commands in a terminal instead of clicking buttons' },
          { term: 'Subcommand', definition: 'A command within a command (e.g., "topic" is a subcommand of "ros2")' },
        ],
        code_example: {
          language: 'bash',
          code: `# See all available ros2 subcommands
ros2 --help

# List all active topics (will be empty if nothing is running)
ros2 topic list

# List all active nodes (will be empty if nothing is running)
ros2 node list

# Check what version of ROS2 you have
ros2 --version`,
          explanation: 'These are the most basic ros2 commands. They let you inspect what is currently happening in your ROS2 system.',
        },
        terminal_output: `$ ros2 --help
usage: ros2 [-h] [--spin-time SPIN_TIME] [--log-level LOG_LEVEL]

Available commands:
  action     Various action related sub-commands
  node       Various node related sub-commands
  param      Various param related sub-commands
  pkg        Various package related sub-commands
  run        Run a package specific executable
  service    Various service related sub-commands
  topic      Various topic related sub-commands

$ ros2 topic list
# (empty - no nodes running yet)`,
        quiz: {
          question: 'What will "ros2 topic list" show if no ROS2 programs are running?',
          options: [
            'An error message',
            'Nothing (empty list)',
            'All available topics in ROS2',
            'The ROS2 version',
          ],
          correct_index: 1,
          explanation: 'If no programs are running, there are no topics being published, so the list will be empty. This is normal, not an error.',
        },
        try_it: ['Run ros2 --help and read through the available commands', 'Run ros2 topic list and ros2 node list to confirm they return empty lists', 'Try ros2 doctor to check your ROS2 setup health'],
      },
      {
        id: 'les-1-3',
        module_id: 'mod-1',
        title: 'Meet Turtlesim - Your Robot Playground',
        order: 3,
        xp: 15,
        theory: `**Turtlesim** is a tiny robot simulator that comes with ROS2. It shows a turtle on a blue canvas that you can move around. It is the "Hello World" of ROS2 - everyone starts here!

Why turtlesim? Because it lets you practice ALL the core ROS2 concepts (topics, services, actions, parameters) with a visual, easy-to-understand robot. No hardware needed.

**How it works:**
1. You run the turtlesim node - it opens a window with a turtle
2. You run the teleop (tele-operation) node - it lets you control the turtle with arrow keys
3. The two nodes communicate through a **topic** called /turtle1/cmd_vel (command velocity)

Think of it like a remote-controlled toy:
- The teleop node is the remote control (it sends movement commands)
- The turtlesim node is the toy (it receives commands and moves)
- The topic is the invisible signal between them

Let us run it!`,
        key_terms: [
          { term: 'Turtlesim', definition: 'A simple 2D robot simulator included with ROS2 for learning purposes' },
          { term: 'Teleop', definition: 'Tele-operation - controlling a robot remotely, usually with a keyboard or joystick' },
          { term: 'cmd_vel', definition: 'Command Velocity - a standard ROS2 topic name for sending movement commands' },
        ],
        code_example: {
          language: 'bash',
          code: `# Terminal 1: Start the turtlesim simulator
ros2 run turtlesim turtlesim_node

# Terminal 2: Start the keyboard teleop controller
ros2 run turtlesim turtle_teleop_key

# Now use arrow keys in Terminal 2 to move the turtle!

# Terminal 3 (optional): Watch the velocity commands being sent
ros2 topic echo /turtle1/cmd_vel`,
          explanation: 'You need TWO terminals because each runs a different node. The turtlesim_node draws the turtle, and turtle_teleop_key reads your keyboard and sends movement commands.',
        },
        terminal_output: `$ ros2 run turtlesim turtlesim_node
[INFO] [turtlesim]: Starting turtlesim with node name /turtlesim
[INFO] [turtlesim]: Spawning turtle [turtle1] at x=[5.544445], y=[5.544445], theta=[0.000000]

# A window opens showing a turtle on a blue background!

$ ros2 run turtlesim turtle_teleop_key
Reading from keyboard and sending to /turtle1/cmd_vel...
---------------------------
Use arrow keys to move the turtle.
Use 'Q' to quit.

# Use arrow keys and the turtle moves!`,
        quiz: {
          question: 'Why do you need TWO terminals to run turtlesim?',
          options: [
            'Because ROS2 requires two terminals',
            'Because one terminal runs the simulator and the other runs the keyboard controller - they are two separate programs',
            'Because one terminal is for input and one is for output',
            'You only need one terminal',
          ],
          correct_index: 1,
          explanation: 'Each terminal runs a separate ROS2 node. The simulator node draws the turtle, and the teleop node reads your keyboard. They communicate through topics.',
        },
        try_it: ['Open two terminals and run turtlesim + teleop', 'Move the turtle around with arrow keys', 'Open a third terminal and run: ros2 topic echo /turtle1/cmd_vel - see the velocity data flowing!'],
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'Nodes - The Workers of ROS2',
    description: 'Understand what nodes are, how to create them, and how they form the building blocks of every ROS2 system.',
    icon: 'Box',
    order: 2,
    lessons: [
      {
        id: 'les-2-1',
        module_id: 'mod-2',
        title: 'What is a Node?',
        order: 1,
        xp: 15,
        theory: `A **node** is a single, focused program that does ONE job in a robot system.

**Think of a factory:**
- One worker checks product quality
- Another worker packages products
- Another worker loads trucks
- Each worker has ONE job but they talk to each other

In ROS2:
- One node reads the camera
- Another node detects objects
- Another node plans the path
- Another node drives the motors

**Each node is an independent program.** It can start, stop, or crash without taking down the whole system. This is the KEY design principle of ROS2.

**What makes a node:**
1. It has a **name** (like "camera_driver" or "path_planner")
2. It can **publish** data (send information out)
3. It can **subscribe** to data (receive information)
4. It can **provide services** (answer requests)
5. It can **use parameters** (configuration values)

**In code terms:** A node is a Python class (or C++ class) that inherits from rclpy.Node (or rclcpp::Node).`,
        key_terms: [
          { term: 'Node', definition: 'A single ROS2 program that does one focused job and communicates with other nodes' },
          { term: 'rclpy', definition: 'ROS Client Library for Python - the Python package that lets you create ROS2 nodes' },
          { term: 'rclcpp', definition: 'ROS Client Library for C++ - the C++ library for creating ROS2 nodes' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'What is the KEY design principle of ROS2 nodes?',
          options: [
            'All nodes must be written in C++',
            'Each node does ONE focused job and can run independently',
            'Nodes must all run on the same computer',
            'A node must do everything the robot needs',
          ],
          correct_index: 1,
          explanation: 'Each node is a single, focused program. This modularity means nodes can start, stop, or crash independently without taking down the whole system.',
        },
        try_it: ['Think of a self-driving car. List at least 5 nodes it would need.', 'For each node, write down: what is its ONE job?'],
      },
      {
        id: 'les-2-2',
        module_id: 'mod-2',
        title: 'Writing Your First Node in Python',
        order: 2,
        xp: 20,
        theory: `Let us write a real ROS2 node! We will create the simplest possible node - one that just prints "Hello Robot!" every second.

**The recipe for any ROS2 Python node:**

1. **Import** the ROS2 Python library (rclpy)
2. **Create a class** that inherits from Node
3. **In the constructor** (__init__), give your node a name
4. **Create a timer** to do something repeatedly (optional)
5. **Define what the node does** (a method that runs on the timer)
6. **In main**: initialize ROS2, create your node, and spin it (keep it running)

**Important:** Every node needs a name. This name must be UNIQUE in your ROS2 system - no two nodes can have the same name. Think of it like a name badge at a conference.

Let us look at the code:`,
        key_terms: [
          { term: 'Timer', definition: 'A ROS2 mechanism that calls a function at a regular interval (like an alarm clock)' },
          { term: 'Spin', definition: 'Keeping a node alive and responsive - without spinning, the node would immediately exit' },
          { term: 'Constructor', definition: 'The __init__ method in Python - code that runs when an object is first created' },
        ],
        code_example: {
          language: 'python',
          code: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class HelloNode(Node):
    def __init__(self):
        # Give this node the name 'hello_robot'
        super().__init__('hello_robot')

        # Create a timer that fires every 1 second (1.0 seconds)
        # When it fires, it calls self.timer_callback
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0
        self.get_logger().info('Hello Robot node has started!')

    def timer_callback(self):
        # This runs every 1 second
        self.count += 1
        self.get_logger().info(f'Hello Robot! Count: {self.count}')

def main(args=None):
    # Step 1: Initialize ROS2
    rclpy.init(args=args)

    # Step 2: Create our node
    node = HelloNode()

    # Step 3: Keep the node running (spin)
    rclpy.spin(node)

    # Step 4: Clean up when done
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
          explanation: 'This is the minimal structure of every ROS2 Python node. The timer callback runs every 1 second, printing a message. rclpy.spin() keeps the node alive so it can respond to callbacks.',
        },
        terminal_output: `$ python3 hello_node.py
[INFO] [hello_robot]: Hello Robot node has started!
[INFO] [hello_robot]: Hello Robot! Count: 1
[INFO] [hello_robot]: Hello Robot! Count: 2
[INFO] [hello_robot]: Hello Robot! Count: 3
[INFO] [hello_robot]: Hello Robot! Count: 4
# ...keeps printing every second until you press Ctrl+C`,
        quiz: {
          question: 'What happens if you remove rclpy.spin(node) from the main function?',
          options: [
            'The node runs forever',
            'The node prints once and then the program exits immediately',
            'The node crashes with an error',
            'Nothing changes',
          ],
          correct_index: 1,
          explanation: 'Without spin(), the program creates the node but then immediately moves to destroy_node() and shutdown(). The node never gets a chance to run its callbacks.',
        },
        try_it: ['Create a file called hello_node.py with the code above', 'Run it with: python3 hello_node.py', 'Watch it print every second. Press Ctrl+C to stop it.', 'Modify the timer to fire every 0.5 seconds instead of 1.0'],
      },
      {
        id: 'les-2-3',
        module_id: 'mod-2',
        title: 'Inspecting Nodes with CLI Tools',
        order: 3,
        xp: 15,
        theory: `Once you have nodes running, you need to be able to inspect them. ROS2 provides several CLI tools for this.

**Key commands:**

- **ros2 node list** - Shows all running nodes (like seeing who is online)
- **ros2 node info /node_name** - Shows details about a specific node (what it publishes, subscribes to, etc.)

**Why this matters:** When your robot is not working correctly, the FIRST thing you do is check if all the nodes are running. If a node is missing, that is your problem. If a node is there but not publishing data, that is a different problem.

Think of it like a hospital - before treating a patient, you check their vitals. Before debugging a robot, you check its nodes.

**The node lifecycle:**
1. A node is **created** (your code starts it)
2. It is **discovered** by other nodes (ROS2 automatically finds it)
3. It **communicates** (publishes, subscribes, etc.)
4. It is **destroyed** (your code shuts it down or Ctrl+C)

While a node is running, you can inspect it from ANY terminal.`,
        key_terms: [
          { term: 'Discovery', definition: 'The process by which ROS2 nodes automatically find each other on the network' },
          { term: 'Node info', definition: 'A command that shows everything a node does: publishers, subscribers, services, etc.' },
        ],
        code_example: {
          language: 'bash',
          code: `# Terminal 1: Run the turtlesim node
ros2 run turtlesim turtlesim_node

# Terminal 2: Inspect it!

# List all running nodes
ros2 node list
# Output: /turtlesim

# Get detailed info about the turtlesim node
ros2 node info /turtlesim`,
          explanation: 'ros2 node list shows all active nodes. ros2 node info shows what a specific node publishes, subscribes to, and provides as services.',
        },
        terminal_output: `$ ros2 node list
/turtlesim

$ ros2 node info /turtlesim
/turtlesim
  Subscribers:
    /parameter_events: rcl_interfaces/msg/ParameterEvent
    /turtle1/cmd_vel: geometry_msgs/msg/Twist
  Publishers:
    /parameter_events: rcl_interfaces/msg/ParameterEvent
    /rosout: rcl_interfaces/msg/Log
    /turtle1/color_sensor: turtlesim/msg/Color
    /turtle1/pose: turtlesim/msg/Pose
  Services:
    /clear: std_srvs/srv/Empty
    /kill: turtlesim/srv/Kill
    /reset: std_srvs/srv/Empty
    /spawn: turtlesim/srv/Spawn
    /turtle1/set_pen: turtlesim/srv/SetPen
    /turtle1/teleport_absolute: turtlesim/srv/TeleportAbsolute
    /turtle1/teleport_relative: turtlesim/srv/TeleportRelative`,
        quiz: {
          question: 'What is the FIRST thing you should check when your robot is not working?',
          options: [
            'Reinstall ROS2',
            'Check if all the expected nodes are running using ros2 node list',
            'Restart your computer',
            'Check the battery',
          ],
          correct_index: 1,
          explanation: 'Always verify nodes are running first. If a node is missing, that is likely your problem. If all nodes are there, check what they are publishing/subscribing to.',
        },
        try_it: ['Run turtlesim in one terminal', 'In another terminal, run ros2 node list', 'Run ros2 node info /turtlesim and study the output', 'Try running ros2 node info on a node that does not exist - what error do you get?'],
      },
    ],
  },
  {
    id: 'mod-3',
    title: 'Topics - Making Nodes Talk',
    description: 'Learn how nodes communicate through topics using the publish/subscribe pattern.',
    icon: 'Radio',
    order: 3,
    lessons: [
      {
        id: 'les-3-1',
        module_id: 'mod-3',
        title: 'What are Topics?',
        order: 1,
        xp: 15,
        theory: `**Topics are the most common way nodes communicate in ROS2.**

Think of a topic like a **radio channel**:
- Anyone can **broadcast** (publish) on a channel
- Anyone can **listen** (subscribe) to a channel
- The broadcaster does not know (or care) who is listening
- The listener does not know (or care) who is broadcasting
- Multiple people can broadcast and multiple can listen

**In ROS2 terms:**
- A **Publisher** sends data to a topic
- A **Subscriber** receives data from a topic
- The topic has a **name** (like "/camera/image") and a **message type** (like "Image")

**Key properties of topics:**
- **Asynchronous** - the publisher sends data and moves on, it does not wait for a response
- **Many-to-many** - multiple publishers and subscribers on the same topic
- **Continuous** - data flows continuously (like a video stream, not a single photo)

**When to use topics:** When you have a continuous stream of data (sensor readings, video frames, position updates) that multiple nodes might want.

**When NOT to use topics:** When you need a guaranteed response (use Services instead - coming next module).`,
        key_terms: [
          { term: 'Publisher', definition: 'A node that sends data to a topic' },
          { term: 'Subscriber', definition: 'A node that receives data from a topic' },
          { term: 'Message Type', definition: 'The format/structure of data sent on a topic (e.g., geometry_msgs/msg/Twist)' },
          { term: 'Asynchronous', definition: 'Send and forget - the sender does not wait for a response' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Which scenario is BEST suited for a topic (not a service)?',
          options: [
            'Asking a robot to calculate 2+2 and return the answer',
            'Continuously streaming camera images from a robot',
            'Turning the robot off',
            "Asking for the robot's name",
          ],
          correct_index: 1,
          explanation: 'Topics are for continuous data streams. Camera images flow continuously, so a topic is perfect. Request/response tasks (like calculating or turning off) use services.',
        },
        try_it: ['Think of 5 data streams on a delivery robot that would use topics', 'For each, write: topic name, who publishes, who subscribes'],
      },
      {
        id: 'les-3-2',
        module_id: 'mod-3',
        title: 'Writing a Publisher',
        order: 2,
        xp: 25,
        theory: `Now let us write a node that **publishes** data to a topic!

We will create a node that publishes movement commands (velocity) to make the turtlesim turtle move in a circle.

**The recipe for a publisher:**

1. Create a node (like before)
2. Create a **publisher** object with:
   - The **topic name** (where to publish)
   - The **message type** (what format the data is in)
   - A **queue size** (how many messages to buffer if nobody is reading)
3. In a timer callback, create a message and **publish** it

**Message types** are like templates for data. For velocity commands, we use geometry_msgs/msg/Twist which contains:
- **linear** (forward/backward speed): x, y, z
- **angular** (rotation speed): x, y, z

For a 2D turtle, we only use linear.x (forward speed) and angular.z (turning speed).`,
        key_terms: [
          { term: 'Twist', definition: 'A standard ROS2 message type for velocity commands with linear and angular components' },
          { term: 'Queue Size', definition: 'How many messages to keep in buffer before dropping old ones (QoS setting)' },
          { term: 'QoS', definition: 'Quality of Service - settings that control how reliably messages are delivered' },
        ],
        code_example: {
          language: 'python',
          code: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class CirclePublisher(Node):
    def __init__(self):
        super().__init__('circle_publisher')

        # Create a publisher on the /turtle1/cmd_vel topic
        # It sends Twist messages with a queue size of 10
        self.publisher = self.create_publisher(
            Twist,               # message type
            '/turtle1/cmd_vel',  # topic name
            10                   # queue size
        )

        # Create a timer that fires every 0.5 seconds
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.get_logger().info('Circle publisher started! Making the turtle go in circles.')

    def timer_callback(self):
        # Create a new Twist message
        msg = Twist()

        # Move forward at 2.0 m/s
        msg.linear.x = 2.0
        msg.linear.y = 0.0
        msg.linear.z = 0.0

        # Turn at 1.0 rad/s (this creates the circular motion)
        msg.angular.x = 0.0
        msg.angular.y = 0.0
        msg.angular.z = 1.0

        # Publish the message!
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: linear.x={msg.linear.x}, angular.z={msg.angular.z}')

def main(args=None):
    rclpy.init(args=args)
    node = CirclePublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
          explanation: 'This publisher sends velocity commands every 0.5 seconds. linear.x moves the turtle forward, angular.z turns it. Combined, they create circular motion.',
        },
        terminal_output: `$ python3 circle_publisher.py
[INFO] [circle_publisher]: Circle publisher started! Making the turtle go in circles.
[INFO] [circle_publisher]: Publishing: linear.x=2.0, angular.z=1.0
[INFO] [circle_publisher]: Publishing: linear.x=2.0, angular.z=1.0
[INFO] [circle_publisher]: Publishing: linear.x=2.0, angular.z=1.0
# The turtle in turtlesim moves in a circle!`,
        quiz: {
          question: 'What does setting both linear.x=2.0 and angular.z=1.0 do?',
          options: [
            'Moves the turtle straight forward at 2.0 m/s',
            'Spins the turtle in place at 1.0 rad/s',
            'Moves the turtle in a circle - forward at 2.0 while turning at 1.0',
            'Stops the turtle',
          ],
          correct_index: 2,
          explanation: 'linear.x moves forward, angular.z turns. When both are non-zero, the turtle moves in a circle. The radius depends on the ratio of linear to angular speed.',
        },
        try_it: ['Run turtlesim in one terminal', 'Run the circle publisher in another terminal', 'Watch the turtle draw a circle!', 'Modify the speeds: try linear.x=1.0 and angular.z=2.0 - what changes?'],
      },
      {
        id: 'les-3-3',
        module_id: 'mod-3',
        title: 'Writing a Subscriber',
        order: 3,
        xp: 25,
        theory: `Now let us write a node that **subscribes** to a topic and receives data.

We will subscribe to the turtle's position topic (/turtle1/pose) and print the coordinates.

**The recipe for a subscriber:**

1. Create a node
2. Create a **subscriber** object with:
   - The **topic name** (what to listen to)
   - The **message type** (what format to expect)
   - A **callback function** (what to do when data arrives)
   - A **queue size**
3. Define the **callback function** that processes incoming messages

**Key difference from publisher:** A subscriber does not need a timer. It just sits and waits. Whenever a message arrives on the topic, ROS2 automatically calls the callback function.

Think of it like getting a text message - you do not need to check your phone every second. The phone buzzes when a message arrives, and you respond.`,
        key_terms: [
          { term: 'Callback', definition: 'A function that is automatically called when an event occurs (like data arriving on a topic)' },
          { term: 'Pose', definition: 'Position and orientation of a robot - where it is and which way it faces' },
        ],
        code_example: {
          language: 'python',
          code: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class PoseSubscriber(Node):
    def __init__(self):
        super().__init__('pose_subscriber')

        # Create a subscriber on the /turtle1/pose topic
        self.subscription = self.create_subscription(
            Pose,               # message type
            '/turtle1/pose',    # topic name
            self.pose_callback, # callback function
            10                   # queue size
        )
        self.get_logger().info('Pose subscriber started! Listening to turtle position.')

    def pose_callback(self, msg):
        # This function runs every time a new Pose message arrives
        self.get_logger().info(
            f'Turtle position -> X: {msg.x:.2f}, Y: {msg.y:.2f}, Theta: {msg.theta:.2f}'
        )

def main(args=None):
    rclpy.init(args=args)
    node = PoseSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
          explanation: 'The subscriber listens to /turtle1/pose. Every time the turtle moves, turtlesim publishes its position, and our callback automatically receives and prints it.',
        },
        terminal_output: `$ python3 pose_subscriber.py
[INFO] [pose_subscriber]: Pose subscriber started! Listening to turtle position.
[INFO] [pose_subscriber]: Turtle position -> X: 5.54, Y: 5.54, Theta: 0.00
# (Now move the turtle with teleop and watch the coordinates change!)
[INFO] [pose_subscriber]: Turtle position -> X: 5.62, Y: 5.54, Theta: 0.00
[INFO] [pose_subscriber]: Turtle position -> X: 5.70, Y: 5.54, Theta: 0.00`,
        quiz: {
          question: 'Why does a subscriber NOT need a timer?',
          options: [
            'Because it only receives one message',
            'Because ROS2 automatically calls the callback function whenever a new message arrives',
            'Because subscribers are faster than publishers',
            'Because timers are only for publishers',
          ],
          correct_index: 1,
          explanation: 'ROS2 handles the event loop for you. When a message arrives on the subscribed topic, the callback is automatically invoked. No polling needed.',
        },
        try_it: ['Run turtlesim in terminal 1', 'Run the pose subscriber in terminal 2', 'Run teleop in terminal 3 and move the turtle', 'Watch the subscriber print real-time position updates!'],
      },
      {
        id: 'les-3-4',
        module_id: 'mod-3',
        title: 'Topic CLI Tools',
        order: 4,
        xp: 15,
        theory: `ROS2 provides powerful CLI tools to inspect topics without writing any code. These are your debugging best friends.

**Essential topic commands:**

| Command | What it does |
|---------|-------------|
| ros2 topic list | Shows all active topics |
| ros2 topic list -t | Shows topics WITH their message types |
| ros2 topic echo /topic_name | Prints messages as they arrive (like tail -f) |
| ros2 topic info /topic_name | Shows publishers and subscribers of a topic |
| ros2 topic pub /topic_name msg_type "data" | Manually publish a message |
| ros2 topic hz /topic_name | Shows the publishing rate (messages per second) |
| ros2 topic type /topic_name | Shows the message type of a topic |
| ros2 interface show msg_type | Shows the structure of a message type |

**The most useful one for beginners:** ros2 topic echo - it lets you see exactly what data is flowing through any topic. This is how you verify your publishers are working correctly.

**Pro tip:** Use ros2 topic pub to manually send a single command to a topic. This is great for testing without writing a publisher node.`,
        key_terms: [
          { term: 'echo', definition: 'Print incoming messages to the terminal in real-time' },
          { term: 'hz', definition: 'Hertz - the frequency at which messages are published (messages per second)' },
          { term: 'Interface', definition: 'The definition/structure of a message type (what fields it contains)' },
        ],
        code_example: {
          language: 'bash',
          code: `# Start turtlesim first
ros2 run turtlesim turtlesim_node

# List all topics
ros2 topic list

# See what type of data flows on cmd_vel
ros2 topic info /turtle1/cmd_vel

# See the structure of the Twist message
ros2 interface show geometry_msgs/msg/Twist

# Watch the turtle's position in real-time
ros2 topic echo /turtle1/pose

# Manually publish a velocity command (move the turtle!)
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \\
  "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"

# Check how fast the pose topic publishes
ros2 topic hz /turtle1/pose`,
          explanation: 'These commands let you inspect, monitor, and interact with topics entirely from the command line - no code needed.',
        },
        terminal_output: `$ ros2 topic list
/parameter_events
/rosout
/turtle1/cmd_vel
/turtle1/color_sensor
/turtle1/pose

$ ros2 interface show geometry_msgs/msg/Twist
# This expresses velocity in free space broken into linear and angular parts.
Vector3  linear
Vector3  angular

$ ros2 topic hz /turtle1/pose
average rate: 62.515
  min: 0.015s max: 0.033s std dev: 0.00385s window: 64`,
        quiz: {
          question: 'Which command lets you see data flowing through a topic in real-time?',
          options: [
            'ros2 topic list',
            'ros2 topic echo /topic_name',
            'ros2 topic info /topic_name',
            'ros2 topic hz /topic_name',
          ],
          correct_index: 1,
          explanation: 'ros2 topic echo prints every message as it arrives, letting you see the actual data flowing through the topic in real-time.',
        },
        try_it: ['Run turtlesim and try every command in the example above', 'Use ros2 topic pub to move the turtle without teleop', 'Use ros2 topic hz to measure the pose publishing rate'],
      },
    ],
  },
  {
    id: 'mod-4',
    title: 'Services - Ask and You Shall Receive',
    description: 'Learn about the request/response communication pattern in ROS2.',
    icon: 'PhoneCall',
    order: 4,
    lessons: [
      {
        id: 'les-4-1',
        module_id: 'mod-4',
        title: 'What are Services?',
        order: 1,
        xp: 15,
        theory: `If topics are like radio broadcasts, **services are like phone calls.**

**Topic (radio):** You broadcast, anyone can listen, no response expected.
**Service (phone call):** You call someone, they pick up, you ask a question, they give an answer, you hang up.

**How services work:**
1. A **Service Server** offers a service (like a receptionist at a desk)
2. A **Service Client** sends a **request** (you walk up and ask a question)
3. The server processes the request and sends back a **response** (the receptionist answers)
4. The client receives the response and continues

**Key differences from topics:**
- Services are **synchronous** (you wait for the response)
- Services are **one-to-one** (one server, one client at a time)
- Services are **occasional** (called when needed, not continuous)

**When to use services:**
- Spawning a new turtle in turtlesim
- Asking for the current time
- Triggering a one-time action (grab object, take photo)
- Getting a specific piece of data on demand

**When NOT to use services:**
- Continuous data streams (use topics)
- Long-running tasks that need progress updates (use actions - next module)`,
        key_terms: [
          { term: 'Service Server', definition: 'A node that offers a service and responds to requests' },
          { term: 'Service Client', definition: 'A node that sends a request to a service and waits for a response' },
          { term: 'Request/Response', definition: 'The two-part communication pattern: client asks, server answers' },
          { term: 'Synchronous', definition: 'The caller waits and blocks until the response arrives' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Which is a good use case for a service (not a topic)?',
          options: [
            'Streaming video from a camera',
            'Asking the robot to spawn a new object and confirming it was created',
            'Continuously publishing battery level',
            'Sending steering commands at 50Hz',
          ],
          correct_index: 1,
          explanation: 'Spawning an object is a one-time action where you need confirmation. You send a request, wait for the response confirming it was created, then move on. This is the service pattern.',
        },
        try_it: ['List 3 things on a robot that would use services instead of topics', 'For each, write: what is the request? What is the response?'],
      },
      {
        id: 'les-4-2',
        module_id: 'mod-4',
        title: 'Using Services with Turtlesim',
        order: 2,
        xp: 20,
        theory: `Let us use services with turtlesim! Turtlesim has several built-in services.

**Available turtlesim services:**
- /spawn - Create a new turtle at a specific position
- /kill - Remove a turtle
- /clear - Clear the drawing on the canvas
- /reset - Reset everything
- /turtle1/set_pen - Change the pen color and thickness
- /turtle1/teleport_absolute - Move turtle to exact coordinates
- /turtle1/teleport_relative - Move turtle relative to current position

**How to call a service from the CLI:**
\`\`\`
ros2 service call /service_name service_type "request_data"
\`\`\`

The request data format depends on the service type. You can check the format with:
\`\`\`
ros2 interface show service_type
\`\`\`

Let us spawn a second turtle!`,
        key_terms: [
          { term: 'Spawn', definition: 'Creating a new entity (like a new turtle) in the simulation' },
          { term: 'Teleport', definition: 'Instantly moving an object to a new position (not walking, just appearing there)' },
        ],
        code_example: {
          language: 'bash',
          code: `# Start turtlesim
ros2 run turtlesim turtlesim_node

# List all available services
ros2 service list

# Check the type of the /spawn service
ros2 service type /spawn
# Output: turtlesim/srv/Spawn

# See what data the Spawn service expects
ros2 interface show turtlesim/srv/Spawn
# Output:
# float32 x
# float32 y
# float32 theta
# string name
# ---
# string name

# Spawn a new turtle named "turtle2" at position (1, 1)
ros2 service call /spawn turtlesim/srv/Spawn \\
  "{x: 1.0, y: 1.0, theta: 0.0, name: 'turtle2'}"

# Change the pen color of turtle1 to red
ros2 service call /turtle1/set_pen turtlesim/srv/SetPen \\
  "{r: 255, g: 0, b: 0, width: 3, off: 0}"

# Teleport turtle1 to the center
ros2 service call /turtle1/teleport_absolute turtlesim/srv/TeleportAbsolute \\
  "{x: 5.54, y: 5.54, theta: 0.0}"`,
          explanation: 'The ros2 service call command lets you invoke services from the terminal. The request data format must match the service type definition.',
        },
        terminal_output: `$ ros2 service call /spawn turtlesim/srv/Spawn "{x: 1.0, y: 1.0, theta: 0.0, name: 'turtle2'}"
waiting for service to become available...
requester: making request: turtlesim.srv.Spawn_Request(x=1.0, y=1.0, theta=0.0, name='turtle2')

response:
turtlesim.srv.Spawn_Response(name='turtle2')

# A second turtle appears in the turtlesim window!

$ ros2 node list
/turtlesim
# Note: the new turtle is NOT a new node - it is managed by the same turtlesim node`,
        quiz: {
          question: 'After spawning a second turtle, why does ros2 node list NOT show a new node?',
          options: [
            'The spawn failed',
            'The new turtle is managed by the existing turtlesim node, not a separate one',
            'You need to refresh the node list',
            'ROS2 only shows one node at a time',
          ],
          correct_index: 1,
          explanation: 'The turtlesim node manages all turtles internally. Spawning a new turtle adds it to the same node, not creates a new node. This is a design choice by the turtlesim developers.',
        },
        try_it: ['Spawn a second turtle with a custom name and position', 'Change the pen color of turtle1', 'Teleport turtle1 to a corner of the canvas', 'Try killing turtle2 with the /kill service'],
      },
      {
        id: 'les-4-3',
        module_id: 'mod-4',
        title: 'Writing a Service Server and Client',
        order: 3,
        xp: 25,
        theory: `Now let us write our own service! We will create:
1. A **service server** that adds two numbers
2. A **service client** that calls it

**The recipe for a service server:**
1. Create a node
2. Create a service with a name and service type
3. Define a callback that processes the request and returns a response

**The recipe for a service client:**
1. Create a node
2. Create a service client with the same name and type
3. Wait for the service to be available
4. Send a request and wait for the response

For this example, we will use the built-in example_interfaces/srv/AddTwoInts service type which takes two integers and returns their sum.`,
        key_terms: [
          { term: 'AddTwoInts', definition: 'A built-in example service type: request has two ints a and b, response has sum' },
          { term: 'Service callback', definition: 'The function that runs when a service request arrives - it processes the request and returns a response' },
        ],
        code_example: {
          language: 'python',
          code: `# === SERVICE SERVER ===
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddServiceServer(Node):
    def __init__(self):
        super().__init__('add_service_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback
        )
        self.get_logger().info('Add Two Ints service is READY.')

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Received: {request.a} + {request.b} = {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)
    node = AddServiceServer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


# === SERVICE CLIENT ===
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
import sys

class AddServiceClient(Node):
    def __init__(self, a, b):
        super().__init__('add_service_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')

        # Wait for the server to be available
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for server...')

        request = AddTwoInts.Request()
        request.a = a
        request.b = b

        self.get_logger().info(f'Sending: {a} + {b}')
        future = self.client.call_async(request)
        rclpy.spin_until_future_complete(self, future)
        result = future.result()
        self.get_logger().info(f'Result: {result.sum}')

def main(args=None):
    rclpy.init(args=args)
    a = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    b = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    node = AddServiceClient(a, b)
    node.destroy_node()
    rclpy.shutdown()`,
          explanation: 'The server registers a service called "add_two_ints" and processes requests. The client connects to that service, sends two numbers, and waits for the sum.',
        },
        terminal_output: `# Terminal 1 (Server):
$ python3 add_server.py
[INFO] [add_service_server]: Add Two Ints service is READY.
[INFO] [add_service_server]: Received: 5 + 3 = 8

# Terminal 2 (Client):
$ python3 add_client.py 5 3
[INFO] [add_service_client]: Sending: 5 + 3
[INFO] [add_service_client]: Result: 8`,
        quiz: {
          question: 'What does the client do if the server is not running yet?',
          options: [
            'Crashes with an error',
            'Waits in a loop until the service becomes available',
            'Sends the request anyway',
            'Creates the server itself',
          ],
          correct_index: 1,
          explanation: 'The client uses wait_for_service() in a loop, checking every second until the server is ready. This prevents errors from calling a non-existent service.',
        },
        try_it: ['Create both files and run the server in one terminal', 'Run the client with different numbers in another terminal', 'Try running the client WITHOUT the server - what happens?', 'Now start the server and try the client again'],
      },
    ],
  },
  {
    id: 'mod-5',
    title: 'Actions - Long-Running Tasks',
    description: 'Learn about actions for tasks that take time and need progress feedback.',
    icon: 'PlayCircle',
    order: 5,
    lessons: [
      {
        id: 'les-5-1',
        module_id: 'mod-5',
        title: 'What are Actions?',
        order: 1,
        xp: 15,
        theory: `**Actions are for tasks that take TIME and you want PROGRESS UPDATES.**

Think of ordering food at a restaurant:
- **Topic** = the kitchen broadcasts "order up!" (one-way, continuous)
- **Service** = you ask "is the soup ready?" and get yes/no (request/response)
- **Action** = you order, the kitchen gives you progress ("chopping... cooking... plating..."), and finally delivers the food

**An action has THREE parts:**
1. **Goal** - What you want done ("rotate 180 degrees")
2. **Feedback** - Progress updates while working ("currently at 45 degrees... 90 degrees...")
3. **Result** - The final outcome ("rotation complete, took 3.2 seconds")

**When to use actions:**
- Navigation (go to point B - takes time, you want progress)
- Arm movement (reach for object - takes time, you want progress)
- Any long-running task where you might want to CANCEL midway

**Actions are built ON TOP of topics and services:**
- The goal and result use a service-like mechanism
- The feedback uses a topic-like mechanism
- This is why you learn topics and services first!`,
        key_terms: [
          { term: 'Goal', definition: 'What you want the action to achieve (the request)' },
          { term: 'Feedback', definition: 'Periodic progress updates sent while the action is executing' },
          { term: 'Result', definition: 'The final outcome of the action after it completes' },
          { term: 'Cancel', definition: 'The ability to abort an action while it is still running' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'What makes actions DIFFERENT from services?',
          options: [
            'Actions are faster than services',
            'Actions provide progress feedback while the task is running, services do not',
            'Actions do not return a result',
            'Services can be cancelled but actions cannot',
          ],
          correct_index: 1,
          explanation: 'The key difference is feedback. Services block until done with no updates. Actions let you monitor progress and even cancel midway.',
        },
        try_it: ['Think of 3 tasks on a warehouse robot that would use actions', 'For each, write: what is the goal? What feedback would you want? What is the result?'],
      },
      {
        id: 'les-5-2',
        module_id: 'mod-5',
        title: 'Using Actions with Turtlesim',
        order: 2,
        xp: 20,
        theory: `Turtlesim has a built-in action: **rotate_absolute** - it rotates the turtle to a specific angle.

This is perfect for learning because:
- The **goal** is the target angle
- The **feedback** is the current angle during rotation
- The **result** is whether it completed

Let us use the CLI to call this action and see the feedback in action!`,
        key_terms: [
          { term: 'RotateAbsolute', definition: 'A turtlesim action that rotates the turtle to a specific angle' },
        ],
        code_example: {
          language: 'bash',
          code: `# Start turtlesim
ros2 run turtlesim turtlesim_node

# List all available actions
ros2 action list

# Get info about the rotate action
ros2 action info /turtle1/rotate_absolute

# See the action type
ros2 action type /turtle1/rotate_absolute

# See the action interface definition
ros2 interface show turtlesim/action/RotateAbsolute

# Send an action goal - rotate to 3.14 radians (180 degrees)
# The --feedback flag shows progress updates!
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute \\
  "{theta: 3.14}" --feedback

# Try another rotation with feedback
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute \\
  "{theta: 0.0}" --feedback`,
          explanation: 'The --feedback flag is key - without it, you only see the final result. With it, you see real-time progress as the turtle rotates.',
        },
        terminal_output: `$ ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute "{theta: 3.14}" --feedback
Waiting for an action server to become available...
Sending goal:
     theta: 3.14

Feedback:
    remaining: 2.355

Feedback:
    remaining: 1.5707

Feedback:
    remaining: 0.7853

Goal accepted, result:
    delta: 3.14

# The turtle rotated from 0 to 3.14 radians (180 degrees)!
# "remaining" shows how much rotation is left
# "delta" in the result shows the total rotation performed`,
        quiz: {
          question: 'What does the "remaining" value in the action feedback represent?',
          options: [
            'The time remaining before the action times out',
            'How much rotation is still left to reach the goal angle',
            'The number of actions remaining in the queue',
            'The distance the turtle has traveled',
          ],
          correct_index: 1,
          explanation: '"remaining" shows how many radians of rotation are still needed to reach the target angle. It decreases as the turtle rotates toward the goal.',
        },
        try_it: ['Run turtlesim and send a rotate_absolute action with --feedback', 'Watch the "remaining" value decrease in real-time', 'Try sending a goal while the turtle is already rotating - what happens?'],
      },
    ],
  },
  {
    id: 'mod-6',
    title: 'Parameters - Configuring Your Node',
    description: 'Learn how to use parameters to configure nodes at runtime without changing code.',
    icon: 'Sliders',
    order: 6,
    lessons: [
      {
        id: 'les-6-1',
        module_id: 'mod-6',
        title: 'What are Parameters?',
        order: 1,
        xp: 15,
        theory: `**Parameters are configuration values** that you can change WITHOUT recompiling your code.

Think of it like your phone's settings app:
- You can change the ringtone volume without rewriting the phone's software
- You can change the wallpaper without reinstalling the OS
- The settings persist until you change them again

**In ROS2:**
- A node declares parameters with default values in code
- You can change them from the CLI at launch time or while running
- Parameters have types: integer, float, string, boolean, or lists

**Common uses:**
- Motor speed limits
- Camera resolution
- Robot name
- PID controller gains
- Update frequency

**Key rules:**
1. Parameters belong to a specific node (each node has its own)
2. Parameters must be **declared** before they can be used
3. By default, parameters can only be set at startup (not while running) unless you allow dynamic reconfiguration`,
        key_terms: [
          { term: 'Parameter', definition: 'A configurable value on a node that can be set without changing code' },
          { term: 'Declare', definition: 'Registering a parameter with a node so it can be used' },
          { term: 'Dynamic reconfiguration', definition: 'Allowing parameters to be changed while the node is running' },
        ],
        code_example: {
          language: 'python',
          code: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class ParamNode(Node):
    def __init__(self):
        super().__init__('param_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'TurtleBot')
        self.declare_parameter('max_speed', 1.0)
        self.declare_parameter('debug_mode', False)

        # Read parameter values
        name = self.get_parameter('robot_name').value
        speed = self.get_parameter('max_speed').value
        debug = self.get_parameter('debug_mode').value

        self.get_logger().info(f'Robot: {name}, Max Speed: {speed}, Debug: {debug}')

def main(args=None):
    rclpy.init(args=args)
    node = ParamNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()`,
          explanation: 'declare_parameter() registers a parameter with a default value. get_parameter() reads the current value. Users can override defaults from the CLI.',
        },
        terminal_output: `$ python3 param_node.py
[INFO] [param_node]: Robot: TurtleBot, Max Speed: 1.0, Debug: False

# Override parameters from the CLI:
$ ros2 run my_package param_node --ros-args \\
    -p robot_name:="Explorer" \\
    -p max_speed:=2.5 \\
    -p debug_mode:=true

[INFO] [param_node]: Robot: Explorer, Max Speed: 2.5, Debug: True`,
        quiz: {
          question: 'What is the main advantage of using parameters instead of hardcoding values?',
          options: [
            'Parameters make the code run faster',
            'You can change configuration without modifying and recompiling the code',
            'Parameters are required by ROS2',
            'Parameters use less memory',
          ],
          correct_index: 1,
          explanation: 'Parameters let you configure a node from the command line or launch files. No code changes needed - just pass different values at startup.',
        },
        try_it: ['Create the param_node.py file and run it with default values', 'Run it again with overridden parameters using --ros-args', 'Use ros2 param list /param_node to see all parameters', 'Use ros2 param get /param_node max_speed to read a specific parameter'],
      },
    ],
  },
  {
    id: 'mod-7',
    title: 'Launch Files - Start Everything at Once',
    description: 'Learn how to launch multiple nodes together with launch files.',
    icon: 'Rocket',
    order: 7,
    lessons: [
      {
        id: 'les-7-1',
        module_id: 'mod-7',
        title: 'Why Launch Files?',
        order: 1,
        xp: 15,
        theory: `Imagine you built a robot with 5 nodes. Every time you want to test it, you need to open 5 terminals and type 5 commands. That is annoying and error-prone.

**Launch files solve this:** One file, one command, ALL nodes start together.

**What launch files do:**
1. Start multiple nodes with a single command
2. Set parameters for each node
3. Remap topic names
4. Include other launch files
5. Pass arguments to customize the launch

**In ROS2, launch files are written in Python** (not XML like ROS1). This means you have the full power of Python - loops, conditionals, functions - in your launch configuration.

**The basic structure:**
\`\`\`
ros2 launch package_name launch_file.py
\`\`\`

Or run a launch file directly:
\`\`\`
ros2 launch /path/to/my_launch.py
\`\`\`

Think of launch files as a "startup script" for your robot - press one button and everything boots up in the right order with the right settings.`,
        key_terms: [
          { term: 'Launch file', definition: 'A Python script that describes which nodes to start and how to configure them' },
          { term: 'Remap', definition: 'Redirecting a topic name so a node talks on a different topic than its default' },
          { term: 'LaunchDescription', definition: 'The main object in a launch file that contains all the nodes and actions to launch' },
        ],
        code_example: {
          language: 'python',
          code: `# my_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Start turtlesim
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='turtlesim',
            output='screen',
        ),
        # Start teleop with a remapped topic
        Node(
            package='turtlesim',
            executable='turtle_teleop_key',
            name='teleop',
            output='screen',
            remappings=[
                ('/turtle1/cmd_vel', '/turtle1/cmd_vel'),
            ],
        ),
    ])

# Run it with:
# ros2 launch my_launch.py`,
          explanation: 'This launch file starts both turtlesim and teleop with a single command. No more opening two terminals!',
        },
        terminal_output: `$ ros2 launch my_launch.py
[INFO] [launch]: All log files can be found below...
[INFO] [turtlesim]: Starting turtlesim with node name /turtlesim
[INFO] [teleop]: Reading from keyboard and sending to /turtle1/cmd_vel...
# Both nodes start from ONE command!`,
        quiz: {
          question: 'What is the main benefit of launch files?',
          options: [
            'They make nodes run faster',
            'They let you start multiple nodes with a single command instead of opening many terminals',
            'They are required for ROS2 to work',
            'They replace the need for nodes',
          ],
          correct_index: 1,
          explanation: 'Launch files automate starting multiple nodes together. One command replaces opening many terminals and typing many commands.',
        },
        try_it: ['Create the launch file above and save it as my_launch.py', 'Run it with: ros2 launch my_launch.py', 'Both turtlesim and teleop should start together!'],
      },
    ],
  },
  {
    id: 'mod-8',
    title: 'Custom Messages and Interfaces',
    description: 'Create your own message types when the built-in ones are not enough.',
    icon: 'FileCode',
    order: 8,
    lessons: [
      {
        id: 'les-8-1',
        module_id: 'mod-8',
        title: 'Why Custom Messages?',
        order: 1,
        xp: 15,
        theory: `ROS2 comes with many built-in message types (Twist, Pose, String, Int32, etc.) but sometimes you need something custom.

**Example:** You are building a weather station robot. You want to publish temperature, humidity, and wind speed together. There is no built-in message for that - you need to create one.

**The three types of interfaces:**
1. **.msg** - For topics (one-way data)
2. **.srv** - For services (request + response)
3. **.action** - For actions (goal + result + feedback)

**Where to put them:**
Custom interfaces go in a separate package (by convention, named your_package_msgs). They must be in a folder structure:
\`\`\`
my_robot_msgs/
  msg/
    Weather.msg
  srv/
    GetWeather.srv
  action/
    ScanWeather.action
\`\`\`

**After creating the files, you build with colcon** and the build system generates Python and C++ code from your definitions.`,
        key_terms: [
          { term: '.msg file', definition: 'A text file defining the fields of a topic message' },
          { term: '.srv file', definition: 'A text file defining request and response fields for a service' },
          { term: '.action file', definition: 'A text file defining goal, result, and feedback fields for an action' },
          { term: 'colcon', definition: 'The ROS2 build tool that compiles packages and generates code from interface definitions' },
        ],
        code_example: {
          language: 'python',
          code: `# File: my_robot_msgs/msg/Weather.msg
# A custom message for weather data

float32 temperature    # in Celsius
float32 humidity       # percentage 0-100
float32 wind_speed     # in m/s
string station_name    # which station reported this
std_msgs/Header header # timestamp and frame

# ---

# File: my_robot_msgs/srv/GetWeather.srv
# Request: city name
string city_name
---
# Response: weather data
float32 temperature
float32 humidity
string condition    # "sunny", "rainy", etc.

# ---

# File: my_robot_msgs/action/ScanWeather.action
# Goal: how long to scan
float32 scan_duration
---
# Result: summary after scanning
float32 avg_temperature
float32 avg_humidity
int32 samples_collected
---
# Feedback: current progress
float32 current_temperature
int32 samples_so_far`,
          explanation: 'Custom interfaces are defined in simple text files. The build system (colcon) reads these and generates Python/C++ code you can import in your nodes.',
        },
        terminal_output: `# After building with colcon:
$ colcon build --packages-select my_robot_msgs
Starting >>> my_robot_msgs
Finished <<< my_robot_msgs [2.1s]

# Now you can import in Python:
# from my_robot_msgs.msg import Weather
# from my_robot_msgs.srv import GetWeather
# from my_robot_msgs.action import ScanWeather`,
        quiz: {
          question: 'Where should custom message definitions be placed?',
          options: [
            'In the same package as your nodes',
            'In a separate _msgs package by convention (e.g., my_robot_msgs)',
            'In the ROS2 installation directory',
            'Anywhere, ROS2 will find them automatically',
          ],
          correct_index: 1,
          explanation: 'By convention, custom interfaces go in a separate package with the _msgs suffix. This keeps interfaces separate from node logic and allows sharing across packages.',
        },
        try_it: ['Create a my_robot_msgs package structure', 'Write a custom .msg file for robot battery status (voltage, percentage, charging)', 'Write a custom .srv file for setting motor speed (request: speed, response: success)'],
      },
    ],
  },
  {
    id: 'mod-9',
    title: 'TF2 - Where is Everything?',
    description: 'Understand coordinate frames and transforms - how robots track where things are relative to each other.',
    icon: 'Compass',
    order: 9,
    lessons: [
      {
        id: 'les-9-1',
        module_id: 'mod-9',
        title: 'What are Coordinate Frames?',
        order: 1,
        xp: 15,
        theory: `A robot needs to know WHERE things are. But "where" depends on your perspective.

**Example:** You are standing in a room. The table is 2 meters to YOUR left. But from the table's perspective, YOU are 2 meters to ITS right. Both are correct - just different reference points.

**In robotics, we call these reference points "frames" (or "coordinate frames"):**
- **base_link** - the robot's body (origin is at the robot's center)
- **odom** - the world relative to where the robot started
- **map** - the absolute world position
- **camera** - where the camera is on the robot
- **laser** - where the laser sensor is on the robot

**TF2 (Transform Library)** keeps track of all these frames and how they relate to each other. It answers questions like:
- "Where is the camera relative to the robot base?" (fixed transform)
- "Where is the robot in the world?" (changes as robot moves)

**Think of TF2 as a GPS + compass system for every part of the robot.**`,
        key_terms: [
          { term: 'Frame', definition: 'A coordinate system with an origin and orientation - a reference point for measuring position' },
          { term: 'base_link', definition: 'The standard name for the robot body frame (its center point)' },
          { term: 'Transform', definition: 'The mathematical relationship between two frames (translation + rotation)' },
          { term: 'TF2', definition: 'The ROS2 Transform Library that tracks coordinate frames over time' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Why does a robot need multiple coordinate frames?',
          options: [
            'Because ROS2 requires it',
            'Because different parts of the robot (camera, laser, wheels) are in different physical locations, and each needs its own reference point',
            'Because one frame is not accurate enough',
            'Because the robot moves too fast for one frame',
          ],
          correct_index: 1,
          explanation: 'Each sensor and part of the robot is at a different physical location. To know where a detected object is relative to the robot base, you need transforms between all these frames.',
        },
        try_it: ['Draw a simple robot with 3 parts (body, camera on top, laser in front)', 'Label each part with its frame name', 'Draw arrows between frames showing the transform relationships'],
      },
    ],
  },
  {
    id: 'mod-10',
    title: 'URDF - Describing Your Robot',
    description: "Learn how to describe a robot's physical structure using URDF (Unified Robot Description Format).",
    icon: 'Cuboid',
    order: 10,
    lessons: [
      {
        id: 'les-10-1',
        module_id: 'mod-10',
        title: 'What is a URDF?',
        order: 1,
        xp: 20,
        theory: `**URDF** (Unified Robot Description Format) is an XML file that describes your robot's physical structure.

Think of it like a **skeleton description** for your robot:
- What parts does it have? (links)
- How are the parts connected? (joints)
- What do the parts look like? (visual geometry)
- How heavy are the parts? (inertial properties)
- What sensors are on each part? (Gazebo plugins)

**Links and Joints:**
- A **link** is a rigid body part (like a bone)
- A **joint** connects two links (like a knee joint)

**Every URDF is a tree:**
- It starts with a root link (usually base_link)
- Each joint connects a parent link to a child link
- No loops allowed (use SRDF for closed chains)

**Simple example - a mobile robot with a body and two wheels:**
- base_link (body)
  - left_wheel_joint -> left_wheel_link
  - right_wheel_joint -> right_wheel_link

The URDF tells ROS2: "the left wheel is 0.3 meters to the left of the body center, and it can rotate around its axis."`,
        key_terms: [
          { term: 'URDF', definition: "Unified Robot Description Format - XML file describing a robot's physical structure" },
          { term: 'Link', definition: 'A rigid body part of the robot (like a bone in a skeleton)' },
          { term: 'Joint', definition: 'A connection between two links that defines how they can move relative to each other' },
          { term: 'base_link', definition: 'The root link of the robot - usually the center of the main body' },
        ],
        code_example: {
          language: 'xml',
          code: `<?xml version="1.0"?>
<robot name="simple_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- The main body -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.1"/>  <!-- length, width, height in meters -->
      </geometry>
      <origin xyz="0 0 0" rpy="0 0 0"/>
    </visual>
  </link>

  <!-- Left wheel -->
  <link name="left_wheel_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.02"/>
      </geometry>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
    </visual>
  </link>

  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel_link"/>
    <origin xyz="0 0.16 -0.03" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>  <!-- wheel rotates around Y axis -->
  </joint>

  <!-- Right wheel -->
  <link name="right_wheel_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.02"/>
      </geometry>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
    </visual>
  </link>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel_link"/>
    <origin xyz="0 -0.16 -0.03" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>

</robot>`,
          explanation: 'This URDF describes a simple robot with a rectangular body and two wheels. Each joint specifies the parent/child relationship and the position/orientation offset.',
        },
        terminal_output: `# Check your URDF for errors:
$ check_urdf simple_robot.urdf
URDF parsed successfully

# View the URDF in RViz:
$ ros2 run robot_state_publisher robot_state_publisher \\
    --ros-args -p robot_description:="$(cat simple_robot.urdf)"`,
        quiz: {
          question: 'What is the relationship between links and joints in a URDF?',
          options: [
            'Links connect joints together',
            'Joints connect links together and define how they can move relative to each other',
            'Links and joints are the same thing',
            'A robot can only have one link',
          ],
          correct_index: 1,
          explanation: 'Joints are the connections between links. Each joint has a parent link and a child link, and defines the type of motion allowed (fixed, revolute, continuous, etc.).',
        },
        try_it: ['Create the URDF file above and save it as simple_robot.urdf', 'Install check_urdf and validate your file', 'Try adding a third link (a caster wheel) to the URDF'],
      },
    ],
  },
  {
    id: 'mod-11',
    title: 'Gazebo - Simulating Your Robot',
    description: 'Bring your URDF robot to life in the Gazebo physics simulator.',
    icon: 'Monitor',
    order: 11,
    lessons: [
      {
        id: 'les-11-1',
        module_id: 'mod-11',
        title: 'What is Gazebo?',
        order: 1,
        xp: 15,
        theory: `**Gazebo** is a physics simulator for robots. It lets you test your robot code without having a physical robot.

**Why simulate?**
- Real robots are expensive (a research robot can cost $10,000+)
- Real robots can break (crash into a wall = expensive repair)
- Simulation lets you test safely and quickly
- You can simulate sensors (cameras, lasers) that you do not own

**What Gazebo provides:**
- **Physics engine** - gravity, collisions, friction
- **Sensor simulation** - cameras, LiDAR, IMU, GPS
- **3D visualization** - see your robot in a virtual world
- **ROS2 integration** - your ROS2 nodes work with the simulated robot exactly like a real one

**The key insight:** Your ROS2 code does not know (or care) if it is talking to a real robot or a simulated one. The same code works for both! This is one of the most powerful features of ROS2.

**Gazebo versions:**
- **Gazebo Classic** (old, used with ROS1 and early ROS2)
- **Gazebo (new)** (also called Ignition Gazebo or Gazebo Sim - the modern version)

For ROS2 Humble, we typically use Gazebo Classic (gazebo11). For ROS2 Jazzy and newer, use the new Gazebo.`,
        key_terms: [
          { term: 'Gazebo', definition: 'A robotics physics simulator that lets you test robot code without physical hardware' },
          { term: 'Physics engine', definition: 'Software that simulates real-world physics: gravity, collisions, friction, etc.' },
          { term: 'SDF', definition: "Simulation Description Format - Gazebo's XML format for describing simulation worlds" },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Why is simulation so valuable in robotics?',
          options: [
            'Simulation is always 100% accurate',
            'It lets you test code safely without expensive hardware, and the same ROS2 code works on both simulated and real robots',
            'Simulation is faster than real robots',
            'You do not need to learn ROS2 if you use simulation',
          ],
          correct_index: 1,
          explanation: 'Simulation lets you develop and test without hardware risk. The key benefit is that your ROS2 code is identical for simulation and real robots - just swap the hardware interface.',
        },
        try_it: ['Install Gazebo: sudo apt install ros-humble-gazebo-ros-pkgs', 'Launch an empty Gazebo world: ros2 launch gazebo_ros gazebo.launch.py', 'You should see a 3D empty world window'],
      },
    ],
  },
  {
    id: 'mod-12',
    title: 'Navigation2 - Making Your Robot Move Smart',
    description: 'Learn the Nav2 stack for autonomous navigation: mapping, path planning, and obstacle avoidance.',
    icon: 'Navigation',
    order: 12,
    lessons: [
      {
        id: 'les-12-1',
        module_id: 'mod-12',
        title: 'What is Nav2?',
        order: 1,
        xp: 15,
        theory: `**Navigation2 (Nav2)** is the ROS2 navigation stack. It is the software that lets a robot go from point A to point B autonomously while avoiding obstacles.

**What Nav2 does (in plain English):**
1. **SLAM** (Simultaneous Localization and Mapping) - The robot explores and builds a map while figuring out where it is on that map
2. **Localization** - Once a map exists, the robot figures out "I am at position (x, y) facing direction theta"
3. **Path Planning** - Given a goal, compute the best path to get there
4. **Path Following** - Actually drive along the planned path
5. **Obstacle Avoidance** - If something blocks the path, go around it
6. **Behavior Trees** - Decide what to do in complex situations (stuck? replan. Low battery? go home.)

**Think of Nav2 like a GPS navigation system for your car:**
- SLAM = driving around a new city and drawing a map
- Localization = the blue dot showing where you are
- Path Planning = calculating the route
- Path Following = turn-by-turn directions
- Obstacle Avoidance = "traffic ahead, rerouting"
- Behavior Trees = "if traffic is too bad, take a different route entirely"

**Nav2 is a COLLECTION of nodes** working together. You do not write Nav2 from scratch - you configure it for your robot.`,
        key_terms: [
          { term: 'SLAM', definition: 'Simultaneous Localization and Mapping - building a map while tracking your position in it' },
          { term: 'Localization', definition: "Determining the robot's position and orientation on a known map" },
          { term: 'Path Planning', definition: 'Computing a route from current position to a goal while avoiding obstacles' },
          { term: 'Behavior Tree', definition: 'A decision-making structure that orchestrates complex robot behaviors' },
          { term: 'Costmap', definition: 'A grid where each cell has a "cost" - high cost means obstacle, low cost means clear' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'What is the difference between SLAM and Localization?',
          options: [
            'They are the same thing',
            'SLAM builds a map AND finds your position. Localization only finds your position on an EXISTING map',
            'SLAM is for simulation, localization is for real robots',
            'Localization builds maps, SLAM uses them',
          ],
          correct_index: 1,
          explanation: 'SLAM does both mapping and localization simultaneously. Localization assumes a map already exists and just finds where you are on it.',
        },
        try_it: ['Watch a YouTube video of "ROS2 Nav2 navigation demo" to see it in action', 'Draw a simple map of a room and mark where the robot starts and its goal', 'Draw the path the robot should take, then mark an obstacle on that path - how should it reroute?'],
      },
    ],
  },
  {
    id: 'mod-13',
    title: 'Capstone - Build a Complete Robot Project',
    description: 'Combine everything you have learned to build a complete ROS2 robot application.',
    icon: 'Trophy',
    order: 13,
    lessons: [
      {
        id: 'les-13-1',
        module_id: 'mod-13',
        title: 'Your Capstone Project: Patrol Robot',
        order: 1,
        xp: 50,
        theory: `Congratulations on making it this far! Now let us put EVERYTHING together.

**Capstone Project: Autonomous Patrol Robot**

You will build a simulated robot that:
1. Has a URDF description (Module 10)
2. Runs in Gazebo simulation (Module 11)
3. Uses custom messages for patrol waypoints (Module 8)
4. Has a patrol node that publishes waypoint goals (Modules 2, 3)
5. Uses Nav2 to navigate between waypoints (Module 12)
6. Reports status via a service (Module 4)
7. Sends progress feedback via an action (Module 5)
8. Uses parameters for patrol speed and route (Module 6)
9. Launches everything with a single launch file (Module 7)
10. Uses TF2 for coordinate tracking (Module 9)

**Step-by-step plan:**

**Phase 1 - Setup (Day 1-2):**
- Create a ROS2 package for your patrol robot
- Write the URDF for a simple differential-drive robot
- Launch it in Gazebo and verify it appears

**Phase 2 - Core Nodes (Day 3-5):**
- Write a waypoint publisher node (publishes next patrol point)
- Write a status service (returns current patrol status)
- Write a patrol action server (navigates waypoints with feedback)

**Phase 3 - Navigation (Day 6-7):**
- Configure Nav2 for your robot
- Run SLAM to create a map
- Test autonomous navigation to a single goal

**Phase 4 - Integration (Day 8-10):**
- Connect patrol action to Nav2
- Add parameters for customization
- Create a launch file that starts everything
- Test the full patrol loop

**You now have a complete, working ROS2 application!**`,
        key_terms: [
          { term: 'Waypoint', definition: 'A specific location the robot should visit during its patrol' },
          { term: 'Differential drive', definition: 'A robot that moves by controlling the speed of two wheels independently' },
          { term: 'Patrol', definition: 'Repeatedly visiting a set of locations in order' },
        ],
        code_example: null,
        terminal_output: null,
        quiz: {
          question: 'Which ROS2 concepts does the capstone project combine?',
          options: [
            'Only topics and services',
            'All of them: nodes, topics, services, actions, parameters, launch files, TF2, URDF, Gazebo, and Nav2',
            'Only navigation',
            'Only URDF and Gazebo',
          ],
          correct_index: 1,
          explanation: 'The capstone integrates every concept from the entire curriculum into one working application. This is how real robot systems are built.',
        },
        try_it: ['Create your ROS2 package: ros2 pkg create patrol_robot --build-type ament_python', 'Write the URDF for your patrol robot', 'Start a plan for which nodes you need and how they communicate'],
      },
    ],
  },
];

export function getAllLessons(): Lesson[] {
  return modules.flatMap(m => m.lessons);
}

export function getModule(moduleId: string): Module | undefined {
  return modules.find(m => m.id === moduleId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  return modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
}

export function getLessonIdsForModule(moduleId: string): string[] {
  const mod = modules.find(m => m.id === moduleId);
  return mod ? mod.lessons.map(l => l.id) : [];
}

export function getNextLesson(currentLessonId: string): Lesson | null {
  const allLessons = getAllLessons();
  const idx = allLessons.findIndex(l => l.id === currentLessonId);
  if (idx < 0 || idx >= allLessons.length - 1) return null;
  return allLessons[idx + 1];
}

export function getPreviousLesson(currentLessonId: string): Lesson | null {
  const allLessons = getAllLessons();
  const idx = allLessons.findIndex(l => l.id === currentLessonId);
  if (idx <= 0) return null;
  return allLessons[idx - 1];
}

export function isModuleUnlocked(moduleId: string, completedLessonIds: Set<string>): boolean {
  const mod = modules.find(m => m.id === moduleId);
  if (!mod) return false;
  if (mod.order === 0) return true;
  const prevModule = modules.find(m => m.order === mod.order - 1);
  if (!prevModule) return true;
  return prevModule.lessons.every(l => completedLessonIds.has(l.id));
}
