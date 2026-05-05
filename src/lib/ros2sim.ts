export interface SimLog {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  timestamp: number;
  nodeName?: string;
}

export interface SimMessage {
  topic: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

type MessageCallback = (msg: SimMessage) => void;
type ServiceCallback = (request: Record<string, unknown>) => Record<string, unknown>;
type ActionGoalCallback = (goal: Record<string, unknown>, feedback: (fb: Record<string, unknown>) => void) => Promise<Record<string, unknown>>;
type TimerCallback = () => void;

interface PublisherEntry {
  topic: string;
  type: string;
  queueSize: number;
}

interface SubscriberEntry {
  topic: string;
  type: string;
  callback: MessageCallback;
  queueSize: number;
}

interface ServiceServerEntry {
  name: string;
  type: string;
  callback: ServiceCallback;
}

interface ServiceClientEntry {
  name: string;
  type: string;
}

interface ActionServerEntry {
  name: string;
  type: string;
  callback: ActionGoalCallback;
}

interface ActionClientEntry {
  name: string;
  type: string;
}

interface TimerEntry {
  period: number;
  callback: TimerCallback;
  intervalId: number | null;
}

interface ParamEntry {
  value: unknown;
  type: string;
}

export class SimNode {
  name: string;
  publishers: PublisherEntry[] = [];
  subscribers: SubscriberEntry[] = [];
  serviceServers: ServiceServerEntry[] = [];
  serviceClients: ServiceClientEntry[] = [];
  actionServers: ActionServerEntry[] = [];
  actionClients: ActionClientEntry[] = [];
  timers: TimerEntry[] = [];
  parameters: Map<string, ParamEntry> = new Map();
  private sim: Ros2Sim;

  constructor(name: string, sim: Ros2Sim) {
    this.name = name;
    this.sim = sim;
    sim.registerNode(this);
  }

  create_publisher(type: string, topic: string, queueSize: number = 10): PublisherEntry {
    const entry: PublisherEntry = { topic, type, queueSize };
    this.publishers.push(entry);
    this.sim.registerTopic(topic, type);
    return entry;
  }

  create_subscription(type: string, topic: string, callback: MessageCallback, queueSize: number = 10): SubscriberEntry {
    const entry: SubscriberEntry = { topic, type, callback, queueSize };
    this.subscribers.push(entry);
    this.sim.subscribe(topic, callback);
    return entry;
  }

  create_service(type: string, name: string, callback: ServiceCallback): ServiceServerEntry {
    const entry: ServiceServerEntry = { name, type, callback };
    this.serviceServers.push(entry);
    this.sim.registerService(name, type, callback, this.name);
    return entry;
  }

  create_client(type: string, name: string): ServiceClientEntry {
    const entry: ServiceClientEntry = { name, type };
    this.serviceClients.push(entry);
    return entry;
  }

  create_action_server(type: string, name: string, callback: ActionGoalCallback): ActionServerEntry {
    const entry: ActionServerEntry = { name, type, callback };
    this.actionServers.push(entry);
    this.sim.registerAction(name, type, callback, this.name);
    return entry;
  }

  create_action_client(type: string, name: string): ActionClientEntry {
    const entry: ActionClientEntry = { name, type };
    this.actionClients.push(entry);
    return entry;
  }

  create_timer(period: number, callback: TimerCallback): TimerEntry {
    const entry: TimerEntry = { period, callback, intervalId: null };
    this.timers.push(entry);
    this.sim.registerTimer(entry);
    return entry;
  }

  declare_parameter(name: string, defaultValue: unknown, type: string = 'auto'): ParamEntry {
    const entry: ParamEntry = { value: defaultValue, type };
    this.parameters.set(name, entry);
    return entry;
  }

  get_parameter(name: string): ParamEntry | undefined {
    return this.parameters.get(name);
  }

  get_logger(): { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void } {
    const nodeName = this.name;
    return {
      info: (msg: string) => this.sim.log('INFO', msg, nodeName),
      warn: (msg: string) => this.sim.log('WARN', msg, nodeName),
      error: (msg: string) => this.sim.log('ERROR', msg, nodeName),
    };
  }

  destroy(): void {
    this.sim.unregisterNode(this);
  }
}

interface TurtleState {
  x: number;
  y: number;
  theta: number;
  linearX: number;
  angularZ: number;
  penOn: boolean;
  penColor: { r: number; g: number; b: number };
  penWidth: number;
  trail: { x: number; y: number }[];
}

export class Ros2Sim {
  private nodes: Map<string, SimNode> = new Map();
  private topics: Map<string, { type: string; subscribers: MessageCallback[] }> = new Map();
  private services: Map<string, { type: string; callback: ServiceCallback; nodeName: string }> = new Map();
  private actions: Map<string, { type: string; callback: ActionGoalCallback; nodeName: string }> = new Map();
  private timerEntries: TimerEntry[] = [];
  private logs: SimLog[] = [];
  private logListeners: ((log: SimLog) => void)[] = [];
  private messageListeners: ((msg: SimMessage) => void)[] = [];
  private running = false;
  private simIntervalId: number | null = null;
  private simTime = 0;
  private simSpeed = 1.0;

  turtles: Map<string, TurtleState> = new Map();
  private turtleUpdateListeners: ((turtles: Map<string, TurtleState>) => void)[] = [];

  constructor() {
    this.turtles.set('turtle1', {
      x: 5.544, y: 5.544, theta: 0,
      linearX: 0, angularZ: 0,
      penOn: true, penColor: { r: 0, g: 255, b: 0 }, penWidth: 2,
      trail: [{ x: 5.544, y: 5.544 }],
    });
  }

  init(): void {
    this.running = true;
    this.log('INFO', 'ROS2 simulation initialized');
    this.startSimLoop();
  }

  shutdown(): void {
    this.running = false;
    this.stopTimers();
    if (this.simIntervalId !== null) {
      clearInterval(this.simIntervalId);
      this.simIntervalId = null;
    }
    this.log('INFO', 'ROS2 simulation shut down');
  }

  create_node(name: string): SimNode {
    if (this.nodes.has(name)) {
      this.log('WARN', `Node '${name}' already exists, replacing it`);
      this.nodes.get(name)!.destroy();
    }
    return new SimNode(name, this);
  }

  private startSimLoop(): void {
    const dt = 0.05;
    this.simIntervalId = window.setInterval(() => {
      if (!this.running) return;
      this.simTime += dt * this.simSpeed;
      this.updateTurtles(dt * this.simSpeed);
    }, 50);
  }

  private updateTurtles(dt: number): void {
    for (const [, turtle] of this.turtles) {
      if (Math.abs(turtle.linearX) > 0.001 || Math.abs(turtle.angularZ) > 0.001) {
        turtle.theta += turtle.angularZ * dt;
        turtle.x += turtle.linearX * Math.cos(turtle.theta) * dt;
        turtle.y += turtle.linearZ !== undefined ? 0 : turtle.linearX * Math.sin(turtle.theta) * dt;
        turtle.x = Math.max(0, Math.min(11, turtle.x));
        turtle.y = Math.max(0, Math.min(11, turtle.y));

        if (turtle.penOn) {
          turtle.trail.push({ x: turtle.x, y: turtle.y });
          if (turtle.trail.length > 5000) turtle.trail.shift();
        }

        this.publish('/turtle1/pose', 'turtlesim/msg/Pose', {
          x: turtle.x, y: turtle.y, theta: turtle.theta,
          linear_velocity: turtle.linearX, angular_velocity: turtle.angularZ,
        });
      }
    }
    this.notifyTurtleUpdate();
  }

  registerNode(node: SimNode): void {
    this.nodes.set(node.name, node);
    this.log('INFO', `Node registered: ${node.name}`);
  }

  unregisterNode(node: SimNode): void {
    this.nodes.delete(node.name);
    for (const timer of node.timers) {
      if (timer.intervalId !== null) clearInterval(timer.intervalId);
    }
    this.log('INFO', `Node destroyed: ${node.name}`);
  }

  registerTopic(topic: string, type: string): void {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, { type, subscribers: [] });
    }
  }

  subscribe(topic: string, callback: MessageCallback): void {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, { type: 'unknown', subscribers: [] });
    }
    this.topics.get(topic)!.subscribers.push(callback);
  }

  publish(topic: string, type: string, data: Record<string, unknown>): void {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, { type, subscribers: [] });
    }

    if (topic === '/turtle1/cmd_vel') {
      const lx = Number(data.linear?.x ?? 0);
      const az = Number(data.angular?.z ?? 0);
      const turtle = this.turtles.get('turtle1');
      if (turtle) {
        turtle.linearX = lx;
        turtle.angularZ = az;
      }
    }

    const msg: SimMessage = { topic, type, data, timestamp: this.simTime };
    const topicEntry = this.topics.get(topic);
    if (topicEntry) {
      for (const sub of topicEntry.subscribers) {
        try { sub(msg); } catch (e) { this.log('ERROR', `Subscriber error on ${topic}: ${e}`); }
      }
    }
    for (const listener of this.messageListeners) {
      listener(msg);
    }
  }

  registerService(name: string, type: string, callback: ServiceCallback, nodeName: string): void {
    this.services.set(name, { type, callback, nodeName });
  }

  async callService(name: string, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    const service = this.services.get(name);
    if (!service) throw new Error(`Service '${name}' is not available`);
    this.log('INFO', `Calling service: ${name}`);
    return service.callback(request);
  }

  registerAction(name: string, type: string, callback: ActionGoalCallback, nodeName: string): void {
    this.actions.set(name, { type, callback, nodeName });
  }

  async sendActionGoal(name: string, goal: Record<string, unknown>): Promise<{ result: Record<string, unknown>; feedbacks: Record<string, unknown>[] }> {
    const action = this.actions.get(name);
    if (!action) throw new Error(`Action '${name}' is not available`);
    const feedbacks: Record<string, unknown>[] = [];
    const feedbackFn = (fb: Record<string, unknown>) => { feedbacks.push(fb); };
    const result = await action.callback(goal, feedbackFn);
    return { result, feedbacks };
  }

  registerTimer(entry: TimerEntry): void {
    if (this.running) {
      entry.intervalId = window.setInterval(() => {
        if (this.running) entry.callback();
      }, entry.period * 1000 / this.simSpeed);
    }
    this.timerEntries.push(entry);
  }

  stopTimers(): void {
    for (const entry of this.timerEntries) {
      if (entry.intervalId !== null) clearInterval(entry.intervalId);
      entry.intervalId = null;
    }
  }

  restartTimers(): void {
    for (const entry of this.timerEntries) {
      if (entry.intervalId !== null) clearInterval(entry.intervalId);
      entry.intervalId = window.setInterval(() => {
        if (this.running) entry.callback();
      }, entry.period * 1000 / this.simSpeed);
    }
  }

  log(level: SimLog['level'], message: string, nodeName?: string): void {
    const log: SimLog = { level, message, timestamp: Date.now(), nodeName };
    this.logs.push(log);
    if (this.logs.length > 1000) this.logs.shift();
    for (const listener of this.logListeners) listener(log);
  }

  onLog(listener: (log: SimLog) => void): () => void {
    this.logListeners.push(listener);
    return () => { this.logListeners = this.logListeners.filter(l => l !== listener); };
  }

  onMessage(listener: (msg: SimMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => { this.messageListeners = this.messageListeners.filter(l => l !== listener); };
  }

  onTurtleUpdate(listener: (turtles: Map<string, TurtleState>) => void): () => void {
    this.turtleUpdateListeners.push(listener);
    return () => { this.turtleUpdateListeners = this.turtleUpdateListeners.filter(l => l !== listener); };
  }

  private notifyTurtleUpdate(): void {
    for (const listener of this.turtleUpdateListeners) listener(this.turtles);
  }

  getLogs(): SimLog[] { return [...this.logs]; }
  getNodes(): string[] { return [...this.nodes.keys()]; }
  getTopics(): string[] { return [...this.topics.keys()]; }
  getTopicInfo(topic: string): { type: string; subscriberCount: number } | undefined {
    const t = this.topics.get(topic);
    return t ? { type: t.type, subscriberCount: t.subscribers.length } : undefined;
  }
  getServices(): string[] { return [...this.services.keys()]; }
  getActions(): string[] { return [...this.actions.keys()]; }
  getSimTime(): number { return this.simTime; }
  setSimSpeed(speed: number): void { this.simSpeed = speed; this.restartTimers(); }
  isRunning(): boolean { return this.running; }

  reset(): void {
    this.shutdown();
    this.nodes.clear();
    this.topics.clear();
    this.services.clear();
    this.actions.clear();
    this.timerEntries = [];
    this.logs = [];
    this.simTime = 0;
    this.turtles.clear();
    this.turtles.set('turtle1', {
      x: 5.544, y: 5.544, theta: 0,
      linearX: 0, angularZ: 0,
      penOn: true, penColor: { r: 0, g: 255, b: 0 }, penWidth: 2,
      trail: [{ x: 5.544, y: 5.544 }],
    });
  }

  handleCliCommand(cmd: string): string {
    const parts = cmd.trim().split(/\s+/);
    if (parts[0] !== 'ros2') return `bash: ros2: command not found. Type 'ros2 --help' for available commands.`;

    const sub = parts[1];
    switch (sub) {
      case 'node': {
        if (parts[2] === 'list') return this.getNodes().map(n => `/${n}`).join('\n') || '(no nodes running)';
        if (parts[2] === 'info') {
          const name = parts[3];
          const node = this.nodes.get(name?.replace(/^\//, '') || '');
          if (!node) return `Node ${parts[3]} not found`;
          let info = `/${node.name}\n  Publishers:\n`;
          for (const p of node.publishers) info += `    ${p.topic} [${p.type}]\n`;
          info += `  Subscribers:\n`;
          for (const s of node.subscribers) info += `    ${s.topic} [${s.type}]\n`;
          info += `  Services:\n`;
          for (const s of node.serviceServers) info += `    ${s.name} [${s.type}]\n`;
          return info;
        }
        return 'Usage: ros2 node list | ros2 node info /node_name';
      }
      case 'topic': {
        if (parts[2] === 'list') return this.getTopics().join('\n') || '(no topics)';
        if (parts[2] === 'echo') {
          return `(topic echo is shown in real-time in the terminal output)`;
        }
        if (parts[2] === 'info') {
          const topic = parts[3];
          const info = this.getTopicInfo(topic);
          if (!info) return `Topic ${topic} not found`;
          return `Type: ${info.type}\nSubscription count: ${info.subscriberCount}`;
        }
        return 'Usage: ros2 topic list | ros2 topic info /topic';
      }
      case 'service': {
        if (parts[2] === 'list') return this.getServices().join('\n') || '(no services)';
        return 'Usage: ros2 service list';
      }
      case 'action': {
        if (parts[2] === 'list') return this.getActions().join('\n') || '(no actions)';
        return 'Usage: ros2 action list';
      }
      case '--help': case '-h':
        return `Available commands:
  ros2 node list          List active nodes
  ros2 node info /name    Show node details
  ros2 topic list         List active topics
  ros2 topic info /topic  Show topic info
  ros2 service list       List active services
  ros2 action list        List active actions`;
      default:
        return `ros2: '${sub}' is not a ros2 command. Type 'ros2 --help'.`;
    }
  }

  spawnTurtle(name: string, x: number, y: number, theta: number = 0): void {
    this.turtles.set(name, {
      x, y, theta, linearX: 0, angularZ: 0,
      penOn: true, penColor: { r: 0, g: 255, b: 0 }, penWidth: 2,
      trail: [{ x, y }],
    });
    this.log('INFO', `Spawning turtle [${name}] at x=[${x.toFixed(2)}], y=[${y.toFixed(2)}], theta=[${theta.toFixed(2)}]`, 'turtlesim');
    this.notifyTurtleUpdate();
  }
}

export const globalSim = new Ros2Sim();
