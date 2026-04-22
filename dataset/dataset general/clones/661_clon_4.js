(function() {
    /**
     * Module for managing responsive image adjustments based on viewport dimensions.
     */
    const visualAssetManager = {
        // Configuration map for screen width breakpoints and their associated suffixes.
        // This replaces the direct reading of a container's width.
        dimensionThresholds: [
            { lowerBound: 992, upperBound: Infinity, suffixTag: '' },         // Desktop-like widths
            { lowerBound: 768, upperBound: 991, suffixTag: '_tablet' },      // Tablet-like widths
            { lowerBound: 0, upperBound: 767, suffixTag: '_mobile' }        // Mobile-like widths
        ],
        // CSS class indicating an image should be hidden on mobile, without changing its src.
        mobileHideClass: 'hide-mobile',
        // Selector for images that need responsive adjustment.
        targetImageSelector: 'img.responsive',

        /**
         * Determines the current device mode (desktop, tablet, mobile) based on window's inner width.
         * @returns {string} The suffix tag for the current device mode (e.g., '_tablet', '_mobile', or '').
         */
        deriveCurrentDeviceMode() {
            const currentViewportWidth = window.innerWidth;
            for (const threshold of this.dimensionThresholds) {
                if (currentViewportWidth >= threshold.lowerBound && currentViewportWidth <= threshold.upperBound) {
                    return threshold.suffixTag;
                }
            }
            return ''; // Default or fallback, though config should cover all cases.
        },

        /**
         * Removes a specific suffix from the end of an image base name if present.
         * @param {string} baseSegment - The base name of the image (without extension).
         * @param {string} suffixToRemove - The suffix to be removed (e.g., '_tablet').
         * @returns {string} The base name with the suffix removed, or the original base name.
         */
        pruneSuffix(baseSegment, suffixToRemove) {
            if (baseSegment.endsWith(suffixToRemove)) {
                return baseSegment.slice(0, -suffixToRemove.length);
            }
            return baseSegment;
        },

        /**
         * Core function to iterate through responsive images and update their sources.
         * This function is triggered by various window events.
         */
        updateResponsiveImages() {
            const currentOperationalMode = this.deriveCurrentDeviceMode();
            const imagesToProcess = document.querySelectorAll(this.targetImageSelector);

            imagesToProcess.forEach(imageElement => {
                const originalImageSource = imageElement.getAttribute('src');
                if (!originalImageSource) return;

                const sourceBreakdown = originalImageSource.match(/(.*)\.([^.]+)$/);
                if (!sourceBreakdown) return; // Skip malformed image sources

                let baseFilename = sourceBreakdown[1];
                const fileExtension = sourceBreakdown[2];
                let finalImageSource = originalImageSource; // Assume no change initially

                // Logic to adjust image source based on the current mode and existing suffixes.
                switch (currentOperationalMode) {
                    case '': // Desktop mode: Ensure no _tablet or _mobile suffix
                        if (baseFilename.endsWith('_tablet')) {
                            baseFilename = this.pruneSuffix(baseFilename, '_tablet');
                            finalImageSource = `${baseFilename}.${fileExtension}`;
                        } else if (baseFilename.endsWith('_mobile')) {
                            baseFilename = this.pruneSuffix(baseFilename, '_mobile');
                            finalImageSource = `${baseFilename}.${fileExtension}`;
                        }
                        break;

                    case '_tablet': // Tablet mode
                        if (baseFilename.endsWith('_tablet')) {
                            // Already has _tablet suffix, no change needed
                        } else if (baseFilename.endsWith('_mobile')) {
                            // Has _mobile, remove it. No _tablet added here based on original logic.
                            baseFilename = this.pruneSuffix(baseFilename, '_mobile');
                            finalImageSource = `${baseFilename}.${fileExtension}`;
                        } else {
                            // No device suffix, add _tablet
                            finalImageSource = `${baseFilename}${currentOperationalMode}.${fileExtension}`;
                        }
                        break;

                    case '_mobile': // Mobile mode
                        if (baseFilename.endsWith('_mobile')) {
                            // Already has _mobile suffix, no change needed
                        } else if (baseFilename.endsWith('_tablet')) {
                            if (imageElement.classList.contains(this.mobileHideClass)) {
                                // Image has hide-mobile class, CSS handles visibility, no src change
                            } else {
                                // Has _tablet, remove it. No _mobile added here based on original logic.
                                baseFilename = this.pruneSuffix(baseFilename, '_tablet');
                                finalImageSource = `${baseFilename}.${fileExtension}`;
                            }
                        } else {
                            // No device suffix, add _mobile
                            if (imageElement.classList.contains(this.mobileHideClass)) {
                                // Image has hide-mobile class, CSS handles visibility, no src change
                            } else {
                                finalImageSource = `${baseFilename}${currentOperationalMode}.${fileExtension}`;
                            }
                        }
                        break;
                }

                // Update the image's src attribute only if it has actually changed.
                if (imageElement.getAttribute('src') !== finalImageSource) {
                    imageElement.setAttribute('src', finalImageSource);
                }
            });
        },

        /**
         * Sets up event listeners for window resize, load, and orientation changes.
         */
        establishEventHandlers() {
            // Bind the update function to relevant window events.
            window.addEventListener('resize', this.updateResponsiveImages.bind(this));
            window.addEventListener('load', this.updateResponsiveImages.bind(this));

            // Check for and bind to orientation change events.
            if ('onorientationchange' in window) {
                window.addEventListener('orientationchange', this.updateResponsiveImages.bind(this));
            }
        }
    };

    // Initialize the event handlers once the DOM is fully loaded.
    document.addEventListener('DOMContentLoaded', () => {
        visualAssetManager.establishEventHandlers();
    });
})();