class GraphicDisplay {
    constructor(initialOptions = {}) {
        this.parentContainer = null;
        this.boundaryWidth = '';
        this.boundaryHeight = '';
        this.drawingSurface = null;
        this.renderContext = null;
        this.rotationActive = false;
        this.rotationDegrees = 0;

        this.primaryGradientColor = "#cdeb8e";
        this.secondaryGradientColor = "#a5c956";
        this.labelFillColor = "#666";
        this.lineStrokeColor = "#000";
        this.borderStrokeColor = "#000";
        this.backgroundFillColor = "#fff";
        this.labelFont = "";
        this.initialXPosition = 45;
        this.axisXOffset = 10;
        this.axisYOffset = 40;
        this.axisXLineThickness = 1;
        this.axisYLineThickness = 1;
        this.initialYPosition = 0;

        this.barSegmentHeight = 10;
        this.plotKind = "hbar";

        this.drawValueLabels = false;
        this.xScaleFactor = 1;
        this.barFillGradient = null;

        this.initializeSettings(initialOptions);
    }

    initializeSettings(opts) {
        const configurableProperties = new Set([
            "backgroundFillColor", "borderStrokeColor", "rotationActive",
            "rotationDegrees", "labelFillColor", "lineStrokeColor",
            "initialXPosition", "axisXOffset", "axisYOffset",
            "initialYPosition", "plotKind", "primaryGradientColor",
            "secondaryGradientColor", "labelFont", "drawValueLabels"
        ]);

        Object.keys(opts).forEach(key => {
            if (configurableProperties.has(key)) {
                this[key] = opts[key];
            }
        });
    }

    isGraphicsSupported() {
        return !!document.createElement('canvas').getContext;
    }

    setupDisplay(containerElement, widthValue, heightValue) {
        this.boundaryWidth = widthValue;
        this.boundaryHeight = heightValue;

        if (containerElement != null) {
            containerElement.style.width = this.boundaryWidth + "px";
            containerElement.style.height = this.boundaryHeight + "px";
        }
        this.parentContainer = containerElement;

        let surfaceElement = null;
        if (typeof document !== 'undefined') {
            surfaceElement = document.createElement('canvas');
        } else if (typeof canvas !== 'undefined' && typeof canvas === 'function') {
            surfaceElement = new canvas(this.boundaryWidth, this.boundaryHeight);
        }

        if (surfaceElement === null) {
            console.error("Failed to create graphics surface. Is environment supported?");
            return false;
        }

        this.drawingSurface = surfaceElement;
        surfaceElement.id = "graphicSurface";
        surfaceElement.width = this.boundaryWidth;
        surfaceElement.height = this.boundaryHeight;
        surfaceElement.style.width = this.boundaryWidth + "px";
        surfaceElement.style.height = this.boundaryHeight + "px";

        if (this.initialYPosition === 0) {
            this.initialYPosition = this.boundaryHeight - 70;
        }

        this.renderContext = surfaceElement.getContext('2d');
        const currentContext = this.renderContext;

        if (typeof window !== 'undefined' && window.devicePixelRatio === 2) {
            surfaceElement.width = this.boundaryWidth * 2;
            surfaceElement.height = this.boundaryHeight * 2;
            currentContext.scale(2, 2);
        }

        this.outlineRectangle(0, 0, this.boundaryWidth, this.boundaryHeight, this.borderStrokeColor);
        this.fillRectangle(0, 0, this.boundaryWidth, this.boundaryHeight, this.backgroundFillColor);

        currentContext.font = "normal 12px sans-serif";
        currentContext.textBaseline = 'top';
        return true;
    }

    outlineRectangle(xStart, yStart, widthSize, heightSize, outlineStyle) {
        const ctx = this.renderContext;
        ctx.strokeStyle = outlineStyle;
        ctx.strokeRect(xStart, yStart, widthSize, heightSize);
    }

    fillRectangle(xStart, yStart, widthSize, heightSize, fillStyle) {
        const ctx = this.renderContext;
        ctx.fillStyle = fillStyle;
        ctx.fillRect(xStart, yStart, widthSize, heightSize);
    }

    renderPlot(xMarkings, xIncrement, yMarkings, yIncrement, plotData) {
        const ctx = this.renderContext;
        if (ctx !== null) {
            this.drawSegment(this.axisXOffset, this.boundaryHeight - 40, this.boundaryWidth - 10, this.boundaryHeight - 40, {
                lineColor: this.lineStrokeColor,
                lineThickness: this.axisXLineThickness
            });
            if (xIncrement != null && xMarkings != null) {
                this.plotXLabels(xMarkings, xIncrement, this.boundaryHeight - 30, this.rotationActive, this.rotationDegrees);
            }

            this.drawSegment(this.axisYOffset, 10, this.axisYOffset, this.boundaryHeight - 10, {
                lineColor: this.lineStrokeColor,
                lineThickness: this.axisYLineThickness
            });
            if (yMarkings != null && yIncrement != null) {
                this.plotYLabels(yMarkings, yIncrement, 10);
            }

            this.xScaleFactor = (this.boundaryWidth - this.initialXPosition) / xMarkings[xMarkings.length - 1];

            const plotRenderers = new Map([
                ["hbar", this.drawHorizontalBars.bind(this)],
                ["line", () => {
                    if (typeof this.traceSeriesLine === 'function') {
                        this.traceSeriesLine(plotData, xIncrement);
                    } else {
                        console.warn("Line series renderer not found. Did you include the line module?");
                    }
                }],
                ["vbar", () => {
                    if (typeof this.drawVerticalBars === 'function') {
                        this.drawVerticalBars(plotData, xIncrement);
                    } else {
                        console.warn("Vertical bars renderer not found. Did you include the vbar module?");
                    }
                }]
            ]);

            const selectedRenderer = plotRenderers.get(this.plotKind);
            if (selectedRenderer) {
                // Pass appropriate increment based on chart type
                selectedRenderer(plotData, this.plotKind === "hbar" ? yIncrement : xIncrement);
            } else {
                console.error(`Unknown plot kind: ${this.plotKind}`);
            }

        } else {
            console.error("Rendering context is null. Cannot draw plot!");
        }
    }

    plotXLabels(marks, stepIncrement, yPosition, shouldRotate, rotationAngle) {
        if (!marks) {
            return;
        }
        let currentX = this.initialXPosition;
        const ctx = this.renderContext;

        if (shouldRotate) {
            this.applyRotation(ctx, rotationAngle);
        }

        marks.forEach((label, index) => {
            const effectiveX = (index === 0) ? currentX : (currentX += stepIncrement);
            this.writeText(label, effectiveX, yPosition);
        });

        if (shouldRotate) {
            ctx.restore();
        }
    }

    plotYLabels(marks, stepIncrement, xPosition) {
        if (!marks) {
            return;
        }
        let currentY = this.initialYPosition;

        marks.forEach((label, index) => {
            const effectiveY = (index === 0) ? currentY : (currentY -= (stepIncrement + 10));
            this.writeText(label, xPosition, effectiveY);
        });
    }

    writeText(content, xCoord, yCoord) {
        const ctx = this.renderContext;
        if (this.labelFont !== "") {
            ctx.font = this.labelFont;
        }
        ctx.fillStyle = this.labelFillColor;
        ctx.fillText(content, xCoord, yCoord);
    }

    applyRotation(contextReference, degrees) {
        contextReference.save();
        contextReference.rotate(degrees);
    }

    drawSegment(xOrigin, yOrigin, xEnd, yEnd, options) {
        const ctx = this.renderContext;
        const lineOptions = {
            lineColor: this.lineStrokeColor,
            lineThickness: 1,
            lineCapStyle: "square",
            ...options
        };

        ctx.strokeStyle = lineOptions.lineColor;
        ctx.lineWidth = lineOptions.lineThickness;
        ctx.lineCap = lineOptions.lineCapStyle;

        ctx.beginPath();
        ctx.moveTo(xOrigin, yOrigin);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
        ctx.closePath();
    }

    drawCircularShape(xCoord, yCoord, radiusValue, options) {
        const shapeOptions = {
            outlineColor: "#000000",
            fillColor: "#000000",
            ...options
        };
        const ctx = this.renderContext;

        ctx.strokeStyle = shapeOptions.outlineColor;
        ctx.fillStyle = shapeOptions.fillColor;
        ctx.beginPath();
        ctx.arc(xCoord, yCoord, radiusValue, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    generateLinearGradient() {
        const ctx = this.renderContext;
        const barGradient = ctx.createLinearGradient(0, 0, 300, 0);
        barGradient.addColorStop(0, this.primaryGradientColor);
        barGradient.addColorStop(1, this.secondaryGradientColor);
        this.barFillGradient = barGradient;
    }

    drawHorizontalBars(dataValues, yStepIncrement) {
        if (!dataValues || dataValues.length === 0) {
            console.warn("No data provided for horizontal bars.");
            return;
        }

        this.generateLinearGradient();
        let currentY = this.initialYPosition + 10;
        const startX = this.initialXPosition + 1;

        const barSegmentConfig = {
            lineThickness: this.barSegmentHeight,
            lineColor: this.barFillGradient
        };

        dataValues.forEach(value => {
            const endX = startX + (this.xScaleFactor * value);
            this.drawSegment(startX, currentY, endX, currentY, barSegmentConfig);
            if (this.drawValueLabels) {
                this.writeText(value, endX + 8, currentY - 10);
            }
            currentY -= (yStepIncrement + 10);
        });
    }

    presentDisplay() {
        if (this.parentContainer !== null && this.drawingSurface !== null) {
            this.parentContainer.innerHTML = "";
            this.parentContainer.appendChild(this.drawingSurface);
        } else if (this.drawingSurface !== null) {
            return this.drawingSurface.toDataURL();
        } else {
            console.error("No drawing surface available to present.");
            return null;
        }
    }

    disposeDisplay() {
        this.renderContext = null;
        this.drawingSurface = null;
        if (this.parentContainer) {
            this.parentContainer.innerHTML = "";
            this.parentContainer = null;
        }
        console.info("Graphics display disposed.");
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = new GraphicDisplay();
}