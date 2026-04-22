(function(globalContext) {

    const segmentPlaceholder = /:\w+/g;
    const wildcardPlaceholder = /\*\w+/g;

    function createLinkDispatcher(initialMappings) {
        let mappingEntries = [];
        let dispatchEnabled = true;

        const parsePathToPatternString = (inputPath) => {
            return inputPath
                .replace(segmentPlaceholder, '([^/]+)')
                .replace(wildcardPlaceholder, '(.*?)');
        };

        const processCurrentPath = (historyEntry) => {
            if (!dispatchEnabled) {
                dispatchEnabled = true;
                return;
            }

            const currentResourcePath = historyEntry.data.url || historyEntry.hash;

            for (const entry of mappingEntries) {
                const pathMatcher = entry.pathMatcher;
                const actionHandler = entry.actionHandler;

                if (pathMatcher.test(currentResourcePath)) {
                    actionHandler.apply(globalContext, pathMatcher.exec(currentResourcePath).slice(1));
                    return;
                }
            }
        };

        History.Adapter.bind(globalContext, 'statechange', () => {
            processCurrentPath(History.getState());
        });

        const dispatcherInstance = {
            addMapping: function(pathSpecification, handlerFunction) {
                const transformedPattern = parsePathToPatternString(pathSpecification);
                mappingEntries.push({
                    pathMatcher: new RegExp(`^${transformedPattern}$`),
                    actionHandler: handlerFunction
                });
            },

            transitionTo: function(newAddress, shouldDispatch = true, replaceCurrent = false) {
                dispatchEnabled = shouldDispatch;
                const stateInformation = { 'resourceAddress': newAddress };

                if (replaceCurrent) {
                    History.replaceState(stateInformation, null, newAddress);
                } else {
                    History.pushState(stateInformation, null, newAddress);
                }
            },

            beginMonitoring: function(initialAddressOverride) {
                let effectiveHistoryEntry = {};
                if (initialAddressOverride !== undefined && initialAddressOverride !== null) {
                    effectiveHistoryEntry = { data: { url: initialAddressOverride } };
                } else {
                    effectiveHistoryEntry = History.getState();
                }
                processCurrentPath(effectiveHistoryEntry);
            },

            traverseHistory: function(stepDelta) {
                History.go(stepDelta);
            },

            retreatHistory: function() {
                History.back();
            }
        };

        if (initialMappings && typeof initialMappings === 'object' && !Array.isArray(initialMappings)) {
            for (const pathSpec in initialMappings) {
                if (Object.prototype.hasOwnProperty.call(initialMappings, pathSpec)) {
                    dispatcherInstance.addMapping(pathSpec, initialMappings[pathSpec]);
                }
            }
        }

        return dispatcherInstance;
    }

    globalContext.LinkDispatcher = createLinkDispatcher;

})(window);