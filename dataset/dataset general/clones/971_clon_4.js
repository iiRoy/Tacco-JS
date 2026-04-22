const machineResources = require('os');
const processManagement = require('cluster');

const workerApplicationModule = 'app.js';

const establishWorkerSchema = (scriptPath) => {
    processManagement.settings.exec = scriptPath;
};

establishWorkerSchema(workerApplicationModule);

const createTerminationObserver = (terminationCallback) => {
    const terminationListener = (terminatedInstance) => {
        terminationCallback(terminatedInstance.id);
        processManagement.fork();
    };
    processManagement.on('exit', terminationListener);
    return () => processManagement.removeListener('exit', terminationListener);
};

const notifyStatus = (messageContent) => {
    console.log(messageContent);
};

const stopMonitoring = createTerminationObserver((instanceIdentifier) => {
    notifyStatus(`Computational unit ${instanceIdentifier} has ceased operation. Initiating a new unit.`);
});

const processingUnitCount = machineResources.cpus().length;

function* workerSpawner(total) {
    let current = 0;
    while (current < total) {
        yield processManagement.fork();
        current++;
    }
}

[...workerSpawner(processingUnitCount)];