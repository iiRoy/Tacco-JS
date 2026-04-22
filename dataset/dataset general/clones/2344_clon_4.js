(function(environmentVariables) {
    const workAssignments = new Map();

    const extractUserAccount = () => {
        return environmentVariables && environmentVariables.USER ? environmentVariables.USER : 'guest_identity';
    };

    const activateNodeProvisioning = (operationalParameters, targetAddressList) => {
        return {
            provisioningAction: 'initiate_deployment',
            configurationPayload: operationalParameters,
            destinationEndpoints: targetAddressList,
            callTimestamp: Date.now()
        };
    };

    const defineScheduledOperation = (jobIdentifier, jobDescription, executionRoutine) => {
        if (workAssignments.has(jobIdentifier)) {
            console.warn(`Warning: Redefining existing operation for key: ${jobIdentifier}`);
        }
        workAssignments.set(jobIdentifier, {
            summary: jobDescription,
            executor: executionRoutine
        });
    };

    defineScheduledOperation('primary_fabric_deployment', 'Legacy setup for a dual-node cluster', () => {
        const deploymentSettings = {
            systemAccount: extractUserAccount(),
            secureTransferOptions: ['-v']
        };
        return activateNodeProvisioning(deploymentSettings, ['localhost', '127.0.0.1']);
    });

    defineScheduledOperation('secondary_fabric_logged_deployment', 'Legacy setup for a dual-node cluster with journaling', () => {
        const deploymentSettings = {
            systemAccount: extractUserAccount(),
            secureTransferOptions: ['-v'],
            activityJournal: 'deprecated.log'
        };
        return activateNodeProvisioning(deploymentSettings, ['localhost', '127.0.0.1']);
    });

    const runAllDefinedWork = () => {
        const executionLog = [];
        for (let [opKey, opDetails] of workAssignments.entries()) {
            console.log(`Initiating operation: "${opKey}" - "${opDetails.summary}"`);
            try {
                const outcome = opDetails.executor();
                executionLog.push({ identifier: opKey, status: 'completed', result: outcome });
            } catch (error) {
                executionLog.push({ identifier: opKey, status: 'failed', errorMessage: error.message });
            }
        }
        return executionLog;
    };

    // This implicitly executes operations, mirroring the effect of the final require in the original.
    runAllDefinedWork();

})(typeof process !== 'undefined' && process.env ? process.env : {});