(function(jq) {
    const interactionStateRegistry = new WeakMap();

    const defaultBehaviorAttributes = {
        scanInterval: 100,
        motionTolerance: 6,
        exitDelay: 0
    };

    function mergeBehaviorAttributes(base, overrides) {
        return jq.extend({}, base, overrides);
    }

    function computeSquaredDistance(x1, y1, x2, y2) {
        const deltaX = x1 - x2;
        const deltaY = y1 - y2;
        return deltaX * deltaX + deltaY * deltaY;
    }

    function updatePointerCoordinates(eventData, elementRecord) {
        elementRecord.currentX = eventData.pageX;
        elementRecord.currentY = eventData.pageY;
    }

    function assessPointerStability(triggerEvent, targetNode, elementRecord, attributes) {
        elementRecord.pendingOperationHandle = clearTimeout(elementRecord.pendingOperationHandle);

        const squaredDistance = computeSquaredDistance(elementRecord.previousX, elementRecord.previousY, elementRecord.currentX, elementRecord.currentY);
        if (Math.sqrt(squaredDistance) < attributes.motionTolerance) {
            jq(targetNode).off("mousemove.proximityScan", elementRecord.coordinateUpdater);
            elementRecord.isActiveState = true;
            return attributes.onEnter.call(targetNode, [triggerEvent]);
        } else {
            elementRecord.previousX = elementRecord.currentX;
            elementRecord.previousY = elementRecord.currentY;
            elementRecord.pendingOperationHandle = setTimeout(() => {
                assessPointerStability(triggerEvent, targetNode, elementRecord, attributes);
            }, attributes.scanInterval);
        }
    }

    function initiateDeactivationSequence(triggerEvent, targetNode, elementRecord, attributes) {
        elementRecord.pendingOperationHandle = clearTimeout(elementRecord.pendingOperationHandle);
        elementRecord.isActiveState = false;
        return attributes.onLeave.call(targetNode, [triggerEvent]);
    }

    function handleInputEvent(eventObject) {
        const currentTargetNode = this;
        const currentElementRecord = interactionStateRegistry.get(currentTargetNode);

        if (!currentElementRecord) {
            return;
        }

        const currentAttributes = currentElementRecord.behaviorAttributes;

        if (currentElementRecord.pendingOperationHandle) {
            currentElementRecord.pendingOperationHandle = clearTimeout(currentElementRecord.pendingOperationHandle);
        }

        if (eventObject.type === "mouseenter") {
            currentElementRecord.previousX = eventObject.pageX;
            currentElementRecord.previousY = eventObject.pageY;
            currentElementRecord.coordinateUpdater = (e) => updatePointerCoordinates(e, currentElementRecord);
            jq(currentTargetNode).on("mousemove.proximityScan", currentElementRecord.coordinateUpdater);

            if (!currentElementRecord.isActiveState) {
                currentElementRecord.pendingOperationHandle = setTimeout(() => {
                    assessPointerStability(eventObject, currentTargetNode, currentElementRecord, currentAttributes);
                }, currentAttributes.scanInterval);
            }
        } else if (eventObject.type === "mouseleave") {
            jq(currentTargetNode).off("mousemove.proximityScan", currentElementRecord.coordinateUpdater);
            if (currentElementRecord.isActiveState) {
                currentElementRecord.pendingOperationHandle = setTimeout(() => {
                    initiateDeactivationSequence(eventObject, currentTargetNode, currentElementRecord, currentAttributes);
                }, currentAttributes.exitDelay);
            }
        }
    }

    jq.fn.pointerProximity = function(entryAction, exitAction, eventScope) {
        let configuredAttributes = {};

        if (typeof entryAction === "object") {
            configuredAttributes = entryAction;
        } else if (jq.isFunction(exitAction)) {
            configuredAttributes = { onEnter: entryAction, onLeave: exitAction, delegationTarget: eventScope };
        } else {
            configuredAttributes = { onEnter: entryAction, onLeave: entryAction, delegationTarget: exitAction };
        }

        const effectiveAttributes = mergeBehaviorAttributes(defaultBehaviorAttributes, configuredAttributes);

        return this.each(function() {
            const elementToObserve = this;
            let elementRecord = interactionStateRegistry.get(elementToObserve);

            if (!elementRecord) {
                elementRecord = {
                    pendingOperationHandle: null,
                    isActiveState: false,
                    currentX: 0, currentY: 0,
                    previousX: 0, previousY: 0,
                    coordinateUpdater: null,
                    behaviorAttributes: effectiveAttributes
                };
                interactionStateRegistry.set(elementToObserve, elementRecord);
            } else {
                elementRecord.behaviorAttributes = effectiveAttributes;
            }

            jq(elementToObserve).on({
                'mouseenter.proximityScan': handleInputEvent,
                'mouseleave.proximityScan': handleInputEvent
            }, effectiveAttributes.delegationTarget);
        });
    };
})(jQuery);