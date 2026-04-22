(function (windowRef) {
    const dynamicEffectManager = {};

    const scheduleDeferredAction = function (taskFunction) {
        setTimeout(taskFunction, 0);
    };

    const checkIsObject = function (candidateValue) {
        return candidateValue !== null && typeof candidateValue === 'object' && candidateValue.constructor === Object;
    };

    const checkIsFunction = function (candidateValue) {
        return typeof candidateValue === 'function';
    };

    const checkIsString = function (candidateValue) {
        return typeof candidateValue === 'string';
    };

    const determineCompletionEvent = function (eventAliasMap) {
        const temporaryDisplayNode = document.createElement('ghostNode');
        for (const styleProperty in eventAliasMap) {
            if (Object.prototype.hasOwnProperty.call(eventAliasMap, styleProperty)) {
                if (temporaryDisplayNode.style[styleProperty] !== undefined) {
                    return eventAliasMap[styleProperty];
                }
            }
        }
        return null;
    };

    const transitionCompletionEvents = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
    };

    const animationCompletionEvents = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
    };

    dynamicEffectManager.transitionEndIdentifier = determineCompletionEvent(transitionCompletionEvents);
    dynamicEffectManager.animationEndIdentifier = determineCompletionEvent(animationCompletionEvents);

    dynamicEffectManager.orchestrateVisualChange = function (targetDomElement, modificationInstruction, configurationParameters) {
        configurationParameters = configurationParameters || {};

        let promiseControl;
        let finalEventIdentifier = dynamicEffectManager[configurationParameters.isAnimation ? 'animationEndIdentifier' : 'transitionEndIdentifier'];

        const resultantPromise = new Promise((resolveOutcome, rejectOutcome) => {
            promiseControl = { resolveOutcome, rejectOutcome };
        });

        const eventTriggerProcessor = function (eventObject) {
            targetDomElement.removeEventListener(finalEventIdentifier, eventTriggerProcessor);
            promiseControl.resolveOutcome(targetDomElement);
        };

        if (finalEventIdentifier) {
            targetDomElement.addEventListener(finalEventIdentifier, eventTriggerProcessor);
        }

        scheduleDeferredAction(function () {
            if (checkIsString(modificationInstruction)) {
                targetDomElement.classList.add(modificationInstruction);
            } else if (checkIsFunction(modificationInstruction)) {
                modificationInstruction(targetDomElement);
            } else if (checkIsObject(modificationInstruction)) {
                for (const cssProperty in modificationInstruction) {
                    if (Object.prototype.hasOwnProperty.call(modificationInstruction, cssProperty)) {
                        targetDomElement.style[cssProperty] = modificationInstruction[cssProperty];
                    }
                }
            }

            if (!finalEventIdentifier) {
                promiseControl.resolveOutcome(targetDomElement);
            }
        });

        resultantPromise.abortProcess = function () {
            if (finalEventIdentifier) {
                targetDomElement.removeEventListener(finalEventIdentifier, eventTriggerProcessor);
            }
            promiseControl.rejectOutcome('Visual operation aborted');
        };

        return resultantPromise;
    };

    windowRef.VisualDynamicsEngine = windowRef.VisualDynamicsEngine || {};
    windowRef.VisualDynamicsEngine.EffectCoordinator = dynamicEffectManager.orchestrateVisualChange;
    windowRef.VisualDynamicsEngine.EffectCoordinator.transitionEndIdentifier = dynamicEffectManager.transitionEndIdentifier;
    windowRef.VisualDynamicsEngine.EffectCoordinator.animationEndIdentifier = dynamicEffectManager.animationEndIdentifier;

})(window);