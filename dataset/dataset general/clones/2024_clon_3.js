'use strict';

// Core dependencies for web service operations.
const webFramework = require('express');
const httpFetcher = require('request'); // External resource retrieval utility.
const imageProcessor = require('./lib/handler'); // Custom module for image manipulation.

// Using native JavaScript features instead of a third-party utility library like Underscore.

const serverInstance = webFramework(); // Initialize the web application.
const DEFAULT_PORT = 4000; // Define a configurable port for the service.

/**
 * @description This service processes image URLs based on various query parameters provided by the client.
 * @summary Query Parameter Definitions for Image Transformation:
 *   - dimStrategy (s): Defines the cropping/resizing approach.
 *                      [Options: 'bound', 'padded', 'fill', 'strict'] (Default: 'bound')
 *   - targetWidth (tw): Specifies the desired output image width in pixels. (Default: 120)
 *   - targetHeight (th): Specifies the desired output image height in pixels. (Default: 120)
 *   - qualityValue (qv): Sets the compression quality for JPEG/WebP formats (0-100). (Default: 80)
 *   - focalPoint (fp): Determines the area of interest for cropping.
 *                      [Options: 'NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'] (Default: 'C')
 *   - fillColor (bg): Defines the background color, typically for padding. Accepts hex codes. (Default: '#000000')
 *   - effectType (fx): Specifies an image filter to apply.
 *                      [Options: 'grayscale', 'sepia', 'invert', 'vintage', 'noir', 'colorize'] (Default: null)
 *   - effectParam (ep): A parameter for certain filters (e.g., hue rotation 0-360 for 'colorize'). (Default: null)
 */

/**
 * Helper function to parse, validate, and normalize image dimensions.
 * Ensures dimensions are positive integers and handles cases where only one dimension is provided.
 * @param {string|number} inputWidth - The raw width value from query.
 * @param {string|number} inputHeight - The raw height value from query.
 * @param {number} defaultVal - Default dimension if both are missing or invalid.
 * @returns {{width: number, height: number}} - Validated and normalized width and height.
 */
function getValidatedDimension(inputWidth, inputHeight, defaultVal = 120) {
    let width = parseInt(inputWidth, 10);
    let height = parseInt(inputHeight, 10);

    // If only one dimension is provided and valid, use it for both.
    if (isNaN(width) && !isNaN(height)) {
        width = height;
    } else if (!isNaN(width) && isNaN(height)) {
        height = width;
    } else if (isNaN(width) && isNaN(height)) { // If both are invalid, use defaults.
        width = defaultVal;
        height = defaultVal;
    }

    // Ensure dimensions are positive integers, at least 1 pixel.
    width = Math.max(1, width);
    height = Math.max(1, height);

    return { width, height };
}

// Define the primary route for image processing requests.
// The asterisk allows capturing the full URL path after '/img-process/'.
serverInstance.get('/img-process/*', function (clientRequest, serverResponse) {
    // Extract the original resource URL from the path segment.
    const resourceUri = clientRequest.params[0];

    // Early validation for the remote image URI.
    if (!resourceUri || !resourceUri.startsWith('http')) {
        console.warn(`Attempted processing with invalid URI: ${resourceUri}`);
        return serverResponse.status(400).send('Error: Invalid or missing remote image URI. Must start with http(s).');
    }

    // Establish base image processing settings with sensible defaults.
    let processingSettings = {
        s: 'bound',    // Strategy: bounded scaling
        w: 120,        // Width: 120 pixels
        h: 120,        // Height: 120 pixels
        g: 'C',        // Gravity: Center
        b: '#000000',  // Background: Black (hex code)
        q: 80,         // Quality: 80%
        fx: null,      // Filter effect: none
        ep: null       // Effect parameter: none
    };

    // Apply client-provided query parameters, mapping them to internal setting keys.
    const incomingQueryParams = clientRequest.query;
    Object.assign(processingSettings, {
        s: incomingQueryParams.dimStrategy || processingSettings.s,
        g: incomingQueryParams.focalPoint || processingSettings.g,
        b: incomingQueryParams.fillColor || processingSettings.b,
        fx: incomingQueryParams.effectType || processingSettings.fx,
        ep: incomingQueryParams.effectParam || processingSettings.ep
    });

    // Parse and validate quality value, ensuring it's within a valid range.
    const requestedQuality = parseInt(incomingQueryParams.qualityValue, 10);
    if (!isNaN(requestedQuality) && requestedQuality >= 0 && requestedQuality <= 100) {
        processingSettings.q = requestedQuality;
    } else {
        // Log a warning if quality is invalid and reset to default.
        if (incomingQueryParams.qualityValue) {
            console.warn(`Invalid quality value '${incomingQueryParams.qualityValue}' provided for ${resourceUri}. Using default ${processingSettings.q}.`);
        }
    }

    // Normalize and assign dimensions using the dedicated helper function.
    const normalizedDims = getValidatedDimension(
        incomingQueryParams.targetWidth,
        incomingQueryParams.targetHeight,
        processingSettings.w // Use current default width as base for helper.
    );
    processingSettings.w = normalizedDims.width;
    processingSettings.h = normalizedDims.height;


    // Configure the HTTP request for fetching the external image resource.
    const fetchOptions = {
        url: resourceUri,
        timeout: 7000, // Set a reasonable timeout (7 seconds) for external requests.
        headers: {
            'User-Agent': 'ImageProcessingService/1.0 (Node.js)', // Custom User-Agent header.
            'Accept': 'image/*, */*' // Request image content types.
        }
    };

    // Initiate the request to fetch the remote image.
    httpFetcher(fetchOptions)
        .on('response', function (incomingStream) {
            // Validate the incoming stream to ensure it's a successful image response.
            const contentType = incomingStream.headers['content-type'];
            if (!incomingStream || incomingStream.statusCode !== 200 || !contentType || !contentType.startsWith('image/')) {
                 console.error(`Failed to retrieve valid image from ${resourceUri}. Status: ${incomingStream ? incomingStream.statusCode : 'N/A'}, Content-Type: ${contentType || 'N/A'}`);
                 return serverResponse.status(404).send('Error: Could not retrieve or validate remote image resource.');
            }

            // Set appropriate HTTP headers for the client response.
            serverResponse.setHeader('Content-Type', contentType);
            serverResponse.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Aggressive caching for processed images.
            serverResponse.setHeader('X-Processed-By', 'ImageTransformService'); // Custom service identifier.
            serverResponse.setHeader('X-Original-URI', resourceUri); // For debugging/tracing.

            // Pass the incoming image stream and processing settings to the image processor.
            imageProcessor(incomingStream, processingSettings, function (processingError, outputStream) {
                if (processingError) {
                    console.error('Image processing failed for URI:', resourceUri, 'Error:', processingError);
                    return serverResponse.status(500).send('Internal Server Error: Image processing encountered an issue.');
                }
                if (!outputStream) {
                    console.error('Image processing yielded no output stream for URI:', resourceUri);
                    return serverResponse.status(500).send('Internal Server Error: No output stream from image processor.');
                }
                // Pipe the processed image stream directly to the client response.
                outputStream.pipe(serverResponse);
            });
        })
        .on('error', function (fetchError) {
            // Handle network or request-specific errors during image fetching.
            console.error(`HTTP fetch error for ${resourceUri}:`, fetchError.message);
            serverResponse.status(502).send(`Error: Failed to fetch remote image resource. Details: ${fetchError.code || fetchError.message}`);
        });
});

// Start the server and listen for incoming connections on the configured port.
serverInstance.listen(process.env.PORT || DEFAULT_PORT, function () {
    const activePort = process.env.PORT || DEFAULT_PORT;
    console.log(`Image transformation service operational and listening on port ${activePort}.`);
    console.log('Awaiting incoming image processing requests at /img-process/*...');
});