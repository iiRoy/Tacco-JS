/*
 * This is a modified version of the original QR code generator.
 * All identifiers and logic are preserved.
 * Changes are limited to whitespace and comments only.
 */


function showQRCode(text)
{
	// Initialize configuration variables for the QR code generation process.
	var dotsize = 5; /* This variable defines the pixel size for each "dot" or module in the QR code. */
	var padding = 10; // The amount of empty space (in pixels) around the QR code itself.
	var black = "rgb(0,0,0)";
	var white = "rgb(255,255,255)";
	var QRCodeVersion = 15; /* Specifies the version of the QR Code standard to use, affecting complexity and data capacity. */

	// Dynamically create a canvas element where the QR code will be drawn.
	var canvas = document.createElement('canvas');
	var qrCanvasContext = canvas.getContext('2d'); // Obtain the 2D rendering context for the canvas.

	try
	{
		// Instantiate a new QR Code object with specified version and error correction level.
		// Error correction levels: L (7%), M (15%), Q (25%), H (30%) - higher means more redundancy.
		var qr = new QRCode(QRCodeVersion, QRErrorCorrectLevel.L);
		qr.addData(text); // Add the input text data to the QR code generator.
		qr.make(); // Generate the QR code matrix based on the added data.
	}
	catch (err)
	{
		// In case of an error during QR code generation, create an error message element.
		var errorChild = document.createElement("p");
		var errorMSG = document.createTextNode("QR Code FAIL! " + err);
		errorChild.appendChild(errorMSG); // Append the error message to the paragraph element.
		return errorChild; // Return the error message element instead of a QR code.
	}

	// Calculate the total size of the QR code matrix.
	var qrsize = qr.getModuleCount();

	// Set the canvas dimensions based on the QR code size, dot size, and padding.
	canvas.setAttribute('height', (qrsize * dotsize) + padding);
	canvas.setAttribute('width', (qrsize * dotsize) + padding);

	var shiftForPadding = padding / 2; // Determine the offset needed to center the QR code within the padding.

	if (canvas.getContext)
	{
		// Iterate through each row of the QR code matrix.
		for (var r = 0; r < qrsize; r++)
		{
			// Iterate through each column in the current row.
			for (var c = 0; c < qrsize; c++)
			{
				// Check if the current module (dot) in the QR code matrix is dark or light.
				if (qr.isDark(r, c)) { qrCanvasContext.fillStyle = black; } // If dark, set fill style to black.
				else { qrCanvasContext.fillStyle = white; } // If light, set fill style to white.

				// Draw the rectangle for the current module on the canvas.
				qrCanvasContext.fillRect((c * dotsize) + shiftForPadding, (r * dotsize) + shiftForPadding, dotsize, dotsize);
			}
		}
	}

	// Create a new image element to display the generated QR code.
	var imgElement = document.createElement("img");

	// Convert the canvas content to a PNG data URL and set it as the image source.
	imgElement.src = canvas.toDataURL("image/png");

	return imgElement; // Return the final image element containing the QR code.
}