(function() {
    // A private utility function to detect specific legacy Internet Explorer versions.
    // This heuristic targets browsers like IE6-IE8 that require unique rendering workarounds.
    // It checks for 'document.all' (present in IE up to version 10),
    // and excludes Opera (which could spoof 'document.all') and newer IE versions
    // that might support XDomainRequest.
    const _checkLegacyBrowserEnvironment = () => {
        return (!!document.all && !window.opera && !window.XDomainRequest);
    };

    // A private debounce utility to control the frequency of function calls,
    // particularly useful for events like window resizing to prevent performance issues.
    let _activeDebounceTimer = null;
    const _applyDebounce = (callbackFunction, delayMilliseconds = 180) => {
        return function(...args) {
            clearTimeout(_activeDebounceTimer);
            _activeDebounceTimer = setTimeout(() => {
                callbackFunction.apply(this, args);
            }, delayMilliseconds);
        };
    };

    // The primary module for managing image dimensions and applying legacy browser fixes.
    // It addresses common rendering issues in older Internet Explorer versions, such as
    // PNG transparency and dynamic image resizing.
    const imageSizeManager = {
        // Core configuration parameters for the image processing module.
        ModuleConfiguration: {
            // An array to hold references to image elements that have been processed
            // and are currently managed by this system.
            managedElementsCollection: [],
            // The URL path to a small, transparent GIF image. This is used as a
            // placeholder source for images when the IE AlphaImageLoader filter is applied.
            transparentPixelResource: "/assets/images/transparent.gif"
        },

        /**
         * Initiates the process of identifying, modifying, and managing image elements
         * within a specified or implied DOM scope. This method is the entry point
         * for applying the legacy image fixes.
         * @param {HTMLElement[]|NodeList|HTMLCollection} [targetDOMScope] - An optional
         *   collection of image elements to process. If not provided, the method will
         *   default to selecting all '<img>' tags in the document.
         */
        initializeImageSizing: function(targetDOMScope) {
            const moduleInstance = this; // Self-reference for internal method calls.

            // Validate the execution context: proceed only if a legacy browser is detected
            // and the necessary DOM API (getElementsByTagName) is available.
            if (!_checkLegacyBrowserEnvironment() || !document.getElementsByTagName) {
                // console.info("Image sizing initialization skipped: Environment not suitable for legacy fixes.");
                return;
            }

            // Determine the set of image nodes to be processed.
            // Prioritize the provided 'targetDOMScope' if it's a valid collection;
            // otherwise, fall back to all '<img>' elements in the document.
            const imageNodesToProcess = (targetDOMScope && targetDOMScope.length)
                ? targetDOMScope
                : document.getElementsByTagName("img");

            // If no images are found or the collection is invalid, exit early.
            if (!imageNodesToProcess || imageNodesToProcess.length === 0) {
                return;
            }

            // Iterate through each image element in the determined collection.
            for (let elementIndex = 0; elementIndex < imageNodesToProcess.length; elementIndex++) {
                const currentImageNode = imageNodesToProcess[elementIndex];

                // Guard against processing non-element nodes or elements without a 'dataset' property.
                if (!(currentImageNode instanceof HTMLElement) || !currentImageNode.dataset) {
                    continue;
                }

                // Skip processing if this image has already been handled by this module instance.
                if (currentImageNode.dataset.imageManagerProcessed === 'true') {
                    continue;
                }

                // Store the image's original dimensions as data attributes. These are crucial
                // for calculating the correct aspect ratio during subsequent resizing operations.
                currentImageNode.dataset.initialWidth = currentImageNode.offsetWidth.toString();
                currentImageNode.dataset.initialHeight = currentImageNode.offsetHeight.toString();

                // Add the current image element to the module's managed collection.
                moduleInstance.ModuleConfiguration.managedElementsCollection.push(currentImageNode);

                // Apply the Internet Explorer-specific AlphaImageLoader filter, which
                // handles PNG transparency and replaces the image source.
                moduleInstance.applyAlphaTransparencyFilter(currentImageNode);

                // Set the image's width to 100% to enable responsive scaling within its parent container.
                currentImageNode.style.width = "100%";

                // Mark the image as having been processed by this manager.
                currentImageNode.dataset.imageManagerProcessed = 'true';
            }

            // If there are images being managed, set up the window resize event handler.
            if (moduleInstance.ModuleConfiguration.managedElementsCollection.length > 0) {
                // Define the core logic for dynamically adjusting the heights of managed images
                // based on their new widths and original aspect ratios.
                const synchronizeImageHeights = function() {
                    const activeImages = moduleInstance.ModuleConfiguration.managedElementsCollection;
                    for (let elementIndex = 0; elementIndex < activeImages.length; elementIndex++) {
                        const imgNode = activeImages[elementIndex];

                        // Retrieve original dimensions from data attributes.
                        const originalW = parseFloat(imgNode.dataset.initialWidth);
                        const originalH = parseFloat(imgNode.dataset.initialHeight);

                        // Basic validation for original dimensions.
                        if (isNaN(originalW) || isNaN(originalH) || originalW === 0) {
                            // console.warn("Missing or invalid initial dimensions for image:", imgNode);
                            continue;
                        }

                        // Calculate the current scaling ratio based on the image's present width.
                        const currentScalingRatio = imgNode.offsetWidth / originalW;
                        // Apply this ratio to the original height to maintain the image's aspect.
                        imgNode.style.height = (originalH * currentScalingRatio) + "px";
                    }
                };
                // Register the height synchronization function as a window resize handler,
                // applying a debounce to optimize performance during rapid resizing events.
                moduleInstance.manageWindowResizeEvent(synchronizeImageHeights);
            }
        },

        /**
         * Applies the proprietary 'AlphaImageLoader' filter, a specific workaround for
         * legacy Internet Explorer to correctly render PNG transparency and manage image sources.
         * The original image source is moved to the filter, and the element's 'src' is replaced.
         * @param {HTMLImageElement} imageElementToFix - The image element to which the filter will be applied.
         */
        applyAlphaTransparencyFilter: function(imageElementToFix) {
            const moduleInstance = this;

            // Validate the input: ensure it's an HTMLImageElement with a valid 'src'.
            if (!(imageElementToFix instanceof HTMLImageElement) || typeof imageElementToFix.src !== 'string' || !imageElementToFix.dataset) {
                return;
            }

            // If a previous source URL is stored, restore it temporarily before applying the filter.
            // This ensures the filter uses the correct, current image source.
            if (imageElementToFix.dataset.cachedSourceUrl) {
                imageElementToFix.src = imageElementToFix.dataset.cachedSourceUrl;
            }

            const currentImageSourceURL = imageElementToFix.src;

            // Explicitly set the image element's width and height based on its current rendered size.
            // This is often critical for the AlphaImageLoader filter to scale the image correctly.
            imageElementToFix.style.width = imageElementToFix.offsetWidth + "px";
            imageElementToFix.style.height = imageElementToFix.offsetHeight + "px";

            // Apply the 'AlphaImageLoader' filter. The 'sizingMethod='scale'' parameter
            // instructs the filter to scale the image content to fit the element's dimensions.
            imageElementToFix.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + currentImageSourceURL + "', sizingMethod='scale')";

            // Store the original image source URL in a data attribute. This allows for
            // potential future restoration or reference, as the 'src' attribute will be changed.
            imageElementToFix.dataset.cachedSourceUrl = currentImageSourceURL;

            // Replace the image element's 'src' attribute with a path to a transparent pixel.
            // The actual image content is now rendered by the CSS filter, not the 'src'.
            imageElementToFix.src = moduleInstance.ModuleConfiguration.transparentPixelResource;
        },

        /**
         * Manages the window's 'onresize' event by registering a new callback function.
         * This method ensures that existing 'onresize' handlers are preserved and chained,
         * and applies a debounce mechanism to the new handler for performance optimization.
         * @param {Function} resizeCallbackAction - The function to be executed when the
         *   window's dimensions change.
         */
        manageWindowResizeEvent: function(resizeCallbackAction) {
            // Capture any previously assigned 'window.onresize' handler to ensure it's called.
            const previousWindowResizeHandler = window.onresize;

            // Assign the new 'onresize' handler, wrapped with a debounce function.
            window.onresize = _applyDebounce(function() {
                // If a previous handler existed and is a function, invoke it first.
                if (typeof previousWindowResizeHandler === 'function') {
                    previousWindowResizeHandler.call(this);
                }
                // Then, execute the newly provided resize action.
                resizeCallbackAction.call(this);
            });
        }
    };

    // Expose the main image manager object to the global window scope,
    // making it accessible for external use, consistent with the original structure.
    window.imageSizeManager = imageSizeManager;

})();