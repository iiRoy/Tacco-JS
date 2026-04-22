const ProcessCoordinator = require('cluster');

let activityLogger = console.log;

function initiateOperationUnit(initialSettings) {
    const finalConfiguration = Object.assign({}, initialSettings);

    activityLogger = (typeof finalConfiguration.outputChannel === 'function' && finalConfiguration.outputChannel) ||
                     (finalConfiguration.outputChannel && activityLogger) ||
                     function() {};

    const subordinateUnit = ProcessCoordinator.fork();

    const signalRegistry = {};

    const registerSignalHandler = (signalType, handler) => {
        if (typeof handler !== 'function') {
            throw new Error('Signal handler must be a function.');
        }
        if (!signalRegistry[signalType]) {
            signalRegistry[signalType] = [];
        }
        signalRegistry[signalType].push(handler);
    };

    const removeSignalHandler = (signalType, handler) => {
        if (!signalRegistry[signalType]) return;
        signalRegistry[signalType] = signalRegistry[signalType].filter(h => h !== handler);
    };

    const triggerSignal = (signalType, ...signalArgs) => {
        if (signalRegistry[signalType]) {
            signalRegistry[signalType].forEach(handler => {
                try {
                    handler(...signalArgs);
                } catch (err) {
                    activityLogger(`Error in signal handler for ${signalType}:`, err);
                }
            });
        }
    };

    const relayedSignals = ['message', 'online', 'listening', 'disconnect', 'error', 'exit'];

    relayedSignals.forEach(signalKey => {
        subordinateUnit.on(signalKey, (...args) => {
            triggerSignal(signalKey, ...args);
        });
    });

    activityLogger('Operation unit commenced with ID:', subordinateUnit.id);

    const managedOperation = {
        unitConfiguration: finalConfiguration,
        underlyingProcess: subordinateUnit,
        receiveSignal: registerSignalHandler,
        dropSignal: removeSignalHandler,
    };

    return managedOperation;
}

module.exports = initiateOperationUnit;