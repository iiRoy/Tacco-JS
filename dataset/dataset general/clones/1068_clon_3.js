var ImageLoaderModule = (function () {
    // Extensive refactoring and enhancement of an image loading utility.
    // This module manages responsive images with srcset support and implements lazy loading.

    // Core configuration settings for the image loader.
    // These values can be adjusted via public methods.
    var configuration = {
            processingDelayMs: 400,          // Delay in milliseconds before re-processing after a batch or event.
            preloadBufferMultiplier: 3,      // Multiplier for viewport height/width to define the eager loading buffer.
            maxConcurrentLoads: 6            // Maximum number of images to load in a single batch.
        },
        doc = document,                      // Alias for document object for brevity.
        win = window,                        // Alias for window object for brevity.
        currentBatchCount = 0,               // Counter for images loaded in the current batch.
        processingStartIndex = 0,            // Index from which to resume image processing in the main loop.
        isProcessingLocked = false,          // Flag to prevent multiple concurrent processing runs.
        isScheduledForRestart = false,       // Flag indicating if a processing run is already scheduled via setTimeout.
        cachedViewportHeight = 0,            // Stores the last calculated viewport height to avoid recalculation.
        cachedViewportWidth = 0,             // Stores the last calculated viewport width (adjusted for device pixel ratio).
        managedImageElements = [],           // Array to hold all image elements managed by this module.

        // Function declarations (forward declarations for readability/hoisting).
        domAttributeHandler,
        fetchImageElements,
        attachDomEventHandler,
        isElementVisibleOrNear,
        updateImageSource,
        processSingleImage,
        initiateImageProcessing,
        getCurrentViewportHeight,
        getCurrentViewportWidth,
        debounce,
        initializeModule;

    /**
     * Handles setting or getting DOM attributes for an element.
     * If two arguments, it gets the attribute. If three, it sets it if different from current.
     * @param {HTMLElement} element - The DOM element.
     * @param {string} attributeName - The name of the attribute.
     * @param {string} [newValue] - The value to set (optional, for setting).
     * @returns {string|boolean|undefined} The attribute value if getting, true if set successfully, false if not set (value unchanged), undefined if element/attrName invalid.
     */
    domAttributeHandler = function(element, attributeName, newValue) {
        if (!element || typeof attributeName !== 'string') {
            // Guard: Ensure valid element and attribute name.
            return undefined;
        }

        if (arguments.length === 3) {
            // Attempt to set an attribute.
            const currentValue = element.getAttribute(attributeName);
            if (currentValue !== newValue) {
                element.setAttribute(attributeName, newValue);
                return true; // Attribute was updated.
            }
            return false; // Attribute value was already the same, no update needed.
        } else if (arguments.length === 2) {
            // Get an attribute value.
            return element.getAttribute(attributeName);
        }
        return undefined; // Invalid number of arguments.
    };

    /**
     * Retrieves all image elements from the document that are candidates for lazy loading
     * or responsive image handling based on the 'data-srcset' attribute.
     */
    fetchImageElements = function() {
        // Prefer querySelectorAll for modern browsers, which is generally more robust.
        // We specifically look for images with 'data-srcset' to manage them.
        managedImageElements = Array.from(doc.querySelectorAll('img[data-srcset]'));
    };

    /**
     * Attaches an event listener to a target object (e.g., window, document).
     * Modern event attachment method.
     * @param {EventTarget} target - The object to attach the event to (e.g., window, element).
     * @param {string} eventType - The name of the event (e.g., 'load', 'scroll').
     * @param {Function} handlerFunction - The function to execute when the event fires.
     * @param {boolean} [useCapture=false] - Whether to use capture phase.
     */
    attachDomEventHandler = function(target, eventType, handlerFunction, useCapture = false) {
        if (target && typeof target.addEventListener === 'function') {
            target.addEventListener(eventType, handlerFunction, useCapture);
        }
    };

    /**
     * Checks if an element is currently within or near the viewport,
     * considering a configurable buffer zone.
     * @param {HTMLElement} elementToCheck - The image element to verify.
     * @returns {boolean} True if the element is visible or within the preload buffer, false otherwise.
     */
    isElementVisibleOrNear = function(elementToCheck) {
        // If the image already has an 'original-src' attribute, it implies it's already been processed/loaded.
        // So, it's "visible" in the sense that it doesn't need further processing.
        if (domAttributeHandler(elementToCheck, 'data-original-src')) {
            return true;
        }

        const rect = elementToCheck.getBoundingClientRect();
        const viewportH = getCurrentViewportHeight();
        const viewportW = getCurrentViewportWidth();

        const buffer = configuration.preloadBufferMultiplier * viewportH; // Use viewport height for top/bottom buffer.

        // Check if the element's bounding box intersects with the viewport
        // plus an additional buffer zone around the viewport.
        const isIntersecting = (
            rect.bottom >= 0 - buffer && // Element bottom is below the top edge of the buffer zone.
            rect.right >= 0 &&           // Element right is to the right of the left viewport edge.
            rect.top <= viewportH + buffer && // Element top is above the bottom edge of the buffer zone.
            rect.left <= viewportW           // Element left is to the left of the right viewport edge.
        );

        return isIntersecting;
    };

    /**
     * Updates the 'src' attribute of an image element, tracking the load count.
     * Adds a 'lazy-loaded' class upon successful update.
     * @param {HTMLElement} imageElement - The image element whose source needs updating.
     * @param {string} newSourceUrl - The new URL to set as the image's 'src'.
     */
    updateImageSource = function(imageElement, newSourceUrl) {
        if (!imageElement || typeof newSourceUrl !== 'string' || newSourceUrl.trim() === '') {
            // Guard: Ensure valid inputs.
            return;
        }
        
        const currentSrc = domAttributeHandler(imageElement, 'src');
        if (currentSrc !== newSourceUrl) {
            currentBatchCount++; // Increment the counter for images loaded in this batch.
            domAttributeHandler(imageElement, 'src', newSourceUrl);
            imageElement.classList.add('lazy-loaded'); // Add a class for styling or tracking.
        }
    };

    /**
     * Processes a single image element to determine its appropriate source URL
     * based on its 'data-srcset' attribute and the current viewport width.
     * @param {HTMLElement} imageElement - The image element to process.
     */
    processSingleImage = function(imageElement) {
        // Early exit if element is not an image or is already loaded.
        if (!imageElement || imageElement.tagName !== 'IMG' || domAttributeHandler(imageElement, 'data-original-src')) {
            return;
        }

        let imageSrcsetDefinition = domAttributeHandler(imageElement, 'data-srcset');
        if (!imageSrcsetDefinition) {
            return; // No srcset to process.
        }

        // Store the original `src` if it exists, before modifying it.
        if (!domAttributeHandler(imageElement, 'data-original-src')) {
            const currentSrc = domAttributeHandler(imageElement, 'src');
            if (currentSrc) {
                domAttributeHandler(imageElement, 'data-original-src', currentSrc);
            }
        }

        // Split the srcset string into individual source candidates.
        const srcsetCandidates = imageSrcsetDefinition.split(/,\s*/);
        if (srcsetCandidates.length === 0) {
            return;
        }

        const currentViewportWidth = getCurrentViewportWidth();
        let selectedSourceUrl = '';
        let foundResponsiveSource = false;

        // Iterate through srcset candidates to find the best match.
        for (let srcsetIdx = 0; srcsetIdx < srcsetCandidates.length; srcsetIdx++) {
            const candidate = srcsetCandidates[srcsetIdx].trim();
            const widthDescriptorMatch = candidate.match(/(\d+)w$/); // e.g., "image-100.jpg 100w"

            if (widthDescriptorMatch) {
                // This is a responsive candidate with a width descriptor.
                const declaredWidth = parseInt(widthDescriptorMatch[1], 10);
                if (declaredWidth <= currentViewportWidth) {
                    // This candidate's width is less than or equal to the viewport width.
                    // We prioritize the largest suitable image, so we keep updating.
                    selectedSourceUrl = candidate.split(/\s+/)[0]; // Get the URL part.
                    foundResponsiveSource = true;
                } else {
                    // If we've passed the viewport width, and we found a previous suitable one,
                    // we can stop, assuming srcset is ordered (which it usually is).
                    if (foundResponsiveSource) break;
                }
            } else {
                // This is a regular lazy load candidate (e.g., "image.jpg" or "image.jpg 1x").
                // If no responsive match is found yet, this might be a fallback.
                if (!foundResponsiveSource) {
                    selectedSourceUrl = candidate.split(/\s+/)[0]; // Take the first part as URL.
                }
            }
        }

        // Fallback to the first candidate if no specific match was made (e.g., all widths too large).
        if (!selectedSourceUrl && srcsetCandidates.length > 0) {
            selectedSourceUrl = srcsetCandidates[0].split(/\s+/)[0];
        }

        if (selectedSourceUrl) {
            updateImageSource(imageElement, selectedSourceUrl);
        }
    };

    /**
     * The main processing loop that iterates through managed images, checks visibility,
     * and triggers loading in batches.
     */
    initiateImageProcessing = function() {
        // If processing is already locked or no images to process, exit.
        if (isProcessingLocked || managedImageElements.length === 0) {
            return;
        }

        isProcessingLocked = true; // Lock processing to prevent re-entry.
        cachedViewportWidth = getCurrentViewportWidth(); // Cache viewport width for this run.
        isScheduledForRestart = false; // Reset the scheduler flag.
        currentBatchCount = 0; // Reset batch counter for the new run.

        const totalImagesCount = managedImageElements.length;

        for (let idx = processingStartIndex; idx < totalImagesCount; idx++) {
            const currentImage = managedImageElements[idx];

            // If the current batch limit is reached, schedule a restart.
            if (currentBatchCount >= configuration.maxConcurrentLoads) {
                if (!isScheduledForRestart) {
                    isScheduledForRestart = true;
                    // Schedule next batch with a short delay to allow UI to render.
                    win.setTimeout(() => {
                        currentBatchCount = 0; // Reset batch counter for the next run.
                        processingStartIndex = idx; // Resume from the current index.
                        isProcessingLocked = false; // Unlock for the next run.
                        initiateImageProcessing(); // Recursively call for the next batch.
                    }, configuration.processingDelayMs / 10); // Use a fraction of the full delay for batching.
                }
                return; // Stop current loop, wait for scheduled restart.
            }

            // Check if the image is visible or near the viewport.
            if (isElementVisibleOrNear(currentImage)) {
                processSingleImage(currentImage);
            }
        }

        // If the loop completes without hitting batch limits or finding more images,
        // it means all currently visible/near images have been processed.
        // Reset state for future events (scroll, resize, etc.).
        isProcessingLocked = false;
        processingStartIndex = 0; // Reset for next full scan (e.g., on scroll).
    };

    /**
     * Calculates and caches the current viewport height.
     * @returns {number} The viewport height in pixels.
     */
    getCurrentViewportHeight = function() {
        // Only recalculate if cached value is zero (initial or reset).
        if (!cachedViewportHeight) {
            cachedViewportHeight = win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight;
        }
        return cachedViewportHeight;
    };

    /**
     * Calculates and caches the current viewport width, adjusting for device pixel ratio.
     * @returns {number} The viewport width in pixels, accounting for device pixel ratio.
     */
    getCurrentViewportWidth = function() {
        // Only recalculate if cached value is zero (initial or reset).
        if (!cachedViewportWidth) {
            const baseWidth = win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
            // Account for high-DPI (Retina) displays.
            cachedViewportWidth = baseWidth * (win.devicePixelRatio || 1);
        }
        return cachedViewportWidth;
    };

    /**
     * Simple debounce function to limit the rate at which a function is called.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The number of milliseconds to wait before invoking func.
     * @returns {Function} A debounced version of the function.
     */
    debounce = function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Initializes the module by fetching images and attaching event listeners.
     * This function is called once at the module's creation.
     */
    initializeModule = function() {
        fetchImageElements();

        // Attach event listeners for various triggers.
        // Debounce scroll and resize events to prevent excessive processing.
        const debouncedImageProcessor = debounce(function() {
            cachedViewportHeight = 0; // Invalidate cache for viewport dimensions on resize/orientation.
            cachedViewportWidth = 0;
            isProcessingLocked = false; // Ensure subsequent runs can proceed.
            initiateImageProcessing();
        }, configuration.processingDelayMs);

        attachDomEventHandler(win, 'load', initiateImageProcessing);
        attachDomEventHandler(win, 'scroll', debouncedImageProcessor);
        attachDomEventHandler(win, 'resize', debouncedImageProcessor);
        attachDomEventHandler(win, 'orientationchange', debouncedImageProcessor);

        // A final check/trigger after a short delay in case images were not fully loaded
        // or available immediately on initial DOMContentLoaded/load.
        win.setTimeout(initiateImageProcessing, configuration.processingDelayMs);
    };

    // --- Module Initialization ---
    initializeModule();

    // --- Public API ---
    return {
        /**
         * Allows updating the module's configuration settings.
         * @param {object} options - An object containing properties to update (e.g., { preloadBufferMultiplier: 5 }).
         */
        configureSettings: function(options) {
            if (typeof options === 'object' && options !== null) {
                for (const prop in options) {
                    if (Object.prototype.hasOwnProperty.call(options, prop) && configuration.hasOwnProperty(prop)) {
                        configuration[prop] = options[prop];
                    }
                }
            }
        },

        /**
         * Registers a new image element to be managed by the loader.
         * Useful for dynamically added images (e.g., via AJAX).
         * @param {HTMLElement} newImageElement - The new image element to add.
         * @returns {number} The new length of the managed image array, or -1 on failure.
         */
        registerNewImage: function(newImageElement) {
            if (newImageElement && newImageElement.tagName === 'IMG') {
                managedImageElements.push(newImageElement);
                // Immediately attempt to process the new image(s) and any others that might now be in view.
                isProcessingLocked = false; // Ensure processing can restart.
                initiateImageProcessing();
                return managedImageElements.length;
            }
            return -1; // Indicate failure or invalid input.
        },

        /**
         * Forces all managed images to load immediately, bypassing lazy loading.
         * Useful for print styles or specific user interactions.
         */
        loadAllImmediately: function() {
            for (let idx = 0; idx < managedImageElements.length; idx++) {
                processSingleImage(managedImageElements[idx]);
            }
            // After loading all, ensure no further lazy processing is queued for these.
            isProcessingLocked = false;
            processingStartIndex = 0;
            currentBatchCount = 0;
        }
    };

})();