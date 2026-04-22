/*
 *   Initialization routine for the application.
 */
window.onload = function  ()  {
    // Configure the file selection mechanism
    var fileSelector = document.getElementById('sourceContent');
    fileSelector.addEventListener('change', loadVisualData);

    // Attach functionality to the data concealment button
    var concealButton = document.getElementById('concealData');
    concealButton.addEventListener('click', performConcealment);

    // Attach functionality to the data uncovering button
    var uncoverButton = document.getElementById('uncoverData');
    uncoverButton.addEventListener('click', performUncovering);
};

/*
 *   Impose an artificial upper bound on the hidden payload size.
 */
var secretPayloadLimit = 1000;

/*
 *   Handles loading an image, displaying it, and preparing the canvas.
 *   @param {Event} actionEvent - The change event from the file input.
 */
var loadVisualData = function(actionEvent) {
    let contentStreamer = new FileReader();

    contentStreamer.onload = function(loadEvent) {
        // Update the image preview display
        document.getElementById('displayArea').style.display = 'block';
        document.getElementById('displayArea').src = loadEvent.target.result;

        // Clear out all input fields for a fresh start
        document.getElementById('secretInput').value = '';
        document.getElementById('secureKey').value = '';
        document.getElementById('secureKeyVerify').value = '';
        document.getElementById('revealedOutput').innerHTML = '';

        // Render the image onto the canvas element
        let graphicObject = new Image();
        graphicObject.onload = function() {
            let renderContext = document.getElementById('drawingSurface').getContext('2d');
            renderContext.canvas.width = graphicObject.width;
            renderContext.canvas.height = graphicObject.height;
            renderContext.drawImage(graphicObject, 0, 0);

            performUncovering(); // Attempt to decode any existing hidden data
        };
        graphicObject.src = loadEvent.target.result;
    };

    contentStreamer.readAsDataURL(actionEvent.target.files[0]);
};

/*
 *   Embeds a secret message into the image and provides the modified image.
 */
var performConcealment = function() {
    var payloadContent = document.getElementById('secretInput').value;
    var accessKey = document.getElementById('secureKey').value;
    var resultImage = document.getElementById('resultImage');
    var drawingSurface = document.getElementById('drawingSurface');
    var renderContext = drawingSurface.getContext('2d');

    // Encrypt the payload if a security key is provided
    if (accessKey.length > 0) {
        payloadContent = cryptographyUtility.encrypt(accessKey, payloadContent);
    } else {
        payloadContent = JSON.stringify({'text': payloadContent});
    }

    // Abort if the payload is too large for the current image dimensions
    let totalPixelCount = renderContext.canvas.width * renderContext.canvas.height;
    if ((payloadContent.length + 1) * 16 > totalPixelCount * 4 * 0.75) {
        alert('The secret message is excessively large for this image.');
        return;
    }

    // Abort if the payload exceeds the artificial global limit
    if (payloadContent.length > secretPayloadLimit) {
        alert('The secret message size exceeds the maximum allowed limit.');
        return;
    }

    // Proceed with embedding the (potentially encrypted) payload
    var imageDataBuffer = renderContext.getImageData(0, 0, renderContext.canvas.width, renderContext.canvas.height);
    embedSecretInPixels(imageDataBuffer.pixelColorArray, cryptographyUtility.hash.sha256.hash(accessKey), payloadContent);
    renderContext.putImageData(imageDataBuffer, 0, 0);

    // Notify user and display the modified image
    alert('Operation Complete! Please save and share the new image.');

    resultImage.src = drawingSurface.toDataURL();
};

/*
 *   Extracts and displays any hidden information from the image.
 */
var performUncovering = function() {
    const accessKeyInput = document.getElementById('secureKeyVerify').value;
    const authenticationFailedMsg = 'Incorrect access key or no hidden content found.';

    // Attempt to extract the payload using the provided key
    let renderContext = document.getElementById('drawingSurface').getContext('2d');
    let imageDataBuffer = renderContext.getImageData(0, 0, renderContext.canvas.width, renderContext.canvas.height);
    let extractedPayload = retrieveSecretFromPixels(imageDataBuffer.pixelColorArray, cryptographyUtility.hash.sha256.hash(accessKeyInput));

    // Try to parse the extracted data as JSON
    let parsedResult = null;
    try {
        parsedResult = JSON.parse(extractedPayload);
    } catch (parseError) {
        // If parsing fails, show the 'choose' view
        document.getElementById('initialView').style.display = 'block';
        document.getElementById('decodedView').style.display = 'none';

        if (accessKeyInput.length > 0) {
            alert(authenticationFailedMsg);
        }
    }

    // If successfully parsed, display the 'reveal' view
    if (parsedResult) {
        document.getElementById('initialView').style.display = 'none';
        document.getElementById('decodedView').style.display = 'block';

        // Decrypt the content if it was encrypted
        if (parsedResult.ct) {
            try {
                parsedResult.text = cryptographyUtility.decrypt(accessKeyInput, extractedPayload);
            } catch (decryptionError) {
                alert(authenticationFailedMsg);
            }
        }

        // Define a map for HTML entity escaping
        const htmlEntityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#x2F;',
            '\n': '<br/>'
        };

        // Function to sanitize content for HTML display
        var sanitizeDisplayContent = function (rawString) {
            return String(rawString).replace(/[&<>"'\/\n]/g, function (charToEscape) {
                return htmlEntityMap[charToEscape];
            });
        };
        document.getElementById('revealedOutput').innerHTML = sanitizeDisplayContent(parsedResult.text);
    }
};

/*
 *   Retrieves a specific bit (0 or 1) from a numeric value at a given position.
 *   @param {number} numericValue - The integer from which to extract the bit.
 *   @param {number} bitPosition - The zero-indexed position of the bit.
 *   @returns {number} The bit value (0 or 1).
 */
var extractSingleBit = function (numericValue, bitPosition) {
    return ((numericValue >> bitPosition) & 1);
};

/*
 *   Sets a specific bit in a numeric value to a given state (0 or 1).
 *   @param {number} numericValue - The integer to modify.
 *   @param {number} bitPosition - The zero-indexed position of the bit to set.
 *   @param {number} binaryDigit - The new bit value (0 or 1).
 *   @returns {number} The modified integer.
 */
var modifySingleBit = function(numericValue, bitPosition, binaryDigit) {
    return (numericValue & ~(1 << bitPosition)) | (binaryDigit << bitPosition);
};

/*
 *   Converts a 16-bit number into an array of its individual bits.
 *   @param {number} numericValue - The 16-bit integer to convert.
 *   @returns {Array<number>} An array of 0s and 1s representing the number.
 */
var convertNumberToBits = function(numericValue) {
    var bitCollection = [];
    for (let loopIndex = 0; loopIndex < 16; loopIndex++) {
        bitCollection.push(extractSingleBit(numericValue, loopIndex));
    }
    return bitCollection;
};

/*
 *   Reconstructs a 16-bit number from a sequence of bits hidden in a byte array.
 *   @param {Array<number>} byteSequence - The array of byte values (e.g., pixel color components).
 *   @param {Array<number>} processedIndices - A history of indices already used.
 *   @param {Array<number>} seedHashValue - A hash used for determining bit locations.
 *   @returns {number} The reconstructed 16-bit integer.
 */
var reconstructNumberFromBits = function(byteSequence, processedIndices, seedHashValue) {
    let reconstructedNumber = 0;
    let currentBitIndex = 0;
    while (currentBitIndex < 16) {
        let currentLocation = calculateNextIndex(processedIndices, seedHashValue, byteSequence.length);
        let extractedDigit = extractSingleBit(byteSequence[currentLocation], 0);
        reconstructedNumber = modifySingleBit(reconstructedNumber, currentBitIndex, extractedDigit);
        currentBitIndex++;
    }
    return reconstructedNumber;
};

/*
 *   Converts a text string into an array of its constituent bits.
 *   @param {string} inputText - The string to convert.
 *   @returns {Array<number>} A flat array of 0s and 1s.
 */
var convertTextToBitstream = function(inputText) {
    let textBitstream = [];
    for (var loopIndex = 0; loopIndex < inputText.length; loopIndex++) {
        let charUnicode = inputText.charCodeAt(loopIndex);
        textBitstream = textBitstream.concat(convertNumberToBits(charUnicode));
    }
    return textBitstream;
};

/*
 *   Determines the next available location in the data array for bit storage.
 *   @param {Array<number>} processedIndices - Indices already used.
 *   @param {Array<number>} seedHashValue - Hash for pseudo-random location generation.
 *   @param {number} totalElementsCount - Total size of the data array.
 *   @returns {number} The next valid, unused index.
 */
var calculateNextIndex = function(processedIndices, seedHashValue, totalElementsCount) {
    let sequenceIndex = processedIndices.length;
    let dataIndex = Math.abs(seedHashValue[sequenceIndex % seedHashValue.length] * (sequenceIndex + 1)) % totalElementsCount;
    while (true) {
        if (dataIndex >= totalElementsCount) {
            dataIndex = 0; // Wrap around if out of bounds
        } else if (processedIndices.indexOf(dataIndex) >= 0) {
            dataIndex++; // Skip if already used
        } else if ((dataIndex + 1) % 4 === 0) {
            dataIndex++; // Skip alpha channel to avoid modifying it accidentally
        } else {
            processedIndices.push(dataIndex);
            return dataIndex;
        }
    }
};

/*
 *   Embeds a secret message into the pixel data array.
 *   @param {Array<number>} pixelDataArray - The RGBA pixel component array.
 *   @param {Array<number>} seedHashValue - Hash used for bit placement.
 *   @param {string} payloadContent - The message string to embed.
 */
var embedSecretInPixels = function(pixelDataArray, seedHashValue, payloadContent) {
    // Generate an array of bits from the message length and content
    var textBitstream = convertNumberToBits(payloadContent.length);
    textBitstream = textBitstream.concat(convertTextToBitstream(payloadContent));

    // Keep track of modified pixel locations
    var processedIndices = [];

    // Embed each bit into the pixel data
    var currentBitIndex = 0;
    while (currentBitIndex < textBitstream.length) {
        // Determine the next location to modify
        let currentLocation = calculateNextIndex(processedIndices, seedHashValue, pixelDataArray.length);
        pixelDataArray[currentLocation] = modifySingleBit(pixelDataArray[currentLocation], 0, textBitstream[currentBitIndex]);

        // Ensure the alpha channel for this pixel is fully opaque (255)
        // This is necessary due to how browsers handle premultiplied alpha.
        while ((currentLocation + 1) % 4 !== 0) {
            currentLocation++;
        }
        pixelDataArray[currentLocation] = 255;

        currentBitIndex++;
    }
};

/*
 *   Extracts a secret message from the pixel data array.
 *   @param {Array<number>} pixelDataArray - The RGBA pixel component array.
 *   @param {Array<number>} seedHashValue - Hash used for bit retrieval order.
 *   @returns {string} The decoded message string.
 */
var retrieveSecretFromPixels = function(pixelDataArray, seedHashValue) {
    // Track read pixel locations
    var processedIndices = [];

    // First, determine the length of the hidden payload
    var secretDataLength = reconstructNumberFromBits(pixelDataArray, processedIndices, seedHashValue);

    // Validate the extracted length to prevent out-of-bounds access
    if ((secretDataLength + 1) * 16 > pixelDataArray.length * 0.75) {
        return '';
    }

    // Also check against the artificial limit
    if (secretDataLength === 0 || secretDataLength > secretPayloadLimit) {
        return '';
    }

    // Reconstruct each character from its bits
    var decodedCharacters = [];
    for (let loopIndex = 0; loopIndex < secretDataLength; loopIndex++) {
        let charUnicode = reconstructNumberFromBits(pixelDataArray, processedIndices, seedHashValue);
        decodedCharacters.push(String.fromCharCode(charUnicode));
    }

    // Join the characters to form the final message string
    return decodedCharacters.join('');
};