/*
 * Visual Asset Processing Toolkit
 * Version 2.0 - Optimized for modern web environments
 *
 * Copyright 2024, [Your Name/Company Name]
 * Licensed under the Apache License, Version 2.0.
 *
 * Date: Mon Jul 22 10:30:00 2024 +0000
 */

/**
 * Provides a suite of utilities for client-side image manipulation and transmission.
 * @class
 */
const AssetUtils = {

    /**
     * Processes an input image, applying compression and format conversion.
     * @param {HTMLImageElement} inputImageRef - The original HTML Image element.
     * @param {number} outputFidelityLevel - The desired quality level (0-100).
     * @param {string} targetMimeTypeStr - The desired output format ('image/jpeg' or 'image/png').
     * @returns {HTMLImageElement|null} A new HTML Image element containing the processed data, or null on error.
     */
    optimizeVisualAsset: function(inputImageRef, outputFidelityLevel, targetMimeTypeStr) {

        // --- Input Validation and Defaulting ---
        if (!(inputImageRef instanceof HTMLImageElement) || !inputImageRef.complete) {
            console.error("AssetUtils: Invalid or incomplete input image element provided for optimization.");
            return null;
        }

        let effectiveMimeType = "image/jpeg"; // Default to JPEG
        if (typeof targetMimeTypeStr === "string" && targetMimeTypeStr.toLowerCase() === "png") {
            effectiveMimeType = "image/png";
        } else if (typeof targetMimeTypeStr === "string" && targetMimeTypeStr.toLowerCase() === "image/png") {
             effectiveMimeType = "image/png";
        }

        const normalizedQuality = Math.max(0, Math.min(100, outputFidelityLevel || 80)) / 100; // Ensure quality is 0-1 and default to 80%

        // --- Canvas Setup ---
        const drawingSurface = document.createElement('canvas');
        const initialWidth = inputImageRef.naturalWidth || inputImageRef.width;
        const initialHeight = inputImageRef.naturalHeight || inputImageRef.height;

        if (initialWidth <= 0 || initialHeight <= 0) {
            console.error("AssetUtils: Input image dimensions are invalid.");
            return null;
        }

        drawingSurface.width = initialWidth;
        drawingSurface.height = initialHeight;

        const canvasDrawingAPI = drawingSurface.getContext("2d");
        if (!canvasDrawingAPI) {
            console.error("AssetUtils: Could not obtain 2D rendering context for canvas.");
            return null;
        }

        // --- Image Drawing and Data Extraction ---
        canvasDrawingAPI.drawImage(inputImageRef, 0, 0, initialWidth, initialHeight);

        // Convert canvas content to a data URL based on specified quality and type
        const processedImageDataURL = drawingSurface.toDataURL(effectiveMimeType, normalizedQuality);

        // --- Create and Return New Image Object ---
        const generatedImageObject = new Image();
        generatedImageObject.src = processedImageDataURL;

        return generatedImageObject;
    },

    /**
     * Transmits a processed image object to a remote server using XMLHttpRequest.
     * @param {HTMLImageElement} processedImageRef - The HTML Image element containing the processed image data.
     * @param {string} destinationEndpoint - The URL where the image data will be sent (POST request).
     * @param {string} formKeyName - The name of the form field for the file (e.g., 'imageFile').
     * @param {string} assetName - The filename to be sent to the server (e.g., 'my_photo.jpg').
     * @param {Function} onCompletion - Callback function for successful transfer (receives responseText).
     * @param {Function} [onFailure] - Optional callback for failed transfers (receives error details).
     * @param {Function} [onProgress] - Optional callback for progress updates (receives percentage).
     * @param {Object} [extraHeaders] - Optional object of key-value pairs for custom HTTP headers.
     */
    transmitAssetData: function(processedImageRef, destinationEndpoint, formKeyName, assetName, onCompletion, onFailure, onProgress, extraHeaders) {

        // --- Input Validation ---
        if (!(processedImageRef instanceof HTMLImageElement) || !processedImageRef.src) {
            console.error("AssetUtils: Invalid or empty processed image element provided for upload.");
            onFailure && onFailure("Invalid image reference provided.");
            return;
        }
        if (typeof destinationEndpoint !== "string" || !destinationEndpoint.trim()) {
            console.error("AssetUtils: Destination endpoint URL is required for upload.");
            onFailure && onFailure("Missing upload URL.");
            return;
        }
        if (typeof formKeyName !== "string" || !formKeyName.trim()) {
            console.error("AssetUtils: Form field name is required for upload.");
            onFailure && onFailure("Missing form field name.");
            return;
        }
        if (typeof assetName !== "string" || !assetName.trim()) {
            console.error("AssetUtils: Asset filename is required for upload.");
            onFailure && onFailure("Missing asset filename.");
            return;
        }
        if (typeof onCompletion !== "function") {
            console.error("AssetUtils: A success callback function is mandatory for upload.");
            return;
        }

        // --- Canvas Redraw for Consistent DataURL Extraction (if needed) ---
        // This redraw ensures we get a fresh dataURL with the correct type for upload,
        // even if the processedImageRef's src was generated with a different type.
        const uploadDrawingSurface = document.createElement('canvas');
        uploadDrawingSurface.width = processedImageRef.naturalWidth || processedImageRef.width;
        uploadDrawingSurface.height = processedImageRef.naturalHeight || processedImageRef.height;

        const uploadRenderContext = uploadDrawingSurface.getContext("2d");
        if (!uploadRenderContext) {
            console.error("AssetUtils: Could not obtain 2D rendering context for upload canvas.");
            onFailure && onFailure("Internal error: Canvas context unavailable for upload.");
            return;
        }
        uploadRenderContext.drawImage(processedImageRef, 0, 0);

        // --- Determine MIME Type for Upload ---
        let payloadType = "image/jpeg"; // Default
        if (assetName.toLowerCase().endsWith(".png")) {
            payloadType = "image/png";
        } else if (assetName.toLowerCase().endsWith(".gif")) { // Added support for GIF, though canvas toDataURL doesn't support it directly
            payloadType = "image/gif";
        }

        // --- Extract Base64 Data ---
        let rawImageDataString = uploadDrawingSurface.toDataURL(payloadType);
        const base64Prefix = `data:${payloadType};base64,`;
        if (!rawImageDataString.startsWith(base64Prefix)) {
            console.error("AssetUtils: Failed to extract base64 data URL with expected prefix.");
            onFailure && onFailure("Failed to prepare image data for upload.");
            return;
        }
        const base64EncodedData = rawImageDataString.substring(base64Prefix.length);

        // --- XMLHttpRequest Setup ---
        const httpRequestInstance = new XMLHttpRequest();
        httpRequestInstance.open('POST', destinationEndpoint, true); // Asynchronous request

        const dataSeparatorToken = '___FormBoundary' + Math.random().toString(36).substring(2, 15); // Unique boundary
        httpRequestInstance.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + dataSeparatorToken);

        // Apply custom headers if provided
        if (extraHeaders && typeof extraHeaders === "object") {
            for (const headerKey in extraHeaders) {
                if (Object.prototype.hasOwnProperty.call(extraHeaders, headerKey)) {
                    httpRequestInstance.setRequestHeader(headerKey, extraHeaders[headerKey]);
                }
            }
        }

        // --- Progress Reporting ---
        if (typeof onProgress === "function") {
            httpRequestInstance.upload.onprogress = function(progressEvent) { // Use upload.onprogress for sending progress
                if (progressEvent.lengthComputable) {
                    const percentage = (progressEvent.loaded / progressEvent.total) * 100;
                    onProgress(percentage); // Actually call the callback
                }
            };
        }

        // --- sendAsBinary Polyfill (for older browsers) ---
        // This ensures compatibility for browsers that don't natively support sending binary data directly.
        if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
            XMLHttpRequest.prototype.sendAsBinary = function(stringToEncode) {
                const charBytes = Array.prototype.map.call(stringToEncode, function(char) {
                    return char.charCodeAt(0) & 0xff; // Ensure single byte char code
                });
                this.send(new Uint8Array(charBytes).buffer);
            };
        }

        // --- Constructing Multipart/Form-Data Body ---
        const multipartBodyParts = [
            '--' + dataSeparatorToken,
            `Content-Disposition: form-data; name="${formKeyName}"; filename="${assetName}"`,
            `Content-Type: ${payloadType}`,
            '',
            atob(base64EncodedData), // Decode Base64 back to binary string
            '--' + dataSeparatorToken + '--'
        ];
        const finalPayload = multipartBodyParts.join('\r\n');

        // --- Send the Request ---
        httpRequestInstance.sendAsBinary(finalPayload);

        // --- Response Handling ---
        httpRequestInstance.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE) { // Equivalent to 4
                if (this.status >= 200 && this.status < 300) { // Success range
                    onCompletion(this.responseText);
                } else {
                    console.error(`AssetUtils: Upload failed with status ${this.status}: ${this.statusText || 'Unknown error'}`);
                    if (typeof onFailure === "function") {
                        onFailure(this.responseText || this.statusText || `HTTP Error: ${this.status}`);
                    }
                }
            }
        };

    }
};