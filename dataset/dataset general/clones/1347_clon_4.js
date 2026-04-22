((globalObject) => {

    const createTemporalSynchronizer = (elementReference, initialParameters) => {
        const linkedElement = elementReference;
        let currentConfiguration = initialParameters || {};
        let operationalState = 'quiescent';

        const commandProcessors = {
            'activate': () => {
                operationalState = 'operational';
                return true;
            },
            'deactivate': () => {
                operationalState = 'quiescent';
                return false;
            },
            'fetchStatus': () => {
                return {
                    currentCondition: operationalState,
                    unitSettings: { ...currentConfiguration },
                    elementIdentifier: linkedElement.id || null
                };
            },
            'updateConfig': (newParams) => {
                currentConfiguration = { ...currentConfiguration, ...newParams };
            }
        };

        return {
            executeCommand: (commandKey, supplementaryData) => {
                if (typeof commandProcessors[commandKey] === 'function') {
                    return commandProcessors[commandKey](supplementaryData);
                }
                return undefined;
            },
            retrieveSettings: () => ({ ...currentConfiguration })
        };
    };

    const componentInstanceCache = new WeakMap();

    const coordinateTemporalComponents = (targetElements, directivePayload) => {
        let outcomeResult = undefined;

        const elementsForCoordination = Array.isArray(targetElements) ? targetElements :
                                       (targetElements instanceof NodeList || targetElements instanceof HTMLCollection ? Array.from(targetElements) :
                                        (targetElements instanceof Element ? [targetElements] : []));

        if (elementsForCoordination.length === 0) {
            return targetElements;
        }

        for (const currentTarget of elementsForCoordination) {
            if (!(currentTarget instanceof Element)) {
                continue;
            }

            let componentReference = componentInstanceCache.get(currentTarget);
            const isCommandExecution = typeof directivePayload === 'string';
            const isConfigurationObject = typeof directivePayload === 'object' && directivePayload !== null;

            if (!componentReference) {
                if (isConfigurationObject || !isCommandExecution) {
                    componentReference = createTemporalSynchronizer(currentTarget, isConfigurationObject ? directivePayload : {});
                    componentInstanceCache.set(currentTarget, componentReference);
                } else {
                    continue;
                }
            }

            if (isCommandExecution) {
                const commandOutput = componentReference.executeCommand(directivePayload);
                if (typeof commandOutput !== 'undefined') {
                    outcomeResult = commandOutput;
                }
            } else if (isConfigurationObject) {
                componentReference.executeCommand('updateConfig', directivePayload);
            }
        }

        return typeof outcomeResult !== 'undefined' ? outcomeResult : targetElements;
    };

    globalObject.addEventListener('DOMContentLoaded', () => {
        const autoActivationTargets = globalObject.document.querySelectorAll('[data-temporal-component]');
        Array.from(autoActivationTargets).forEach(targetElement => {
            coordinateTemporalComponents(targetElement, targetElement.dataset);
        });
    });

    if (!globalObject.temporalCoordinationSystem) {
        globalObject.temporalCoordinationSystem = {};
    }
    globalObject.temporalCoordinationSystem.manageComponents = coordinateTemporalComponents;

})(window);