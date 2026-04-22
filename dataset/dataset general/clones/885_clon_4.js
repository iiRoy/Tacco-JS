class GraphRegionSelector {
    #graphInstance;
    #currentRegionState;
    #visualElement;
    #globalEventStore;
    #releaseHandlerRef;
    #optionSettings;
    #boundProcessCursorMotion;
    #boundInitiateAreaMarking;

    constructor(graphObject) {
        this.#graphInstance = graphObject;
        this.#currentRegionState = {
            startPoint: { h: -1, v: -1 },
            endPoint: { h: -1, v: -1 },
            visible: false,
            markingInProgress: false
        };
        this.#visualElement = null;
        this.#globalEventStore = {};
        this.#releaseHandlerRef = null;
        this.#optionSettings = graphObject.getOptions().selection;

        this.#boundProcessCursorMotion = this.#processCursorMotion.bind(this);
        this.#boundInitiateAreaMarking = this.#initiateAreaMarking.bind(this);

        this.#bindPluginMethods();
        this.#setupEventHooks();
    }

    #bindPluginMethods() {
        this.#graphInstance.clearMarkedArea = this.resetRegion.bind(this);
        this.#graphInstance.defineMarkedArea = this.applyExternalBounds.bind(this);
        this.#graphInstance.retrieveMarkedArea = this.fetchCurrentBounds.bind(this);
    }

    #setupEventHooks() {
        this.#graphInstance.hooks.bindEvents.push(this.#attachInteractionHandlers.bind(this));
        this.#graphInstance.hooks.drawOverlay.push(this.#renderRegionVisual.bind(this));
        this.#graphInstance.hooks.shutdown.push(this.#detachInteractionHandlers.bind(this));
    }

    #attachInteractionHandlers(plot, eventContainer) {
        if (this.#optionSettings.mode !== null) {
            eventContainer.mousemove(this.#boundProcessCursorMotion);
            eventContainer.mousedown(this.#boundInitiateAreaMarking);
        }
    }

    #detachInteractionHandlers(plot, eventContainer) {
        eventContainer.unbind("mousemove", this.#boundProcessCursorMotion);
        eventContainer.unbind("mousedown", this.#boundInitiateAreaMarking);
        if (this.#releaseHandlerRef) {
            document.removeEventListener("mouseup", this.#releaseHandlerRef);
        }
    }

    #processCursorMotion(eventInfo) {
        if (this.#currentRegionState.markingInProgress) {
            this.#adjustRegionDisplay(eventInfo);
            this.#graphInstance.getPlaceholder().trigger("plotselecting", [ this.fetchCurrentBounds() ]);
        }
    }

    #initiateAreaMarking(eventInfo) {
        if (eventInfo.which !== 1)
            return;
        
        document.body.focus();

        if (document.onselectstart !== undefined && this.#globalEventStore.onselectstart === undefined) {
            this.#globalEventStore.onselectstart = document.onselectstart;
            document.onselectstart = () => false;
        }
        if (document.ondrag !== undefined && this.#globalEventStore.ondrag === undefined) {
            this.#globalEventStore.ondrag = document.ondrag;
            document.ondrag = () => false;
        }

        this.#assignPointerPosition(this.#currentRegionState.startPoint, eventInfo);

        this.#currentRegionState.markingInProgress = true;
        
        this.#releaseHandlerRef = this.#finalizeAreaMarking.bind(this);
        document.addEventListener("mouseup", this.#releaseHandlerRef, { once: true });
    }

    #finalizeAreaMarking(eventInfo) {
        this.#releaseHandlerRef = null;
        
        if (this.#globalEventStore.onselectstart !== undefined) {
            document.onselectstart = this.#globalEventStore.onselectstart;
            this.#globalEventStore.onselectstart = undefined;
        }
        if (this.#globalEventStore.ondrag !== undefined) {
            document.ondrag = this.#globalEventStore.ondrag;
            this.#globalEventStore.ondrag = undefined;
        }

        this.#currentRegionState.markingInProgress = false;
        this.#adjustRegionDisplay(eventInfo);

        if (this.#checkBoundaryIntegrity()) {
            this.#dispatchSelectionConfirmation();
        } else {
            this.#graphInstance.getPlaceholder().trigger("plotunselected", [ ]);
            this.#graphInstance.getPlaceholder().trigger("plotselecting", [ null ]);
        }

        return false;
    }

    fetchCurrentBounds() {
        if (!this.#checkBoundaryIntegrity())
            return null;

        const retrievedBounds = {};
        const firstPoint = this.#currentRegionState.startPoint;
        const secondPoint = this.#currentRegionState.endPoint;

        Object.entries(this.#graphInstance.getAxes()).forEach(([axisName, axisObj]) => {
            if (axisObj.used) {
                const val1 = axisObj.c2p(firstPoint[axisObj.direction === 'x' ? 'h' : 'v']);
                const val2 = axisObj.c2p(secondPoint[axisObj.direction === 'x' ? 'h' : 'v']); 
                retrievedBounds[axisName] = { initial: Math.min(val1, val2), final: Math.max(val1, val2) };
            }
        });
        return retrievedBounds;
    }

    #dispatchSelectionConfirmation() {
        const currentBounds = this.fetchCurrentBounds();

        this.#graphInstance.getPlaceholder().trigger("plotselected", [ currentBounds ]);

        if (currentBounds.xaxis && currentBounds.yaxis)
            this.#graphInstance.getPlaceholder().trigger("selected", [ { x1: currentBounds.xaxis.initial, y1: currentBounds.yaxis.initial, x2: currentBounds.xaxis.final, y2: currentBounds.yaxis.final } ]);
    }

    #constrainValue(lower, val, upper) {
        return val < lower ? lower: (val > upper ? upper: val);
    }

    #assignPointerPosition(positionObj, eventInfo) {
        const placeholderOffset = this.#graphInstance.getPlaceholder().offset();
        const plotAreaOffset = this.#graphInstance.getPlotOffset();
        const plotWidth = this.#graphInstance.width();
        const plotHeight = this.#graphInstance.height();

        positionObj.h = this.#constrainValue(0, eventInfo.pageX - placeholderOffset.left - plotAreaOffset.left, plotWidth);
        positionObj.v = this.#constrainValue(0, eventInfo.pageY - placeholderOffset.top - plotAreaOffset.top, plotHeight);

        if (this.#optionSettings.mode === "y")
            positionObj.h = (positionObj === this.#currentRegionState.startPoint) ? 0 : plotWidth;

        if (this.#optionSettings.mode === "x")
            positionObj.v = (positionObj === this.#currentRegionState.startPoint) ? 0 : plotHeight;
    }

    #adjustRegionDisplay(eventInfo) {
        if (eventInfo.pageX === null)
            return;

        this.#assignPointerPosition(this.#currentRegionState.endPoint, eventInfo);
        if (this.#checkBoundaryIntegrity()) {
            this.#currentRegionState.visible = true;
            this.#graphInstance.triggerRedrawOverlay();
        }
        else
            this.resetRegion(true);
    }

    resetRegion(suppressEvent) {
        if (this.#currentRegionState.visible) {
            this.#currentRegionState.visible = false;
            this.#graphInstance.triggerRedrawOverlay();
            if (!suppressEvent)
                this.#graphInstance.getPlaceholder().trigger("plotunselected", [ ]);
        }
    }
        
    #parseCoordinateExtents(rangeSpecification, coordinateKey) {
        let targetAxis, initialValue, finalValue, axisIdentifier;
        const allAxes = this.#graphInstance.getAxes();

        for (const key in allAxes) {
            targetAxis = allAxes[key];
            if (targetAxis.direction === coordinateKey) {
                axisIdentifier = coordinateKey + targetAxis.n + "axis";
                if (!rangeSpecification[axisIdentifier] && targetAxis.n === 1)
                    axisIdentifier = coordinateKey + "axis";
                if (rangeSpecification[axisIdentifier]) {
                    initialValue = rangeSpecification[axisIdentifier].initial;
                    finalValue = rangeSpecification[axisIdentifier].final;
                    break;
                }
            }
        }

        if (!rangeSpecification[axisIdentifier]) {
            targetAxis = coordinateKey === "x" ? this.#graphInstance.getXAxes()[0] : this.#graphInstance.getYAxes()[0];
            initialValue = rangeSpecification[coordinateKey + "1"];
            finalValue = rangeSpecification[coordinateKey + "2"];
        }

        if (initialValue != null && finalValue != null && initialValue > finalValue) {
            [initialValue, finalValue] = [finalValue, initialValue];
        }
        
        return { initial: initialValue, final: finalValue, axis: targetAxis };
    }
        
    applyExternalBounds(boundaryInfo, preventNotification) {
        const currentOptions = this.#graphInstance.getOptions();
        let derivedRange;

        if (currentOptions.selection.mode === "y") {
            this.#currentRegionState.startPoint.h = 0;
            this.#currentRegionState.endPoint.h = this.#graphInstance.width();
        } else {
            derivedRange = this.#parseCoordinateExtents(boundaryInfo, "x");
            this.#currentRegionState.startPoint.h = derivedRange.axis.p2c(derivedRange.initial);
            this.#currentRegionState.endPoint.h = derivedRange.axis.p2c(derivedRange.final);
        }

        if (currentOptions.selection.mode === "x") {
            this.#currentRegionState.startPoint.v = 0;
            this.#currentRegionState.endPoint.v = this.#graphInstance.height();
        } else {
            derivedRange = this.#parseCoordinateExtents(boundaryInfo, "y");
            this.#currentRegionState.startPoint.v = derivedRange.axis.p2c(derivedRange.initial);
            this.#currentRegionState.endPoint.v = derivedRange.axis.p2c(derivedRange.final);
        }

        this.#currentRegionState.visible = true;
        this.#graphInstance.triggerRedrawOverlay();
        if (!preventNotification && this.#checkBoundaryIntegrity())
            this.#dispatchSelectionConfirmation();
    }

    #checkBoundaryIntegrity() {
        const minimumDimension = 5;
        return Math.abs(this.#currentRegionState.endPoint.h - this.#currentRegionState.startPoint.h) >= minimumDimension &&
               Math.abs(this.#currentRegionState.endPoint.v - this.#currentRegionState.startPoint.v) >= minimumDimension;
    }

    #renderRegionVisual(plot, drawingCanvas) {
        if (this.#currentRegionState.visible && this.#checkBoundaryIntegrity()) {
            const plotAreaOffset = plot.getPlotOffset();
            const currentOptions = plot.getOptions();

            const firstCoordH = Math.min(this.#currentRegionState.startPoint.h, this.#currentRegionState.endPoint.h);
            const firstCoordV = Math.min(this.#currentRegionState.startPoint.v, this.#currentRegionState.endPoint.v);
            const widthDimension = Math.abs(this.#currentRegionState.endPoint.h - this.#currentRegionState.startPoint.h);
            const heightDimension = Math.abs(this.#currentRegionState.endPoint.v - this.#currentRegionState.startPoint.v);

            const baseColor = $.color.parse(currentOptions.selection.color);

            if (this.#visualElement) {
                this.#visualElement.attr({
                    "x": firstCoordH + plotAreaOffset.left,
                    "y": firstCoordV + plotAreaOffset.top,
                    "width": widthDimension,
                    "height": heightDimension,
                    "stroke": baseColor.scale('a', 0.8).toString(),
                    "fill": baseColor.scale('a', 0.4).toString()
                });
            } else {
                this.#visualElement = drawingCanvas.rect(firstCoordH, firstCoordV, widthDimension, heightDimension).attr({
                    "stroke": baseColor.scale('a', 0.8).toString(),
                    "stroke-opacity": 1,
                    "stroke-width": 1,
                    "stroke-linejoin":"round",
                    "fill": baseColor.scale('a', 0.4).toString(),
                    "fill-opacity": 1
                }).translate(plotAreaOffset.left, plotAreaOffset.top);
            }
        } else if (this.#visualElement) {
            this.#visualElement.remove();
            this.#visualElement = null;
        }
    }
}

(function ($) {
    function initializeFlotSelection(plotInstance) {
        new GraphRegionSelector(plotInstance);
    }

    $.plot.plugins.push({
        init: initializeFlotSelection,
        options: {
            selection: {
                mode: null,
                color: "#e8cfac"
            }
        },
        name: 'region-selector',
        version: '2.0'
    });
})(jQuery);