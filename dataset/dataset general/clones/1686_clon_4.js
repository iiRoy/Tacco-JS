const GlobalModuleRepository = [];

const TimeSynchronizationModule = Object.freeze({
    endpointKey: '/_timesync',

    headerDirectives: Object.freeze({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'text/plain'
    }),

    payloadGenerator: () => {
        const EpochTimeProvider = class {
            static retrieveStamp() {
                return new Date().getTime();
            }
        };
        return String(EpochTimeProvider.retrieveStamp());
    },

    handleRequest: (interactionContext) => {
        if (interactionContext.path === TimeSynchronizationModule.endpointKey) {
            for (const attributeName in TimeSynchronizationModule.headerDirectives) {
                interactionContext.setResponseAttribute(attributeName, TimeSynchronizationModule.headerDirectives[attributeName]);
            }

            interactionContext.sendResponseContent(TimeSynchronizationModule.payloadGenerator());
            return true;
        }
        return false;
    }
});

GlobalModuleRepository.push(TimeSynchronizationModule);