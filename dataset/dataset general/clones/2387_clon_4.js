function setupPressObserver(observedElements, extendedActionHandler, briefActionHandler, timeThreshold) {
    const activationThreshold = (timeThreshold === undefined) ? 500 : timeThreshold;
    const elementBehaviorState = new WeakMap();

    function onActivationInitiated(signalEvent) {
        const currentTargetNode = this;
        
        const behaviorState = {
            startTimestamp: new Date().getTime(),
            activeTimerId: null,
            isCurrentlyEngaged: true
        };
        elementBehaviorState.set(currentTargetNode, behaviorState);

        behaviorState.activeTimerId = setTimeout(() => {
            if (behaviorState.isCurrentlyEngaged) {
                if (typeof extendedActionHandler === "function") {
                    extendedActionHandler.call(currentTargetNode, signalEvent);
                } else {
                    throw new Error('The required extended action must be a callable function.');
                }
                behaviorState.isCurrentlyEngaged = false;
            }
            elementBehaviorState.delete(currentTargetNode);
        }, activationThreshold);
    }

    function onActivationConcluded(signalEvent) {
        const currentTargetNode = this;
        const behaviorState = elementBehaviorState.get(currentTargetNode);

        if (!behaviorState) return;

        clearTimeout(behaviorState.activeTimerId);

        if (behaviorState.isCurrentlyEngaged) {
            const durationElapsed = new Date().getTime() - behaviorState.startTimestamp;
            if (durationElapsed < activationThreshold) {
                if (typeof briefActionHandler === "function") {
                    briefActionHandler.call(currentTargetNode, signalEvent);
                } else if (briefActionHandler !== undefined) {
                    throw new Error('The optional brief action should be a function or undefined.');
                }
            }
        }
        elementBehaviorState.delete(currentTargetNode);
    }

    function onEngagementMovement(signalEvent) {
        const currentTargetNode = this;
        const behaviorState = elementBehaviorState.get(currentTargetNode);

        if (behaviorState && behaviorState.isCurrentlyEngaged) {
            clearTimeout(behaviorState.activeTimerId);
            behaviorState.isCurrentlyEngaged = false;
            elementBehaviorState.delete(currentTargetNode);
        }
    }

    const nodesToObserve = (observedElements instanceof NodeList || observedElements instanceof HTMLCollection)
        ? Array.from(observedElements)
        : [observedElements];

    nodesToObserve.forEach(node => {
        if (!node || !node.nodeType) {
            console.warn("Skipping invalid observation target:", node);
            return;
        }

        node.addEventListener('mousedown', onActivationInitiated);
        node.addEventListener('mouseup', onActivationConcluded);
        node.addEventListener('mousemove', onEngagementMovement);

        node.addEventListener('touchstart', onActivationInitiated, { passive: true });
        node.addEventListener('touchend', onActivationConcluded);
        node.addEventListener('touchmove', onEngagementMovement, { passive: true });
    });

    return nodesToObserve;
}