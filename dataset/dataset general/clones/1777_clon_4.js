(function( globalScope ) {

    const obtainScrollY = () => globalScope.scrollY || globalScope.pageYOffset;
    const obtainViewportHeight = () => globalScope.innerHeight;
    const obtainDocumentHeight = () => document.documentElement.scrollHeight || document.body.scrollHeight;
    
    const extractElementDimensions = (element) => {
        const boundaryRect = element.getBoundingClientRect();
        return {
            top: boundaryRect.top + obtainScrollY(),
            bottom: boundaryRect.bottom + obtainScrollY(),
            dimension: boundaryRect.height
        };
    };

    const observationCore = {};

    let currentScrollPositionTop;
    let currentScrollPositionBottom;
    let currentTotalDocumentHeight;
    let currentVisibleWindowHeight = obtainViewportHeight();

    let previousTotalDocumentHeight;
    let lastRegisteredEvent;

    const activeObservationUnits = new Set();

    const EVENT_KIND_VISIBILITY_CHANGE = 'visibilityChange';
    const EVENT_KIND_ENTER_VIEWPORT = 'enterViewport';
    const EVENT_KIND_FULLY_ENTER_VIEWPORT = 'fullyEnterViewport';
    const EVENT_KIND_EXIT_VIEWPORT = 'exitViewport';
    const EVENT_KIND_PARTIALLY_EXIT_VIEWPORT = 'partiallyExitViewport';
    const EVENT_KIND_LOCATION_CHANGE = 'locationChange';
    const EVENT_KIND_STATE_CHANGE = 'stateChange';

    const recognisedEventTypes = [
        EVENT_KIND_VISIBILITY_CHANGE,
        EVENT_KIND_ENTER_VIEWPORT,
        EVENT_KIND_FULLY_ENTER_VIEWPORT,
        EVENT_KIND_EXIT_VIEWPORT,
        EVENT_KIND_PARTIALLY_EXIT_VIEWPORT,
        EVENT_KIND_LOCATION_CHANGE,
        EVENT_KIND_STATE_CHANGE
    ];

    const standardBoundaryAdjustments = {top: 0, bottom: 0};

    function updateGlobalViewportState() {
        currentScrollPositionTop = obtainScrollY();
        currentScrollPositionBottom = currentScrollPositionTop + currentVisibleWindowHeight;
        currentTotalDocumentHeight = obtainDocumentHeight();

        if (currentTotalDocumentHeight !== previousTotalDocumentHeight) {
            for (const unit of activeObservationUnits) {
                unit.determineSpatialPlacement();
            }
            previousTotalDocumentHeight = currentTotalDocumentHeight;
        }
    }

    function executeFullMonitoringCycle() {
        currentVisibleWindowHeight = obtainViewportHeight();
        updateGlobalViewportState();
        refreshAndDispatchUnitNotifications();
    }

    let queuedResizeFrameId = null;
    function debounceAndScheduleCycle() {
        if (queuedResizeFrameId) {
            cancelAnimationFrame(queuedResizeFrameId);
        }
        queuedResizeFrameId = requestAnimationFrame(executeFullMonitoringCycle);
    }

    function refreshAndDispatchUnitNotifications() {
        for (const unit of activeObservationUnits) {
            unit.evaluateRelativeStatus();
        }

        for (const unit of activeObservationUnits) {
            unit.dispatchNotifications();
        }
    }

    class ViewportMonitorUnit {
        constructor( targetEntity, boundaryModifiers ) {
            this.targetEntity = targetEntity;
            
            if (!boundaryModifiers) {
                this.boundaryModifiers = standardBoundaryAdjustments;
            } else if (typeof boundaryModifiers === 'number') {
                this.boundaryModifiers = {top: boundaryModifiers, bottom: boundaryModifiers};
            } else {
                this.boundaryModifiers = Object.assign({}, standardBoundaryAdjustments, boundaryModifiers);
            }

            this.notificationCallbacks = new Map();
            for (const type of recognisedEventTypes) {
                this.notificationCallbacks.set(type, new Set());
            }

            this.isPositionLocked = false;

            this.historicalStatus = {
                isInVisibleArea: undefined,
                isCompletelyInVisibleArea: undefined,
                isAboveVisibleBoundary: undefined,
                isBelowVisibleBoundary: undefined
            };

            this.currentEvaluatedStatus = {};

            this.determineSpatialPlacement();
            this.evaluateRelativeStatus();

            Object.assign(this.historicalStatus, this.currentEvaluatedStatus);
        }

        _activateRegisteredHandlers( handlerSet ) {
            if (!handlerSet || handlerSet.size === 0) {
                return;
            }
            const handlersToExecute = Array.from(handlerSet);
            for (const item of handlersToExecute) {
                item.callback.call( this, lastRegisteredEvent );
                if (item.singleExecution) {
                    handlerSet.delete(item);
                }
            }
        }

        dispatchNotifications() {
            const current = this.currentEvaluatedStatus;
            const prior = this.historicalStatus;

            if (current.isInVisibleArea && !prior.isInVisibleArea) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_ENTER_VIEWPORT) );
            }
            if (current.isCompletelyInVisibleArea && !prior.isCompletelyInVisibleArea) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_FULLY_ENTER_VIEWPORT) );
            }
            
            if (current.isAboveVisibleBoundary !== prior.isAboveVisibleBoundary && 
                current.isBelowVisibleBoundary !== prior.isBelowVisibleBoundary) {

                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_VISIBILITY_CHANGE) );
                
                if (!prior.isCompletelyInVisibleArea && !current.isCompletelyInVisibleArea) {
                    this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_FULLY_ENTER_VIEWPORT) );
                    this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_PARTIALLY_EXIT_VIEWPORT) );
                }
                if (!prior.isInVisibleArea && !current.isInVisibleArea) {
                    this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_ENTER_VIEWPORT) );
                    this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_EXIT_VIEWPORT) );
                }
            }

            if (!current.isCompletelyInVisibleArea && prior.isCompletelyInVisibleArea) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_PARTIALLY_EXIT_VIEWPORT) );
            }
            if (!current.isInVisibleArea && prior.isInVisibleArea) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_EXIT_VIEWPORT) );
            }
            if (current.isInVisibleArea !== prior.isInVisibleArea) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_VISIBILITY_CHANGE) );
            }
            
            if (current.isInVisibleArea !== prior.isInVisibleArea ||
                current.isCompletelyInVisibleArea !== prior.isCompletelyInVisibleArea ||
                current.isAboveVisibleBoundary !== prior.isAboveVisibleBoundary ||
                current.isBelowVisibleBoundary !== prior.isBelowVisibleBoundary) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_STATE_CHANGE) );
            }

            Object.assign(this.historicalStatus, current);
        }

        determineSpatialPlacement() {
            if (this.isPositionLocked) {
                return;
            }
            const previousUpperEdge = this.upperEdge;
            const previousLowerEdge = this.lowerEdge;

            let computedTop, computedBottom;

            if (this.targetEntity instanceof Element) {
                const initialDisplay = this.targetEntity.style.display;
                if (initialDisplay === 'none') {
                    this.targetEntity.style.display = '';
                }
                
                const elementPosition = extractElementDimensions(this.targetEntity);
                computedTop = elementPosition.top;
                computedBottom = elementPosition.bottom;

                if (initialDisplay === 'none') {
                    this.targetEntity.style.display = initialDisplay;
                }

            } else if (typeof this.targetEntity === 'number') {
                if (this.targetEntity > 0) {
                    computedTop = computedBottom = this.targetEntity;
                } else {
                    computedTop = computedBottom = currentTotalDocumentHeight + this.targetEntity;
                }

            } else if (this.targetEntity && typeof this.targetEntity === 'object' && ('top' in this.targetEntity || 'bottom' in this.targetEntity)) {
                computedTop = this.targetEntity.top;
                computedBottom = this.targetEntity.bottom;
            } else {
                console.warn('Invalid target for viewport observation:', this.targetEntity);
                return;
            }

            this.upperEdge = computedTop - this.boundaryModifiers.top;
            this.lowerEdge = computedBottom + this.boundaryModifiers.bottom;
            this.spatialDimension = this.lowerEdge - this.upperEdge;

            if ( (previousUpperEdge !== undefined || previousLowerEdge !== undefined) && (this.upperEdge !== previousUpperEdge || this.lowerEdge !== previousLowerEdge) ) {
                this._activateRegisteredHandlers( this.notificationCallbacks.get(EVENT_KIND_LOCATION_CHANGE) );
            }
        }

        evaluateRelativeStatus() {
            this.currentEvaluatedStatus.isAboveVisibleBoundary = this.upperEdge < currentScrollPositionTop;
            this.currentEvaluatedStatus.isBelowVisibleBoundary = this.lowerEdge > currentScrollPositionBottom;

            this.currentEvaluatedStatus.isInVisibleArea = (this.upperEdge <= currentScrollPositionBottom && this.lowerEdge >= currentScrollPositionTop);
            this.currentEvaluatedStatus.isCompletelyInVisibleArea = (this.upperEdge >= currentScrollPositionTop && this.lowerEdge <= currentScrollPositionBottom) ||
                                                                    (this.currentEvaluatedStatus.isAboveVisibleBoundary && this.currentEvaluatedStatus.isBelowVisibleBoundary);

        }

        registerNotification( eventIdentifier, callbackHandler, isSingleExecution ) {
            if (!this.notificationCallbacks.has(eventIdentifier)) {
                throw new Error(`Attempted to register an unrecognized event: ${eventIdentifier}. Options: ${recognisedEventTypes.join(', ')}`);
            }
            
            const current = this.currentEvaluatedStatus;
            let shouldExecuteImmediately = false;
            switch(true) {
                case eventIdentifier === EVENT_KIND_VISIBILITY_CHANGE && !current.isInVisibleArea && current.isAboveVisibleBoundary:
                case eventIdentifier === EVENT_KIND_ENTER_VIEWPORT && current.isInVisibleArea:
                case eventIdentifier === EVENT_KIND_FULLY_ENTER_VIEWPORT && current.isCompletelyInVisibleArea:
                case eventIdentifier === EVENT_KIND_EXIT_VIEWPORT && current.isAboveVisibleBoundary && !current.isInVisibleArea:
                case eventIdentifier === EVENT_KIND_PARTIALLY_EXIT_VIEWPORT && current.isAboveVisibleBoundary:
                    shouldExecuteImmediately = true;
                    break;
            }

            if (shouldExecuteImmediately) {
                callbackHandler.call(this, lastRegisteredEvent);
                if (isSingleExecution) {
                    return;
                }
            }

            this.notificationCallbacks.get(eventIdentifier).add({callback: callbackHandler, singleExecution: isSingleExecution});
        }

        deregisterNotification( eventIdentifier, callbackHandler ) {
            if (this.notificationCallbacks.has(eventIdentifier)) {
                const handlerSet = this.notificationCallbacks.get(eventIdentifier);
                for (const item of handlerSet) {
                    if (item.callback === callbackHandler) {
                        handlerSet.delete(item);
                        break;
                    }
                }
            } else {
                throw new Error(`Attempted to deregister an unrecognized event: ${eventIdentifier}. Options: ${recognisedEventTypes.join(', ')}`);
            }
        }

        registerSingleShotNotification( eventIdentifier, callbackHandler ) {
            this.registerNotification( eventIdentifier, callbackHandler, true);
        }

        updateSpatialDimension() {
            if (this.targetEntity instanceof Element) {
                this.spatialDimension = this.targetEntity.offsetHeight + this.boundaryModifiers.top + this.boundaryModifiers.bottom;
                this.lowerEdge = this.upperEdge + this.spatialDimension;
            }
        }

        releaseUnit() {
            activeObservationUnits.delete(this);
            for (const type of recognisedEventTypes) {
                this.notificationCallbacks.get(type).clear();
            }
        }

        freezePositionUpdates() {
            this.isPositionLocked = true;
        }

        unfreezePositionUpdates() {
            this.isPositionLocked = false;
        }
    }

    for (const type of recognisedEventTypes) {
        ViewportMonitorUnit.prototype[type] = function( handler, isSingleExecution ) {
            this.registerNotification(this, type, handler, isSingleExecution);
        };
    }

    updateGlobalViewportState();

    function handleGlobalViewportChange(event) {
        lastRegisteredEvent = event;
        updateGlobalViewportState();
        refreshAndDispatchUnitNotifications();
    }

    globalScope.addEventListener('scroll', handleGlobalViewportChange, { passive: true });
    globalScope.addEventListener('resize', debounceAndScheduleCycle);

    observationCore.createObservationUnit = function( sourceElement, modifiers ) {
        let resolvedSource = sourceElement;
        if (typeof sourceElement === 'string') {
            resolvedSource = document.querySelector(sourceElement);
        } else if (typeof sourceElement === 'object' && sourceElement !== null && typeof sourceElement.length === 'number' && sourceElement.length > 0 && sourceElement[0] instanceof Element) {
            resolvedSource = sourceElement[0];
        }
        
        const newUnit = new ViewportMonitorUnit( resolvedSource, modifiers );
        activeObservationUnits.add(newUnit);
        newUnit.evaluateRelativeStatus();
        return newUnit;
    };

    observationCore.forceRefresh = function() {
        lastRegisteredEvent = null;
        updateGlobalViewportState();
        refreshAndDispatchUnitNotifications();
    };

    observationCore.resetAllUnitPositions = function() {
        currentTotalDocumentHeight = 0;
        observationCore.forceRefresh();
    };
    
    globalScope.scrollObserver = observationCore;

})(typeof window !== 'undefined' ? window : this);