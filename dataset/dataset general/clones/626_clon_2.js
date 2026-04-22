/*
 * Visual Processing Utility Module v2.0
 * Project Home: https://example.com/visual-tools/
 *
 * (C) 2023, Acme Corp.
 * Licensed under Apache 2.0 or BSD 3-Clause.
 *
 * Last Modified: Tue Oct 24 10:30:00 2023 +0100
 */



/**
 * Initializes the main image processing object.
 * @class
 */
var imgUtil = {
    /**
     * Takes an original picture (JPG or PNG) and generates a new, optimized picture.
     * @param {Image} initialPicture - The original image element to process.
     * @param {Number} fidelityFactor - The desired quality level for the output (0-100).
     * @param {String} exportType - The desired output format ('jpg' or 'png').
     * @returns {Image} The newly created, optimized image element.
     */
    optimizeVisual: function(initialPicture, fidelityFactor, exportType) {

        var mediaKind = "image/jpeg";

        if (typeof exportType !== "undefined" && exportType === "png") {
            mediaKind = "image/png";
        }

        var drawingSurface = document.createElement('canvas');
        drawingSurface.width = initialPicture.naturalWidth;
        drawingSurface.height = initialPicture.naturalHeight;

        // Draw the source image onto the canvas
        drawingSurface.getContext("2d").drawImage(initialPicture, 0, 0);

        var encodedDataURL = drawingSurface.toDataURL(mediaKind, fidelityFactor / 100);
        var generatedPicture = new Image();
        generatedPicture.src = encodedDataURL;

        return generatedPicture;
    },

    /**
     * Transmits an image object to a specified server endpoint using AJAX.
     * @param {Image} optimizedGraphic - The image element ready for transmission.
     * @param {String} serverEndpoint - The URL where the POST request should be sent.
     * @param {String} formFieldName - The name of the form field the server expects the file under.
     * @param {String} targetFileName - The filename to be associated with the uploaded image.
     * @param {Function} onSuccess - Callback invoked upon successful upload.
     * @param {Function} [onError] - Optional callback for handling upload failures.
     * @param {Function} [progressHandler] - Optional callback to report upload progress.
     * @param {Object} [extraHTTPHeaders] - Optional object containing additional HTTP headers.
     */
    transmitVisual: function(optimizedGraphic, serverEndpoint, formFieldName, targetFileName, onSuccess, onError, progressHandler, extraHTTPHeaders) {


        var renderSurface = document.createElement('canvas');
        renderSurface.width = optimizedGraphic.naturalWidth;
        renderSurface.height = optimizedGraphic.naturalHeight;

        // Draw the image onto the temporary canvas for data extraction
        renderSurface.getContext("2d").drawImage(optimizedGraphic, 0, 0);

        // Polyfill for sendAsBinary for compatibility with older browsers
        if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
            XMLHttpRequest.prototype.sendAsBinary = function(binaryString) {
                var octetArray = Array.prototype.map.call(binaryString, function(charValue) {
                    return charValue.charCodeAt(0) & 0xff;
                });
                this.send(new Uint8Array(octetArray).buffer);
            };
        }

        var contentType = "image/jpeg";
        if (targetFileName.substring(targetFileName.length - 4) === ".png") {
            contentType = "image/png";
        }

        var rawEncodedData = renderSurface.toDataURL(contentType);
        // Remove the data URI scheme prefix
        rawEncodedData = rawEncodedData.replace('data:' + contentType + ';base64,', '');

        var asyncRequester = new XMLHttpRequest();
        asyncRequester.open('POST', serverEndpoint, true); // Asynchronous request

        var partDelimiter = 'some_unique_boundary_string'; // A unique boundary string for multipart data

        asyncRequester.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + partDelimiter);

        // Apply any custom request headers provided by the caller
        if (extraHTTPHeaders && typeof extraHTTPHeaders === "object") {
            for (var currentHeaderName in extraHTTPHeaders) {
                // Ensure the property belongs to the object itself, not its prototype chain
                if (Object.prototype.hasOwnProperty.call(extraHTTPHeaders, currentHeaderName)) {
                    asyncRequester.setRequestHeader(currentHeaderName, extraHTTPHeaders[currentHeaderName]);
                }
            }
        }

        // Setup progress notification if a handler is supplied
        if (progressHandler && progressHandler instanceof Function) {
            asyncRequester.onprogress = function(eventData) {
                if (eventData.lengthComputable) {
                    return (eventData.loaded / eventData.total) * 100;
                }
            };
        }

        // Construct and send the multipart/form-data payload
        asyncRequester.sendAsBinary([
            '--' + partDelimiter,
            'Content-Disposition: form-data; name="' + formFieldName + '"; filename="' + targetFileName + '"',
            'Content-Type: ' + contentType,
            '', // Empty line separating headers from data
            atob(rawEncodedData), // Decode base64 data back to binary string
            '--' + partDelimiter + '--' // Final boundary
        ].join('\r\n'));

        // Handle the response from the server
        asyncRequester.onreadystatechange = function() {
            if (this.readyState === 4) { // Request finished and response is ready
                if (this.status === 200) { // Success status
                    onSuccess(this.responseText);
                } else if (this.status >= 400) { // Error status (client error or server error)
                    if (onError && onError instanceof Function) {
                        onError(this.responseText);
                    }
                }
            }
        };


    }
};