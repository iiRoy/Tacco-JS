(function( moduleCreator ) {
    if (typeof define !== 'undefined' && define.amd) {
        define(['jquery'], moduleCreator);
    } else if (typeof commonModule !== 'undefined' && commonModule.exportData) {
        var domLib = getModule('jquery');
        commonModule.exportData = moduleCreator( domLib );
    } else {
        globalScope.elementObserver = moduleCreator( jQuery );
    }
})(function( domLib ) {

    var exportObject = {};

    var currentWindow = domLib(window);
    var currentDocument = domLib(document);

    var observerList = [];

    var VISUAL_STATE_CHANGE = 'visualStateChange';
    var ENTERING_VIEW = 'enteringView';
    var COMPLETELY_VISIBLE = 'completelyVisible';
    var LEAVING_VIEW = 'leavingView';
    var PARTIALLY_HIDDEN = 'partiallyHidden';
    var POSITION_UPDATE = 'positionUpdate';
    var STATUS_UPDATE = 'statusUpdate';

    var eventTypeNames = [
        VISUAL_STATE_CHANGE,
        ENTERING_VIEW,
        COMPLETELY_VISIBLE,
        LEAVING_VIEW,
        PARTIALLY_HIDDEN,
        POSITION_UPDATE,
        STATUS_UPDATE
    ];

    var standardMargins = {top: 0, bottom: 0};

    exportObject.viewTop;
    exportObject.viewBottom;
    exportObject.pageHeight;
    exportObject.viewHeight = currentWindow.height();

    var lastPageHeight;
    var recentEventData;

    var calcViewIndex;
    function determineViewportBounds() {
        exportObject.viewTop = currentWindow.scrollTop();
        exportObject.viewBottom = exportObject.viewTop + exportObject.viewHeight;
        exportObject.pageHeight = currentDocument.height();
        if (exportObject.pageHeight !== lastPageHeight) {
            calcViewIndex = observerList.length;
            while( calcViewIndex-- ) {
                observerList[calcViewIndex].updateElementPosition();
            }
            lastPageHeight = exportObject.pageHeight;
        }
    }

    function updateObserversAndNotify() {
        exportObject.viewHeight = currentWindow.height();
        determineViewportBounds();
        processAndDispatchObservers();
    }

    var delayedUpdateTimer;
    function throttleUpdateAndNotify() {
        clearTimeout(delayedUpdateTimer);
        delayedUpdateTimer = setTimeout( updateObserversAndNotify, 100 );
    }

    var notifyIndex;
    function processAndDispatchObservers() {
        notifyIndex = observerList.length;
        while( notifyIndex-- ) {
            observerList[notifyIndex].checkVisibility();
        }

        notifyIndex = observerList.length;
        while( notifyIndex-- ) {
            observerList[notifyIndex].dispatchElementEvents();
        }

    }

    function VisualElementTracker( trackedElement, marginSettings ) {
        var instanceRef = this;

        this.trackedElement = trackedElement;

        if (!marginSettings) {
            this.marginSettings = standardMargins;
        } else if (marginSettings === +marginSettings) {
            this.marginSettings = {top: marginSettings, bottom: marginSettings};
        } else {
            this.marginSettings = domLib.extend({}, standardMargins, marginSettings);
        }

        this.eventHandlers = {};

        for (var idxA = 0, idxB = eventTypeNames.length; idxA < idxB; idxA++) {
            instanceRef.eventHandlers[eventTypeNames[idxA]] = [];
        }

        this.isLocked = false;

        var wasVisible;
        var wasCompletelyVisible;
        var wasAboveFold;
        var wasBelowFold;

        var handlerIter;
        var currentHandler;
        function executeHandlerCollection( handlers ) {
            if (handlers.length === 0) {
                return;
            }
            handlerIter = handlers.length;
            while( handlerIter-- ) {
                currentHandler = handlers[handlerIter];
                currentHandler.callback.call( instanceRef, recentEventData );
                if (currentHandler.isOne) {
                    handlers.splice(handlerIter, 1);
                }
            }
        }
        this.dispatchElementEvents = function dispatchElementEvents() {

            if (this.isInViewport && !wasVisible) {
                executeHandlerCollection( this.eventHandlers[ENTERING_VIEW] );
            }
            if (this.isFullyInViewport && !wasCompletelyVisible) {
                executeHandlerCollection( this.eventHandlers[COMPLETELY_VISIBLE] );
            }


            if (this.isAboveViewport !== wasAboveFold &&
                this.isBelowViewport !== wasBelowFold) {

                executeHandlerCollection( this.eventHandlers[VISUAL_STATE_CHANGE] );

                if (!wasCompletelyVisible && !this.isFullyInViewport) {
                    executeHandlerCollection( this.eventHandlers[COMPLETELY_VISIBLE] );
                    executeHandlerCollection( this.eventHandlers[PARTIALLY_HIDDEN] );
                }
                if (!wasVisible && !this.isInViewport) {
                    executeHandlerCollection( this.eventHandlers[ENTERING_VIEW] );
                    executeHandlerCollection( this.eventHandlers[LEAVING_VIEW] );
                }
            }

            if (!this.isFullyInViewport && wasCompletelyVisible) {
                executeHandlerCollection( this.eventHandlers[PARTIALLY_HIDDEN] );
            }
            if (!this.isInViewport && wasVisible) {
                executeHandlerCollection( this.eventHandlers[LEAVING_VIEW] );
            }
            if (this.isInViewport !== wasVisible) {
                executeHandlerCollection( this.eventHandlers[VISUAL_STATE_CHANGE] );
            }
            switch( true ) {
                case wasVisible !== this.isInViewport:
                case wasCompletelyVisible !== this.isFullyInViewport:
                case wasAboveFold !== this.isAboveViewport:
                case wasBelowFold !== this.isBelowViewport:
                    executeHandlerCollection( this.eventHandlers[STATUS_UPDATE] );
            }

            wasVisible = this.isInViewport;
            wasCompletelyVisible = this.isFullyInViewport;
            wasAboveFold = this.isAboveViewport;
            wasBelowFold = this.isBelowViewport;

        };

        this.updateElementPosition = function() {
            if (this.isLocked) {
                return;
            }
            var oldTopCoord = this.topCoord;
            var oldBottomCoord = this.bottomCoord;
            if (this.trackedElement.nodeName) {
                var storedDisplayProp = this.trackedElement.style.display;
                if (storedDisplayProp === 'none') {
                    this.trackedElement.style.display = '';
                }

                var elementCoords = domLib(this.trackedElement).offset();
                this.topCoord = elementCoords.top;
                this.bottomCoord = elementCoords.top + this.trackedElement.offsetHeight;

                if (storedDisplayProp === 'none') {
                    this.trackedElement.style.display = storedDisplayProp;
                }

            } else if (this.trackedElement === +this.trackedElement) {
                if (this.trackedElement > 0) {
                    this.topCoord = this.bottomCoord = this.trackedElement;
                } else {
                    this.topCoord = this.bottomCoord = exportObject.pageHeight - this.trackedElement;
                }

            } else {
                this.topCoord = this.trackedElement.top;
                this.bottomCoord = this.trackedElement.bottom;
            }

            this.topCoord -= this.marginSettings.top;
            this.bottomCoord += this.marginSettings.bottom;
            this.totalHeight = this.bottomCoord - this.topCoord;

            if ( (oldTopCoord !== undefined || oldBottomCoord !== undefined) && (this.topCoord !== oldTopCoord || this.bottomCoord !== oldBottomCoord) ) {
                executeHandlerCollection( this.eventHandlers[POSITION_UPDATE] );
            }
        };

        this.updateElementPosition();
        this.checkVisibility();

        wasVisible = this.isInViewport;
        wasCompletelyVisible = this.isFullyInViewport;
        wasAboveFold = this.isAboveViewport;
        wasBelowFold = this.isBelowViewport;
    }

    VisualElementTracker.prototype = {
        addListener: function( eventType, handlerFunc, isOneTime ) {

            switch( true ) {
                case eventType === VISUAL_STATE_CHANGE && !this.isInViewport && this.isAboveViewport:
                case eventType === ENTERING_VIEW && this.isInViewport:
                case eventType === COMPLETELY_VISIBLE && this.isFullyInViewport:
                case eventType === LEAVING_VIEW && this.isAboveViewport && !this.isInViewport:
                case eventType === PARTIALLY_HIDDEN && this.isAboveViewport:
                    handlerFunc();
                    if (isOneTime) {
                        return;
                    }
            }

            if (this.eventHandlers[eventType]) {
                this.eventHandlers[eventType].push({callback: handlerFunc, isOne: isOneTime});
            } else {
                throw new Error('Attempted to add an element observer listener of type '+eventType+'. Available types are: '+eventTypeNames.join(', '));
            }
        },
        removeListener: function( eventType, handlerFunc ) {
            if (this.eventHandlers[eventType]) {
                for (var idxA = 0, handlerItem; handlerItem = this.eventHandlers[eventType][idxA]; idxA++) {
                    if (handlerItem.callback === handlerFunc) {
                        this.eventHandlers[eventType].splice(idxA, 1);
                        break;
                    }
                }
            } else {
                throw new Error('Attempted to remove an element observer listener of type '+eventType+'. Available types are: '+eventTypeNames.join(', '));
            }
        },
        addOneTimeListener: function( eventType, handlerFunc ) {
            this.addListener.call( this, eventType, handlerFunc, true);
        },
        refreshDimensions: function() {
            this.totalHeight = this.trackedElement.offsetHeight + this.marginSettings.top + this.marginSettings.bottom;
            this.bottomCoord = this.topCoord + this.totalHeight;
        },
        checkVisibility: function() {
            this.isAboveViewport = this.topCoord < exportObject.viewTop;
            this.isBelowViewport = this.bottomCoord > exportObject.viewBottom;

            this.isInViewport = (this.topCoord <= exportObject.viewBottom && this.bottomCoord >= exportObject.viewTop);
            this.isFullyInViewport = (this.topCoord >= exportObject.viewTop && this.bottomCoord <= exportObject.viewBottom) ||
                                 (this.isAboveViewport && this.isBelowViewport);
        },
        removeTracker: function() {
            var trackerIdx = observerList.indexOf(this),
                instanceRef  = this;
            observerList.splice(trackerIdx, 1);
            for (var idxA = 0, idxB = eventTypeNames.length; idxA < idxB; idxA++) {
                instanceRef.eventHandlers[eventTypeNames[idxA]].length = 0;
            }
        },
        lockTracking: function() {
            this.isLocked = true;
        },
        unlockTracking: function() {
            this.isLocked = false;
        }
    };

    var eventDispatcherCreator = function (eventTypeString) {
        return function( handlerFunc, isOneTime ) {
            this.addListener.call(this, eventTypeString, handlerFunc, isOneTime);
        };
    };

    for (var idxA = 0, idxB = eventTypeNames.length; idxA < idxB; idxA++) {
        var eventTypeString =  eventTypeNames[idxA];
        VisualElementTracker.prototype[eventTypeString] = eventDispatcherCreator(eventTypeString);
    }

    determineViewportBounds();

    function scrollActivityListener(event) {
        recentEventData = event;
        determineViewportBounds();
        processAndDispatchObservers();
    }

    currentWindow.on('scroll', scrollActivityListener);
    currentWindow.on('resize', throttleUpdateAndNotify);

    exportObject.produceObserver = exportObject.buildObserver = function( targetElement, marginSettings ) {
        if (typeof targetElement === 'string') {
            targetElement = domLib(targetElement)[0];
        }
        if (targetElement instanceof domLib) {
            targetElement = targetElement[0];
        }
        var newObserver = new VisualElementTracker( targetElement, marginSettings );
        observerList.push(newObserver);
        newObserver.checkVisibility();
        return newObserver;
    };

    exportObject.refreshAll = function() {
        recentEventData = null;
        determineViewportBounds();
        processAndDispatchObservers();
    };
    exportObject.recalculateAllPositions = function() {
        exportObject.pageHeight = 0;
        exportObject.refreshAll();
    };

    return exportObject;
});