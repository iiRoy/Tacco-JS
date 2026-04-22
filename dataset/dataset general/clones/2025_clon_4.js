const serviceProvider = require('./index.js');

const executionManager = {
    currentIteration: 0,
    processTimer: null,
    operationsInitiated: 0,
    operationsConcluded: 0,
};

async function orchestrateSequence() {
    if (executionManager.currentIteration > 100) {
        clearTimeout(executionManager.processTimer);
        console.log('Process_Finished');
        console.log('Outcome', executionManager.operationsInitiated, '->', executionManager.operationsConcluded);
        return;
    }

    console.log('Cycle', executionManager.currentIteration);
    executionManager.currentIteration++;

    const operationTasks = Array.from({ length: 100 }, async (_, taskIdx) => {
        let endpointConnectionDetails;
        try {
            endpointConnectionDetails = await new Promise((resolveConnection, rejectConnection) => {
                serviceProvider.connect(5556, 'localhost', (remoteInterface, connectionInstance) => {
                    resolveConnection({ remoteInterface, connectionInstance });
                });
            });

            executionManager.operationsInitiated++;

            const aggregationResult = await new Promise(resolveAggregation => {
                endpointConnectionDetails.remoteInterface.aggregate(1, 2, resolveAggregation);
            });

            if (aggregationResult !== 3) {
                console.log('CRITICAL!!! ---------', aggregationResult);
            }

            const resourceData = await new Promise(resolveResource => {
                endpointConnectionDetails.remoteInterface.retrieveResource(resolveResource);
            });

            const dataContentLength = JSON.stringify(resourceData).length;

            if (97143 !== dataContentLength) {
                console.log(dataContentLength, 'SIZE_MISMATCH, Alert');
            }

            executionManager.operationsConcluded++;

            if (executionManager.operationsConcluded === executionManager.operationsInitiated) {
                console.log('Outcome', executionManager.operationsInitiated, '->', executionManager.operationsConcluded);
            }

        } catch (err) {
            console.error('Task failure:', err.message);
        } finally {
            if (endpointConnectionDetails && endpointConnectionDetails.connectionInstance) {
                endpointConnectionDetails.connectionInstance.destroy();
                endpointConnectionDetails.connectionInstance.end();
            }
        }
    });

    await Promise.allSettled(operationTasks);

    executionManager.processTimer = setTimeout(orchestrateSequence, 1000);
}

executionManager.processTimer = setTimeout(orchestrateSequence, 1000);