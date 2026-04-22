(function (externalJQuery, rootScope, undefined) {
    let currentInteractionSession = null;
    const registeredBehaviors = {};
    const deviceSupportsTouch = 'ontouchstart' in rootScope;

    const PointerInteractionManager = {

        isListening: false,

        activateListeners: function () {
            const eventTarget = externalJQuery(document);
            eventTarget.on('touchstart MSPointerDown pointerdown', handleInteractionStart);
            eventTarget.on('touchmove MSPointerMove MSPointerHover pointermove', handleInteractionMove);
            eventTarget.on('touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel', handleInteractionEnd);
            this.isListening = true;
        },

        deactivateListeners: function () {
            const eventTarget = externalJQuery(document);
            eventTarget.off('touchstart MSPointerDown pointerdown', handleInteractionStart);
            eventTarget.off('touchmove MSPointerMove MSPointerHover pointermove', handleInteractionMove);
            eventTarget.off('touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel', handleInteractionEnd);
            this.isListening = false;
        },

        registerBehavior: function (behaviorIdentifier, behaviorDefinition) {
            registeredBehaviors[behaviorIdentifier] = behaviorDefinition;
        },

        deriveContextualData: function (normalizedEvent, supplementaryData) {
            const jqTarget = externalJQuery(normalizedEvent.subjectElement);
            const targetOffset = jqTarget.offset();
            const firstInteractionPoint = normalizedEvent.interactionPoints[0];
            const derivedParams = {
                xCoord: firstInteractionPoint.x,
                yCoord: firstInteractionPoint.y,
                offsetFromTargetLeft: targetOffset.left - firstInteractionPoint.x,
                offsetFromTargetTop: targetOffset.top - firstInteractionPoint.y
            };
            return externalJQuery.extend(derivedParams, supplementaryData);
        },

        normalizeInputEvent: function (originalDOMEvent) {
            const processedEvent = {
                kind: originalDOMEvent.type,
                occurrenceTime: Date.now(),
                subjectElement: originalDOMEvent.target,
                interactionPoints: []
            };

            let sourcePoints = [];
            const eventType = originalDOMEvent.type;

            if (eventType.includes('touch')) {
                sourcePoints = originalDOMEvent.changedTouches || originalDOMEvent.originalEvent.changedTouches || originalDOMEvent.touches || originalDOMEvent.originalEvent.touches;
            } else if (eventType.match(/.*?pointer.*?/i)) {
                sourcePoints = [originalDOMEvent.originalEvent];
            }

            processedEvent.interactionPoints = Array.from(sourcePoints).map(p => ({
                x: p.pageX,
                y: p.pageY
            }));

            return processedEvent;
        },

        createInteractionRecord: function (initialEventData) {
            return {
                begin: initialEventData,
                movements: [],
                final: null
            };
        },

        GeometricUtils: {
            measureTimeDelta: (startPoint, endPoint) => endPoint.occurrenceTime - startPoint.occurrenceTime,

            calculateEuclideanDistance: (pointOne, pointTwo) =>
                Math.hypot(pointTwo.x - pointOne.x, pointTwo.y - pointOne.y),

            determineAngleDegrees: (pointOne, pointTwo) =>
                Math.atan2(pointTwo.y - pointOne.y, pointTwo.x - pointOne.x) * 180 / Math.PI,

            resolveCardinalDirection: (angleValue) => {
                if (angleValue < -45 && angleValue > -135) {
                    return 'up';
                } else if (angleValue >= -45 && angleValue <= 45) {
                    return 'right';
                } else if (angleValue >= 45 && angleValue < 135) {
                    return 'down';
                } else if (angleValue >= 135 || angleValue <= -135) {
                    return 'left';
                }
                return 'undefined_direction';
            },

            computeScaleFactor: (initialEvent, currentEvent) => {
                const initialPoints = initialEvent.interactionPoints;
                const currentPoints = currentEvent.interactionPoints;

                if (initialPoints.length === 2 && currentPoints.length === 2) {
                    const initialDistance = PointerInteractionManager.GeometricUtils.calculateEuclideanDistance(initialPoints[0], initialPoints[1]);
                    const currentDistance = PointerInteractionManager.GeometricUtils.calculateEuclideanDistance(currentPoints[0], currentPoints[1]);
                    return (currentDistance / initialDistance).toFixed(2);
                }
                return 0;
            },

            calculateAngularShift: (initialEvent, currentEvent) => {
                const initialPoints = initialEvent.interactionPoints;
                const currentPoints = currentEvent.interactionPoints;

                if (initialPoints.length === 2 && currentPoints.length === 2) {
                    const initialAngle = PointerInteractionManager.GeometricUtils.determineAngleDegrees(initialPoints[0], initialPoints[1]);
                    const currentAngle = PointerInteractionManager.GeometricUtils.determineAngleDegrees(currentPoints[0], currentPoints[1]);
                    return (currentAngle - initialAngle).toFixed(2);
                }
                return 0;
            }
        }
    };

    function dispatchBehaviorEvent(eventType, domEvent, sessionRecord, eventSnapshot) {
        Object.values(registeredBehaviors).forEach(behavior => {
            if (typeof behavior[eventType] === 'function') {
                behavior[eventType].call(this, domEvent, sessionRecord, eventSnapshot);
            }
        });
    }

    function handleInteractionStart(domEvent) {
        const startSnapshot = PointerInteractionManager.normalizeInputEvent(domEvent);
        currentInteractionSession = PointerInteractionManager.createInteractionRecord(startSnapshot);
        dispatchBehaviorEvent('touchstart', domEvent, currentInteractionSession, startSnapshot);
    }

    function handleInteractionMove(domEvent) {
        if (!currentInteractionSession) { return; }

        const moveSnapshot = PointerInteractionManager.normalizeInputEvent(domEvent);
        currentInteractionSession.movements.push(moveSnapshot);
        dispatchBehaviorEvent('touchmove', domEvent, currentInteractionSession, moveSnapshot);
    }

    function handleInteractionEnd(domEvent) {
        if (!currentInteractionSession) { return; }
        const endSnapshot = PointerInteractionManager.normalizeInputEvent(domEvent);
        currentInteractionSession.final = endSnapshot;
        dispatchBehaviorEvent('touchend', domEvent, currentInteractionSession, endSnapshot);
        currentInteractionSession = null;
    }

    PointerInteractionManager.activateListeners();

    externalJQuery.gestureProcessor = PointerInteractionManager;

}(jQuery, this));