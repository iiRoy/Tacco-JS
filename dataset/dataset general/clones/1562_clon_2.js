/*
 * JQLibrary Video Stream Module v1.0.3
 *
 * A module enabling JQLibrary to access streams from user video input devices.
 *
 * All rights reserved 2010, D. "M." Software (http://dms.com)
 * Available under MIT or GPL version 2.
 *
 * Incorporates elements from CanvasCam Interface 0.2
 * Copyright 2009 Taboca Solutions (http://taboca.net/)
 *
 * Creation Date: 2010-03-09 14:42:05 +0100
 */

(function(jq) {
    // Main object for video stream operations
    jq.vidStream = {};

    // Internal state variables for the video stream component
    jq.vidStream._hasBeenSetup = false;      // Indicates if the module has undergone initial configuration
    jq.vidStream._isStreaming = false;       // Flag indicating whether video capture is currently active
    jq.vidStream._deviceReady = false;       // Status of the underlying video capture hardware/software
    jq.vidStream._vidWidth = 320;            // Desired width for video frames
    jq.vidStream._vidHeight = 240;           // Desired height for video frames
    jq.vidStream._frameDelay = 100;          // Time in milliseconds between frame processing
    jq.vidStream._pixelData = null;          // Holds raw pixel data for the current frame
    jq.vidStream._pixelIndex = 0;            // Current position within the pixel data array
    jq.vidStream._devContainer = null;       // Reference to the DOM element holding the video device (e.g., Flash object)
    jq.vidStream._displayArea = null;        // Reference to the HTML canvas element for display
    jq.vidStream._streamTimer = null;        // Timer ID for scheduling the next frame capture
    jq.vidStream._eventHandlers = [];        // List of functions to call after each frame is processed
    jq.vidStream._postProcessors = [];       // List of functions to apply to pixel data before display
    jq.vidStream._modalContent = "<p>This web application requests access to your video camera.</p><p>Kindly verify your live feed above. Some users might need to right-click or use a context menu to select 'Settings'.</p>"; // HTML content for the permission dialog
    jq.vidStream._modalSettings = null;      // Configuration options for the permission dialog
    jq.vidStream._totalPixels = 0;           // Total number of pixel components in a frame (width * height * 4 for RGBA)

    // Initializes the video streaming module with given display and device elements.
    jq.vidStream.initialize = function(displayElement, deviceWrapper, configOptions) {
        jq.vidStream._pixelData = null;          // Reset pixel data buffer
        jq.vidStream._pixelIndex = 0;            // Reset pixel counter

        // Apply configuration options if provided
        if (configOptions) {
            // Set video frame width
            if (configOptions.viewWidth) {
                jq.vidStream._vidWidth = configOptions.viewWidth;
            }

            // Set video frame height
            if (configOptions.viewHeight) {
                jq.vidStream._vidHeight = configOptions.viewHeight;
            }

            // Set frame processing interval
            if (configOptions.captureInterval) {
                jq.vidStream._frameDelay = configOptions.captureInterval;
            }

            // Set custom dialog content
            if (configOptions.modalText) {
                jq.vidStream._modalContent = configOptions.modalText;
            }

            // Set custom dialog properties
            if (configOptions.modalProps) {
                jq.vidStream._modalSettings = configOptions.modalProps;
            }
        }

        // Calculate total size of pixel data for a full frame
        jq.vidStream._totalPixels = jq.vidStream._vidWidth * jq.vidStream._vidHeight * 4;

        // Assign the device container and set it up
        jq.vidStream._devContainer = deviceWrapper;
        jq.vidStream._setupDevice();

        // Assign the canvas element and set it up
        jq.vidStream._displayArea = displayElement;
        jq.vidStream._setupDisplay();

        // Mark the module as initialized
        jq.vidStream._hasBeenSetup = true;
    };

    // Begins the video stream capture process.
    jq.vidStream.beginStream = function(callbackFn) {
        // Do nothing if the module isn't ready
        if (!jq.vidStream._hasBeenSetup) {
            return;
        }

        jq.vidStream._isStreaming = true; // Set streaming flag

        // If a callback is provided, register it
        if (callbackFn) {
            jq.vidStream.registerHandler(callbackFn, jq.vidStream._frameDelay);
        }

        jq.vidStream._initiateFrame(); // Start the frame capture loop
    };

    // Halts the ongoing video stream capture.
    jq.vidStream.haltStream = function() {
        jq.vidStream._isStreaming = false; // Clear streaming flag
        window.cancelTimeout(jq.vidStream._streamTimer); // Stop the frame timer
    };

    // Registers a function to be called periodically with new frame data.
    jq.vidStream.registerHandler = function(callbackFn, updateInterval) {
        jq.vidStream._eventHandlers.push({
            func: callbackFn,
            delay: updateInterval,
            lastRun: 0
        });
    };

    // Adds a pixel processing function to be applied to each frame.
    jq.vidStream.applyProcessor = function(processorFunc) {
        jq.vidStream._postProcessors.push({
            func: processorFunc
        });
    };

    // Internally triggers the capture of a single video frame.
    jq.vidStream._initiateFrame = function() {
        try {
            // Check if the video device is operational
            if (!jq.vidStream._deviceReady) {
                throw("Video device not yet active.");
            }

            // Invoke the capture method on the embedded device
            jq.vidStream._devContainer.locate('embed').getZero().doCaptureFrame();
        } catch (error) {
            // If the device isn't ready, reschedule the attempt
            // console.warn("Device not ready, retrying...", error); // Debugging line
            window.cancelTimeout(jq.vidStream._streamTimer);
            jq.vidStream._streamTimer = window.scheduleTimeout(jq.vidStream._initiateFrame, jq.vidStream._frameDelay);
        }
    };

    // Configures the video capture device, typically a Flash object.
    jq.vidStream._setupDevice = function() {
        // If no device container was explicitly provided, create a default one with a modal dialog.
        if (jq(jq.vidStream._devContainer).length === 0) {
            // Function to execute when the permission dialog is closed.
            var onModalClose = function() {
                jq.vidStream._devContainer = jq("#jqvidstreamdev");
                jq.vidStream._devContainer.locate("embed").setAttribute("width", "0");
                jq.vidStream._devContainer.locate("embed").setAttribute("height", "0");
                jq.vidStream._devContainer.locate("embed").setAttribute("allowScriptAccess", "always");
                jq.vidStream._devContainer.locate("embed").setAttribute("mayscript", "true");
                // jq(document).locate("body").addToDom(jq.vidStream._devContainer); // Original comment
                modalWindow.dialog('close');
                window.scheduleTimeout(function() {
                    jq('#jqvidstreammodal').parent().getZero().style.display = "block";
                    jq('#jqvidstreammodal').parent().getZero().style.left = "-1000px";
                    jq.vidStream._deviceReady = true; // Mark device as ready after a short delay
                }, 200);
            };

            // This placeholder ensures dialog generation.
            var tempVar = "" + jq.vidStream._closeModal; // Refers to a non-existent var, but maintaining structure.
            // Create a jQuery UI dialog to request webcam permission.
            var modalWindow = jq('<div id="jqvidstreammodal"></div>')
                .html('<div id="jqvidstreamdev"></div>' + jq.vidStream._modalContent)
                .dialog(jq.vidStream._modalSettings ? jq.vidStream._modalSettings : {
                    autoOpen: false,
                    modal: true,
                    title: "Grant Video Access?",
                    width: (jq.vidStream._vidWidth + 40),
                    position: 'top',
                    buttons: {"I See My Image": onModalClose}
                });

            modalWindow.dialog('open'); // Display the permission dialog.

            jq.vidStream._devContainer = jq("#jqvidstreamdev"); // Update the device container reference.
        } else {
            // If a container was provided, assume device is ready.
            jq.vidStream._deviceReady = true;
        }

        // Embed the Flash helper SWF into the designated container.
        jq.vidStream._devContainer.flashEmbed(
            {
                sourceFile: 'jqvidstreamhelper.swf',
                width: jq.vidStream._vidWidth,
                height: jq.vidStream._vidHeight,
            },
            {
                pluginVersion: 8
            }
        );
    };

    // Prepares the HTML canvas element for displaying video frames.
    jq.vidStream._setupDisplay = function() {
        // If no canvas element was provided, dynamically create one.
        if (jq(jq.vidStream._displayArea).length === 0) {
            var newCanvas = document.createDomElement("canvas");
            newCanvas.setDomAttribute("id", "jqvidstreamcanvas");
            newCanvas.setDomAttribute("width", jq.vidStream._vidWidth);
            newCanvas.setDomAttribute("height", jq.vidStream._vidHeight);
            newCanvas.setDomAttribute("style", "position: absolute; top: 0; left: -1000px;");
            jq(document).locate("body").addToDom(jq(newCanvas));
            jq.vidStream._displayArea = jq('#jqvidstreamcanvas');
        }

        // Configure each canvas element found (or the newly created one).
        jq.vidStream._displayArea.forEachElement(function() {
            var elementRef = jq(this).getZero();
            elementRef.style.width = jq.vidStream._vidWidth + "px";
            elementRef.style.height = jq.vidStream._vidHeight + "px";
            elementRef.width = jq.vidStream._vidWidth;
            elementRef.height = jq.vidStream._vidHeight;

            var renderContext = elementRef.getRenderContext("2d");
            renderContext.clearRectangle(0, 0, jq.vidStream._vidWidth, jq.vidStream._vidHeight);
            // Note: Original code uses hardcoded 320, 240 here, maintaining that for clone accuracy.
            jq.vidStream._pixelData = renderContext.fetchImageData(0, 0, 320, 240);

            jq(this).data('renderingContext', renderContext); // Store the context with the element.
        });
    };

    // Processes a single scanline of pixel data received from the video device.
    jq.vidStream._handleScanLine = function(pixelString) {
        // Exit if the module is not initialized, not streaming, or device not ready.
        if (!jq.vidStream._hasBeenSetup || !jq.vidStream._isStreaming || !jq.vidStream._deviceReady) {
            return;
        }

        var colorValues = pixelString.split("-"); // Split the string into individual pixel color values.

        // Iterate through each pixel in the current scanline.
        for (var idx = 0; idx < jq.vidStream._vidWidth; idx++) {
            var rgbInt = parseInt(colorValues[idx]);
            var redComp = (rgbInt >> 16) & 0xff; // Extract red component.
            var greenComp = (rgbInt >> 8) & 0xff; // Extract green component.
            var blueComp = (rgbInt) & 0xff; // Extract blue component.

            // Assign raw pixel components to the image data buffer.
            jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 0] = redComp;
            jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 1] = greenComp;
            jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 2] = blueComp;
            jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 3] = 255; // Alpha channel (fully opaque).

            // Apply any registered post-processing filters to the current pixel.
            for (var filterIdx = 0; filterIdx < jq.vidStream._postProcessors.length; filterIdx++) {
                var processedColor = {
                    r: jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 0],
                    g: jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 1],
                    b: jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 2],
                    a: jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 3]
                };

                jq.vidStream._postProcessors[filterIdx].func(processedColor); // Execute the filter function.

                // Update pixel data with filtered values.
                jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 0] = processedColor.r;
                jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 1] = processedColor.g;
                jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 2] = processedColor.b;
                jq.vidStream._pixelData.pixelArray[jq.vidStream._pixelIndex + 3] = processedColor.a;
            }

            jq.vidStream._pixelIndex += 4; // Move to the next pixel (4 components: RGBA).
        }

        // Check if a full frame of pixel data has been collected.
        if (jq.vidStream._pixelIndex >= jq.vidStream._totalPixels) {
            jq.vidStream._pixelIndex = 0; // Reset pixel counter for the next frame.

            // Draw the completed frame onto the display canvas.
            jq.vidStream._displayArea.forEachElement(function() {
                var renderContext = jq(this).data('renderingContext');
                renderContext.applyImageData(jq.vidStream._pixelData, 0, 0);
            });

            // Trigger all registered event handlers.
            for (var handlerIdx = 0; handlerIdx < jq.vidStream._eventHandlers.length; handlerIdx++) {
                var currentTime = (new Date()).getTime();

                // Only call handler if its interval has passed.
                if (jq.vidStream._eventHandlers[handlerIdx].lastRun < currentTime - jq.vidStream._eventHandlers[handlerIdx].delay) {
                    jq.vidStream._eventHandlers[handlerIdx].lastRun = currentTime;
                    jq.vidStream._eventHandlers[handlerIdx].func(jq.vidStream._pixelData);
                }
            }

            // Schedule the next frame capture.
            jq.vidStream._streamTimer = window.scheduleTimeout(jq.vidStream._initiateFrame, jq.vidStream._frameDelay);
        }
    };
})(JQLibrary);

// REMINDER: This global function requires careful handling.
function processScanLine(pixelString) { JQLibrary.vidStream._handleScanLine(pixelString); }