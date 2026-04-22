// This file is part of the jQuery Video Stream Utility.
//
// A robust jQuery plugin facilitating interaction with user video input devices (webcams).
// It enables capturing and processing video frames directly within a web application.
//
// Copyright 2023, Global Solutions Inc. (http://globalsolutions.com)
// Licensed under the Apache License, Version 2.0.
//
// This utility incorporates concepts from earlier video capture APIs.
//
// Version: 2.1.0
// Last Updated: Mon Oct 23 10:30:00 UTC 2023

( function( jQuery ) {
    // Define the main namespace for our video streaming utility.
    // Use a more unique internal name to avoid conflicts.
    const _jqs = jQuery.vidStream = {};

    // --- Internal State Variables ---
    _jqs._isModuleReady = false; // Indicates if the module has been initialized.
    _jqs._isCurrentlyStreaming = false; // Flag for active video capture.
    _jqs._flashBridgeActive = false; // Status of the Flash bridge connection.
    _jqs._renderWidth = 320; // Default width for video frames.
    _jqs._renderHeight = 240; // Default height for video frames.
    _jqs._captureIntervalMs = 100; // Time in ms between frame capture attempts.
    _jqs._currentFrameData = null; // Stores the raw pixel data for the current frame (ImageData object).
    _jqs._framePixelIdx = 0; // Current index within _currentFrameData.data for pixel insertion.
    _jqs._flashElementContainer = null; // Reference to the jQuery object holding the Flash embed.
    _jqs._drawingCanvasElement = null; // Reference to the jQuery object for the HTML5 canvas.
    _jqs._captureTimerHandle = null; // Handle for the setTimeout responsible for triggering captures.
    _jqs._frameHandlers = []; // Array of registered callback functions for processed frames.
    _jqs._pixelFilters = []; // Array of functions to apply to individual pixels.
    _jqs._dialogConfiguration = { // Consolidated dialog configuration.
        bodyContent: "<p>This application requests access to your video device.</p><p>Please verify your video feed above. Users might need to right-click for 'Global Settings' if prompted by Flash.</p>",
        dialogProperties: null // jQuery UI dialog properties.
    };
    _jqs._totalPixelBytes = 0; // Total number of bytes for a full frame (width * height * 4).
    _jqs._debugMode = false; // Enable/disable console logging for debugging.

    /**
     * Initializes the video stream module, setting up canvas and Flash components.
     * This method must be called once before starting any video processing.
     * @param {jQuery} targetCanvasElement - The jQuery object for the HTML5 canvas to draw frames on.
     * @param {jQuery} flashEmbedContainer - The jQuery object for the container where the Flash object will be embedded.
     * @param {object} [configOptions] - Optional configuration object.
     * @param {number} [configOptions.width] - Desired width of the video stream.
     * @param {number} [configOptions.height] - Desired height of the video stream.
     * @param {number} [configOptions.interval] - Capture interval in milliseconds.
     * @param {string} [configOptions.dialogBody] - Custom HTML content for the permission prompt.
     * @param {object} [configOptions.dialogProperties] - jQuery UI dialog properties for the prompt.
     * @param {boolean} [configOptions.debug] - Set to true to enable debug console messages.
     * @returns {boolean} True if initialization was successful, false otherwise.
     */
    _jqs.initializeStream = function( targetCanvasElement, flashEmbedContainer, configOptions ) {
        if ( _jqs._isModuleReady ) {
            console.warn( "Video stream module already initialized." );
            return false;
        }

        // Validate input elements.
        if ( !targetCanvasElement || targetCanvasElement.length === 0 || !flashEmbedContainer || flashEmbedContainer.length === 0 ) {
            console.error( "Initialization failed: Both targetCanvasElement and flashEmbedContainer must be valid jQuery objects." );
            return false;
        }

        // Reset frame data and pixel index on initialization.
        _jqs._currentFrameData = null;
        _jqs._framePixelIdx = 0;

        // Apply provided configuration options.
        if ( configOptions ) {
            if ( typeof configOptions.width === 'number' && configOptions.width > 0 ) {
                _jqs._renderWidth = configOptions.width;
            }
            if ( typeof configOptions.height === 'number' && configOptions.height > 0 ) {
                _jqs._renderHeight = configOptions.height;
            }
            if ( typeof configOptions.interval === 'number' && configOptions.interval > 0 ) {
                _jqs._captureIntervalMs = configOptions.interval;
            }
            if ( typeof configOptions.dialogBody === 'string' ) {
                _jqs._dialogConfiguration.bodyContent = configOptions.dialogBody;
            }
            if ( typeof configOptions.dialogProperties === 'object' ) {
                _jqs._dialogConfiguration.dialogProperties = configOptions.dialogProperties;
            }
            if ( typeof configOptions.debug === 'boolean' ) {
                _jqs._debugMode = configOptions.debug;
            }
        }

        // Calculate the total byte size for a single frame (RGBA).
        _jqs._totalPixelBytes = _jqs._renderWidth * _jqs._renderHeight * 4;

        // Store references to the DOM elements.
        _jqs._flashElementContainer = flashEmbedContainer;
        _jqs._setupFlashConnection(); // Initialize the Flash component.

        _jqs._drawingCanvasElement = targetCanvasElement;
        _jqs._prepareCanvasContext(); // Prepare the HTML5 canvas for drawing.

        _jqs._isModuleReady = true; // Mark the module as ready for use.
        _jqs._log( "Video stream module initialized successfully." );
        return true;
    };

    /**
     * Initiates video stream processing, optionally registering an immediate frame handler.
     * @param {function} [frameProcessorFunc] - An optional function to be called for each captured frame.
     * @returns {boolean} True if streaming began, false if already streaming or not initialized.
     */
    _jqs.beginVideoProcessing = function( frameProcessorFunc ) {
        if ( !_jqs._isModuleReady ) {
            console.warn( "Cannot begin streaming: module not initialized. Call .initializeStream() first." );
            return false;
        }
        if ( _jqs._isCurrentlyStreaming ) {
            _jqs._log( "Video streaming is already active." );
            return false;
        }

        _jqs._isCurrentlyStreaming = true; // Set streaming flag to true.

        // If a processor function is provided, register it with the default interval.
        if ( typeof frameProcessorFunc === 'function' ) {
            _jqs.registerFrameProcessor( frameProcessorFunc, _jqs._captureIntervalMs );
        }

        _jqs._requestNextFrame(); // Start the frame capture loop.
        _jqs._log( "Video processing initiated." );
        return true;
    };

    /**
     * Halts the ongoing video stream processing.
     * @returns {boolean} True if streaming was stopped, false if not streaming.
     */
    _jqs.pauseVideoProcessing = function() {
        if ( !_jqs._isCurrentlyStreaming ) {
            _jqs._log( "Video processing is not currently active." );
            return false;
        }
        _jqs._isCurrentlyStreaming = false; // Stop the streaming flag.
        clearTimeout( _jqs._captureTimerHandle ); // Clear any pending capture timeouts.
        _jqs._captureTimerHandle = null; // Ensure the handle is cleared.
        _jqs._log( "Video processing paused." );
        return true;
    };

    /**
     * Registers a function to be called with each processed video frame.
     * @param {function} handlerFunction - The function to execute. It receives ImageData as an argument.
     * @param {number} triggerInterval - The minimum interval (in ms) between consecutive calls to this handler.
     * @returns {boolean} True if handler was registered, false otherwise.
     */
    _jqs.registerFrameProcessor = function( handlerFunction, triggerInterval ) {
        if ( typeof handlerFunction !== 'function' ) {
            console.error( "Attempted to register a non-function as a frame processor." );
            return false;
        }
        if ( typeof triggerInterval !== 'number' || triggerInterval <= 0 ) {
            triggerInterval = _jqs._captureIntervalMs; // Default to module interval.
            _jqs._log( `Invalid trigger interval provided for handler. Defaulting to ${triggerInterval}ms.` );
        }

        // Add the new handler to our list.
        _jqs._frameHandlers.push( { func: handlerFunction, interval: triggerInterval, lastExecutionTime: 0 } );
        _jqs._log( `Frame processor registered with interval: ${triggerInterval}ms.` );
        return true;
    };

    /**
     * Appends a pixel manipulation filter to be applied to each pixel of incoming frames.
     * @param {function} filterFunction - A function that takes an RGBA object ({r,g,b,a}) and modifies it in place.
     * @returns {boolean} True if filter was added, false otherwise.
     */
    _jqs.appendPixelFilter = function( filterFunction ) {
        if ( typeof filterFunction !== 'function' ) {
            console.error( "Attempted to append a non-function as a pixel filter." );
            return false;
        }
        // Add the new filter to our list of pixel filters.
        _jqs._pixelFilters.push( { func: filterFunction } );
        _jqs._log( "Pixel filter appended." );
        return true;
    };

    /**
     * Sets a new interval for video frame capture.
     * @param {number} newIntervalMs - The new interval in milliseconds. Must be a positive number.
     * @returns {boolean} True if interval was updated, false otherwise.
     */
    _jqs.setCaptureInterval = function( newIntervalMs ) {
        if ( typeof newIntervalMs !== 'number' || newIntervalMs <= 0 ) {
            console.error( "Invalid capture interval provided. Must be a positive number." );
            return false;
        }
        _jqs._captureIntervalMs = newIntervalMs;
        _jqs._log( `Capture interval updated to ${newIntervalMs}ms.` );
        // If streaming, restart the timer with the new interval.
        if (_jqs._isCurrentlyStreaming) {
            _jqs.pauseVideoProcessing();
            _jqs.beginVideoProcessing();
        }
        return true;
    };

    /**
     * Disposes of the video stream module, clearing timers and references.
     * This should be called when the module is no longer needed to prevent memory leaks.
     */
    _jqs.disposeStream = function() {
        _jqs.pauseVideoProcessing(); // Ensure streaming is stopped.
        _jqs._isModuleReady = false;
        _jqs._flashBridgeActive = false;
        _jqs._currentFrameData = null;
        _jqs._frameHandlers = [];
        _jqs._pixelFilters = [];
        
        // Attempt to remove dynamically created elements.
        if (_jqs._drawingCanvasElement && _jqs._drawingCanvasElement.attr('id') === 'vidStreamDynamicCanvas') {
            _jqs._drawingCanvasElement.remove();
            _jqs._drawingCanvasElement = null;
        }
        if (_jqs._flashElementContainer && _jqs._flashElementContainer.attr('id') === 'vidStreamFlashBridge') {
            _jqs._flashElementContainer.remove();
            _jqs._flashElementContainer = null;
            // Also remove the dialog parent if it was created.
            jQuery('#vidStreamPermissionDialog').parent().remove();
        }

        _jqs._log( "Video stream module disposed." );
    };

    /**
     * Internal function to trigger the next frame capture from the Flash bridge.
     * Uses a setTimeout loop to handle potential Flash readiness issues.
     */
    _jqs._requestNextFrame = function() {
        if (!_jqs._isCurrentlyStreaming) {
            _jqs._log("Frame request aborted: streaming is paused.");
            return; // Don't try to capture if paused externally.
        }

        try {
            // Check if the Flash bridge is fully ready to capture.
            if ( !_jqs._flashBridgeActive ) {
                throw new Error( "Flash bridge not yet active for capture." );
            }

            // Attempt to call the capture method on the Flash object.
            const flashEmbed = _jqs._flashElementContainer.find( 'embed' ).get( 0 );
            if ( flashEmbed && typeof flashEmbed.ccCapture === 'function' ) {
                flashEmbed.ccCapture();
            } else {
                throw new Error( "Flash capture method 'ccCapture' not found or Flash object not fully loaded." );
            }
        } catch ( captureError ) {
            // If Flash isn't ready or an error occurs, reschedule the capture attempt.
            _jqs._log( `Retrying frame request due to: ${captureError.message}`, "debug" );
            clearTimeout( _jqs._captureTimerHandle );
            _jqs._captureTimerHandle = setTimeout( _jqs._requestNextFrame, _jqs._captureIntervalMs );
        }
    };

    /**
     * Sets up the Flash object for video capture. Handles creating a dialog if no container is provided.
     */
    _jqs._setupFlashConnection = function() {
        const defaultFlashSrc = 'video_capture_bridge.swf'; // Consistent Flash file name.

        // If the provided container element is empty, we need to create a temporary dialog for Flash.
        if ( _jqs._flashElementContainer.length === 0 || !_jqs._flashElementContainer.is('div') ) { // Check if it's a div.
            if (typeof jQuery.ui === 'undefined' || typeof jQuery.ui.dialog === 'undefined') {
                console.error("jQuery UI Dialog is required for automatic Flash container creation but not found.");
                _jqs._flashBridgeActive = false; // Cannot proceed without dialog.
                return;
            }

            _jqs._log( "Flash container not provided, creating temporary dialog for permissions." );

            // Define a callback for when the user accepts the webcam access in the dialog.
            const dialogCloseHandler = function() {
                // Re-assign flash container to the one created inside the dialog.
                _jqs._flashElementContainer = jQuery( "#vidStreamFlashBridge" );
                
                // Hide the Flash object after user interaction to keep it functional but invisible.
                const flashEmbedElement = _jqs._flashElementContainer.find( "embed" );
                flashEmbedElement
                    .attr( "width", "0" )
                    .attr( "height", "0" )
                    .attr( "allowScriptAccess", "always" )
                    .attr( "mayscript", "true" ); // Allow script access to Flash.

                // Close the jQuery UI dialog.
                const dialogInstance = jQuery( this ).closest( '.ui-dialog' ).find( '#vidStreamPermissionDialog' );
                if (dialogInstance.length) {
                    dialogInstance.dialog( 'close' );
                }
                
                // Delay setting flashBridgeActive to allow Flash to fully minimize/hide.
                setTimeout( () => {
                    // Move the dialog's parent element completely off-screen to ensure it's hidden.
                    jQuery( '#vidStreamPermissionDialog' ).parent().css( {
                        position: "absolute",
                        left: "-9999px",
                        top: "-9999px",
                        display: "block" // Keep display block so Flash remains active.
                    } );
                    _jqs._flashBridgeActive = true; // Mark Flash as ready.
                    _jqs._log( "Flash bridge activated after user permission." );
                }, 300 ); // Slightly increased delay for robustness.
            };

            // Construct the HTML for the dialog and Flash container.
            const dialogContentHtml = `<div id="vidStreamFlashBridge" style="margin-bottom: 10px;"></div>${_jqs._dialogConfiguration.bodyContent}`;
            const defaultDialogOptions = {
                autoOpen: false,
                modal: true,
                title: "Grant Video Access?",
                width: ( _jqs._renderWidth + 60 ), // Slightly wider for padding.
                height: "auto", // Allow height to adjust.
                position: { my: "center", at: "center", of: window }, // Center the dialog.
                buttons: { "I'm Visible!": dialogCloseHandler }
            };

            // Create the jQuery UI dialog instance.
            const dialogInstance = jQuery( '<div id="vidStreamPermissionDialog"></div>' )
                .html( dialogContentHtml )
                .dialog( _jqs._dialogConfiguration.dialogProperties || defaultDialogOptions );

            dialogInstance.dialog( 'open' ); // Display the dialog to the user.

            // Update the flash container reference to the newly created element within the dialog.
            _jqs._flashElementContainer = jQuery( "#vidStreamFlashBridge" );
        } else {
            // If a container was provided, assume Flash is ready or will be.
            _jqs._flashBridgeActive = true;
            _jqs._log( "Flash container provided, assuming direct Flash integration." );
        }

        // Embed the Flash SWF file into the designated container.
        _jqs._flashElementContainer.flash(
            {
                src: defaultFlashSrc,
                width: _jqs._renderWidth,
                height: _jqs._renderHeight,
                allowScriptAccess: "always", // Ensure Flash can call JS.
                wmode: "transparent" // Often useful for z-index issues.
            },
            {
                version: 10, // Updated Flash version requirement.
                expressInstall: true, // Offer express install if Flash is missing.
                bgcolor: "#FFFFFF" // Set a background color for Flash.
            }
        );
    };

    /**
     * Prepares the HTML5 canvas element for drawing video frames.
     * If no canvas is provided (or invalid), a hidden one is created.
     */
    _jqs._prepareCanvasContext = function() {
        // If the provided canvas element is invalid or empty, create a new one dynamically.
        if ( _jqs._drawingCanvasElement.length === 0 || !_jqs._drawingCanvasElement.is('canvas') ) {
            _jqs._log( "Canvas element not provided or invalid, creating a dynamic canvas." );
            const dynamicCanvas = document.createElement( "canvas" );
            dynamicCanvas.setAttribute( "id", "vidStreamDynamicCanvas" );
            jQuery( document.body ).append( jQuery( dynamicCanvas ) ); // Append to body.
            _jqs._drawingCanvasElement = jQuery( '#vidStreamDynamicCanvas' );
            // Position off-screen if dynamically created and not explicitly placed.
            _jqs._drawingCanvasElement.css({
                position: "absolute",
                top: "-9999px",
                left: "-9999px"
            });
        }

        // Iterate over all matched canvas elements (should typically be one).
        _jqs._drawingCanvasElement.each( function() {
            const currentCanvasDom = this; // Get the raw DOM element.
            currentCanvasDom.style.width = `${_jqs._renderWidth}px`;
            currentCanvasDom.style.height = `${_jqs._renderHeight}px`;
            currentCanvasDom.width = _jqs._renderWidth;
            currentCanvasDom.height = _jqs._renderHeight;

            // Get the 2D rendering context.
            const canvasContext = currentCanvasDom.getContext( "2d" );
            if (!canvasContext) {
                console.error("Failed to get 2D rendering context for canvas.");
                return; // Skip if context is unavailable.
            }
            canvasContext.clearRect( 0, 0, _jqs._renderWidth, _jqs._renderHeight ); // Clear any previous content.
            
            // Initialize ImageData object for the frame using configured dimensions.
            _jqs._currentFrameData = canvasContext.createImageData( _jqs._renderWidth, _jqs._renderHeight );

            // Store the context with the jQuery data API for easy retrieval.
            jQuery( this ).data( 'canvas2dContext', canvasContext );
            _jqs._log( "Canvas context prepared." );
        } );
    };
    
    /**
     * Receives a segment of pixel data (a single line) from the Flash bridge.
     * This function is called repeatedly by the Flash object.
     * @param {string} pixelDataString - A string containing RGB integer values separated by hyphens.
     */
    _jqs._receiveLineSegment = function( pixelDataString ) {
        // Guard clauses for uninitialized or paused state.
        if ( !_jqs._isModuleReady || !_jqs._isCurrentlyStreaming || !_jqs._flashBridgeActive || !_jqs._currentFrameData ) {
            _jqs._log("Skipping line segment: module not ready, streaming paused, Flash inactive, or no frame data.", "debug");
            return;
        }

		const pixelValues = pixelDataString.split( "-" );
        // Basic validation for data integrity.
        if ( pixelValues.length !== _jqs._renderWidth ) {
            console.warn( `Received malformed pixel data line. Expected ${_jqs._renderWidth} pixels, got ${pixelValues.length}. Skipping line.` );
            // Potentially reset _framePixelIdx if data is severely corrupted.
            if (_jqs._framePixelIdx > 0 && _jqs._framePixelIdx < _jqs._totalPixelBytes) {
                 _jqs._framePixelIdx = 0; // Reset to avoid drawing a partial, corrupted frame.
            }
            return;
        }
	
		for ( let pixelIndex = 0; pixelIndex < _jqs._renderWidth; pixelIndex++ ) {
			const rawPixelInt = parseInt( pixelValues[ pixelIndex ], 10 ); // Ensure base 10 parsing.
            
            // Extract R, G, B components from the single integer value.
            let red = ( rawPixelInt >> 16 ) & 0xff;
            let green = ( rawPixelInt >> 8 ) & 0xff;
            let blue = ( rawPixelInt ) & 0xff;
            let alpha = 255; // Default to fully opaque for webcam data.

            // Prepare pixel object for filters.
            const pixelRGBA = { r: red, g: green, b: blue, a: alpha };

            // Apply any registered pixel filters.
            if ( _jqs._pixelFilters.length > 0 ) {
                for ( let filterIdx = 0; filterIdx < _jqs._pixelFilters.length; filterIdx++ ) {
                    _jqs._pixelFilters[ filterIdx ].func( pixelRGBA );
                }
            }

            // Update the frame data with (potentially filtered) values.
			_jqs._currentFrameData.data[ _jqs._framePixelIdx++ ] = pixelRGBA.r;
			_jqs._currentFrameData.data[ _jqs._framePixelIdx++ ] = pixelRGBA.g;
			_jqs._currentFrameData.data[ _jqs._framePixelIdx++ ] = pixelRGBA.b;
			_jqs._currentFrameData.data[ _jqs._framePixelIdx++ ] = pixelRGBA.a;
		} 

        // Check if a full frame has been received.
        if ( _jqs._framePixelIdx >= _jqs._totalPixelBytes ) {
            _jqs._framePixelIdx = 0; // Reset index for the next frame.

            // Draw the completed frame onto the canvas.
            _jqs._drawingCanvasElement.each( function() {
                const canvasContext = jQuery( this ).data( 'canvas2dContext' );
                if ( canvasContext && _jqs._currentFrameData ) {
                    canvasContext.putImageData( _jqs._currentFrameData, 0, 0 );
                } else {
                    console.warn("Could not draw frame: Canvas context or frame data missing.");
                }
            } );

            // Trigger registered frame handlers.
            const currentTime = Date.now(); 
            for ( let handlerIdx = 0; handlerIdx < _jqs._frameHandlers.length; handlerIdx++ ) {
                const currentHandler = _jqs._frameHandlers[ handlerIdx ];
                if ( currentHandler.lastExecutionTime < currentTime - currentHandler.interval ) {
                    currentHandler.lastExecutionTime = currentTime;
                    try {
                        currentHandler.func( _jqs._currentFrameData );
                    } catch (handlerError) {
                        console.error("Error in frame handler:", handlerError);
                    }
                }
            }

            // Schedule the next frame capture request only if streaming is active.
            if (_jqs._isCurrentlyStreaming) {
                clearTimeout( _jqs._captureTimerHandle ); // Clear any previous timer.
                _jqs._captureTimerHandle = setTimeout( _jqs._requestNextFrame, _jqs._captureIntervalMs );
            } else {
                 _jqs._log("Streaming paused, not scheduling next frame request.", "debug");
            }
        }
    };

    /**
     * Internal logging utility.
     * @param {string} message - The message to log.
     * @param {"log"|"debug"|"warn"|"error"} [level="log"] - The console method to use.
     */
    _jqs._log = function( message, level = "log" ) {
        if ( _jqs._debugMode || level === "error" || level === "warn" ) {
            const timestamp = new Date().toISOString().slice(11, -1); // HH:MM:SS.ms
            const prefix = `[vidStream ${timestamp}]`;
            if ( console && typeof console[level] === 'function' ) {
                console[level]( `${prefix} ${message}` );
            }
        }
    };

} )( jQuery );

// Expose the Flash callback function globally, as required by the SWF.
// This function acts as a bridge from Flash to our jQuery plugin.
function flashReceiveLine( dataString ) {
    // Ensure the function exists on our plugin object before calling.
    // Use a more robust check for the jQuery object and the function itself.
    if ( typeof jQuery !== 'undefined' && jQuery.vidStream && typeof jQuery.vidStream._receiveLineSegment === 'function' ) {
        jQuery.vidStream._receiveLineSegment( dataString );
    } else {
        // Log an error if the callback cannot be processed, indicating a setup issue.
        console.error( "CRITICAL: jQuery.vidStream._receiveLineSegment not available when Flash called flashReceiveLine. Is the plugin initialized?" );
    }
}