// Script initialization: Ensures the DOM is fully loaded before attaching event handlers and setting up UI components.
document.addEventListener('DOMContentLoaded', function() {
    // Locate the file input element responsible for image selection.
    let sourceImageInput = document.getElementById('imageUploadField');
    if (sourceImageInput) { // Defensive check: ensure the element exists.
        sourceImageInput.addEventListener('change', handleImageSelection);
    } else {
        console.error('Critical UI element "imageUploadField" not found. Application may not function correctly.');
    }

    // Locate the button that triggers the message embedding process.
    let embedTrigger = document.getElementById('initiateEncode');
    if (embedTrigger) {
        embedTrigger.addEventListener('click', executeEmbeddingProcess);
    } else {
        console.error('Critical UI element "initiateEncode" not found. Encoding feature unavailable.');
    }

    // Locate the button that initiates the message extraction process.
    let extractTrigger = document.getElementById('initiateDecode');
    if (extractTrigger) {
        extractTrigger.addEventListener('click', executeExtractionProcess);
    } else {
        console.error('Critical UI element "initiateDecode" not found. Decoding feature unavailable.');
    }
});

// A configurable upper limit for the hidden message content size in bytes.
// This acts as a safeguard against excessively large messages.
const MAX_STEGO_PAYLOAD_BYTES = 1024; // Changed value and type from var to const.

/**
 * Manages the display style of a given HTML element.
 * @param {string} elementId - The ID of the HTML element to modify.
 * @param {boolean} isVisible - True to set display to 'block', false to set to 'none'.
 */
function setElementVisibility(elementId, isVisible) {
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
        targetElement.style.display = isVisible ? 'block' : 'none';
    } else {
        console.warn(`Attempted to set visibility for non-existent element: #${elementId}`);
    }
}

/**
 * Handles the event when a user selects an image file for steganography.
 * Reads the file and loads it into a preview and an off-screen canvas.
 * @param {Event} fileChangeEvent - The change event from the file input.
 */
let handleImageSelection = function(fileChangeEvent) {
    const fileReaderInstance = new FileReader();

    fileReaderInstance.onload = function(loadEvent) {
        // Display the selected image in the preview area.
        setElementVisibility('imagePreviewContainer', true);
        document.getElementById('imagePreviewContainer').src = loadEvent.target.result;

        // Clear all relevant input fields and message display areas for a fresh start.
        document.getElementById('secretMessageInput').value = '';
        document.getElementById('encodeKeyInput').value = '';
        document.getElementById('decodeKeyInput').value = '';
        document.getElementById('extractedMessageOutput').innerHTML = ''; // Cleared using innerHTML

        // Create a new Image object and load the selected image for canvas processing.
        let visualAsset = new Image();
        visualAsset.onload = function() {
            const processingCanvas = document.getElementById('stegoCanvas');
            const canvasContext = processingCanvas.getContext('2d');

            // Set canvas dimensions to match the loaded image.
            processingCanvas.width = visualAsset.width;
            processingCanvas.height = visualAsset.height;
            canvasContext.drawImage(visualAsset, 0, 0); // Draw the image onto the canvas.

            // After loading, automatically attempt to extract any potential hidden messages.
            // A slight delay is added to ensure canvas rendering is complete.
            setTimeout(executeExtractionProcess, 50);
        };
        visualAsset.src = loadEvent.target.result; // Start loading the image.
    };

    // Ensure a file is indeed selected before attempting to read it.
    if (fileChangeEvent.target.files && fileChangeEvent.target.files.length > 0) {
        fileReaderInstance.readAsDataURL(fileChangeEvent.target.files[0]);
    } else {
        console.info('No file selected for image processing. Operation aborted.');
    }
};

/**
 * Initiates the process of embedding a secret message into the currently loaded image.
 * This includes optional encryption, message size validation, and pixel manipulation.
 */
let executeEmbeddingProcess = function() {
    let rawMessageContent = document.getElementById('secretMessageInput').value;
    let encryptionKey = document.getElementById('encodeKeyInput').value;
    const outputDisplay = document.getElementById('stegoImageOutput');
    const processingCanvas = document.getElementById('stegoCanvas');
    const canvasContext = processingCanvas.getContext('2d');

    // Ensure there's an image loaded in the canvas before attempting to embed.
    if (processingCanvas.width === 0 || processingCanvas.height === 0) {
        alert('Please load an image first before attempting to embed a message.');
        return;
    }

    let finalPayload;
    // Encrypt the message using SJCL if an encryption key is provided.
    if (encryptionKey.length > 0) {
        try {
            finalPayload = sjcl.encrypt(encryptionKey, rawMessageContent);
        } catch (error) {
            console.error('Encryption failed during embedding:', error);
            alert('Error during encryption. Please verify your key and message content.');
            return;
        }
    } else {
        // If no encryption key, wrap the raw message in a JSON object for consistent handling.
        finalPayload = JSON.stringify({ 'payloadText': rawMessageContent }); // Changed key name for Type III
    }

    // Perform message size suitability checks.
    const totalPixels = canvasContext.canvas.width * canvasContext.canvas.height;
    // Approximate available capacity: 3 color channels per pixel, each can store 1 bit.
    const availableBitCapacity = Math.floor(totalPixels * 3);
    // Required bits: 8 bits per character (for simpler calculation), plus 8 bits for length indicator.
    const requiredBits = (finalPayload.length + 1) * 8;

    if (requiredBits > availableBitCapacity) {
        alert('The secret message is too large for this image. Consider a shorter message or a larger image.');
        return;
    }

    // Check against the predefined artificial message size limit.
    if (finalPayload.length > MAX_STEGO_PAYLOAD_BYTES) {
        alert(`Message length (${finalPayload.length} characters) exceeds the maximum allowed limit of ${MAX_STEGO_PAYLOAD_BYTES} characters.`);
        return;
    }

    // Retrieve the raw pixel data from the canvas.
    let currentImageData = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    // Hash the encryption key to generate a pseudo-random seed for bit placement.
    const keyHash = sjcl.hash.sha256.hash(encryptionKey);

    // Execute the actual message embedding into the pixel data.
    insertMessageIntoPixels(currentImageData.data, keyHash, finalPayload);
    // Update the canvas with the modified pixel data.
    canvasContext.putImageData(currentImageData, 0, 0);

    // Inform the user and display the resulting steganographic image.
    alert('Message successfully embedded! Right-click the image below to save and share.');
    outputDisplay.src = processingCanvas.toDataURL('image/png', 0.9); // Explicitly set format and quality.

    // Optionally clear the original message input field after successful embedding.
    document.getElementById('secretMessageInput').value = '';
};

/**
 * Initiates the process of extracting a secret message from the currently loaded image.
 * This includes attempting decryption if the message is encrypted.
 */
let executeExtractionProcess = function() {
    let decryptionKey = document.getElementById('decodeKeyInput').value;
    const feedbackMessage = 'Extraction failed: No hidden message found, or the decryption key is incorrect.';

    const processingCanvas = document.getElementById('stegoCanvas');
    const canvasContext = processingCanvas.getContext('2d');

    // Pre-check: Ensure the canvas contains an image to process.
    if (processingCanvas.width === 0 || processingCanvas.height === 0) {
        console.info('Canvas is currently empty; cannot perform message extraction.');
        document.getElementById('extractedMessageOutput').innerHTML = ''; // Clear output
        setElementVisibility('decodeOptionsPanel', true);
        setElementVisibility('revealContentPanel', false);
        return; // Exit early if no image.
    }

    // Get the pixel data from the canvas for extraction.
    let imageDataForExtraction = canvasContext.getImageData(0, 0, processingCanvas.width, processingCanvas.height);
    // Hash the decryption key to generate the pseudo-random seed for bit retrieval.
    const keyHashForExtraction = sjcl.hash.sha256.hash(decryptionKey);

    // Attempt to extract the raw hidden content string.
    let extractedRawContent = retrieveMessageFromPixels(imageDataForExtraction.data, keyHashForExtraction);

    let parsedObject = null;
    try {
        // Try to parse the extracted content as JSON.
        parsedObject = JSON.parse(extractedRawContent);
    } catch (parseError) {
        // If JSON parsing fails, it implies either no valid message, or an encrypted message.
        setElementVisibility('decodeOptionsPanel', true); // Show options for decoding.
        setElementVisibility('revealContentPanel', false); // Hide reveal panel.

        if (decryptionKey.length > 0) {
            alert(feedbackMessage); // Inform user about potential key issue.
        } else {
            console.log("Extracted content is not valid JSON. It might be encrypted or not a hidden message.");
        }
        document.getElementById('extractedMessageOutput').innerHTML = ''; // Clear any previous output.
        return; // Stop further processing if parsing failed.
    }

    // If a valid JSON object was parsed, proceed to reveal the message.
    if (parsedObject) {
        setElementVisibility('decodeOptionsPanel', false); // Hide decoding options.
        setElementVisibility('revealContentPanel', true); // Show the message reveal panel.

        // Check if the content was encrypted (e.g., SJCL objects have a 'ct' property).
        if (parsedObject.ct) {
            try {
                // Attempt to decrypt the message using the provided key.
                parsedObject.payloadText = sjcl.decrypt(decryptionKey, extractedRawContent);
            } catch (decryptError) {
                console.error('Decryption failed:', decryptError);
                alert(feedbackMessage); // Inform user about decryption failure.
                document.getElementById('extractedMessageOutput').innerHTML = ''; // Clear output on failure.
                return;
            }
        }

        // Define a map for HTML entity escaping.
        const htmlEscaperMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#x2F;',
            '\n': '<br/>' // Convert newlines to HTML breaks.
        };
        // Helper function to sanitize a string for safe HTML display.
        const sanitizeForHtml = (unsafeString) => {
            if (typeof unsafeString !== 'string') return ''; // Guard for non-string input.
            return unsafeString.replace(/[&<>"'\/\n]/g, (char) => htmlEscaperMap[char] || char);
        };

        // Display the (decrypted and sanitized) message in the designated output area.
        document.getElementById('extractedMessageOutput').innerHTML = sanitizeForHtml(parsedObject.payloadText || '');
    }
};

/**
 * Retrieves a single bit (0 or 1) from a given number at a specified bit position.
 * @param {number} value - The number from which to extract the bit.
 * @param {number} bitPosition - The 0-indexed position of the bit (0 for LSB).
 * @returns {number} The bit value (0 or 1).
 */
const fetchBit = (value, bitPosition) => (value >> bitPosition) & 1;

/**
 * Sets a specific bit in a number to a new value (0 or 1).
 * @param {number} originalValue - The number to modify.
 * @param {number} bitPosition - The 0-indexed position of the bit to set.
 * @param {number} newBitValue - The new bit value (0 or 1).
 * @returns {number} The modified number.
 */
const adjustBit = (originalValue, bitPosition, newBitValue) =>
    (originalValue & ~(1 << bitPosition)) | (newBitValue << bitPosition);

/**
 * Converts a 2-byte (16-bit) numerical value into an array of its individual bits.
 * @param {number} numericalValue - The number to convert.
 * @returns {Array<number>} An array of 16 bits (0s and 1s).
 */
const convertNumberToBitArray = (numericalValue) => {
    let bitSequence = [];
    for (let currentBitIndex = 0; currentBitIndex < 16; currentBitIndex++) {
        bitSequence.push(fetchBit(numericalValue, currentBitIndex));
    }
    return bitSequence;
};

/**
 * Reconstructs a 2-byte (16-bit) number by extracting bits from pixel data
 * using a pseudo-random sequence to determine pixel locations.
 * @param {Uint8ClampedArray} pixelDataArray - The array of pixel color components (RGBA).
 * @param {Array<number>} visitedLocations - An array tracking pixel indices already used.
 * @param {Array<number>} keySeed - The hashed key used for pseudo-random location generation.
 * @returns {number} The reconstructed 16-bit number.
 */
const reconstructNumberFromBits = (pixelDataArray, visitedLocations, keySeed) => {
    let reconstructedNumber = 0;
    let bitCounter = 0;
    // Iterate 16 times to get 16 bits for a 2-byte number.
    while (bitCounter < 16) {
        let pixelIndex = getNextValidPixelLocation(visitedLocations, keySeed, pixelDataArray.length);
        // Extract the least significant bit (LSB) from the chosen pixel component.
        let extractedBit = fetchBit(pixelDataArray[pixelIndex], 0);
        reconstructedNumber = adjustBit(reconstructedNumber, bitCounter, extractedBit);
        bitCounter++;
    }
    return reconstructedNumber;
};

/**
 * Transforms a string message into a flat array of bits, where each character
 * is represented by 16 bits (its Unicode code point).
 * @param {string} textMessage - The message string to convert.
 * @returns {Array<number>} A concatenated array of all message bits.
 */
const transformMessageToBitSequence = (textMessage) => {
    let fullBitSequence = [];
    for (let charIndex = 0; charIndex < textMessage.length; charIndex++) {
        let charCode = textMessage.charCodeAt(charIndex);
        fullBitSequence = fullBitSequence.concat(convertNumberToBitArray(charCode));
    }
    return fullBitSequence;
};

/**
 * Calculates the next available pixel location for embedding or extraction,
 * ensuring it's not an alpha channel and hasn't been used before.
 * The location is determined pseudo-randomly using the provided key seed.
 * @param {Array<number>} visitedIndices - An array of indices already used/modified.
 * @param {Array<number>} pseudoRandomKey - The hashed key array for randomness.
 * @param {number} totalPixelElements - The total length of the pixel data array.
 * @returns {number} The index of the next valid pixel component.
 */
const getNextValidPixelLocation = (visitedIndices, pseudoRandomKey, totalPixelElements) => {
    let currentPositionInKey = visitedIndices.length;
    let calculatedIndex = Math.abs(pseudoRandomKey[currentPositionInKey % pseudoRandomKey.length] * (currentPositionInKey + 1)) % totalPixelElements;

    // Loop indefinitely until a suitable, unused location is found.
    while (true) {
        // If the calculated index exceeds array bounds, wrap it around.
        if (calculatedIndex >= totalPixelElements) {
            calculatedIndex = 0; // Reset to the beginning.
            continue; // Re-evaluate the new index.
        }
        // If this index has already been visited, increment and try the next.
        if (visitedIndices.includes(calculatedIndex)) { // Using Array.prototype.includes for Type III modernization.
            calculatedIndex++;
            continue;
        }
        // Skip alpha channel components (every 4th element, 0-indexed: R, G, B, A).
        if ((calculatedIndex + 1) % 4 === 0) {
            calculatedIndex++;
            continue;
        }
        // If all checks pass, this is a valid location.
        visitedIndices.push(calculatedIndex); // Mark this location as visited.
        return calculatedIndex;
    }
};

/**
 * Embeds a string 'payload' into the 'pixelArray' using LSB steganography.
 * @param {Uint8ClampedArray} pixelArray - The array of pixel color components (RGBA).
 * @param {Array<number>} randomizerKey - The hashed key for pseudo-random bit placement.
 * @param {string} payload - The message string to embed.
 */
const insertMessageIntoPixels = (pixelArray, randomizerKey, payload) => {
    // Convert the message length and the message content itself into a single stream of bits.
    let payloadLengthBits = convertNumberToBitArray(payload.length);
    let fullPayloadBits = payloadLengthBits.concat(transformMessageToBitSequence(payload));

    let processedIndices = []; // Keeps track of pixel indices that have been modified.

    let bitIterator = 0;
    while (bitIterator < fullPayloadBits.length) {
        // Get the next pseudo-random, valid pixel component index.
        let targetPixelIndex = getNextValidPixelLocation(processedIndices, randomizerKey, pixelArray.length);
        // Set the least significant bit of the chosen pixel component to the current message bit.
        pixelArray[targetPixelIndex] = adjustBit(pixelArray[targetPixelIndex], 0, fullPayloadBits[bitIterator]);

        // Ensure the alpha component of the current pixel is fully opaque (255).
        // This is important for consistent image rendering across different browsers and platforms.
        let alphaIndex = targetPixelIndex;
        while ((alphaIndex + 1) % 4 !== 0) { // Move to the alpha component of the current pixel.
            alphaIndex++;
        }
        pixelArray[alphaIndex] = 255; // Force full opacity.

        bitIterator++;
    }
};

/**
 * Extracts a hidden message string from the 'pixelArray'.
 * @param {Uint8ClampedArray} pixelArray - The array of pixel color components (RGBA).
 * @param {Array<number>} randomizerKey - The hashed key used for pseudo-random bit retrieval.
 * @returns {string} The extracted message string, or an empty string if extraction fails or no message is found.
 */
const retrieveMessageFromPixels = (pixelArray, randomizerKey) => {
    let visitedPixelHistory = []; // Tracks pixel indices that have been read from.

    // First, extract the length of the hidden message, which is stored as a 2-byte number.
    let extractedMessageLength = reconstructNumberFromBits(pixelArray, visitedPixelHistory, randomizerKey);

    // Validate the extracted message length against expected bounds.
    if (extractedMessageLength === 0 || extractedMessageLength > MAX_STEGO_PAYLOAD_BYTES) {
        console.warn('Extracted message length is invalid (zero or exceeds artificial limit):', extractedMessageLength);
        return ''; // Return an empty string if the length is suspicious.
    }

    // Perform a rough check to ensure sufficient pixel data exists for the declared message length.
    // Each character (16 bits) requires accessing 16 non-alpha pixel components.
    // Since we skip alpha channels, it's roughly 16 * (4/3) pixel array elements per char.
    const approximateRequiredPixelComponents = Math.ceil(extractedMessageLength * 16 * (4/3));
    if (approximateRequiredPixelComponents > pixelArray.length) {
        console.warn('Declared message length seems too large for the available pixel data. Potential data corruption or incorrect key.');
        return '';
    }

    let characterArray = [];
    // Iterate to reconstruct each character of the message.
    for (let charCounter = 0; charCounter < extractedMessageLength; charCounter++) {
        let charCodeValue = reconstructNumberFromBits(pixelArray, visitedPixelHistory, randomizerKey);
        characterArray.push(String.fromCharCode(charCodeValue));
    }

    return characterArray.join(''); // Join the characters to form the complete message string.
};