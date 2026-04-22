/**
 *    This is a modified version of the original source code.
 *
 *    It demonstrates a Type I code clone, preserving all
 *    functional elements while altering whitespace and comments.
 *
 *    Original Author: William Malone (www.williammalone.com)
 *    Purpose: HTML5 Cross-Browser Canvas Example
 *
 *
 *
 */
var canvasWidth = 267;  // Initial canvas width
var canvasHeight = 200; // Initial canvas height
var width = 125;        // Main icon width
var height = 105;       // Main icon height
var padding = 25;       // Padding around the icon
var lineWidth = 8;      // Line width for drawing elements
var innerBorder = 5;    // Inner border thickness
var primaryColor = "#ffc821";  // First color for gradient
var secondaryColor = "#faf100"; // Second color for gradient
var tertiaryColor = "#dcaa09";  // Third color for gradient, used in reflection

// Assign the windowReady function to the window's load event.
window.onload = windowReady;

/*
 *   Function: windowReady
 *   Description: This function is executed once the entire window content has loaded.
 *                It sets up the canvas, handles IE compatibility, and draws the icons.
 */
function windowReady( ) {

	// In older Internet Explorer versions, direct canvas element creation and context retrieval
	// might not work. G_vmlCanvasManager is used for IE compatibility.

	// Step 1: Find the target division where the canvas will be appended.
	var foo = document.getElementById("canvasCrossBrowserDiv");

	// Step 2: Dynamically create a new canvas element.
	var canvas = document.createElement('canvas');

	// Step 3: Set attributes for the newly created canvas.
	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);
	canvas.setAttribute("id", "canvasCrossBrowser");

	// Step 4: Append the canvas to the designated parent element.
	foo.appendChild(canvas);

	// Step 5: Check for IE compatibility library and initialize if present.
	if (typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}

	// Step 6: Get the 2D rendering context for the canvas.
	var context = canvas.getContext("2d");

	// Step 7: Draw the main icon using the obtained context.
	drawIcon(context);


	// --- Transformation for the Reflected Icon ---

	// Save the current state of the canvas context.
	context.save();

	// Translate the origin to the center of the canvas for rotation.
	context.translate(canvasWidth / 2, canvasHeight / 2);

	// Rotate the canvas by 180 degrees (PI radians) to flip vertically.
	context.rotate(Math.PI);

	// Translate back, and also move it down to position the reflection.
	// The reflection is moved down by (35 + half of icon height).
	context.translate(-canvasWidth / 2, -canvasHeight / 2 - (35 + height / 2));

	// Draw the icon again; it will now appear as a reflection.
	drawIcon(context);

	// --- Post-processing for the Reflection (Fade Effect) ---

	// Restore the canvas context to its state before the reflection transformations.
	context.restore();

	// Set the global composite operation to 'destination-out'.
	// This makes new shapes "punch out" from existing ones, effectively fading out.
	context.globalCompositeOperation = "destination-out";

	// Create a linear gradient for the fade effect.
	// It goes from the bottom of the main icon downwards.
	gradient = context.createLinearGradient(0, padding + height, 0, canvasHeight);

	// The gradient starts transparent and becomes white (which acts as a transparent mask due to 'destination-out').
	gradient.addColorStop(1, "white");
	gradient.addColorStop(0, "transparent");

	// Apply the gradient as the fill style.
	context.fillStyle = gradient;

	// Fill a rectangle with this gradient to create the fade effect.
	// The rectangle starts below the main icon and extends to the bottom of the canvas.
	context.fillRect(0, padding + height + 8, canvasWidth, canvasHeight - (padding + height + 8));

} // End of windowReady function


/**
 * Function: drawIcon
 * Description: Draws the main icon shape, applies gradients, shadows, and an exclamation point.
 *
 * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
 */
function drawIcon(context) {

	// Calculate various geometric parameters for the icon's shape.
	var phi = Math.tan((width / 2) / height);
	var x = innerBorder / Math.cos(phi);
	var y = x / Math.tan(phi);
	var gamma = Math.sqrt(Math.abs(innerBorder * innerBorder - x * x));


	// --- Begin drawing the outer path of the icon ---
	context.beginPath();

	// Top Corner: Defines the peak of the icon.
	context.moveTo(canvasWidth / 2 - x, padding);
	context.quadraticCurveTo(canvasWidth / 2, padding - y, canvasWidth / 2 + x, padding);

	// Right Corner: Draws the right side down to the bottom-right corner.
	context.lineTo((canvasWidth + width) / 2 + gamma, padding + height - gamma);
	context.quadraticCurveTo((canvasWidth + width) / 2 + y, padding + height + innerBorder, (canvasWidth + width) / 2, padding + height + innerBorder);

	// Left Corner: Draws the bottom-left corner and then up the left side.
	context.lineTo((canvasWidth - width) / 2, padding + height + innerBorder);
	context.quadraticCurveTo((canvasWidth - width) / 2 - y, padding + height + innerBorder, (canvasWidth - width) / 2 - gamma, padding + height - gamma);

	// Close Path: Connects back to the starting point.
	context.lineTo(canvasWidth / 2 - x, padding);
	context.closePath();


	// --- Apply gradient and shadow effects ---

	// Create a linear gradient for the main body of the icon.
	// It transitions from primaryColor to secondaryColor.
	var gradient = context.createLinearGradient(0, padding, 0, padding + height);
	gradient.addColorStop(0.5, primaryColor);
	gradient.addColorStop(1, secondaryColor);

	// Set up shadow properties.
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 10;
	context.shadowColor = "black";

	// Fill with a solid color first. This is a workaround for browsers
	// that don't apply shadows to gradient fills directly (e.g., Safari, Chrome).
	context.fillStyle = "white";
	context.fill();

	// Now fill the path with the actual gradient.
	context.fillStyle = gradient;
	context.fill();

	// Reset shadow properties to prevent them from affecting subsequent draws.
	context.shadowBlur = 0;
	context.shadowColor = "transparent";


	// --- Add a horizon reflection effect ---

	// Create a new linear gradient for the reflection.
	// This gradient uses primary, secondary, and tertiary colors.
	gradient = context.createLinearGradient(0, padding, 0, padding + height);
	gradient.addColorStop(0, "#ffc821");
	gradient.addColorStop(0.55, "#ffcb1e");
	gradient.addColorStop(0.55, tertiaryColor);
	gradient.addColorStop(1, secondaryColor);

	// Apply this reflection gradient and fill the icon again.
	context.fillStyle = gradient;
	context.fill();


	// --- Draw the inner outline of the icon ---

	context.beginPath();
	context.moveTo(canvasWidth / 2, padding + lineWidth);
	context.lineTo((canvasWidth + width) / 2 - lineWidth, padding + height - lineWidth / 2);
	context.lineTo((canvasWidth - width) / 2 + lineWidth, padding + height - lineWidth / 2);
	context.lineTo(canvasWidth / 2, padding + lineWidth);
	context.closePath();

	// Create a gradient for the inner outline stroke.
	gradient = context.createLinearGradient(0, padding, 0, padding + height);
	gradient.addColorStop(0, "#555"); // Dark gray
	gradient.addColorStop(1, "#333"); // Even darker gray

	// Configure stroke properties.
	context.lineWidth = lineWidth;
	context.lineJoin = "round";
	context.strokeStyle = gradient;

	// Stroke the inner outline.
	context.stroke();


	// --- Draw the exclamation point ---

	context.beginPath();
	// Draw the dot of the exclamation mark (a small circle).
	context.arc(canvasWidth / 2, 110, 5, 0, Math.PI * 2, true);

	// Draw the upper part of the exclamation mark.
	context.moveTo(canvasWidth / 2 - 3, 95);
	context.quadraticCurveTo(canvasWidth / 2, 105, canvasWidth / 2 + 3, 95);
	context.lineTo(canvasWidth / 2 + 8, 75);
	// Use a bezier curve for the top curvature.
	context.bezierCurveTo(canvasWidth / 2 + 10, 65, canvasWidth / 2 - 10, 65, canvasWidth / 2 - 8, 75, 5);
	context.lineTo(canvasWidth / 2 - 3, 95);
	context.closePath();

	// Fill the exclamation point with a dark gray color.
	context.fillStyle = "#333";
	context.fill();
}