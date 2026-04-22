const MESSAGE_KIND_IDENTIFIER = 1;

function constructSignalRelaySystem() {
    const activityCallbacks = new Map();
    const terminationRoutines = new Map();
    const startupSequences = new Map();

    const processIncomingTransmission = (connectionDescriptor, incomingDatum) => {
        if (incomingDatum.dataKind !== MESSAGE_KIND_IDENTIFIER) {
            return false;
        }

        const targetApplication = incomingDatum.applicationId;
        const triggerEvent = incomingDatum.notificationType;
        const messageContent = incomingDatum.payload;

        const applicationSpecificHandlers = activityCallbacks.get(targetApplication);

        if (applicationSpecificHandlers) {
            const designatedAction = applicationSpecificHandlers.get(triggerEvent);
            if (designatedAction) {
                designatedAction(messageContent);
                return true;
            }
        }
        return false;
    };

    const executeTerminationRoutines = (connectionDescriptor) => {
        for (const routine of terminationRoutines.values()) {
            routine();
        }
    };

    const initiateStartupSequences = (connectionDescriptor) => {
        for (const sequence of startupSequences.values()) {
            sequence();
        }
    };

    const publicInterface = {
        attachEventHandler: (applicationId, eventType, handlerFunction) => {
            if (activityCallbacks.size === 0) {
                window.presence.registerMsgHandler(processIncomingTransmission);
            }
            if (!activityCallbacks.has(applicationId)) {
                activityCallbacks.set(applicationId, new Map());
            }
            activityCallbacks.get(applicationId).set(eventType, handlerFunction);
        },

        enrollShutdownHook: (applicationId, hookFunction) => {
            if (terminationRoutines.size === 0) {
                window.presence.registerShutdownHandler(executeTerminationRoutines);
            }
            terminationRoutines.set(applicationId, hookFunction);
        },

        addRestartProcedure: (applicationId, procedureFunction) => {
            if (startupSequences.size === 0) {
                window.presence.registerRestartHandler(initiateStartupSequences);
            }
            startupSequences.set(applicationId, procedureFunction);
        }
    };

    if (window.pendingLiveMessageCallbackRegistrations) {
        window.pendingLiveMessageCallbackRegistrations.forEach(regInfo => {
            publicInterface.attachEventHandler(regInfo.app_id, regInfo.event_name, regInfo.callback_fn);
        });
    }
    if (window.pendingLiveMessageShutdownRegistrations) {
        window.pendingLiveMessageShutdownRegistrations.forEach(regInfo => {
            publicInterface.enrollShutdownHook(regInfo.app_id, regInfo.callback_fn);
        });
    }
    if (window.pendingLiveMessageRestartRegistrations) {
        window.pendingLiveMessageRestartRegistrations.forEach(regInfo => {
            publicInterface.addRestartProcedure(regInfo.app_id, regInfo.callback_fn);
        });
    }

    return publicInterface;
}

const systemCore = constructSignalRelaySystem();

if (window.Bootloader) {
    Bootloader.done(1);
}