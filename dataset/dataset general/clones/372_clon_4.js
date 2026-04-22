class VisualComposer {
    static configuration = {
        viewport: { widthDimension: 267, heightDimension: 200 },
        primaryShape: { horizontalSpan: 125, verticalSpan: 105 },
        layoutMetrics: { borderOffset: 25, strokeSize: 8, internalGap: 5, reflectionShift: 35 },
        colorPalette: {
            mainHue: "#ffc821",
            secondaryHue: "#faf100",
            accentHue: "#dcaa09",
            darkTone: "#333",
            lightTone: "#555",
            fadeColor: "white",
            shadowColor: "black",
            reflectionStart: "#ffc821",
            reflectionMid: "#ffcb1e"
        },
        indicator: {
            dotRadius: 5,
            dotYCoord: 110,
            stemBaseY: 95,
            stemTipY: 75,
            stemHorizontalOffset: 3,
            stemCurvePeakY: 105,
            stemBezierControlY: 65,
            stemTopWidth: 8
        }
    };

    constructor(targetElementId) {
        this.targetNodeId = targetElementId;
        this.renderCanvas = null;
        this.renderingContext = null;
        this.settings = VisualComposer.configuration;
    }

    // Main method to orchestrate the rendering process
    initiateDrawing() {
        const parentNode = document.getElementById(this.targetNodeId);
        if (!parentNode) {
            console.error("Designated container element not found.");
            return;
        }

        const newDisplayCanvas = document.createElement('canvas');
        newDisplayCanvas.setAttribute("width", this.settings.viewport.widthDimension);
        newDisplayCanvas.setAttribute("height", this.settings.viewport.heightDimension);
        newDisplayCanvas.setAttribute("id", "graphicDisplay");
        parentNode.appendChild(newDisplayCanvas);
        this.renderCanvas = newDisplayCanvas;

        // Compatibility layer for older browsers (e.g., IE)
        if (typeof G_vmlCanvasManager !== 'undefined') {
            this.renderCanvas = G_vmlCanvasManager.initElement(this.renderCanvas);
        }

        const currentContext = this.renderCanvas.getContext("2d");
        if (!currentContext) {
            console.error("2D rendering interface not available for canvas.");
            return;
        }
        this.renderingContext = currentContext;

        // Draw the primary visual element
        this._renderVisualElement(this.renderingContext);

        // Prepare for drawing the reflected visual
        this.renderingContext.save();
        this.renderingContext.translate(this.settings.viewport.widthDimension / 2, this.settings.viewport.heightDimension / 2);
        this.renderingContext.rotate(Math.PI);
        const verticalAdjustment = -this.settings.viewport.heightDimension / 2 - (this.settings.layoutMetrics.reflectionShift + this.settings.primaryShape.verticalSpan / 2);
        this.renderingContext.translate(-this.settings.viewport.widthDimension / 2, verticalAdjustment);

        // Draw the reflected visual element
        this._renderVisualElement(this.renderingContext);
        this.renderingContext.restore();

        // Apply a fade-out effect to the lower part
        this.renderingContext.globalCompositeOperation = "destination-out";
        const fadeGradientYStart = this.settings.layoutMetrics.borderOffset + this.settings.primaryShape.verticalSpan;
        const fadeEffectGradient = this.renderingContext.createLinearGradient(0, fadeGradientYStart, 0, this.settings.viewport.heightDimension);
        fadeEffectGradient.addColorStop(1, this.settings.colorPalette.fadeColor);
        fadeEffectGradient.addColorStop(0, "transparent");

        this.renderingContext.fillStyle = fadeEffectGradient;
        const fadeRectangleYPos = fadeGradientYStart + this.settings.layoutMetrics.strokeSize;
        const fadeRectangleHeight = this.settings.viewport.heightDimension - fadeRectangleYPos;
        this.renderingContext.fillRect(0, fadeRectangleYPos, this.settings.viewport.widthDimension, fadeRectangleHeight);
    }

    // Helper method to draw a single instance of the visual component
    _renderVisualElement(drawingSurface) {
        const { primaryShape, layoutMetrics, viewport, colorPalette, indicator } = this.settings;

        // Geometrical computations for the shape's specific curves
        const angleTheta = Math.atan((primaryShape.horizontalSpan / 2) / primaryShape.verticalSpan);
        const curvePointA = layoutMetrics.internalGap / Math.cos(angleTheta);
        const curvePointB = curvePointA / Math.tan(angleTheta);
        const curvePointC = Math.sqrt(Math.abs(layoutMetrics.internalGap * layoutMetrics.internalGap - curvePointA * curvePointA));

        // Define the outer boundary path
        drawingSurface.beginPath();
        // Top curve
        drawingSurface.moveTo(viewport.widthDimension / 2 - curvePointA, layoutMetrics.borderOffset);
        drawingSurface.quadraticCurveTo(viewport.widthDimension / 2, layoutMetrics.borderOffset - curvePointB, viewport.widthDimension / 2 + curvePointA, layoutMetrics.borderOffset);

        // Right side and bottom-right curve
        drawingSurface.lineTo((viewport.widthDimension + primaryShape.horizontalSpan) / 2 + curvePointC, layoutMetrics.borderOffset + primaryShape.verticalSpan - curvePointC);
        drawingSurface.quadraticCurveTo((viewport.widthDimension + primaryShape.horizontalSpan) / 2 + curvePointB, layoutMetrics.borderOffset + primaryShape.verticalSpan + layoutMetrics.internalGap, (viewport.widthDimension + primaryShape.horizontalSpan) / 2, layoutMetrics.borderOffset + primaryShape.verticalSpan + layoutMetrics.internalGap);

        // Bottom segment and bottom-left curve
        drawingSurface.lineTo((viewport.widthDimension - primaryShape.horizontalSpan) / 2, layoutMetrics.borderOffset + primaryShape.verticalSpan + layoutMetrics.internalGap);
        drawingSurface.quadraticCurveTo((viewport.widthDimension - primaryShape.horizontalSpan) / 2 - curvePointB, layoutMetrics.borderOffset + primaryShape.verticalSpan + layoutMetrics.internalGap, (viewport.widthDimension - primaryShape.horizontalSpan) / 2 - curvePointC, layoutMetrics.borderOffset + primaryShape.verticalSpan - curvePointC);

        // Left side to complete the path
        drawingSurface.lineTo(viewport.widthDimension / 2 - curvePointA, layoutMetrics.borderOffset);
        drawingSurface.closePath();

        // Create gradient for the main fill color
        const mainFillGradient = drawingSurface.createLinearGradient(0, layoutMetrics.borderOffset, 0, layoutMetrics.borderOffset + primaryShape.verticalSpan);
        mainFillGradient.addColorStop(0.5, colorPalette.mainHue);
        mainFillGradient.addColorStop(1, colorPalette.secondaryHue);

        // Apply shadow (with workaround for gradient compatibility)
        drawingSurface.shadowOffsetX = 0;
        drawingSurface.shadowOffsetY = 0;
        drawingSurface.shadowBlur = 10;
        drawingSurface.shadowColor = colorPalette.shadowColor;

        drawingSurface.fillStyle = colorPalette.fadeColor; // Fill with solid color for shadow effect
        drawingSurface.fill();

        drawingSurface.fillStyle = mainFillGradient; // Then fill with the actual gradient
        drawingSurface.fill();

        // Reset shadow properties
        drawingSurface.shadowBlur = 0;
        drawingSurface.shadowColor = "transparent";

        // Add a 'horizon reflection' effect with a specific gradient
        const horizonGradient = drawingSurface.createLinearGradient(0, layoutMetrics.borderOffset, 0, layoutMetrics.borderOffset + primaryShape.verticalSpan);
        horizonGradient.addColorStop(0, colorPalette.reflectionStart);
        horizonGradient.addColorStop(0.55, colorPalette.reflectionMid);
        horizonGradient.addColorStop(0.55, colorPalette.accentHue);
        horizonGradient.addColorStop(1, colorPalette.secondaryHue);
        drawingSurface.fillStyle = horizonGradient;
        drawingSurface.fill();

        // Define the inner outline path
        drawingSurface.beginPath();
        drawingSurface.moveTo(viewport.widthDimension / 2, layoutMetrics.borderOffset + layoutMetrics.strokeSize);
        drawingSurface.lineTo((viewport.widthDimension + primaryShape.horizontalSpan) / 2 - layoutMetrics.strokeSize, layoutMetrics.borderOffset + primaryShape.verticalSpan - layoutMetrics.strokeSize / 2);
        drawingSurface.lineTo((viewport.widthDimension - primaryShape.horizontalSpan) / 2 + layoutMetrics.strokeSize, layoutMetrics.borderOffset + primaryShape.verticalSpan - layoutMetrics.strokeSize / 2);
        drawingSurface.lineTo(viewport.widthDimension / 2, layoutMetrics.borderOffset + layoutMetrics.strokeSize);
        drawingSurface.closePath();

        // Create gradient for the inner outline stroke
        const innerStrokeGradient = drawingSurface.createLinearGradient(0, layoutMetrics.borderOffset, 0, layoutMetrics.borderOffset + primaryShape.verticalSpan);
        innerStrokeGradient.addColorStop(0, colorPalette.lightTone);
        innerStrokeGradient.addColorStop(1, colorPalette.darkTone);

        drawingSurface.lineWidth = layoutMetrics.strokeSize;
        drawingSurface.lineJoin = "round";
        drawingSurface.strokeStyle = innerStrokeGradient;
        drawingSurface.stroke();

        // Draw the exclamation indicator
        drawingSurface.beginPath();
        // Indicator dot
        drawingSurface.arc(viewport.widthDimension / 2, indicator.dotYCoord, indicator.dotRadius, 0, Math.PI * 2, true);
        // Indicator stem
        drawingSurface.moveTo(viewport.widthDimension / 2 - indicator.stemHorizontalOffset, indicator.stemBaseY);
        drawingSurface.quadraticCurveTo(viewport.widthDimension / 2, indicator.stemCurvePeakY, viewport.widthDimension / 2 + indicator.stemHorizontalOffset, indicator.stemBaseY);
        drawingSurface.lineTo(viewport.widthDimension / 2 + indicator.stemTopWidth, indicator.stemTipY);
        drawingSurface.bezierCurveTo(viewport.widthDimension / 2 + indicator.stemHorizontalOffset * 3 + 1, indicator.stemBezierControlY, viewport.widthDimension / 2 - indicator.stemHorizontalOffset * 3 + 1, indicator.stemBezierControlY, viewport.widthDimension / 2 - indicator.stemTopWidth, indicator.stemTipY);
        drawingSurface.lineTo(viewport.widthDimension / 2 - indicator.stemHorizontalOffset, indicator.stemBaseY);
        drawingSurface.closePath();
        drawingSurface.fillStyle = colorPalette.darkTone;
        drawingSurface.fill();
    }
}

// Ensure the DOM is fully loaded before attempting to draw
document.addEventListener('DOMContentLoaded', () => {
    const mainArtisan = new VisualComposer("canvasCrossBrowserDiv");
    mainArtisan.initiateDrawing();
});