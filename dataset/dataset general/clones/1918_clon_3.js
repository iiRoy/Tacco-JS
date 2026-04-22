let ChartDrawingMachine = function() {
    // Core display elements and dimensions
    this.parentContainerElement = null;
    this.displayAreaWidth = '';
    this.displayAreaHeight = '';
    this.canvasElement = null;
    this.renderingContext = null;

    // Transformation settings
    this.isRotationActive = false; // Flag for text orientation
    this.rotationAngle = 0; // Angle in radians for text rotation

    // Visual styling properties
    this.gradientColorStart = "#cdeb8e";
    this.gradientColorEnd = "#a5c956";
    this.labelFillColor = "#666";
    this.axisLineColor = "#000";
    this.outerBorderColor = "#000";
    this.backgroundColor = "#fff";
    this.labelFont = "";

    // Layout and positioning constants
    this.plotAreaOffsetX = 45; // Initial X-offset for plot elements
    this.xAxisPosition = 10; // X-coordinate for the start of the X-axis line
    this.yAxisLeftOffset = 40; // Y-coordinate for the start of the Y-axis line
    this.xAxisStrokeWidth = 1;
    this.yAxisStrokeWidth = 1;

    // Dynamic start Y-position, calculated after container height is known
    this.plotAreaOffsetY = 0;

    // Bar chart specific settings
    this.barSegmentHeight = 10; // Height for each bar in a horizontal bar chart
    this.chartPlotType = "hbar"; // Default chart type
    this.shouldDrawDataValues = false; // Whether to display data values next to bars
};

ChartDrawingMachine.prototype.applyCustomSettings = function(optionsObject) {
    // Guard clause: ensure optionsObject is a valid object
    if (!optionsObject || typeof optionsObject !== 'object') {
        console.warn("Invalid or missing options object provided for chart configuration.");
        return;
    }

    // Iterate over predefined settings and apply from optionsObject if present
    const configurableProps = [
        "backgroundColor", "outerBorderColor", "isRotationActive",
        "rotationAngle", "labelFillColor", "axisLineColor", "plotAreaOffsetX",
        "xAxisPosition", "yAxisLeftOffset", "plotAreaOffsetY", "chartPlotType",
        "gradientColorStart", "gradientColorEnd", "labelFont", "shouldDrawDataValues"
    ];

    for (let prop of configurableProps) {
        if (optionsObject.hasOwnProperty(prop)) {
            this[prop] = optionsObject[prop];
        }
    }
};

ChartDrawingMachine.prototype.checkCanvasAvailability = function() {
    // Simple check to determine if the browser supports canvas rendering
    try {
        const testCanvas = document.createElement('canvas');
        return Boolean(testCanvas.getContext && testCanvas.getContext('2d'));
    } catch (error) {
        console.error("Error during canvas support check:", error);
        return false;
    }
};

ChartDrawingMachine.prototype.setupCanvasContext = function(parentElement, plotWidth, plotHeight) {
    // Store dimensions for later use
    this.displayAreaWidth = plotWidth;
    this.displayAreaHeight = plotHeight;

    // Adjust parent container's style if provided
    if (parentElement) {
        parentElement.style.width = `${this.displayAreaWidth}px`;
        parentElement.style.height = `${this.displayAreaHeight}px`;
        this.parentContainerElement = parentElement;
    }

    let currentCanvas = null;

    // Attempt to create a canvas element based on environment
    if (typeof document !== 'undefined') {
        // Browser environment
        currentCanvas = document.createElement('canvas');
        currentCanvas.id = "chartDisplayCanvas";
    } else if (typeof global !== 'undefined' && global.canvas) {
        // Node.js environment with 'canvas' package (e.g., `const { createCanvas } = require('canvas');`)
        currentCanvas = global.canvas(this.displayAreaWidth, this.displayAreaHeight);
    }

    // Handle failure to create canvas
    if (!currentCanvas) {
        console.error("Failed to instantiate a canvas element. Check your environment setup!");
        return false;
    }

    this.canvasElement = currentCanvas;

    // Set canvas drawing dimensions
    this.canvasElement.width = this.displayAreaWidth;
    this.canvasElement.height = this.displayAreaHeight;

    // Set canvas display dimensions (CSS)
    this.canvasElement.style.width = `${this.displayAreaWidth}px`;
    this.canvasElement.style.height = `${this.displayAreaHeight}px`;

    // Initialize Y-offset if not explicitly set
    if (this.plotAreaOffsetY === 0) {
        this.plotAreaOffsetY = this.displayAreaHeight - 70;
    }

    // Obtain 2D rendering context
    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) {
        console.error("Could not obtain 2D rendering context from canvas.");
        return false;
    }
    this.renderingContext = ctx;

    // Apply Retina display scaling if applicable
    if (typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 1) {
        const scaleFactor = window.devicePixelRatio;
        this.canvasElement.width = this.displayAreaWidth * scaleFactor;
        this.canvasElement.height = this.displayAreaHeight * scaleFactor;
        this.renderingContext.scale(scaleFactor, scaleFactor);
    }

    // Draw initial background and border
    this._drawRectangularOutline(0, 0, this.displayAreaWidth, this.displayAreaHeight, this.outerBorderColor);
    this._fillRectangle(0, 0, this.displayAreaWidth, this.displayAreaHeight, this.backgroundColor);

    // Set default text properties for the context
    this.renderingContext.font = "normal 12px sans-serif";
    this.renderingContext.textBaseline = 'top';

    return true;
};

// Helper for drawing a rectangle border
ChartDrawingMachine.prototype._drawRectangularOutline = function(xPos, yPos, rectWidth, rectHeight, strokeStyle) {
    let ctx = this.renderingContext;
    if (!ctx) return;
    ctx.strokeStyle = strokeStyle;
    ctx.strokeRect(xPos, yPos, rectWidth, rectHeight);
};

// Helper for filling a rectangle
ChartDrawingMachine.prototype._fillRectangle = function(xPos, yPos, rectWidth, rectHeight, fillColor) {
    let ctx = this.renderingContext;
    if (!ctx) return;
    ctx.fillStyle = fillColor;
    ctx.fillRect(xPos, yPos, rectWidth, rectHeight);
};

/* Primary method to render the chart with axes and data. */
ChartDrawingMachine.prototype.renderPlot = function(xLabels, xStepIncrement, yLabels, yStepIncrement, chartData) {
    const ctx = this.renderingContext;
    if (!ctx) {
        console.error("Rendering context is null. Unable to draw chart!");
        return;
    }

    // Draw X-axis line and labels
    this._renderLine(this.xAxisPosition, this.displayAreaHeight - 40, this.displayAreaWidth - 10, this.displayAreaHeight - 40, {
        lineWidth: this.xAxisStrokeWidth,
        lineColor: this.axisLineColor
    });
    if (xLabels && xStepIncrement) {
        this._drawXAxisLabels(xLabels, xStepIncrement, this.displayAreaHeight - 30, this.isRotationActive, this.rotationAngle);
    }

    // Draw Y-axis line and labels
    this._renderLine(this.yAxisLeftOffset, 10, this.yAxisLeftOffset, this.displayAreaHeight - 10, {
        lineWidth: this.yAxisStrokeWidth,
        lineColor: this.axisLineColor
    });
    if (yLabels && yStepIncrement) {
        this._drawYAxisLabels(yLabels, yStepIncrement, 10);
    }

    // Calculate X-axis scale factor
    const lastXLabelValue = xLabels && xLabels.length > 0 ? xLabels[xLabels.length - 1] : 1; // Default to 1 to avoid division by zero
    this.xScaleFactor = (this.displayAreaWidth - this.plotAreaOffsetX) / lastXLabelValue;

    // Render data based on chart type
    switch (this.chartPlotType) {
        case "hbar":
            this._drawHorizontalBars(chartData, yStepIncrement);
            break;
        case "line":
            if (typeof this.drawDataLines === 'function') { // Assuming external line chart module
                this.drawDataLines(chartData, xStepIncrement);
            } else {
                console.warn("Line chart functionality not found. Did you include the 'cc.line.js' module?");
            }
            break;
        case "vbar":
            if (typeof this.drawVerticalBars === 'function') { // Assuming external vertical bar chart module
                this.drawVerticalBars(chartData, xStepIncrement);
            } else {
                console.warn("Vertical bar chart functionality not found. Did you include the 'cc.vbar.js' module?");
            }
            break;
        default:
            console.warn(`Unsupported chart type: ${this.chartPlotType}`);
            break;
    }
};

ChartDrawingMachine.prototype._drawXAxisLabels = function(dataLabels, stepIncrement, verticalPosition, applyRotation, rotationDegrees) {
    if (!dataLabels || !Array.isArray(dataLabels) || dataLabels.length === 0) {
        return;
    }
    const ctx = this.renderingContext;
    let currentXPosition = this.plotAreaOffsetX;

    if (applyRotation) {
        this._rotateCanvasContext(ctx, rotationDegrees);
    }

    dataLabels.forEach((label, index) => {
        const xOffset = (index === 0) ? currentXPosition : (currentXPosition += stepIncrement);
        this._renderText(label, xOffset, verticalPosition);
    });

    if (applyRotation) {
        ctx.restore(); // Restore context to original orientation
    }
};

ChartDrawingMachine.prototype._drawYAxisLabels = function(dataLabels, stepIncrement, horizontalPosition) {
    if (!dataLabels || !Array.isArray(dataLabels) || dataLabels.length === 0) {
        return;
    }
    let currentYPosition = this.plotAreaOffsetY;

    dataLabels.forEach((label, index) => {
        const yOffset = (index === 0) ? currentYPosition : (currentYPosition -= (stepIncrement + 10));
        this._renderText(label, horizontalPosition, yOffset);
    });
};

ChartDrawingMachine.prototype._renderText = function(textValue, xCoord, yCoord) {
    const ctx = this.renderingContext;
    if (this.labelFont) {
        ctx.font = this.labelFont;
    }
    ctx.fillStyle = this.labelFillColor;
    ctx.fillText(textValue, xCoord, yCoord);
};

ChartDrawingMachine.prototype._rotateCanvasContext = function(ctx, angleInRadians) {
    ctx.save();
    ctx.rotate(angleInRadians);
};

ChartDrawingMachine.prototype._renderLine = function(startX, startY, endX, endY, lineProperties) {
    const ctx = this.renderingContext;
    const defaultProps = {
        lineColor: this.axisLineColor,
        lineWidth: 1,
        lineEndCap: "square"
    };
    const finalProps = { ...defaultProps,
        ...(lineProperties || {})
    };

    ctx.strokeStyle = finalProps.lineColor;
    ctx.lineWidth = finalProps.lineWidth;
    ctx.lineCap = finalProps.lineEndCap;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
};

ChartDrawingMachine.prototype._drawCircularShape = function(centerX, centerY, radiusValue, circleConfig) {
    const ctx = this.renderingContext;
    const strokeStyle = (circleConfig && circleConfig.hasOwnProperty("lineColor")) ? circleConfig.lineColor : "#000000";
    const fillStyle = (circleConfig && circleConfig.hasOwnProperty("fillColor")) ? circleConfig.fillColor : "#000000";

    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusValue, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
};

ChartDrawingMachine.prototype._generateBarGradient = function() {
    const ctx = this.renderingContext;
    // Create a horizontal linear gradient across a typical bar width
    const currentBarGradient = ctx.createLinearGradient(0, 0, 300, 0);
    currentBarGradient.addColorStop(0, this.gradientColorStart);
    currentBarGradient.addColorStop(1, this.gradientColorEnd);
    this.barFillGradient = currentBarGradient;
};

ChartDrawingMachine.prototype._drawHorizontalBars = function(dataValues, yStep) {
    if (!dataValues || !Array.isArray(dataValues) || dataValues.length === 0) {
        console.warn("Input data for horizontal bars is undefined or empty. No bars will be drawn.");
        return;
    }

    this._generateBarGradient(); // Ensure gradient is ready
    const ctx = this.renderingContext;
    let currentY = this.plotAreaOffsetY + 10; // Starting Y for the first bar
    const barStartX = this.plotAreaOffsetX + 1;
    const barDrawingOptions = {
        lineWidth: this.barSegmentHeight,
        lineColor: this.barFillGradient
    };

    for (let i = 0; i < dataValues.length; i++) {
        const barLength = this.xScaleFactor * dataValues[i];
        const barEndX = barStartX + barLength;

        this._renderLine(barStartX, currentY, barEndX, currentY, barDrawingOptions);

        if (this.shouldDrawDataValues) {
            this._renderText(dataValues[i].toString(), barEndX + 8, currentY - 10);
        }
        currentY -= (yStep + 10); // Move up for the next bar
    }
};

/**
 * Displays the rendered canvas element within its parent container or returns its data URL.
 */
ChartDrawingMachine.prototype.displayRenderedChart = function() {
    // If a parent container and canvas element exist, append the canvas
    if (this.parentContainerElement && this.canvasElement) {
        this.parentContainerElement.innerHTML = ""; // Clear existing content
        this.parentContainerElement.appendChild(this.canvasElement);
        // Alternative: uncomment lines below to render as an image instead of live canvas
        /*
        const chartImage = document.createElement("img");
        chartImage.id = "renderedChartImage";
        chartImage.width = this.displayAreaWidth;
        chartImage.height = this.displayAreaHeight;
        chartImage.src = this.canvasElement.toDataURL();
        this.parentContainerElement.appendChild(chartImage);
        */
    } else if (this.canvasElement) {
        // No parent container, return the canvas content as a data URL
        return this.canvasElement.toDataURL('image/png'); // Specify image format
    } else {
        console.error("No canvas element available to display or convert to data URL.");
        return null;
    }
};

ChartDrawingMachine.prototype.clearResources = function() {
    // Release references to free up memory
    this.renderingContext = null;
    this.canvasElement = null;
    // Clear any DOM elements if a container exists
    if (this.parentContainerElement) {
        this.parentContainerElement.innerHTML = "";
    }
    this.parentContainerElement = null;
    console.info("Chart drawing resources have been effectively released.");
};

// Export for Node.js environments
if (typeof module !== "undefined" && module.exports) {
    module.exports = new ChartDrawingMachine();
}