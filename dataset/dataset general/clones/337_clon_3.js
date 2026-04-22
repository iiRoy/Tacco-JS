; (function (jQuery, win, doc, undefined) {
    "use strict";

    // Internal reference to the global window object
    const globalWin = jQuery(win);

    // The unique identifier for this jQuery component
    const componentName = "deferredImageLoader";

    // Default configuration settings for the module
    const moduleConfig = {
        deferClass: "deferred", // CSS class for elements managed by this loader
        completedClass: "loadedContent", // CSS class applied once content is loaded
        blankPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH/C1hNUCBEYXRhWE1QRT94cGFja2V0IDE2MDZCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZERDQ1MzVGMkZGMTExRTFBQTE4OTE5ODk4MQAh+QQFAAAAACwAAAAAAQABAEACAkQBADs=", // A tiny transparent GIF for placeholders
        refreshOnResize: true, // Should the component re-evaluate image positions on window resize?
        auxiliaryScrollTarget: "", // Selector for an additional scrollable element (e.g., a modal)
        attributeMap: ["src", "width", "height", "alt", "class"], // List of data- attributes to transfer to actual attributes
        sourcePriorities: ["highDPI", "wideView", "narrowView"], // Ordered list of source types to check
        defaultSource: "wideView", // Fallback source type if no prioritized source matches

        // Performance and display settings
        proximityBuffer: 300, // Pixels before element enters viewport to trigger load
        throttleDuration: 100, // Milliseconds to debounce scroll/resize events
        transitionSpeed: 250, // Milliseconds for fade-in animation
        includeHidden: false, // Should hidden elements also be considered for loading?
        strictLoadMode: false, // Prevents loading unless explicitly forced via API
        minPlaceholderHeight: 1, // Minimum height for placeholder images if not specified

        // Dynamic source evaluation functions
        sourceEvaluators: {
            "highDPI": () => win.devicePixelRatio > 1,
            "narrowView": () => globalWin.width() < 768, // Changed breakpoint
            "wideView": () => globalWin.width() >= 768 // Changed breakpoint
        }
    };

    // Helper to get element data, robust against undefined/null
    const getElementData = (element, key) => jQuery(element).data(key);

    // The core module constructor
    function ImageLoaderModule(targetNode, initialSettings) {
        this.targetNode = jQuery(targetNode); // The DOM element the plugin is initialized on
        this.moduleSettings = jQuery.extend(true, {}, moduleConfig, initialSettings); // Deep merge settings
        this.moduleIdentifier = componentName; // Store the component's name
        this.isInitialized = false; // Flag to track initialization status
        this.scrollThrottleId = null; // ID for the scroll/resize timeout
        this.viewDimensions = {}; // Cache for viewport dimensions

        this.initialize(); // Start the initialization process
    }

    // Prototype methods for the ImageLoaderModule
    jQuery.extend(ImageLoaderModule.prototype, {
        // Main initialization entry point
        initialize: function () {
            this.setupEventHandlers();
            this.preparePlaceholders();
            this.performInitialScan();
            this.isInitialized = true;
        },

        // Sets up all necessary event listeners
        setupEventHandlers: function () {
            const instanceRef = this;
            const currentSettings = instanceRef.moduleSettings;
            const moduleAlias = instanceRef.moduleIdentifier;
            const deferClass = currentSettings.deferClass;
            const activeImageSelector = currentSettings.includeHidden ?
                `img.${deferClass}` :
                `img.${deferClass}:visible`;

            instanceRef.activeImageSelector = activeImageSelector; // Store for later use

            // Event handler for updating individual images
            instanceRef.targetNode.on(`refresh.${moduleAlias}`, `img.${deferClass}`, function (evtObj, forceActivation = false) {
                const currentImage = jQuery(this);
                const completedClass = currentSettings.completedClass;

                if (currentImage.hasClass(completedClass)) {
                    // If already loaded, just ensure source is set (e.g., after a re-render)
                    instanceRef.assignSource(currentImage, instanceRef.resolveSource(currentImage), forceActivation);
                } else {
                    // Otherwise, check if it's in view
                    instanceRef.evaluateVisibility(this, forceActivation);
                }
            });

            // Event handler for immediate loading
            instanceRef.targetNode.on(`loadNow.${moduleAlias}`, `img.${deferClass}`, function () {
                instanceRef.activateImmediately(this);
            });

            // Global scroll/resize/orientationchange event handler with throttling
            globalWin.add(currentSettings.auxiliaryScrollTarget)
                .on([`scroll.${moduleAlias}`, `resize.${moduleAlias}`, `orientationchange.${moduleAlias}`].join(" "), function () {
                    clearTimeout(instanceRef.scrollThrottleId);
                    instanceRef.scrollThrottleId = setTimeout(() => {
                        // Re-calculate viewport dimensions
                        instanceRef.viewDimensions = {
                            height: globalWin.height(),
                            scrollTop: globalWin.scrollTop(),
                            width: globalWin.width(),
                            scrollLeft: globalWin.scrollLeft()
                        };

                        let imagesToProcess = jQuery(instanceRef.activeImageSelector);

                        // If not refreshing on resize, only process unloaded images
                        if (!currentSettings.refreshOnResize) {
                            imagesToProcess = imagesToProcess.not(`.${currentSettings.completedClass}`);
                        }

                        // Trigger update for relevant images
                        imagesToProcess.trigger(`refresh.${moduleAlias}`);

                    }, instanceRef.isInitialized ? currentSettings.throttleDuration : 0);
                });
        },

        // Converts noscript tags to image elements
        preparePlaceholders: function () {
            const instanceRef = this;
            const currentSettings = instanceRef.moduleSettings;
            const noscriptPlaceholders = instanceRef.targetNode.find(`noscript.${currentSettings.deferClass}`);

            noscriptPlaceholders.each(function () {
                const currentNoScript = jQuery(this);
                const newImageElement = jQuery("<img>");
                const initialHeight = getElementData(currentNoScript, "height") || currentSettings.minPlaceholderHeight;

                // Transfer specified data attributes to actual attributes
                for (const attributeName of currentSettings.attributeMap) {
                    const dataValue = getElementData(currentNoScript, attributeName);
                    if (dataValue) {
                        newImageElement.attr(attributeName, dataValue);
                    }
                }

                // Copy all data attributes from noscript to the new image
                newImageElement.data(currentNoScript.data());

                // Add defer class and placeholder src
                newImageElement.addClass(currentSettings.deferClass).attr("src", currentSettings.blankPixel);

                // Set initial height for layout stability
                newImageElement.height(initialHeight);

                // Replace the noscript tag with the new image
                currentNoScript.replaceWith(newImageElement);

                // Initial fade-in state
                newImageElement.css("opacity", "0.001");
            });
        },

        // Performs an initial scan of images to load those already in view or cached
        performInitialScan: function () {
            const instanceRef = this;
            const currentSettings = instanceRef.moduleSettings;
            const moduleAlias = instanceRef.moduleIdentifier;
            const imagesToScan = instanceRef.targetNode.find(instanceRef.activeImageSelector).not(`.${currentSettings.completedClass}`);

            imagesToScan.each(function () {
                const currentImage = jQuery(this);
                const resolvedSource = instanceRef.resolveSource(currentImage);

                let isPreloaded = false;
                try {
                    // Check if this source was previously loaded in the session
                    isPreloaded = !!sessionStorage.getItem(resolvedSource);
                } catch (e) {
                    // Private browsing mode might block sessionStorage
                    console.warn(`${moduleAlias}: sessionStorage access denied.`, e);
                }

                currentImage.trigger(`refresh.${moduleAlias}`, isPreloaded);
            });

            // Trigger a resize event to initiate the first check
            globalWin.trigger(`resize.${moduleAlias}`);
        },

        // Determines if an element is currently within the visible viewport bounds
        isWithinViewportBounds: function (imageElement) {
            const instanceRef = this;
            const currentSettings = instanceRef.moduleSettings;
            const imageTarget = jQuery(imageElement);
            const imageOffset = imageTarget.offset();
            const view = instanceRef.viewDimensions; // Cached viewport dimensions

            // Adjust threshold for iOS devices, which might have different scroll behavior
            const offsetAdjustment = (/iphone|ipod/i.test(navigator.userAgent.toLowerCase())) ? 60 : 0;
            const effectiveThreshold = currentSettings.proximityBuffer + offsetAdjustment;

            // Check vertical bounds
            const inVerticalRange = imageOffset.top < (view.scrollTop + view.height + effectiveThreshold);
            // Check horizontal bounds
            const inHorizontalRange = imageOffset.left < (view.scrollLeft + view.width + effectiveThreshold);

            return inVerticalRange && inHorizontalRange;
        },

        // Checks an image's location and loads it if conditions are met
        evaluateVisibility: function (imageElement, forceActivation = false) {
            const instanceRef = this;
            const currentSettings = instanceRef.moduleSettings;
            const imageTarget = jQuery(imageElement);
            const completedClass = currentSettings.completedClass;

            // Pre-check: If already loaded, skip further evaluation unless forced.
            if (imageTarget.hasClass(completedClass) && !forceActivation) {
                return;
            }

            const allowAutoLoad = !currentSettings.strictLoadMode && !getElementData(imageTarget, "strictload"); // Renamed 'mustforce' data attribute
            let shouldProceed = false;

            // Determine if the image should be loaded
            if (forceActivation || (
                (currentSettings.refreshOnResize || !imageTarget.hasClass(completedClass)) &&
                (currentSettings.includeHidden || imageTarget.is(":visible")) &&
                instanceRef.isWithinViewportBounds(imageTarget) &&
                allowAutoLoad
            )) {
                shouldProceed = true;
            }

            if (shouldProceed) {
                const resolvedSource = instanceRef.resolveSource(imageTarget);
                instanceRef.assignSource(imageTarget, resolvedSource);

                // Clean up height/width if they were placeholders and not actual data
                if (currentSettings.minPlaceholderHeight && !getElementData(imageTarget, "height")) {
                    imageTarget.removeAttr("height");
                }
                if (!getElementData(imageTarget, "width")) {
                    imageTarget.removeAttr("width");
                }

                imageTarget.addClass(completedClass); // Mark as processed
            }
        },

        // Resolves the best image source based on configured priorities and evaluators
        resolveSource: function (imageNode) {
            const currentSettings = this.moduleSettings;
            let resolvedSource = null;

            // Iterate through source priorities to find the best match
            for (const srcType of currentSettings.sourcePriorities) {
                const elementSource = getElementData(imageNode, srcType);
                const evaluator = currentSettings.sourceEvaluators[srcType];

                let evaluationResult = false;
                if (typeof evaluator === "function") {
                    evaluationResult = !!evaluator.call(imageNode[0]); // Call with the raw DOM element context
                } else if (typeof evaluator === "boolean") {
                    evaluationResult = evaluator;
                }

                if (evaluationResult && elementSource) {
                    resolvedSource = elementSource;
                    break; // Found a matching source, stop iterating
                }
            }

            // Fallback to the default source if no priority source matched
            return resolvedSource || getElementData(imageNode, currentSettings.defaultSource);
        },

        // Assigns the resolved source to the image element and initiates loading/fade
        assignSource: function (imageNode, newSource) {
            const currentSettings = this.moduleSettings;
            const moduleAlias = this.moduleIdentifier;

            if (newSource && newSource !== imageNode.attr("src")) {
                const fadeDuration = currentSettings.transitionSpeed;

                // Ensure the image starts nearly transparent before loading
                imageNode.fadeTo(0, 0.001); // Set immediately to near-transparent

                // Bind a one-time load handler
                imageNode.one(`load.${moduleAlias}`, function () {
                    jQuery(this).stop(true).fadeTo(fadeDuration, 1); // Fade in once loaded
                    // Call user-defined callback if provided
                    if (jQuery.isFunction(currentSettings.onImageLoaded)) {
                        currentSettings.onImageLoaded.call(this, false); // Pass false for not forced
                    }
                });

                // Set the src attribute to trigger image loading
                imageNode.attr("src", newSource);

                // Attempt to cache the loaded source in session storage
                try {
                    sessionStorage.setItem(newSource, "loaded");
                } catch (e) {
                    // Handle potential sessionStorage access issues (e.g., private browsing)
                    console.warn(`${moduleAlias}: Could not save source to session storage.`, e);
                }
            }
        },

        // Public method to force an image to load immediately
        activateImmediately: function (imageElement) {
            this.evaluateVisibility(imageElement, true); // Force evaluation and loading
            return this; // Enable chaining
        }
    });

    // jQuery plugin definition wrapper
    // Prevents multiple instantiations on the same element
    jQuery.fn[componentName] = function (options) {
        this.each(function () {
            // Check if a plugin instance already exists on this element
            if (!jQuery.data(this, `plugin_${componentName}`)) {
                // If not, create a new instance and store it
                jQuery.data(this, `plugin_${componentName}`, new ImageLoaderModule(this, options));
            }
        });
        return this; // Maintain jQuery chainability
    };

    // Expose the version number
    jQuery.fn[componentName].version = "2.1.0-beta"; // Updated version number and format

})(jQuery, window, document); // Pass jQuery, window, document explicitly