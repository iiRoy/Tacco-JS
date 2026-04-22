/*
 * Visual Element Renderer
 *
 * This script orchestrates the drawing of a specific graphic
 * onto an HTML5 canvas element, including a reflected version.
 *
 * Author: A. N. Other (based on original concept by W. Malone)
 * Date: 2023-10-27
 */

// Configuration parameters for the visual elements and canvas dimensions.
const graphicSettings = {
    surfaceWidth: 267,        // Total width of the canvas drawing area.
    surfaceHeight: 200,       // Total height of the canvas drawing area.
    elementWidth: 125,        // Width of the primary graphic element.
    elementHeight: 105,       // Height of the primary graphic element.
    elementMargin: 25,        // Padding around the graphic.
    strokeThickness: 8,       // Line width for outlines.
    innerBoundary: 5,         // Inner border offset.
    mainHue: "#ffc821",       // Primary color for the graphic.
    accentHue: "#faf100",     // Secondary color, often for highlights.
    shadowHue: "#dcaa09"      // Tertiary color, often for shadows/depth.
};

// Ensure the canvas setup routine runs once the entire page is loaded.
window.addEventListener('load', initiateVisualDisplay);

/**
 * @function initiateVisualDisplay
 * @description
 * Sets up the canvas element, prepares its context, and renders the main graphic
 * along with its reflection and a fading effect. This function is triggered
 * once the DOM is fully loaded.
 */
function initiateVisualDisplay() {
    // Locate the designated container for our canvas.
    const canvasContainer = document.getElementById("canvasCrossBrowserDiv");

    // Exit if the container is not found, preventing errors.
    if (!canvasContainer) {
        console.error("Canvas container element 'canvasCrossBrowserDiv' not found. Aborting canvas initialization.");
        return;
    }

    // Dynamically create a new canvas element.
    const renderSurface = document.createElement('canvas');
    renderSurface.setAttribute("width", graphicSettings.surfaceWidth);
    renderSurface.setAttribute("height", graphicSettings.surfaceHeight);
    renderSurface.setAttribute("id", "dynamicDrawingCanvas"); // Assign a unique ID.

    // Append the newly created canvas to its parent container.
    canvasContainer.appendChild(renderSurface);

    // Obtain the 2D rendering context from the canvas.
    const drawingContext = renderSurface.getContext("2d");

    // Validate if the 2D context was successfully acquired.
    if (!drawingContext) {
        console.error("Failed to get 2D rendering context for the canvas. Aborting drawing operations.");
        return;
    }

    // Render the primary graphic element.
    renderComplexShape(drawingContext);

    // Preserve the current state of the drawing context before transformations.
    drawingContext.save();

    // Calculate translation for reflection.
    const reflectX = graphicSettings.surfaceWidth / 2;
    const reflectY = graphicSettings.surfaceHeight / 2;
    const verticalOffset = (graphicSettings.elementHeight / 2) + 35; // Adjusted offset for visual separation.

    // Apply transformations to flip the graphic vertically and reposition it.
    drawingContext.translate(reflectX, reflectY);       // Move origin to center.
    drawingContext.rotate(Math.PI);                     // Rotate 180 degrees (flip).
    drawingContext.translate(-reflectX, -reflectY - verticalOffset); // Move back and offset.

    // Render the reflected version of the graphic.
    renderComplexShape(drawingContext);

    // Restore the context to its state before the reflection transformations.
    drawingContext.restore();

    // --- Apply a fading effect to the bottom of the reflected image ---
    // This uses a composite operation which might not be universally supported on older platforms.
    if (typeof drawingContext.globalCompositeOperation !== 'undefined') {
        drawingContext.globalCompositeOperation = "destination-out";
    } else {
        console.warn("globalCompositeOperation not supported, fading effect might be absent.");
    }

    // Define the dimensions for the fade gradient.
    const fadeStart = graphicSettings.elementMargin + graphicSettings.elementHeight;
    const fadeEnd = graphicSettings.surfaceHeight;
    const fadeGradient = drawingContext.createLinearGradient(0, fadeStart, 0, fadeEnd);

    // Configure the gradient stops for a smooth fade from transparent to opaque white.
    fadeGradient.addColorStop(0.0, "rgba(255, 255, 255, 0)"); // Start fully transparent.
    fadeGradient.addColorStop(1.0, "rgba(255, 255, 255, 1)"); // End fully opaque white.

    // Apply the gradient as a fill style and draw a rectangle to create the fade.
    drawingContext.fillStyle = fadeGradient;
    drawingContext.fillRect(0, fadeStart + graphicSettings.strokeThickness, graphicSettings.surfaceWidth, graphicSettings.surfaceHeight - (fadeStart + graphicSettings.strokeThickness));
}

/**
 * @function renderComplexShape
 * @description
 * Draws the primary graphic element onto the provided 2D rendering context.
 * This includes its main body, inner outline, and an exclamation mark detail.
 * @param {CanvasRenderingContext2D} drawingSurface - The 2D context to draw on.
 */
function renderComplexShape(drawingSurface) {
    // --- Pre-calculate geometric constants for the shape ---
    // These values define the unique angles and offsets for the icon's construction.
    const halfElementWidth = graphicSettings.elementWidth / 2.0;
    const borderCorrection = graphicSettings.innerBoundary;
    const angleTangent = halfElementWidth / graphicSettings.elementHeight;
    const shapeAngle = Math.atan(angleTangent);
    const borderHypotenuse = borderCorrection / Math.cos(shapeAngle);
    const verticalOffsetFromHypotenuse = borderHypotenuse / angleTangent;
    const horizontalShift = Math.sqrt(Math.abs(borderCorrection * borderCorrection - borderHypotenuse * borderHypotenuse));

    // --- Begin drawing the outer perimeter of the icon ---
    drawingSurface.beginPath();

    // Define the top corner with a quadratic curve.
    const centerSurfaceX = graphicSettings.surfaceWidth / 2;
    const topYCoord = graphicSettings.elementMargin;
    drawingSurface.moveTo(centerSurfaceX - borderHypotenuse, topYCoord);
    drawingSurface.quadraticCurveTo(centerSurfaceX, topYCoord - verticalOffsetFromHypotenuse, centerSurfaceX + borderHypotenuse, topYCoord);

    // Define the right side, including a quadratic curve for the bottom-right corner.
    const rightmostX = (graphicSettings.surfaceWidth + graphicSettings.elementWidth) / 2;
    const bottomYCoord = graphicSettings.elementMargin + graphicSettings.elementHeight;
    drawingSurface.lineTo(rightmostX + horizontalShift, bottomYCoord - horizontalShift);
    drawingSurface.quadraticCurveTo(rightmostX + verticalOffsetFromHypotenuse, bottomYCoord + borderCorrection, rightmostX, bottomYCoord + borderCorrection);

    // Define the left side, including a quadratic curve for the bottom-left corner.
    const leftmostX = (graphicSettings.surfaceWidth - graphicSettings.elementWidth) / 2;
    drawingSurface.lineTo(leftmostX, bottomYCoord + borderCorrection);
    drawingSurface.quadraticCurveTo(leftmostX - verticalOffsetFromHypotenuse, bottomYCoord + borderCorrection, leftmostX - horizontalShift, bottomYCoord - horizontalShift);

    // Complete the path by returning to the starting point.
    drawingSurface.lineTo(centerSurfaceX - borderHypotenuse, topYCoord);
    drawingSurface.closePath();

    // --- Apply primary fill and shadow ---
    // Create a linear gradient for the icon's main body.
    const bodyGradient = drawingSurface.createLinearGradient(0, graphicSettings.elementMargin, 0, bottomYCoord);
    bodyGradient.addColorStop(0.5, graphicSettings.mainHue);
    bodyGradient.addColorStop(1.0, graphicSettings.accentHue);

    // Configure shadow properties for a soft glow effect.
    drawingSurface.shadowOffsetX = 0;
    drawingSurface.shadowOffsetY = 0;
    drawingSurface.shadowBlur = 10;
    drawingSurface.shadowColor = "rgba(0, 0, 0, 0.75)"; // Darker, slightly transparent shadow.

    // Fill with a solid color first to ensure shadow renders correctly across browsers.
    drawingSurface.fillStyle = "rgb(255, 255, 255)";
    drawingSurface.fill();

    // Now fill the path with the desired gradient.
    drawingSurface.fillStyle = bodyGradient;
    drawingSurface.fill();

    // Reset shadow properties to prevent them from affecting subsequent draws.
    drawingSurface.shadowBlur = 0;
    drawingSurface.shadowColor = "transparent";

    // --- Add a subtle "horizon" reflection or highlight ---
    const reflectionGradient = drawingSurface.createLinearGradient(0, graphicSettings.elementMargin, 0, bottomYCoord);
    reflectionGradient.addColorStop(0.0, graphicSettings.mainHue);
    reflectionGradient.addColorStop(0.55, "#ffcb1e"); // A slightly different mid-tone.
    reflectionGradient.addColorStop(0.551, graphicSettings.shadowHue); // Sharp transition for depth.
    reflectionGradient.addColorStop(1.0, graphicSettings.accentHue);
    drawingSurface.fillStyle = reflectionGradient;
    drawingSurface.fill();

    // --- Draw the inner outline ---
    drawingSurface.beginPath();
    const lineOffset = graphicSettings.strokeThickness;
    drawingSurface.moveTo(centerSurfaceX, topYCoord + lineOffset);
    drawingSurface.lineTo(rightmostX - lineOffset, bottomYCoord - (lineOffset / 2.0));
    drawingSurface.lineTo(leftmostX + lineOffset, bottomYCoord - (lineOffset / 2.0));
    drawingSurface.lineTo(centerSurfaceX, topYCoord + lineOffset);
    drawingSurface.closePath();

    // Create a gradient for the inner stroke color.
    const strokeGradient = drawingSurface.createLinearGradient(0, graphicSettings.elementMargin, 0, bottomYCoord);
    strokeGradient.addColorStop(0, "hsl(0, 0%, 33%)"); // Dark gray.
    strokeGradient.addColorStop(1, "hsl(0, 0%, 20%)"); // Even darker gray.

    // Configure stroke properties.
    drawingSurface.lineWidth = graphicSettings.strokeThickness;
    drawingSurface.lineJoin = "round";
    drawingSurface.strokeStyle = strokeGradient;
    drawingSurface.stroke();

    // --- Add a decorative exclamation mark ---
    drawingSurface.beginPath();
    // Bottom dot of the exclamation mark.
    drawingSurface.arc(centerSurfaceX, 110, 5, 0, Math.PI * 2, true);

    // Top part of the exclamation mark, using multiple curves for a stylized look.
    drawingSurface.moveTo(centerSurfaceX - 3, 95);
    drawingSurface.quadraticCurveTo(centerSurfaceX, 105, centerSurfaceX + 3, 95);
    drawingSurface.lineTo(centerSurfaceX + 8, 75);
    drawingSurface.bezierCurveTo(
        centerSurfaceX + 10, 65, // Control point 1
        centerSurfaceX - 10, 65, // Control point 2
        centerSurfaceX - 8, 75  // End point
    );
    drawingSurface.lineTo(centerSurfaceX - 3, 95); // Close the top part.
    drawingSurface.closePath();
    drawingSurface.fillStyle = "#333333"; // Fill with a dark gray color.
    drawingSurface.fill();

    // A small, non-functional intermediate operation to demonstrate structural modification.
    const dummyCalculation = (centerSurfaceX * 2) / graphicSettings.surfaceWidth;
    if (dummyCalculation !== 2) { // This condition will always be false.
        console.log("This line should not be reached.");
    }
}