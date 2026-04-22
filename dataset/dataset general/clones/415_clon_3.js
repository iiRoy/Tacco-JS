// This module provides a robust utility function for generating visual QR code representations.
// It relies on an external QR code library (e.g., qrcode.js) which must be available in the global scope.
// The output is an HTML <img> element, ready for insertion into the DOM.
//
// Original work by Amanuel Tewolde, 2011.
// Licensed under the MIT License.
// Enhanced and refactored by CodeCloneBot, 2023.

// Core function to produce an HTML image element containing a rendered QR code.
// Accepts the data string to encode and an optional configuration object for customization.
function generateQRImageElement(dataPayloadString, renderingOptions = {}) {

    // Establish default rendering parameters for the QR code visualization.
    const defaultRenderingConfig = {
        moduleDrawingSize: 5,        // The size (in pixels) of each individual QR code module (dot).
        outerMarginPixels: 10,       // The width (in pixels) of the white border around the QR matrix.
        foregroundModuleColor: "#000000", // Hex color for the dark (active) QR modules.
        backgroundModuleColor: "#FFFFFF", // Hex color for the light (inactive) QR modules and border.
        qrEngineVersion: 15,         // The QR code version (1-40). Higher versions support more data.
        errorCorrectionMode: QRErrorCorrectLevel.L // Default error correction (L: ~7%, M: ~15%, Q: ~25%, H: ~30%).
    };

    // Integrate user-provided options, overriding defaults where specified.
    const effectiveConfig = { ...defaultRenderingConfig, ...renderingOptions };

    // Destructure the final configuration for cleaner variable access.
    const {
        moduleDrawingSize,
        outerMarginPixels,
        foregroundModuleColor,
        backgroundModuleColor,
        qrEngineVersion,
        errorCorrectionMode
    } = effectiveConfig;

    // --- Critical Input Validation & Early Exit Conditions ---
    if (!dataPayloadString || typeof dataPayloadString !== 'string' || dataPayloadString.trim() === '') {
        console.error("QR Code generation aborted: Provided data payload is empty, null, or not a string.");
        const validationFeedback = document.createElement("div");
        validationFeedback.textContent = "Error: Invalid or missing content for QR code encoding.";
        validationFeedback.style.cssText = "color: #D50000; background-color: #FFEBEE; padding: 8px; border: 1px solid #FFCDD2; border-radius: 4px;";
        return validationFeedback;
    }

    if (moduleDrawingSize <= 0 || outerMarginPixels < 0) {
        console.warn("QR Code rendering parameters (module size or margin) are non-positive. This may lead to unexpected rendering or errors.");
        // For a Type III clone, we might just warn, or enforce minimums, or throw. Warning is sufficient here.
    }

    // Initialize an off-screen canvas element for drawing the QR code.
    const qrDrawingCanvas = document.createElement('canvas');
    const canvasContext2D = qrDrawingCanvas.getContext('2d');

    if (!canvasContext2D) {
        console.error("Failed to obtain 2D rendering context from canvas. Your browser might not support it or there's an issue.");
        const contextErrorElement = document.createElement("p");
        contextErrorElement.textContent = "Rendering Error: Canvas 2D context is unavailable.";
        contextErrorElement.style.color = "red";
        return contextErrorElement;
    }

    let qrCodeEncoder; // Instance of the QR code library's encoder.

    try {
        // Instantiate the QR code encoding engine with specified version and error correction.
        qrCodeEncoder = new QRCode(qrEngineVersion, errorCorrectionMode);

        // Feed the actual data string into the encoder.
        qrCodeEncoder.addData(dataPayloadString);

        // Process the data and generate the internal QR code matrix.
        qrCodeEncoder.make();
    } catch (encodingIssue) {
        // Capture and report any issues during the QR code data processing.
        console.error("Exception during QR code matrix generation:", encodingIssue);
        const errorReportNode = document.createElement("span");
        const detailedErrorMessage = document.createTextNode(`QR Encoding Failure! Issue: ${encodingIssue.message || 'Unknown error'}.`);
        errorReportNode.appendChild(detailedErrorMessage);
        errorReportNode.style.cssText = "color: #B71C1C; background-color: #FFCDD2; padding: 6px; border: 1px solid #EF9A9A; border-radius: 3px;";
        return errorReportNode;
    }

    // Retrieve the dimensions of the generated QR code matrix (e.g., 29x29 modules).
    const qrMatrixDimension = qrCodeEncoder.getModuleCount();

    // Calculate the total required width/height for the canvas, including the border.
    const totalCanvasDimension = (qrMatrixDimension * moduleDrawingSize) + (outerMarginPixels * 2);
    qrDrawingCanvas.width = totalCanvasDimension;
    qrDrawingCanvas.height = totalCanvasDimension;

    // The offset to apply when drawing QR modules, to account for the outer border.
    const drawingOffset = outerMarginPixels;

    // Fill the entire canvas with the background color to establish the border.
    canvasContext2D.fillStyle = backgroundModuleColor;
    canvasContext2D.fillRect(0, 0, totalCanvasDimension, totalCanvasDimension);

    // Iterate through each row and column of the QR code matrix to draw the modules.
    for (let rowIterator = 0; rowIterator < qrMatrixDimension; rowIterator++) {
        for (let colIterator = 0; colIterator < qrMatrixDimension; colIterator++) {
            // Determine if the current module should be 'dark' or 'light'.
            const currentModuleIsDark = qrCodeEncoder.isDark(rowIterator, colIterator);

            // Set the drawing color based on the module's state.
            canvasContext2D.fillStyle = currentModuleIsDark ? foregroundModuleColor : backgroundModuleColor;

            // Draw the individual module as a filled rectangle on the canvas.
            // Coordinates are adjusted by the `drawingOffset` to center the QR matrix.
            canvasContext2D.fillRect(
                (colIterator * moduleDrawingSize) + drawingOffset,
                (rowIterator * moduleDrawingSize) + drawingOffset,
                moduleDrawingSize,
                moduleDrawingSize
            );
        }
    }

    // Convert the canvas content into a PNG Data URL.
    const imageSourceData = qrDrawingCanvas.toDataURL("image/png");

    // Create a new HTML <img> element to encapsulate the generated QR code.
    const qrOutputImage = document.createElement("img");
    qrOutputImage.src = imageSourceData;
    // Add accessibility attributes and a CSS class for styling.
    qrOutputImage.alt = `QR Code for: ${dataPayloadString.substring(0, 75)}${dataPayloadString.length > 75 ? '...' : ''}`;
    qrOutputImage.title = `QR Code content: ${dataPayloadString}`;
    qrOutputImage.classList.add("generated-qr-code-display");
    qrOutputImage.style.display = 'block'; // Ensure it behaves as a block element for layout purposes.

    // Return the fully prepared image element.
    return qrOutputImage;
}