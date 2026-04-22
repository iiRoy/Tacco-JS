/*
 *  Cutting-edge HTML5 Drawing Surface Demo for Diverse Browsers
 *
 *  @developer Jane Smith (www.newsite.org)
 */
let displayAreaWidth = 267;
const displayAreaHeight = 200;
let shapeBaseWidth = 125;
const shapeBaseHeight = 105;
var frameMargin = 25;
let strokeThickness = 8;
var internalOffset = 5;
const mainHue = "#fbc02d";   // Main visual element color (Amber 700)
let accentShade = "#fff176"; // Secondary color for accents (Yellow 300)
var highlightTint = "#ffa000"; // Tertiary color for highlights (Amber 800)


/*
 *  Simple Display Surface Example Initialization
 */

window.onload = domContentLoaded;

/*
 *  domContentLoaded
 *  Initializes the canvas and renders the main graphic elements.
 */
function domContentLoaded()
{
	// Traditional canvas context retrieval (not suitable for legacy IE)
	// var graphicContext = document.getElementById('visualDisplayElement').getContext("2d");

	// To ensure compatibility across various browsers, including older IE versions
	const containerElement = document.getElementById("mainCanvasContainer");
	const drawingSurface = document.createElement('canvas');
	drawingSurface.setAttribute("width", displayAreaWidth);
	drawingSurface.setAttribute("height", displayAreaHeight);
	drawingSurface.setAttribute("id", "visualDisplayElement");
	containerElement.appendChild(drawingSurface);

	if (typeof G_vmlCanvasManager != 'undefined') { // Check for IE's VML compatibility layer
		drawingSurface = G_vmlCanvasManager.initElement(drawingSurface);
	}

	var graphicContext = drawingSurface.getContext("2d");

	// Proceed to draw the primary visual component
	renderGraphic(graphicContext);

	// Invert the graphic vertically and shift it downwards slightly
	graphicContext.save();
	graphicContext.translate(displayAreaWidth / 2, displayAreaHeight / 2);
	graphicContext.rotate(Math.PI);
	graphicContext.translate(-displayAreaWidth / 2, -displayAreaHeight / 2 - (35 + shapeBaseHeight / 2));

	// Render the mirrored version of the graphic
	renderGraphic(graphicContext);

	// Create a fading effect at the bottom of the graphic (note: not supported in some older browsers like IE)
	graphicContext.restore();
	graphicContext.globalCompositeOperation = "destination-out";

	const colorTransition = graphicContext.createLinearGradient(0, frameMargin + shapeBaseHeight, 0, displayAreaHeight);
	colorTransition.addColorStop(1, "floralwhite"); // Fade to a light color
	colorTransition.addColorStop(0, "rgba(0,0,0,0)"); // Start fully transparent

	graphicContext.fillStyle = colorTransition;
	graphicContext.fillRect(0, frameMargin + shapeBaseHeight + 8, displayAreaWidth, displayAreaHeight - (frameMargin + shapeBaseHeight + 8));
}

/*
 *  renderGraphic
 *  Draws the primary icon on the provided graphic context.
 *
 *  @param graphicContext The 2D rendering context for drawing.
 */
function renderGraphic(graphicContext)
{
	const angleAlpha = Math.tan((shapeBaseWidth / 2) / shapeBaseHeight);
	const offsetX = internalOffset / Math.cos(angleAlpha);
	const offsetY = offsetX / Math.tan(angleAlpha);
	const distanceBeta = Math.sqrt(Math.abs(internalOffset * internalOffset - offsetX * offsetX));

	// Define the path for the main shape outline
	graphicContext.beginPath();
	// Top point of the shape
	graphicContext.moveTo(displayAreaWidth / 2 - offsetX, frameMargin);
	graphicContext.quadraticCurveTo(displayAreaWidth / 2, frameMargin - offsetY, displayAreaWidth / 2 + offsetX, frameMargin);

	// Right side of the shape
	graphicContext.lineTo((displayAreaWidth + shapeBaseWidth) / 2 + distanceBeta, frameMargin + shapeBaseHeight - distanceBeta);
	graphicContext.quadraticCurveTo((displayAreaWidth + shapeBaseWidth) / 2 + offsetY, frameMargin + shapeBaseHeight + internalOffset, (displayAreaWidth + shapeBaseWidth) / 2, frameMargin + shapeBaseHeight + internalOffset);

	// Left side of the shape
	graphicContext.lineTo((displayAreaWidth - shapeBaseWidth) / 2, frameMargin + shapeBaseHeight + internalOffset);
	graphicContext.quadraticCurveTo((displayAreaWidth - shapeBaseWidth) / 2 - offsetY, frameMargin + shapeBaseHeight + internalOffset, (displayAreaWidth - shapeBaseWidth) / 2 - distanceBeta, frameMargin + shapeBaseHeight - distanceBeta);

	// Complete the shape path
	graphicContext.lineTo(displayAreaWidth / 2 - offsetX, frameMargin);
	graphicContext.closePath();

	// Create a color transition for the main fill
	const colorTransition = graphicContext.createLinearGradient(0, frameMargin, 0, frameMargin + shapeBaseHeight);
	colorTransition.addColorStop(0.5, mainHue);
	colorTransition.addColorStop(1, accentShade);

	// Apply a shadow effect around the object
	graphicContext.shadowOffsetX = 0;
	graphicContext.shadowOffsetY = 0;
	graphicContext.shadowBlur = 10;
	graphicContext.shadowColor = "darkslategray"; // Deep gray shadow

	// Some browsers may not render shadows on gradient fills, so a solid base fill is needed first
	graphicContext.fillStyle = "floralwhite"; // Light base color
	graphicContext.fill();

	// Now, apply the gradient fill over the solid base
	graphicContext.fillStyle = colorTransition;
	graphicContext.fill();

	// Reset shadow properties
	graphicContext.shadowBlur = 0;
	graphicContext.shadowColor = "rgba(0,0,0,0)";

	// Add a subtle reflection effect with a gradient overlay
	const reflectionGradient = graphicContext.createLinearGradient(0, frameMargin, 0, frameMargin + shapeBaseHeight);
	reflectionGradient.addColorStop(0, "#fbc02d"); // Amber 700
	reflectionGradient.addColorStop(0.55, "#ffeb3b"); // Yellow 500
	reflectionGradient.addColorStop(0.55, highlightTint); // Amber 800
	reflectionGradient.addColorStop(1, accentShade); // Yellow 300
	graphicContext.fillStyle = reflectionGradient;
	graphicContext.fill();

	// Define the path for the inner outline of the shape
	graphicContext.beginPath();
	graphicContext.moveTo(displayAreaWidth / 2, frameMargin + strokeThickness);
	graphicContext.lineTo((displayAreaWidth + shapeBaseWidth) / 2 - strokeThickness, frameMargin + shapeBaseHeight - strokeThickness / 2);
	graphicContext.lineTo((displayAreaWidth - shapeBaseWidth) / 2 + strokeThickness, frameMargin + shapeBaseHeight - strokeThickness / 2);
	graphicContext.lineTo(displayAreaWidth / 2, frameMargin + strokeThickness);
	graphicContext.closePath();

  	// Create a gradient for the inner stroke
  	const innerStrokeGradient = graphicContext.createLinearGradient(0, frameMargin, 0, frameMargin + shapeBaseHeight);
	innerStrokeGradient.addColorStop(0, "#616161"); // Grey 700
	innerStrokeGradient.addColorStop(1, "#424242"); // Grey 800

	// Apply the inner stroke
	graphicContext.lineWidth = strokeThickness;
  	graphicContext.lineJoin = "round";
  	graphicContext.strokeStyle = innerStrokeGradient;
	graphicContext.stroke();

	// Draw an "exclamation" type mark inside the shape
	graphicContext.beginPath();
	graphicContext.arc(displayAreaWidth / 2, 110, 5, 0, Math.PI * 2, true);
	graphicContext.moveTo(displayAreaWidth / 2 - 3, 95);
	graphicContext.quadraticCurveTo(displayAreaWidth / 2, 105, displayAreaWidth / 2 + 3, 95);
	graphicContext.lineTo(displayAreaWidth / 2 + 8, 75);
	graphicContext.bezierCurveTo(displayAreaWidth / 2 + 10, 65, displayAreaWidth / 2 - 10, 65, displayAreaWidth / 2 - 8, 75, 5);
	graphicContext.lineTo(displayAreaWidth / 2 - 3, 95);
	graphicContext.closePath();
	graphicContext.fillStyle = "#424242"; // Dark grey fill
	graphicContext.fill();
}