import { useState } from 'react';

interface CodespacesSetupProps {
  challengeTitle?: string;
  onClose: () => void;
}

const ROS2_DEVCONTAINER = `{
  "name": "ROS2 Learn Environment",
  "image": "ros:humble",
  "features": {
    "ghcr.io/devcontainers/features/python:1": {}
  },
  "postCreateCommand": "sudo apt-get update && sudo apt-get install -y python3-colcon-common-extensions ros-humble-turtlesim && source /opt/ros/humble/setup.bash",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-iot.vscode-ros"
      ]
    }
  },
  "remoteEnv": {
    "ROS_DOMAIN_ID": "0"
  }
}`;

const ROS2_SETUP_SCRIPT = `#!/bin/bash
# ROS2 Learn - Quick Setup Script
# Run this in your GitHub Codespace terminal

echo "=== ROS2 Learn Environment Setup ==="

# Source ROS2
source /opt/ros/humble/setup.bash

# Install turtlesim if not present
sudo apt-get update -qq
sudo apt-get install -y -qq ros-humble-turtlesim ros-humble-ros2cli

# Create workspace
mkdir -p ~/ros2learn/src
cd ~/ros2learn

echo ""
echo "=== Setup Complete! ==="
echo "Try these commands:"
echo "  ros2 run turtlesim turtlesim_node    # Start the simulator"
echo "  ros2 topic list                       # See active topics"
echo "  ros2 node list                        # See running nodes"
echo ""
echo "To run your Python code:"
echo "  python3 your_file.py"
`;

export function CodespacesSetup({ challengeTitle, onClose }: CodespacesSetupProps) {
  const [step, setStep] = useState<'intro' | 'codespace' | 'local' | 'devcontainer'>('intro');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <h2 className="text-lg font-bold text-surface-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-surface-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Run with Real ROS2
          </h2>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5">
          {step === 'intro' && (
            <div className="space-y-4">
              <p className="text-surface-300 text-sm">
                The in-browser simulator gives you a taste of ROS2, but for the full experience with real ROS2 Humble,
                turtlesim, and all CLI tools, you need a Linux environment. Choose how you want to set it up:
              </p>

              <div className="grid gap-3">
                <button
                  onClick={() => setStep('codespace')}
                  className="text-left bg-surface-800 border border-surface-700 hover:border-primary-600 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-surface-700 rounded-lg flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                      <svg className="w-5 h-5 text-surface-300 group-hover:text-primary-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-surface-100 font-semibold group-hover:text-primary-400 transition-colors">GitHub Codespaces</h3>
                      <p className="text-surface-500 text-xs">Free, instant, no install needed. Opens in your browser.</p>
                    </div>
                  </div>
                  <p className="text-surface-400 text-sm">
                    Create a Codespace with ROS2 Humble pre-installed. Get a full VS Code + terminal in your browser with real ROS2.
                    Free 120 hours/month on GitHub.
                  </p>
                </button>

                <button
                  onClick={() => setStep('local')}
                  className="text-left bg-surface-800 border border-surface-700 hover:border-primary-600 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-surface-700 rounded-lg flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                      <svg className="w-5 h-5 text-surface-300 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-surface-100 font-semibold group-hover:text-primary-400 transition-colors">Local Install</h3>
                      <p className="text-surface-500 text-xs">Ubuntu 22.04 + ROS2 Humble on your machine.</p>
                    </div>
                  </div>
                  <p className="text-surface-400 text-sm">
                    Install ROS2 Humble directly on Ubuntu 22.04 (or via VM/Docker on Mac/Windows). Full performance, works offline.
                  </p>
                </button>

                <button
                  onClick={() => setStep('devcontainer')}
                  className="text-left bg-surface-800 border border-surface-700 hover:border-primary-600 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-surface-700 rounded-lg flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                      <svg className="w-5 h-5 text-surface-300 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-surface-100 font-semibold group-hover:text-primary-400 transition-colors">Docker / Dev Container</h3>
                      <p className="text-surface-500 text-xs">Use the devcontainer.json in any project.</p>
                    </div>
                  </div>
                  <p className="text-surface-400 text-sm">
                    Copy the devcontainer.json below into your project and open it in VS Code with Docker. ROS2 Humble auto-installs.
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 'codespace' && (
            <div className="space-y-4">
              <button onClick={() => setStep('intro')} className="text-surface-400 hover:text-surface-200 text-sm flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              <h3 className="text-lg font-semibold text-surface-100">Set Up GitHub Codespace</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <div>
                    <p className="text-surface-200 font-medium">Create a new GitHub repository</p>
                    <p className="text-surface-400 text-sm">Go to github.com/new and create a repo called <code className="bg-surface-800 px-1 rounded text-primary-300">ros2learn</code></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <div>
                    <p className="text-surface-200 font-medium">Add the devcontainer.json</p>
                    <p className="text-surface-400 text-sm mb-2">Create <code className="bg-surface-800 px-1 rounded text-primary-300">.devcontainer/devcontainer.json</code> in your repo with this content:</p>
                    <div className="bg-surface-950 border border-surface-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700">
                        <span className="text-xs text-surface-500 font-mono">.devcontainer/devcontainer.json</span>
                        <button
                          onClick={() => copyToClipboard(ROS2_DEVCONTAINER, 'devcontainer')}
                          className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                        >
                          {copied === 'devcontainer' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 text-xs text-surface-200 font-mono overflow-x-auto whitespace-pre-wrap">{ROS2_DEVCONTAINER}</pre>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <div>
                    <p className="text-surface-200 font-medium">Open in Codespaces</p>
                    <p className="text-surface-400 text-sm">Go to your repo on GitHub, click the green "Code" button, switch to "Codespaces" tab, and click "Create codespace on main".</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <div>
                    <p className="text-surface-200 font-medium">Wait for setup and start coding!</p>
                    <p className="text-surface-400 text-sm">The Codespace will auto-install ROS2 Humble and turtlesim. Once ready, open a terminal and run:</p>
                    <div className="bg-surface-950 border border-surface-700 rounded-lg p-3 mt-2">
                      <code className="text-xs text-success-500 font-mono">source /opt/ros/humble/setup.bash</code><br/>
                      <code className="text-xs text-success-500 font-mono">ros2 run turtlesim turtlesim_node</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
                <p className="text-sm text-primary-400 font-medium mb-1">Free tier</p>
                <p className="text-xs text-surface-400">GitHub Codespaces gives you 120 core-hours/month free. A 2-core Codespace running 2 hours/day lasts the whole month.</p>
              </div>
            </div>
          )}

          {step === 'local' && (
            <div className="space-y-4">
              <button onClick={() => setStep('intro')} className="text-surface-400 hover:text-surface-200 text-sm flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              <h3 className="text-lg font-semibold text-surface-100">Install ROS2 Locally</h3>

              <div className="space-y-3">
                <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-surface-200 mb-2">Option A: Ubuntu 22.04 (Native)</h4>
                  <p className="text-surface-400 text-xs mb-2">Best performance. Run these commands in your terminal:</p>
                  <div className="bg-surface-950 border border-surface-700 rounded-lg p-3">
                    <pre className="text-xs text-surface-200 font-mono whitespace-pre-wrap">{`# 1. Set up locale
sudo apt update && sudo apt install locales -y
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

# 2. Add ROS2 apt repository
sudo apt install software-properties-common -y
sudo add-apt-repository universe -y
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

# 3. Install ROS2 Humble
sudo apt update
sudo apt install ros-humble-desktop ros-humble-turtlesim -y

# 4. Source and test
source /opt/ros/humble/setup.bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
ros2 run turtlesim turtlesim_node`}</pre>
                  </div>
                </div>

                <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-surface-200 mb-2">Option B: Docker (Mac/Windows)</h4>
                  <p className="text-surface-400 text-xs mb-2">Run ROS2 in a Docker container on any OS:</p>
                  <div className="bg-surface-950 border border-surface-700 rounded-lg p-3">
                    <pre className="text-xs text-surface-200 font-mono whitespace-pre-wrap">{`# Pull and run ROS2 Humble container
docker run -it --rm \\
  --name ros2learn \\
  -e DISPLAY=host.docker.internal:0 \\
  ros:humble

# Inside the container:
apt-get update && apt-get install -y ros-humble-turtlesim
source /opt/ros/humble/setup.bash
ros2 run turtlesim turtlesim_node`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'devcontainer' && (
            <div className="space-y-4">
              <button onClick={() => setStep('intro')} className="text-surface-400 hover:text-surface-200 text-sm flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              <h3 className="text-lg font-semibold text-surface-100">Dev Container Setup</h3>
              <p className="text-surface-400 text-sm">Copy this into <code className="bg-surface-800 px-1 rounded text-primary-300">.devcontainer/devcontainer.json</code> in any project, then open in VS Code with "Dev Containers: Reopen in Container".</p>

              <div className="bg-surface-950 border border-surface-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700">
                  <span className="text-xs text-surface-500 font-mono">devcontainer.json</span>
                  <button
                    onClick={() => copyToClipboard(ROS2_DEVCONTAINER, 'devcontainer2')}
                    className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                  >
                    {copied === 'devcontainer2' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 text-xs text-surface-200 font-mono overflow-x-auto whitespace-pre-wrap">{ROS2_DEVCONTAINER}</pre>
              </div>

              <h4 className="text-sm font-semibold text-surface-200 mt-4">Quick Setup Script</h4>
              <p className="text-surface-400 text-sm">Save this as <code className="bg-surface-800 px-1 rounded text-primary-300">setup.sh</code> and run it in your Codespace/container terminal:</p>

              <div className="bg-surface-950 border border-surface-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700">
                  <span className="text-xs text-surface-500 font-mono">setup.sh</span>
                  <button
                    onClick={() => copyToClipboard(ROS2_SETUP_SCRIPT, 'setup')}
                    className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                  >
                    {copied === 'setup' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 text-xs text-surface-200 font-mono overflow-x-auto whitespace-pre-wrap">{ROS2_SETUP_SCRIPT}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
