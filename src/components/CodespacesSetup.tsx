import { useState } from 'react';

interface CodespacesSetupProps {
  onClose: () => void;
}

const CODESPACE_DEEP_LINK = 'https://codespaces.new/ros2learn/ros2learn-env?quickstart=1';

const ROS2_DEVCONTAINER = `{
  "name": "ROS2 Learn Environment",
  "image": "ros:humble",
  "features": {
    "ghcr.io/devcontainers/features/python:1": {}
  },
  "postCreateCommand": "sudo apt-get update && sudo apt-get install -y ros-humble-turtlesim ros-humble-ros2cli && source /opt/ros/humble/setup.bash",
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
source /opt/ros/humble/setup.bash
sudo apt-get update -qq
sudo apt-get install -y -qq ros-humble-turtlesim ros-humble-ros2cli
echo "=== ROS2 Learn Environment Ready ==="
echo "Try: ros2 run turtlesim turtlesim_node"
`;

export function CodespacesSetup({ onClose }: CodespacesSetupProps) {
  const [step, setStep] = useState<'quick' | 'manual' | 'local'>('quick');
  const [copied, setCopied] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getDeepLink = () => {
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s]+)/);
      if (match) {
        return `https://codespaces.new/${match[1]}/${match[2]}?quickstart=1`;
      }
    }
    return CODESPACE_DEEP_LINK;
  };

  return (
    <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <h2 className="text-lg font-bold text-surface-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-surface-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Open Real ROS2 Environment
          </h2>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tab Selector */}
          <div className="flex gap-1 bg-surface-800 rounded-lg p-0.5">
            {([
              { id: 'quick', label: 'One-Click Launch' },
              { id: 'manual', label: 'Manual Setup' },
              { id: 'local', label: 'Local Install' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setStep(tab.id)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  step === tab.id ? 'bg-primary-600 text-surface-50' : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {step === 'quick' && (
            <div className="space-y-4">
              <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-5 text-center">
                <p className="text-surface-200 text-sm mb-3">Launch a GitHub Codespace with ROS2 Humble pre-installed. Free 120 core-hours/month.</p>
                <a
                  href={getDeepLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-50 text-surface-950 rounded-lg font-semibold text-sm hover:bg-surface-200 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Open in GitHub Codespaces
                </a>
              </div>

              <div>
                <label className="text-xs text-surface-400 block mb-1">Or enter your own ROS2 repo URL:</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/your-repo"
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                />
              </div>

              <div className="bg-surface-800/50 border border-surface-700 rounded-lg p-3">
                <p className="text-xs text-surface-400">Your repo needs a <code className="text-primary-300">.devcontainer/devcontainer.json</code> with the ROS2 Humble image. Copy the config below and add it to your repo.</p>
              </div>

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
          )}

          {step === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <div>
                    <p className="text-surface-200 font-medium text-sm">Create a GitHub repository</p>
                    <p className="text-surface-400 text-xs">Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">github.com/new</a> and create a repo called <code className="bg-surface-800 px-1 rounded text-primary-300">ros2learn</code></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <div>
                    <p className="text-surface-200 font-medium text-sm">Add the devcontainer.json</p>
                    <p className="text-surface-400 text-xs mb-2">Create <code className="bg-surface-800 px-1 rounded text-primary-300">.devcontainer/devcontainer.json</code> in your repo:</p>
                    <div className="bg-surface-950 border border-surface-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1 bg-surface-800 border-b border-surface-700">
                        <span className="text-xs text-surface-500 font-mono">devcontainer.json</span>
                        <button
                          onClick={() => copyToClipboard(ROS2_DEVCONTAINER, 'devcontainer2')}
                          className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                        >
                          {copied === 'devcontainer2' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 text-xs text-surface-200 font-mono overflow-x-auto whitespace-pre-wrap max-h-[200px]">{ROS2_DEVCONTAINER}</pre>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <div>
                    <p className="text-surface-200 font-medium text-sm">Open in Codespaces</p>
                    <p className="text-surface-400 text-xs">Click the green "Code" button on your repo, switch to "Codespaces" tab, and click "Create codespace on main".</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <div>
                    <p className="text-surface-200 font-medium text-sm">Start coding!</p>
                    <p className="text-surface-400 text-xs mb-2">Once the Codespace is ready, run in the terminal:</p>
                    <div className="bg-surface-950 border border-surface-700 rounded-lg p-3">
                      <code className="text-xs text-success-500 font-mono">source /opt/ros/humble/setup.bash</code><br/>
                      <code className="text-xs text-success-500 font-mono">ros2 run turtlesim turtlesim_node</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-950 border border-surface-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800 border-b border-surface-700">
                  <span className="text-xs text-surface-500 font-mono">setup.sh (optional)</span>
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

          {step === 'local' && (
            <div className="space-y-3">
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-surface-200 mb-2">Ubuntu 22.04 (Native)</h4>
                <div className="bg-surface-950 border border-surface-700 rounded-lg p-3">
                  <pre className="text-xs text-surface-200 font-mono whitespace-pre-wrap">{`sudo apt update && sudo apt install locales -y
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8

sudo apt install software-properties-common curl -y
sudo add-apt-repository universe -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install ros-humble-desktop ros-humble-turtlesim -y

source /opt/ros/humble/setup.bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
ros2 run turtlesim turtlesim_node`}</pre>
                </div>
              </div>

              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-surface-200 mb-2">Docker (Mac/Windows)</h4>
                <div className="bg-surface-950 border border-surface-700 rounded-lg p-3">
                  <pre className="text-xs text-surface-200 font-mono whitespace-pre-wrap">{`docker run -it --rm \\
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
          )}
        </div>
      </div>
    </div>
  );
}
