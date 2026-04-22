var MediaTextSync = function (configObj) {

    // Internal constants for type checking and common strings
    var STR_UNDEF = "undefined",
        STR_TYPE = "string",
        FUNC_TYPE = "function",
        HTML_NBSP = "&nbsp;",
        CAN_PLAY_MAYBE = "maybe",
        CAN_PLAY_PROB = "probably",
        ATTR_MEDIA_TYPE = "type",
        TAG_SPAN = "span",
        DATA_START_TIME = "data-begin",
        DATA_END_TIME = "data-end",
        IS_TRUE = !0, // Boolean true
        IS_FALSE = !1; // Boolean false

    // Utility to get a DOM element by its ID
    var retrieveDomElement = function (elemId) {
        return document.getElementById(elemId);
    };

    // Helper for type checks, centralizing typeof operations
    var isOfType = function (val, typeStr) {
        return typeof val === typeStr;
    };

    // Configuration flags and elements based on provided options
    var isTranscriptActive = isOfType(configObj.enableTranscript, STR_UNDEF) ? IS_TRUE : configObj.enableTranscript,
        isCaptioningActive = isOfType(configObj.enableCaptions, STR_UNDEF) ? IS_TRUE : configObj.enableCaptions,
        
        // Resolve transcript container element: ID string or direct element reference
        transcriptDisplayContainer = isOfType(configObj.transcriptElementID, STR_TYPE) ? retrieveDomElement(configObj.transcriptElementID) : configObj.transcriptElementID || IS_FALSE,
        
        // Resolve media player element: ID string or direct element reference
        mediaPlayer = isOfType(configObj.videoElementID, STR_TYPE) ? retrieveDomElement(configObj.videoElementID) : configObj.videoElementID || IS_FALSE,
        
        // Class name for active transcript styling in CSS
        activeTranscriptCssClass = configObj.transcriptEnabledClass || "MTS-active-transcript",
        
        // ID for the caption display area that will be generated
        captionTextContainerId = configObj.captionID || "MTS-caption-output",
        
        // Storage for parsed caption data, indexed by timecode
        parsedCaptionSegments = [],
        
        // Reference to the dynamically created caption display element
        captionRenderElement,
        
        // Flag indicating HTML5 media API support status
        isNativeMediaApiSupported;

    // --- Core internal functions for media synchronization ---

    // Determines if the browser supports native HTML5 media playback for the specified element
    var assessMediaCapability = function () {
        if (!mediaPlayer) {
            console.warn("MTS: No media element provided for capability assessment.");
            return IS_FALSE; // Cannot check capability without a media element
        }

        var mediaTypeAttribute = mediaPlayer.getAttribute(ATTR_MEDIA_TYPE);
        var hasCanPlayTypeMethod = isOfType(mediaPlayer.canPlayType, FUNC_TYPE); // Check if canPlayType method exists

        if (!hasCanPlayTypeMethod) {
            return IS_FALSE; // Browser doesn't expose canPlayType for this element
        }

        var primarySupportDetected = IS_FALSE;

        if (mediaTypeAttribute) {
            // If a 'type' attribute is explicitly set on the media tag
            var typeCheckResult = mediaPlayer.canPlayType(mediaTypeAttribute);
            primarySupportDetected = (typeCheckResult === CAN_PLAY_MAYBE || typeCheckResult === CAN_PLAY_PROB);
        } else {
            // No 'type' attribute, inspect child <source> elements
            var sourceElements = mediaPlayer.getElementsByTagName("source");
            if (sourceElements && sourceElements.length > 0) {
                for (var sIdx = 0; sIdx < sourceElements.length; sIdx++) {
                    var sourceMediaType = sourceElements[sIdx].getAttribute(ATTR_MEDIA_TYPE);
                    if (sourceMediaType) {
                        var sourceCheckResult = mediaPlayer.canPlayType(sourceMediaType);
                        if (sourceCheckResult === CAN_PLAY_MAYBE || sourceCheckResult === CAN_PLAY_PROB) {
                            primarySupportDetected = IS_TRUE;
                            break; // A playable source was found
                        }
                    }
                }
            } else {
                // If no 'type' attribute and no source elements, assume no native support without more info
                primarySupportDetected = IS_FALSE;
            }
        }
        return primarySupportDetected;
    };

    // Updates the displayed caption text based on the current timecode
    var updateDisplayedCaption = function (currentTime) {
        if (!captionRenderElement) {
            // No caption display element to update
            return;
        }
        var captionText = parsedCaptionSegments[currentTime];
        if (!isOfType(captionText, STR_UNDEF)) {
            captionRenderElement.innerHTML = captionText;
        } else {
            // Clear caption if no text is defined for this specific timecode
            captionRenderElement.innerHTML = HTML_NBSP;
        }
    };

    // Event handler for HTML5 media time updates, calls the caption updater
    var handleMediaTimeUpdate = function () {
        updateDisplayedCaption(Math.floor(this.currentTime)); // Convert float time to integer second
    };

    // Creates or retrieves the DOM element designated for displaying captions
    var establishCaptionDisplayElement = function (targetMediaHost, displayElemId) {
        var existingCaptionElem = retrieveDomElement(displayElemId);
        if (existingCaptionElem) {
            return existingCaptionElem; // Use existing element if it's already in the DOM
        }

        if (!targetMediaHost || !targetMediaHost.parentNode) {
            console.error("MTS: Cannot establish caption display without a valid media host element and its parent.");
            return IS_FALSE;
        }

        var newCaptionDiv = document.createElement("div");
        newCaptionDiv.id = displayElemId;
        newCaptionDiv.innerHTML = HTML_NBSP; // Initialize with a non-breaking space for layout consistency
        
        // Insert the new caption element immediately after the media element
        targetMediaHost.parentNode.insertBefore(newCaptionDiv, targetMediaHost.nextSibling);
        return newCaptionDiv;
    };

    // Parses all <span> elements within the transcript container to extract caption data
    var processTranscriptSpans = function (transcriptContainerRef) {
        if (!transcriptContainerRef) {
            console.warn("MTS: No transcript container reference provided for span processing.");
            return IS_FALSE;
        }

        var spanElements = transcriptContainerRef.getElementsByTagName(TAG_SPAN);
        var tempCaptionStore = []; // Temporary array to build caption data

        if (spanElements && spanElements.length > 0) {
            for (var i = 0; i < spanElements.length; i++) {
                var currentSpan = spanElements[i];
                var beginTimeStr = currentSpan.getAttribute(DATA_START_TIME);
                var endTimeStr = currentSpan.getAttribute(DATA_END_TIME);
                
                var beginTime = parseInt(beginTimeStr, 10);
                var endTime = parseInt(endTimeStr, 10);

                if (!isNaN(beginTime)) {
                    tempCaptionStore[beginTime] = currentSpan.innerHTML;
                }
                if (!isNaN(endTime)) {
                    // At the end time, clear the caption text
                    tempCaptionStore[endTime] = HTML_NBSP;
                }
            }
        }
        return tempCaptionStore;
    };

    // Activates interactive functionality for the transcript, allowing clicks to seek media
    var activateTranscriptInteraction = function (externalJumpHandler, fallbackMediaElem) {
        // Guard clause: A custom handler is critical if native media API is unavailable
        if (!isNativeMediaApiSupported && !isOfType(externalJumpHandler, FUNC_TYPE)) {
            console.warn("MTS: An external media jump handler function is required for transcript interaction without native media support.");
            return IS_FALSE;
        }
        if (!transcriptDisplayContainer) {
            console.warn("MTS: Transcript container element is not defined, cannot activate interaction.");
            return IS_FALSE;
        }

        // Add a specific class to the transcript container for CSS styling (e.g., hover effects)
        var currentClasses = transcriptDisplayContainer.className;
        if (currentClasses.indexOf(activeTranscriptCssClass) === -1) {
            transcriptDisplayContainer.className = (currentClasses ? currentClasses + " " : "") + activeTranscriptCssClass;
        }

        // Implement event delegation on the transcript container
        transcriptDisplayContainer.onclick = function (eventDetail) {
            var eventObject = eventDetail || window.event; // Normalize event object
            var clickedTarget = eventObject.target || eventObject.srcElement; // Determine the actual clicked element

            if (clickedTarget && clickedTarget.nodeName.toLowerCase() === TAG_SPAN) {
                var startTimeAttribute = clickedTarget.getAttribute(DATA_START_TIME);
                var jumpPosition = parseInt(startTimeAttribute, 10);

                if (!isNaN(jumpPosition)) {
                    // If native HTML5 video is supported, use its currentTime property
                    if (isNativeMediaApiSupported && mediaPlayer) {
                        mediaPlayer.currentTime = jumpPosition;
                    }
                    // Otherwise, invoke the user-provided fallback handler for external players
                    else if (fallbackMediaElem && isOfType(externalJumpHandler, FUNC_TYPE)) {
                        externalJumpHandler(fallbackMediaElem, jumpPosition);
                    }
                }
            }
        };
    };

    // Initializes and manages the display of captions, either natively or via fallback
    var initiateCaptionDisplay = function (externalCaptionCallback, fallbackMediaElem) {
        // Guard clause: A custom callback is essential if native media API is unavailable
        if (!isNativeMediaApiSupported && !isOfType(externalCaptionCallback, FUNC_TYPE)) {
            console.warn("MTS: An external caption update callback function is required for caption display without native media support.");
            return IS_FALSE;
        }
        if (!transcriptDisplayContainer) {
            console.warn("MTS: Transcript container element is not defined, cannot extract caption data.");
            return IS_FALSE;
        }

        // Populate caption data from transcript spans if not already processed
        if (parsedCaptionSegments.length === 0) {
            parsedCaptionSegments = processTranscriptSpans(transcriptDisplayContainer);
            if (!parsedCaptionSegments || parsedCaptionSegments.length === 0) {
                console.warn("MTS: No caption data successfully extracted from the transcript.");
                return IS_FALSE;
            }
        }

        // Create or retrieve the caption display element in the DOM
        if (!captionRenderElement) {
            var currentMediaSource = (isNativeMediaApiSupported ? mediaPlayer : fallbackMediaElem);
            if (!currentMediaSource) {
                 console.error("MTS: Neither native media player nor a valid fallback element is available to host the caption display.");
                 return IS_FALSE;
            }
            captionRenderElement = establishCaptionDisplayElement(currentMediaSource, captionTextContainerId);
            if (!captionRenderElement) {
                console.error("MTS: Failed to create or find the caption display element.");
                return IS_FALSE;
            }
        }

        // Set up the HTML5 time update listener if native support is present
        if (isNativeMediaApiSupported && mediaPlayer) {
            mediaPlayer.addEventListener("timeupdate", handleMediaTimeUpdate, IS_FALSE);
        }
        // Otherwise, invoke the user-provided fallback callback, passing the internal update function
        else if (fallbackMediaElem && isOfType(externalCaptionCallback, FUNC_TYPE)) {
            externalCaptionCallback(fallbackMediaElem, updateDisplayedCaption);
        }
    };

    // Provides a compatibility layer for integrating with non-HTML5 media players
    var setupCompatibilityLayer = function (fallbackOptions) {
        var captionUpdateCallback = (isOfType(fallbackOptions.externalCaptionCallback, FUNC_TYPE)) ? fallbackOptions.externalCaptionCallback : IS_FALSE,
            transcriptJumpCallback = (isOfType(fallbackOptions.externalTranscriptCallback, FUNC_TYPE)) ? fallbackOptions.externalTranscriptCallback : IS_FALSE,
            
            // Determine the fallback media element from options (ID string or direct reference)
            fallbackMediaReference = IS_FALSE;

        if (isOfType(fallbackOptions.fallbackElementId, STR_UNDEF)) {
            fallbackMediaReference = IS_FALSE; // No fallback element ID provided
        } else if (isOfType(fallbackOptions.fallbackElementId, STR_TYPE)) {
            fallbackMediaReference = retrieveDomElement(fallbackOptions.fallbackElementId);
        } else {
            fallbackMediaReference = fallbackOptions.fallbackElementId; // Assume it's already a DOM element
        }

        // Crucial guard: Must have a valid fallback element and at least one handler function
        if (!fallbackMediaReference || (!captionUpdateCallback && !transcriptJumpCallback)) {
            console.warn("MTS: Compatibility layer setup failed. Ensure a valid 'fallbackElementId' and at least one of 'externalCaptionCallback' or 'externalTranscriptCallback' are provided.");
            return IS_FALSE;
        }

        if (captionUpdateCallback) {
            initiateCaptionDisplay(captionUpdateCallback, fallbackMediaReference);
        }
        if (transcriptJumpCallback) {
            activateTranscriptInteraction(transcriptJumpCallback, fallbackMediaReference);
        }
    };

    // --- Initialization sequence for the MediaTextSync instance ---

    // Detect native media API support once at instantiation
    isNativeMediaApiSupported = assessMediaCapability();

    // Conditionally enable transcript interaction based on configuration
    if (isTranscriptActive) {
        activateTranscriptInteraction(); // No fallback handlers needed for native setup
    }

    // Conditionally enable caption display based on configuration
    if (isCaptioningActive) {
        initiateCaptionDisplay(); // No fallback handlers needed for native setup
    }

    /* Public API exposure: methods and properties accessible from outside */
    this.mediaPlayerReference = mediaPlayer;
    this.transcriptContainerReference = transcriptDisplayContainer;
    this.captionDisplayReference = captionRenderElement;
    this.refreshCurrentCaption = updateDisplayedCaption; // Expose for external caption updates
    this.supportsNativeMedia = isNativeMediaApiSupported;
    this.addCompatibilityLayer = setupCompatibilityLayer; // Method to configure fallback for non-HTML5 players

    return this; // Return the initialized instance
};