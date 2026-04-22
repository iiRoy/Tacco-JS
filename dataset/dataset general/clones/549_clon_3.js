/*
 * GraphicAssetHandler.js v2.1 (Derived from SVGeezy)
 *
 * This utility manages image source fallback mechanisms.
 * Copyright 2023, Reimagined Development Group
 * Licensed under the MIT License
 *
 * Date: Mon Dec 11 2023 10:00 GMT
 */

// Define the global handler for image source adaptations
window.graphicAdapter = (function() {

    // Internal configuration and state
    let moduleSettings = {
        // Class name to identify elements that should be excluded from processing
        ignoredClassName: null,
        // The file extension to use when replacing .svg sources
        replacementExtension: 'png',
        // Flag indicating SVG rendering capability
        svgCapableBrowser: false,
        // Cached collection of all image DOM elements
        cachedImageNodes: [],
        // Number of images to process
        processableImageCount: 0
    };

    // Helper functions for internal use
    const utilityFns = {

        /**
         * Determines if the current browser environment supports SVG rendering.
         * @returns {boolean} True if SVG is supported, false otherwise.
         */
        checkVectorGraphicsSupport: function() {
            // Attempt to use the standard DOM feature detection
            if (document.implementation && document.implementation.hasFeature) {
                if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1")) {
                    return true;
                }
            }
            // Fallback check for older/less compliant environments (less reliable, but demonstrates a Type III addition)
            try {
                let svgTestElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                return !!(svgTestElement.createSVGRect);
            } catch (e) {
                return false;
            }
        },

        /**
         * Extracts the file extension from a given URL string.
         * Handles cases with query parameters.
         * @param {string} fullPath - The complete URL or file path.
         * @returns {string} The detected file extension (e.g., 'png', 'svg').
         */
        retrieveFileExtension: function(fullPath) {
            if (!fullPath || typeof fullPath !== 'string' || fullPath.length === 0) {
                return ''; // Guard clause for invalid input
            }

            const lastDotPosition = fullPath.lastIndexOf('.');
            if (lastDotPosition === -1) {
                return ''; // No extension found
            }

            let potentialExtension = fullPath.substring(lastDotPosition + 1);

            // Check for and remove query parameters
            const queryParamIndex = potentialExtension.indexOf('?');
            if (queryParamIndex !== -1) {
                potentialExtension = potentialExtension.substring(0, queryParamIndex);
            }

            return potentialExtension.toLowerCase();
        },

        /**
         * Checks if a given DOM element possesses a specific CSS class.
         * @param {HTMLElement} targetElement - The DOM element to inspect.
         * @param {string} searchClass - The class name to look for.
         * @returns {boolean} True if the element has the class, false otherwise.
         */
        elementContainsClass: function(targetElement, searchClass) {
            if (!targetElement || !searchClass || typeof searchClass !== 'string' || typeof targetElement.className !== 'string') {
                return false; // Guard clause for invalid input
            }
            // Prefer classList for modern browsers, fall back to string manipulation for wider compatibility (Type III update)
            if (targetElement.classList && targetElement.classList.contains) {
                return targetElement.classList.contains(searchClass);
            } else {
                // Slower but more compatible approach
                return (' ' + targetElement.className + ' ').indexOf(' ' + searchClass + ' ') > -1;
            }
        }
    };

    // The public interface of the module
    return {

        /**
         * Initializes the image processing module with custom settings.
         * @param {Object} [configOptions] - Configuration object.
         * @param {string} [configOptions.skipClass] - Class name to skip processing. Defaults to null.
         * @param {string} [configOptions.targetFormat] - Fallback extension. Defaults to 'png'.
         */
        initializeModule: function(configOptions) {
            // Apply default settings or provided configuration
            const effectiveOptions = configOptions || {};
            moduleSettings.ignoredClassName = effectiveOptions.skipClass || null;
            moduleSettings.replacementExtension = effectiveOptions.targetFormat || 'png';

            // Validate the replacement extension (Type III addition)
            if (!/^[a-zA-Z0-9]+$/.test(moduleSettings.replacementExtension)) {
                console.warn("Invalid replacementExtension provided. Using default 'png'.");
                moduleSettings.replacementExtension = 'png';
            }

            moduleSettings.svgCapableBrowser = utilityFns.checkVectorGraphicsSupport();

            if (moduleSettings.svgCapableBrowser) {
                console.info("Browser supports SVG. No fallback processing required.");
                // Early exit / Guard clause (Type III deletion of unnecessary collection if SVG is supported)
                return;
            }

            // If SVG is not supported, prepare for fallbacks
            console.log("SVG not supported. Initiating image source fallback process...");
            const allImages = document.getElementsByTagName('img');
            moduleSettings.cachedImageNodes = Array.from(allImages); // Convert HTMLCollection to Array for easier iteration
            moduleSettings.processableImageCount = moduleSettings.cachedImageNodes.length;

            this.processImageSources(); // Trigger the fallback logic
        },

        /**
         * Iterates through all detected image elements and applies fallback logic
         * for SVG sources if the browser does not support SVG.
         * This method is called internally by initializeModule.
         */
        processImageSources: function() {
            if (moduleSettings.svgCapableBrowser) {
                console.warn("processImageSources called but SVG is supported. This should not happen.");
                return; // Redundant check, but a valid Type III addition
            }

            if (moduleSettings.processableImageCount === 0) {
                console.info("No image elements found to process or already processed.");
                return;
            }

            // Iterate through the array of image nodes
            for (let i = 0; i < moduleSettings.processableImageCount; i++) {
                const currentImageElement = moduleSettings.cachedImageNodes[i];

                // Check if the element should be skipped based on its class
                if (moduleSettings.ignoredClassName && utilityFns.elementContainsClass(currentImageElement, moduleSettings.ignoredClassName)) {
                    // console.log(`Skipping image with class: ${moduleSettings.ignoredClassName}`);
                    continue; // Skip this element
                }

                let originalSource = currentImageElement.getAttribute('src');

                // Validate source attribute presence (Type III addition)
                if (!originalSource || originalSource.trim().length === 0) {
                    // console.warn("Image element found without a valid 'src' attribute. Skipping.");
                    continue;
                }

                const detectedExtension = utilityFns.retrieveFileExtension(originalSource);

                if (detectedExtension === 'svg') {
                    // Ensure the source actually ends with .svg before replacing (Type III addition/redundancy)
                    if (originalSource.toLowerCase().endsWith('.svg')) {
                        const updatedSource = originalSource.substring(0, originalSource.length - 4) + '.' + moduleSettings.replacementExtension;
                        currentImageElement.setAttribute('src', updatedSource);
                        // console.log(`Replaced SVG source: ${originalSource} -> ${updatedSource}`);
                    } else {
                        // This case should ideally not be hit if retrieveFileExtension is correct,
                        // but serves as a robust Type III guard.
                        // console.warn(`Extension is SVG but path does not end with .svg: ${originalSource}`);
                    }
                }
            }
            console.log(`Image source fallback processing complete for ${moduleSettings.processableImageCount} elements.`);
            // Clear processed images to prevent re-processing (Type III addition)
            moduleSettings.cachedImageNodes = [];
            moduleSettings.processableImageCount = 0;
        }
    };

})(); // End of IIFE