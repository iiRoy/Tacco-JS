class GraphicalDisplayHandler {
    constructor(displayTarget, initialConfiguration = {}) {
        this.displayCanvas = null;
        this.drawingContext = null;
        this.currentGraphInstance = null;
        this.autoDimensioningActive = false;

        this.sourceDataInput = initialConfiguration.sourceDataInput || null;
        this.graphConfiguration = initialConfiguration.graphConfiguration || {};
        this.elementIdentifier = initialConfiguration.elementIdentifier || null;
        this.specifiedWidth = initialConfiguration.specifiedWidth || 0;
        this.specifiedHeight = initialConfiguration.specifiedHeight || 0;
        this.enableResizing = initialConfiguration.enableResizing || false;
        this.graphTypeOverride = initialConfiguration.graphTypeOverride || null;
        this.segmentDetails = initialConfiguration.segmentDetails || null;
        this.responsiveLayout = initialConfiguration.responsiveLayout || false;
        this.highlightedSegmentIndex = initialConfiguration.highlightedSegmentIndex;
        this.displayLegend = initialConfiguration.displayLegend || false;
        this.baseGraphType = initialConfiguration.baseGraphType || 'Bar';

        this.prepareCanvas(displayTarget);
        this.adjustCanvasDimensions();
        this.renderVisuals();
    }

    prepareCanvas(selectorValue) {
        if (typeof selectorValue === 'string') {
            this.displayCanvas = document.querySelector(selectorValue);
        } else if (selectorValue instanceof HTMLCanvasElement) {
            this.displayCanvas = selectorValue;
        } else {
            throw new Error("Invalid target for graphical display provided.");
        }
        if (!this.displayCanvas) {
            throw new Error("Graphical display canvas element not found.");
        }
        this.drawingContext = this.displayCanvas.getContext("2d");
    }

    adjustCanvasDimensions() {
        const containingElement = this.displayCanvas.parentElement;

        if (this.specifiedWidth <= 0) {
            this.displayCanvas.style.width = containingElement.offsetWidth + 'px';
            this.drawingContext.canvas.width = containingElement.offsetWidth;
        } else {
            this.drawingContext.canvas.width = this.specifiedWidth;
            this.autoDimensioningActive = true;
        }

        if (this.specifiedHeight <= 0) {
            this.displayCanvas.style.height = containingElement.offsetHeight + 'px';
            this.drawingContext.canvas.height = this.drawingContext.canvas.width / 2;
        } else {
            this.drawingContext.canvas.height = this.specifiedHeight;
            this.autoDimensioningActive = true;
        }
    }

    updateDataSource(newData) {
        if (this.sourceDataInput === newData) return;

        this.sourceDataInput = newData;
        this.renderVisuals();
    }

    updateDisplayOptions(newOptions) {
        this.graphConfiguration = { ...this.graphConfiguration, ...newOptions };
        this.renderVisuals();
    }

    setHighlightIndex(newIndex) {
        this.highlightedSegmentIndex = newIndex;

        if (this.currentGraphInstance) {
            this.currentGraphInstance.draw();
        }

        if (newIndex === undefined || newIndex === null || !this.currentGraphInstance || !this.currentGraphInstance.segments) {
            return;
        }

        const availableSegments = this.currentGraphInstance.segments;
        if (!Number.isFinite(newIndex) || newIndex >= availableSegments.length || newIndex < 0) {
            return;
        }

        const focusedComponent = availableSegments[newIndex];
        if (focusedComponent) {
            focusedComponent.save();
            focusedComponent.fillColor = focusedComponent.highlightColor;
            this.currentGraphInstance.showTooltip([focusedComponent]);
            focusedComponent.restore();
        }
    }

    renderVisuals() {
        if (this.currentGraphInstance) {
            this.currentGraphInstance.destroy();
        }

        if (!this.sourceDataInput) {
            return;
        }

        const actualGraphType = this.graphTypeOverride || this.baseGraphType;
        const currentOptions = { ...this.graphConfiguration };

        if (this.responsiveLayout || this.enableResizing) {
            currentOptions.responsive = true;
        }
        if (this.responsiveLayout !== undefined) {
            currentOptions.responsive = this.responsiveLayout;
        }

        if (this.autoDimensioningActive) {
             this.adjustCanvasDimensions();
        }

        this.currentGraphInstance = new Chart(this.drawingContext)[actualGraphType](this.sourceDataInput, currentOptions);
        this.currentGraphInstance.update();

        if (this.displayLegend) {
            const generatedKeyElement = this.currentGraphInstance.generateLegend();
            const canvasParent = this.displayCanvas.parentElement;
            if (canvasParent && generatedKeyElement) {
                const canvasGrandParent = canvasParent.parentElement;
                if (canvasGrandParent) {
                    canvasGrandParent.insertBefore(generatedKeyElement, canvasParent.nextSibling);
                } else {
                    canvasParent.appendChild(generatedKeyElement);
                }
            }
        }
    }

    setCanvasSize(newWidth, newHeight) {
        this.specifiedWidth = newWidth;
        this.specifiedHeight = newHeight;
        this.renderVisuals();
    }

    setResponsiveFlag(value) { this.responsiveLayout = value; this.renderVisuals(); }
    setResizeFlag(value) { this.enableResizing = value; this.renderVisuals(); }
    setShowLegendFlag(value) { this.displayLegend = value; this.renderVisuals(); }
    setBaseGraphKind(value) { this.baseGraphType = value; this.renderVisuals(); }
    setGraphTypeOverride(value) { this.graphTypeOverride = value; this.renderVisuals(); }

    disposeResources() {
        if (this.currentGraphInstance) {
            this.currentGraphInstance.destroy();
            this.currentGraphInstance = null;
        }
        this.displayCanvas = null;
        this.drawingContext = null;
    }
}

const visualComponentFactory = {
    produceRenderer(targetCanvasSelector, kind = "Bar", configuration = {}) {
        const effectiveConfiguration = { ...configuration, baseGraphType: kind };
        return new GraphicalDisplayHandler(targetCanvasSelector, effectiveConfiguration);
    }
};

const makeGenericChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Bar", config);
const makeLineChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Line", config);
const makeBarChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Bar", config);
const makeRadarChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Radar", config);
const makePolarChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "PolarArea", config);
const makePieChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Pie", config);
const makeDoughnutChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Doughnut", config);
const makeDonutChart = (canvasSelector, config) => visualComponentFactory.produceRenderer(canvasSelector, "Doughnut", config);