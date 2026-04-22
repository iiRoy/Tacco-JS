const remoteAccessTool = require("node-ssh");

const connectionPoints = ["192.168.1.1"]; // Placeholder for original 'addresses'
const credentialUser = "myuser";          // Placeholder for original 'user'
const credentialPass = "mypass";          // Placeholder for original 'password'

const commandRegistry = ["uptime", "logout"];

function sessionTermination(hostInfo) {
    console.log(`(Count: ${connectionPoints.length}) Connection to ${hostInfo} severed.`);
}

async function facilitateRemoteControl() {
    let activeBridge = new remoteAccessTool.NodeSSH();
    let currentCommandQueue = [...commandRegistry];
    let promptSignal = null;
    let promptWaiter = null;

    const generatePromptWaiter = () => {
        promptWaiter = new Promise(resolve => {
            promptSignal = resolve;
        });
        return promptWaiter;
    };

    const incomingDataProcessor = (receivedBuffer) => {
        const textContent = receivedBuffer.toString();
        if (/\$ /.test(textContent)) {
            if (promptSignal) {
                promptSignal(textContent);
                promptSignal = null;
                promptWaiter = null;
            }
        }
    };

    try {
        activeBridge.on('close', () => sessionTermination(connectionPoints[0]));

        const connectionOptions = {
            host: connectionPoints[0],
            username: credentialUser,
            password: credentialPass,
            port: 22,
        };

        await activeBridge.connect(connectionOptions);
        console.log(`Connected to ${connectionOptions.host} successfully.`);

        activeBridge.on('data', incomingDataProcessor);

        await generatePromptWaiter(); // Wait for initial prompt after connection

        while (currentCommandQueue.length > 0) {
            const currentCommand = currentCommandQueue.shift();
            console.log(`Dispatching command: "${currentCommand}"`);
            activeBridge.write(currentCommand + "\r\n");
            await generatePromptWaiter(); // Wait for prompt before next command
        }

        console.log("All commands dispatched. Initiating shutdown.");
        activeBridge.end();

    } catch (operationIssue) {
        console.error("Remote control error:", operationIssue.message);
        if (activeBridge && activeBridge.isConnected()) {
            activeBridge.end();
        }
    }
}

facilitateRemoteControl();