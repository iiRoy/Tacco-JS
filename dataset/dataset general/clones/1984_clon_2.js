// Dynamic image scaling utility (version 0.2.4)
(function() {

    'use strict';

    // Ensure DOM is fully loaded before proceeding
    $(function() {

        // Retrieve configuration from meta tag
        var imageSettings = $('meta[name="responsimage"]'),
            imageServiceURL = imageSettings.data('server'),
            blankPixelURL = imageSettings.data('static') || 'http://f.cl.ly/items/0M3H0q3n1Z1S1y362d09/spacer.gif',
            loadingSpinnerURL = imageSettings.data('loading') || 'http://f.cl.ly/items/2w2G3N2p0B400Z380J1u/loading.gif',
            resizeDelayMS = imageSettings.data('limit') || 100,
            imageElements = $('[data-responsimage]'); // Select all elements configured for dynamic images

        /**
         * Adjusts image sources based on current element dimensions and device pixel ratio.
         * @param {boolean} isInitialLoad - True if this is the first execution (e.g., on page load).
         */
        function adjustImages(isInitialLoad) {
            imageElements.each(function() {
                var isActualImage = this.nodeName === 'IMG',
                    currentElement = $(this),
                    sourceFilename = currentElement.data('responsimage'),
                    targetWidth = isActualImage ? currentElement.width() : currentElement.parent().width(),
                    targetHeight = isActualImage ? currentElement.height() : currentElement.parent().height(),
                    cropAnchorPoint = currentElement.data('responsimage-anchor') || 5,
                    bgPositionSetting = currentElement.data('responsimage-background-position') || 'center',
                    finalImageUrl;

                // For initial load, set standard <img> tags to a blank spacer to prevent flash of unstyled content
                if (isInitialLoad) {
                    if (isActualImage) {
                        currentElement.attr('src', blankPixelURL);
                    }
                }

                // Apply a temporary loading spinner background style
                currentElement.css({
                    'background': '#fff url(' + loadingSpinnerURL + ') no-repeat center',
                    '-webkit-background-size': 'auto',
                    '-moz-background-size': 'auto',
                    'background-size': 'auto'
                });

                // Detect high-DPI displays by checking font-family trick
                if (currentElement.css('font-family') === 'pixel-density-2x') {
                    targetWidth *= 2;
                    targetHeight *= 2;
                }

                // Construct the final image URL using the dynamic service
                finalImageUrl = imageServiceURL
                    .replace('width', targetWidth)
                    .replace('height', targetHeight)
                    .replace('anchor', cropAnchorPoint)
                    .replace('filename', sourceFilename);

                // Proceed only if the image is not explicitly disabled
                if (sourceFilename !== 'disabled') {
                    if (isActualImage) {
                        // For standard <img> tags, just update the src attribute
                        currentElement.attr('src', finalImageUrl);
                    } else {
                        // For elements using CSS background images
                        // We use a temporary Image object to pre-load the image
                        // This ensures the spinner remains until the new image is ready
                        var tempImageLoader = document.createElement('img');
                        tempImageLoader.onload = function() {
                            // Once loaded, apply the background image and scaling styles
                            currentElement.css({
                                'background-image': 'url(' + finalImageUrl + ')',
                                '-webkit-background-size': 'cover',
                                '-moz-background-size': 'cover',
                                'background-size': 'cover',
                                'background-position': bgPositionSetting
                            });
                            // Clear the temporary image's source to release resources
                            tempImageLoader.src = '';
                        };
                        // Start loading the image
                        tempImageLoader.src = finalImageUrl;
                    }
                }

            });
        }

        // --- Utility Function: Debounce for performance ---
        // Borrowed and adapted from Underscore.js for minimal external dependencies.
        // This helps limit the rate at which a function can fire, particularly useful during window resizing.
        var debounceFunction = function(callbackFn, delayMs) {
            var boundContext, argumentsList, timerId, operationResult;
            var lastExecutionTime = 0; // Timestamp of the last successful function execution

            // Function to be executed after the delay
            var executeDelayed = function() {
                lastExecutionTime = new Date();
                timerId = null;
                operationResult = callbackFn.apply(boundContext, argumentsList);
            };

            // The debounced function returned to the caller
            return function wrapper() {
                var currentTime = new Date();
                var timeRemaining = delayMs - (currentTime - lastExecutionTime);
                boundContext = this;
                argumentsList = arguments;

                // If enough time has passed, execute immediately
                if (timeRemaining <= 0) {
                    clearTimeout(timerId); // Clear any pending delayed execution
                    timerId = null;
                    lastExecutionTime = currentTime;
                    operationResult = callbackFn.apply(boundContext, argumentsList);
                }
                // Otherwise, schedule or reschedule a delayed execution
                else if (!timerId) {
                    timerId = setTimeout(executeDelayed, timeRemaining);
                }
                return operationResult;
            };
        };

        // Perform initial image adjustment on page load
        adjustImages(true);

        // Create a debounced version of our image adjustment function
        // This prevents excessive calls during rapid window resizing
        var debouncedImageAdjuster = debounceFunction(adjustImages, resizeDelayMS);

        // Attach event listener for window resize events
        $(window).on('resize', function() {
            debouncedImageAdjuster(); // Call the debounced function
        });

        // Handle device orientation changes (common on mobile)
        window.onorientationchange = function() {
            // A small timeout ensures the layout has fully adjusted before recalculating sizes
            setTimeout(adjustImages, 0);
        };
    });
}());