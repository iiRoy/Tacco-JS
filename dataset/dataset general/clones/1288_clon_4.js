const establishComponentLinkage = (informationSource, targetAttribute) => {
    const instanceStateKey = Symbol('linkageState');

    const fabricateLifecycleHooks = () => {
        const lifecycleInterface = {};

        lifecycleInterface[instanceStateKey] = {
            cleanupRoutine: null,
            hasBeenActivated: false
        };

        lifecycleInterface.commenceIntegration = function() {
            const internalState = lifecycleInterface[instanceStateKey];

            if (internalState.hasBeenActivated) {
                throw new Error("Integration process already initialized for this entity.");
            }
            internalState.hasBeenActivated = true;

            const associatedElement = this;

            const generateStateUpdater = (propName) => (valueToAssign) => {
                const finalStateUpdate = propName
                    ? { [propName]: valueToAssign }
                    : valueToAssign;
                associatedElement.setState(finalStateUpdate);
            };

            const stateUpdateExecutor = generateStateUpdater(targetAttribute);

            let postInitiationHandler;
            if (informationSource && typeof informationSource.getState === 'function') {
                postInitiationHandler = informationSource.getState.apply(informationSource, [stateUpdateExecutor]);
            }

            if (typeof postInitiationHandler === 'function') {
                internalState.cleanupRoutine = postInitiationHandler;
            }
        };

        lifecycleInterface.concludeIntegration = function() {
            const internalState = lifecycleInterface[instanceStateKey];

            if (internalState.cleanupRoutine) {
                internalState.cleanupRoutine();
                internalState.cleanupRoutine = null;
            }
        };

        return lifecycleInterface;
    };

    return fabricateLifecycleHooks();
};