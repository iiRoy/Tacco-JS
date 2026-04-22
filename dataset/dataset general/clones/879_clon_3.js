/*
 * Adaptive Asset Handler Module
 * Manages responsive image loading based on viewport size and lazy-loading.
 */

// Placeholder or registration for a custom element, can be managed externally or within the module.
// For this clone, we'll assume the custom element is handled or not strictly required for the JS logic.

var adaptiveAssetHandler = {

    /**
     * Core configuration and operational parameters.
     */
    options: {
        cssClass: "responsive-media", // Renamed from className
        lazyLoadThrottleDelay: 250, // Renamed from lazyDelay
        preferNoScriptFallback: false, // Renamed from useNoScript
        debugMode: false, // New addition
        defaultProfile: { // Renamed from default
            breakpoints: [320, 480, 720, 100000], // Renamed from sizes
            assetNames: {320: 320, 480: 480, 720: 720, 100000: 100000}, // Renamed from fileNames
            assetPathPattern: "^(.*?)(-\\d+)(\\.[a-z]{2,4})$", // Renamed from imagePath, slightly modified regex
            sizeSegmentIndex: 2, // Renamed from imagePathSizeField
            enableLazyLoad: true, // Renamed from lazy
            lazyLoadPreloadDistance: 250 // Renamed from lazyPrePx
        }
    },

    /**
     * Stores the current viewport width, including scrollbar.
     */
    currentViewportWidth: 0, // Renamed from screenWidth

    /**
     * Stores the calculated width of the scrollbar.
     */
    computedScrollbarWidth: 0, // Renamed from scrollbarWidth

    /**
     * Flag indicating if the module has completed its initial setup.
     */
    isModuleActive: false, // Renamed from hasInited

    /**
     * Controls the frequency of scroll event processing to prevent performance issues.
     */
    canProcessScrollEvents: true, // Renamed from allowLazyUpdate

    /**
     * Special flag to address specific browser scrolling quirks (e.g., Chrome 33 bug).
     */
    quirkModeActive: true, // Renamed from forcedScrollUpdate

    /**
     * Helper function to debounce function calls.
     * @param {Function} func The function to debounce.
     * @param {number} delay The delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    debounce: function (func, delay) {
        var timeoutId;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                func.apply(context, args);
            }, delay);
        };
    },

    /**
     * Initializes the responsive asset management system.
     * Calculates scrollbar dimensions and performs an initial image sizing.
     *
     * @param {object} userSettings An object containing overrides for default options.
     */
    initialize: function (userSettings) {
        // Validate input settings
        if (typeof userSettings !== "object" || userSettings === null) {
            userSettings = {};
            this.debugLog("No valid user settings provided; using defaults.");
        }

        // Merge user-defined options with the defaults
        this.options = this.consolidateOptions(userSettings);

        // Determine the scrollbar's width for accurate viewport calculations
        this.calculateScrollbarDimension();

        // Set up event listeners for window resize and scroll actions
        this.setupEventObservers();

        this.debugLog("Module initialized with settings: " + JSON.stringify(this.options));
    },

    /**
     * Establishes event listeners for window resizing and scrolling.
     * Uses a debounced version for resize to improve performance.
     */
    setupEventObservers: function () {
        var selfRef = this;

        // Debounce the resize handler to prevent excessive calls
        selfRef.debouncedAdaptToViewportChanges = selfRef.debounce(function () {
            selfRef.adaptToViewportChanges(false); // Do not force initial update
        }, 150); // A small debounce for resize

        window.addEventListener("resize", selfRef.debouncedAdaptToViewportChanges, false);
        window.addEventListener("load", selfRef.debouncedAdaptToViewportChanges, false); // Initial load also triggers resize
        window.addEventListener("scroll", function () {
            selfRef.handleScrollForLazyLoading();
        }, false);

        selfRef.debugLog("Event observers attached for resize and scroll.");
    },

    /**
     * Merges user-provided settings with the module's default options.
     * Ensures all necessary configuration fields are present and correctly ordered.
     *
     * @param {object} inputSettings An object containing custom settings.
     * @returns {object} The complete, merged configuration object.
     */
    consolidateOptions: function (inputSettings) {
        var mergedOptions = {};
        var settingProp;
        var defaultDefault = this.options.defaultProfile; // Cache default profile

        // Copy top-level default options or use inputSettings if provided
        mergedOptions.cssClass = inputSettings.cssClass !== undefined ? inputSettings.cssClass : this.options.cssClass;
        mergedOptions.lazyLoadThrottleDelay = inputSettings.lazyLoadThrottleDelay !== undefined ? inputSettings.lazyLoadThrottleDelay : this.options.lazyLoadThrottleDelay;
        mergedOptions.preferNoScriptFallback = inputSettings.preferNoScriptFallback !== undefined ? inputSettings.preferNoScriptFallback : this.options.preferNoScriptFallback;
        mergedOptions.debugMode = inputSettings.debugMode !== undefined ? inputSettings.debugMode : this.options.debugMode;

        // Iterate through all other possible custom profiles (e.g., "responsive-large")
        for (settingProp in inputSettings) {
            if (Object.prototype.hasOwnProperty.call(inputSettings, settingProp) && typeof inputSettings[settingProp] === "object") {
                // If it's a nested profile, merge with defaultDefault
                var profile = {};
                for (var key in defaultDefault) {
                    if (Object.prototype.hasOwnProperty.call(defaultDefault, key)) {
                        profile[key] = inputSettings[settingProp][key] !== undefined ? inputSettings[settingProp][key] : defaultDefault[key];
                    }
                }

                // Ensure breakpoints are sorted numerically
                profile.breakpoints.sort(function (a, b) { return a - b; });

                // If assetNames are missing but breakpoints are present, generate a default map
                if (profile.assetNames === undefined && profile.breakpoints !== undefined) {
                    profile.assetNames = {};
                    for (var bpIdx in profile.breakpoints) {
                        if (Object.prototype.hasOwnProperty.call(profile.breakpoints, bpIdx)) {
                            profile.assetNames[profile.breakpoints[bpIdx]] = profile.breakpoints[bpIdx];
                        }
                    }
                }
                mergedOptions[settingProp] = profile;
            }
        }

        // Ensure the 'defaultProfile' is always present, even if not explicitly provided in inputSettings
        if (mergedOptions.defaultProfile === undefined) {
            var defaultProfileCopy = {};
            for (var key in defaultDefault) {
                if (Object.prototype.hasOwnProperty.call(defaultDefault, key)) {
                    defaultProfileCopy[key] = defaultDefault[key];
                }
            }
            mergedOptions.defaultProfile = defaultProfileCopy;
        }

        return mergedOptions;
    },

    /**
     * Extracts configuration options relevant to a specific image element
     * based on its CSS classes.
     *
     * @param {string} elementClasses A string containing all CSS classes of the element.
     * @returns {object|null} An object with configuration options, or null if no relevant profile is found.
     */
    extractElementSettings: function (elementClasses) {
        var selectedProfileKey = null;
        var classList = elementClasses.split(" ");
        var moduleCssClass = this.options.cssClass;

        for (var idx = 0; idx < classList.length; idx++) {
            var currentClass = classList[idx].trim();

            // If the base class is found, use the 'defaultProfile'
            if (selectedProfileKey === null && currentClass === moduleCssClass) {
                selectedProfileKey = "defaultProfile";
            }

            // Check for namespaced profiles (e.g., "responsive-media-gallery")
            if (currentClass.startsWith(moduleCssClass + "-")) {
                var profileName = currentClass.substring(moduleCssClass.length + 1);
                if (this.options[profileName] !== undefined) {
                    selectedProfileKey = profileName;
                    break; // Found a specific profile, prioritize it
                }
            }
        }

        if (selectedProfileKey === null) {
            this.debugLog("No adaptive profile found for element classes: " + elementClasses);
            return null;
        }

        return this.options[selectedProfileKey];
    },

    /**
     * Determines the width of the browser's scrollbar.
     * This is crucial for accurate viewport width calculations in some browsers.
     */
    calculateScrollbarDimension: function () {
        if (this.computedScrollbarWidth === 0) {
            var measureDiv = document.createElement("div");
            measureDiv.style.cssText = "width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;";
            document.body.appendChild(measureDiv);

            // Calculate the difference between offsetWidth (includes scrollbar) and clientWidth (excludes scrollbar)
            if (measureDiv.offsetWidth && measureDiv.clientWidth) {
                this.computedScrollbarWidth = measureDiv.offsetWidth - measureDiv.clientWidth;
            }

            document.body.removeChild(measureDiv);
            this.debugLog("Calculated scrollbar width: " + this.computedScrollbarWidth + "px");
        }
    },

    /**
     * Checks if the viewport size has changed and, if so, triggers a re-evaluation
     * of all responsive images.
     *
     * @param {boolean} [forceUpdateFlag=false] Set to true to bypass the width check and force an update.
     */
    adaptToViewportChanges: function (forceUpdateFlag) {
        var moduleRef = this;
        var newViewportWidth = document.documentElement.clientWidth + moduleRef.computedScrollbarWidth;

        // Ensure the forceUpdateFlag is a boolean
        forceUpdateFlag = !!forceUpdateFlag;

        // The first run or a forced update always proceeds
        var shouldProceed = !moduleRef.isModuleActive || forceUpdateFlag;
        moduleRef.isModuleActive = true; // Mark as active after first run

        // If viewport width hasn't changed and it's not a forced update, exit
        if (moduleRef.currentViewportWidth === newViewportWidth && !shouldProceed) {
            return;
        }

        moduleRef.debugLog("Viewport width changed from " + moduleRef.currentViewportWidth + " to " + newViewportWidth + ". Triggering asset rebuild.");
        moduleRef.currentViewportWidth = newViewportWidth;

        // Rebuild all image elements based on the new viewport size
        moduleRef.renderVisibleAssets();

        // After rebuilding, check for any lazy-loadable images now in view
        moduleRef.handleScrollForLazyLoading();
    },

    /**
     * Iterates through all responsive asset containers (noscript or custom elements)
     * and generates or updates their corresponding <img> tags.
     */
    renderVisibleAssets: function () {
        var moduleRef = this;
        var assetContainers;
        var dataAttrPrefix = "data-" + moduleRef.options.cssClass + "-";

        // Select elements based on the configured preference
        if (moduleRef.options.preferNoScriptFallback) {
            assetContainers = document.querySelectorAll("noscript." + moduleRef.options.cssClass);
        } else {
            // Assuming "responsive-image" is a custom element or a generic data container
            assetContainers = document.querySelectorAll("responsive-image." + moduleRef.options.cssClass);
        }

        moduleRef.debugLog("Processing " + assetContainers.length + " adaptive asset containers.");

        for (var k = 0; k < assetContainers.length; k++) {
            var currentContainer = assetContainers[k];
            var containerOptions = moduleRef.extractElementSettings(currentContainer.className);

            if (!containerOptions) {
                continue; // Skip if no valid options found
            }

            // Determine the optimal image source and metadata
            var assetDetails = moduleRef.determineBestFitSource(currentContainer, containerOptions);

            // Assign a unique ID if not already present
            if (!currentContainer.getAttribute(dataAttrPrefix + "asset-id")) {
                currentContainer.setAttribute(dataAttrPrefix + "asset-id", dataAttrPrefix + "img-" + Math.floor(Math.random() * 100000000));
            }

            // Mark for lazy loading if enabled in options
            if (containerOptions.enableLazyLoad && !currentContainer.getAttribute(dataAttrPrefix + "lazy-status")) {
                currentContainer.setAttribute(dataAttrPrefix + "lazy-status", "pending");
                currentContainer.setAttribute(dataAttrPrefix + "preload-distance", String(containerOptions.lazyLoadPreloadDistance));
            }

            var assetId = currentContainer.getAttribute(dataAttrPrefix + "asset-id");
            var existingImageElement = document.getElementById(assetId);

            if (existingImageElement && existingImageElement.tagName.toLowerCase() === "img") {
                // If the image exists and is the same size, skip update
                if (parseInt(existingImageElement.getAttribute(dataAttrPrefix + "used-size"), 10) === parseInt(assetDetails.size, 10)) {
                    continue;
                }

                // Otherwise, remove the old image to rebuild with the new size
                existingImageElement.parentNode.removeChild(existingImageElement);
                currentContainer.removeAttribute(dataAttrPrefix + "lazy-status-loaded"); // Reset lazy status
                existingImageElement = null;
            }

            // Create a new image element
            var freshImageElement = document.createElement("img");
            freshImageElement.setAttribute("id", assetId);
            freshImageElement.setAttribute(dataAttrPrefix + "used-size", assetDetails.size);

            if (assetDetails.altText) { freshImageElement.setAttribute("alt", assetDetails.altText); }
            if (assetDetails.titleText) { freshImageElement.setAttribute("title", assetDetails.titleText); }
            if (assetDetails.extraClasses) { freshImageElement.setAttribute("class", assetDetails.extraClasses); }

            // Set src or data-src based on lazy-load configuration
            if (containerOptions.enableLazyLoad) {
                freshImageElement.setAttribute(dataAttrPrefix + "lazy-src", assetDetails.sourceUrl);
            } else {
                freshImageElement.setAttribute("src", assetDetails.sourceUrl);
            }

            // Insert the new image element before its container
            currentContainer.parentNode.insertBefore(freshImageElement, currentContainer);
            moduleRef.debugLog("Image element " + assetId + " created/updated for size " + assetDetails.size);
        }
    },

    /**
     * Determines the most appropriate image source (path and size) for a given
     * element based on current viewport width and available breakpoints.
     *
     * @param {HTMLElement} targetElement The source element (noscript or custom element).
     * @param {object} assetOptions The configuration options for this asset.
     * @returns {object} An object containing the optimal size, source URL, and other attributes.
     */
    determineBestFitSource: function (targetElement, assetOptions) {
        var moduleRef = this;
        var optimalSize = assetOptions.breakpoints[assetOptions.breakpoints.length - 1]; // Default to largest
        var currentViewportWidth = moduleRef.currentViewportWidth;

        // Find the closest breakpoint without exceeding the current viewport width
        for (var i = 0; i < assetOptions.breakpoints.length; i++) {
            var currentSizeCandidate = parseInt(assetOptions.breakpoints[i], 10);
            if (currentViewportWidth <= currentSizeCandidate && optimalSize >= currentSizeCandidate) {
                optimalSize = currentSizeCandidate;
            }
        }

        var sourceElement;
        var originalSourceUrl;

        // Extract original source URL and other attributes
        if (moduleRef.options.preferNoScriptFallback) {
            // For noscript, parse content for img tag
            var tempContainer = document.createElement("div");
            tempContainer.innerHTML = targetElement.childNodes[0] ? targetElement.childNodes[0].data : "";
            sourceElement = tempContainer.getElementsByTagName("img")[0];
            originalSourceUrl = sourceElement ? sourceElement.src : "";
        } else {
            // For custom elements, use data-src attribute
            sourceElement = targetElement;
            originalSourceUrl = targetElement.getAttribute('data-src') || "";
        }

        // Parse the original source URL to insert the new size
        var pathSegments = new RegExp(assetOptions.assetPathPattern).exec(originalSourceUrl);
        var finalImagePath = "";

        if (pathSegments && pathSegments.length > assetOptions.sizeSegmentIndex) {
            for (var segmentIndex = 1; segmentIndex < pathSegments.length; segmentIndex++) {
                if (segmentIndex === assetOptions.sizeSegmentIndex) {
                    finalImagePath += assetOptions.assetNames[optimalSize];
                } else {
                    finalImagePath += pathSegments[segmentIndex];
                }
            }
        } else {
            // Fallback if regex doesn't match or path is simple
            finalImagePath = originalSourceUrl;
            moduleRef.debugLog("Warning: Asset path pattern did not match for " + originalSourceUrl);
        }

        return {
            size: optimalSize,
            sourceUrl: finalImagePath,
            altText: sourceElement ? sourceElement.getAttribute('alt') : '',
            titleText: sourceElement ? sourceElement.getAttribute('title') : '',
            extraClasses: sourceElement ? sourceElement.getAttribute('data-class') : ''
        };
    },

    /**
     * Processes scroll events to identify and load lazy-loadable images
     * that have entered the viewport.
     */
    handleScrollForLazyLoading: function () {
        var moduleRef = this;

        // Throttle scroll events
        if (!moduleRef.canProcessScrollEvents) {
            return;
        }
        moduleRef.canProcessScrollEvents = false;

        var currentScreenHeight = window.innerHeight || document.documentElement.clientHeight;
        var dataAttributePrefix = "data-" + moduleRef.options.cssClass + "-";

        // Query all image elements that are marked for lazy loading but not yet loaded
        var lazyLoadTargets = document.querySelectorAll(
            "img[" + dataAttributePrefix + "lazy-src]:not([" + dataAttributePrefix + "lazy-status-loaded])"
        );

        // Chrome 33 scroll bug workaround (can be simplified/removed for modern browsers)
        if (moduleRef.quirkModeActive) {
            var scrollFixTimer = window.setInterval(function () {
                if (document.documentElement.scrollTop !== 0 || document.body.scrollTop !== 0) {
                    window.clearInterval(scrollFixTimer);
                    moduleRef.canProcessScrollEvents = true; // Allow re-run immediately after fix
                    moduleRef.quirkModeActive = false;
                    moduleRef.handleScrollForLazyLoading(); // Re-trigger
                } else {
                    // If still at top, assume no scroll will happen, disable quirk mode
                    moduleRef.quirkModeActive = false;
                    moduleRef.debugLog("Quirk mode deactivated: No scroll detected.");
                }
            }, 50);
            return; // Exit this call, let the timer re-trigger
        }

        for (var j = 0; j < lazyLoadTargets.length; j++) {
            var targetImage = lazyLoadTargets[j];
            var boundingRectangle = targetImage.getBoundingClientRect();
            var preloadDistance = parseInt(targetImage.getAttribute(dataAttributePrefix + "preload-distance"), 10) || 0;

            // Check if the image is within the viewport (or preload distance)
            if (boundingRectangle.top - preloadDistance <= currentScreenHeight && boundingRectangle.bottom >= 0) {
                var lazySrc = targetImage.getAttribute(dataAttributePrefix + "lazy-src");
                if (lazySrc) {
                    targetImage.setAttribute("src", lazySrc);
                    targetImage.removeAttribute(dataAttributePrefix + "lazy-src"); // Clean up attribute
                    targetImage.setAttribute(dataAttributePrefix + "lazy-status-loaded", "true"); // Mark as loaded
                    moduleRef.debugLog("Lazy-loaded image: " + targetImage.id);
                }
            }
        }

        // Allow scroll events to be processed again after a delay
        window.setTimeout(function () {
            moduleRef.canProcessScrollEvents = true;
        }, moduleRef.options.lazyLoadThrottleDelay);
    },

    /**
     * Internal logging utility, active only if debugMode is true.
     * @param {string} message The message to log.
     */
    debugLog: function (message) {
        if (this.options.debugMode) {
            console.log("[AdaptiveAssetHandler] " + message);
        }
    }
};