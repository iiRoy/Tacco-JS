//
// graphics-helper.js v2.0
//
// (c) 2023, Your Name or Company
// Licensed under the MIT License
//
// Initial Release: October 26, 2023
//

//
// Usage example:
// vectorAssist.initialize('no-process', 'webp');
// This will configure the helper to skip images with 'no-process' class
// and replace '.svg' extensions with '.webp'.
//

window.vectorAssist = (function() {

    return { // Public API for the vector graphics assistance utility

        /**
         * Initializes the graphics processing module.
         * @param {string|boolean} excludeClass - A CSS class name to skip for processing, or false to process all.
         * @param {string} replacementExtension - The file extension to use for fallbacks (e.g., 'png', 'jpg').
         */
        initialize: function(excludeClass, replacementExtension) {
            this.excludeClass = excludeClass || false; // Store the class to avoid
            this.replacementExtension = replacementExtension || 'png'; // Default fallback format
            this.vectorGraphicsSupported = this.checkVectorGraphicsSupport(); // Determine SVG capability

            if (!this.vectorGraphicsSupported) { // If SVG is not supported by the browser
                this.imageElements = document.getElementsByTagName('img'); // Get all image tags
                this.imageCount = this.imageElements.length; // Store the total number of images
                this.applyFallbacks(); // Execute the fallback logic for images
            }
        },

        /**
         * Iterates through image elements and applies fallback sources if needed.
         */
        applyFallbacks: function() {
            // Loop through all image elements in reverse, using the object's counter property
            while (this.imageCount--) {
                // Check if the current image should be processed (not having the excludeClass or no excludeClass defined)
                // Accessing imageElements[this.imageCount] directly as in the original
                if (!this.elementHasClass(this.imageElements[this.imageCount], this.excludeClass) || !this.excludeClass) {
                    var sourcePath = this.imageElements[this.imageCount].getAttribute('src'); // Retrieve the image's source URL

                    if (sourcePath === null) { // Skip if the source attribute is missing
                        continue;
                    }

                    // If the image source is an SVG, convert it to the fallback type
                    if (this.extractExtension(sourcePath) === 'svg') {
                        var newSourcePath = sourcePath.replace('.svg', '.' + this.replacementExtension); // Construct the new source path
                        this.imageElements[this.imageCount].setAttribute('src', newSourcePath); // Update the image's source attribute
                    }
                }
            }
        },

        /**
         * Extracts the file extension from a given URL path.
         * Handles query parameters gracefully.
         * @param {string} sourcePath - The URL or file path.
         * @returns {string} The extracted file extension.
         */
        extractExtension: function(sourcePath) {
            var fileExtension = sourcePath.split('.').pop(); // Get the last part after a dot

            if (fileExtension.indexOf("?") !== -1) { // Check for query parameters
                fileExtension = fileExtension.split('?')[0]; // Remove query string
            }

            return fileExtension; // Return the cleaned extension
        },

        /**
         * Checks if a DOM element has a specific CSS class.
         * @param {HTMLElement} domElement - The DOM element to check.
         * @param {string} classNameString - The CSS class name to look for.
         * @returns {boolean} True if the element has the class, false otherwise.
         */
        elementHasClass: function(domElement, classNameString) {
            // Check for class presence using a space-padded string comparison
            return (' ' + domElement.className + ' ').indexOf(' ' + classNameString + ' ') > -1;
        },

        /**
         * Determines if the current browser environment supports SVG images.
         * @returns {boolean} True if SVG is supported, false otherwise.
         */
        checkVectorGraphicsSupport: function() {
            // Utilize the DOM implementation's feature detection
            return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
        }
    };

})(); // Self-executing function to create and assign the utility object