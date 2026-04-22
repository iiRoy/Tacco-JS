(function (globalScope, $) {
    /**
     * Module: Dynamic Asset Resolution
     * Description: This script orchestrates the real-time adjustment of image sources
     *              based on the detected viewport characteristics, primarily focusing
     *              on the width of a designated content area. It ensures that
     *              optimized versions of "responsive-media" assets are loaded
     *              for different device profiles (e.g., desktop, tablet, mobile).
     *
     * Key Features:
     * - Identifies current display mode via container width.
     * - Modifies image 'src' attributes to point to device-specific variants.
     * - Responds to window resizing, page load, and device orientation changes.
     * - Includes performance optimizations like debouncing.
     */

    // --- Configuration Constants ---
    // Centralized settings for easy modification and clarity.
    const DISPLAY_PROFILES = {
        CONTAINER_SELECTOR: '.primary-content-area', // Renamed from .container-12
        DESKTOP_THRESHOLD: 960,
        TABLET_THRESHOLD: 720,
        SUFFIX_DESKTOP: '',      // No suffix for desktop assets
        SUFFIX_TABLET: '-tab',   // Renamed from _tablet
        SUFFIX_MOBILE: '-mobi',  // Renamed from _mobile
        TARGET_IMAGE_CLASS: 'responsive-asset', // Renamed from .responsive
        HIDDEN_MOBILE_CLASS: 'omit-on-mobile'    // Renamed from hide-mobile
    };

    // --- Utility Functions ---

    /**
     * Helper to safely extract base name and extension from a file path.
     * @param {string} fullPath The complete image source path.
     * @returns {{base: string, ext: string}} An object containing the base name and extension.
     */
    function dissectPath(fullPath) {
        const lastPeriodPos = fullPath.lastIndexOf('.');
        if (lastPeriodPos === -1 || lastPeriodPos === 0) {
            // No extension found or path starts with a dot
            return { base: fullPath, ext: '' };
        }
        return {
            base: fullPath.substring(0, lastPeriodPos),
            ext: fullPath.substring(lastPeriodPos + 1)
        };
    }

    /**
     * Determines the effective device profile based on the provided width.
     * @param {number} currentWidth The measured width of the content container.
     * @returns {string} The suffix for the current device profile.
     */
    function ascertainDeviceProfile(currentWidth) {
        if (currentWidth >= DISPLAY_PROFILES.DESKTOP_THRESHOLD) {
            return DISPLAY_PROFILES.SUFFIX_DESKTOP;
        } else if (currentWidth >= DISPLAY_PROFILES.TABLET_THRESHOLD) {
            return DISPLAY_PROFILES.SUFFIX_TABLET;
        } else {
            return DISPLAY_PROFILES.SUFFIX_MOBILE;
        }
    }

    // --- Main Logic Function ---

    let priorContainerWidth = null; // State variable to prevent redundant updates.

    /**
     * Core function to evaluate the viewport and update responsive image sources.
     * This function is debounced for performance during rapid resize events.
     */
    function adjustVisualAssets() {
        const contentContainer = $(DISPLAY_PROFILES.CONTAINER_SELECTOR);

        // Type III: Add validation for the existence of the container.
        if (contentContainer.length === 0) {
            console.warn('Responsive content container not found. Image adjustments aborted.');
            return;
        }

        const currentContainerMeasurement = contentContainer.width();

        // Type III: Early exit if the container width hasn't changed.
        if (currentContainerMeasurement === priorContainerWidth) {
            // console.info('Container width unchanged. Skipping image re-evaluation.');
            return;
        }
        priorContainerWidth = currentContainerMeasurement; // Update the state.

        const activeDeviceSuffix = ascertainDeviceProfile(currentContainerMeasurement);

        // console.log(`Viewport width: ${currentContainerMeasurement}px, identified profile: "${activeDeviceSuffix || 'desktop'}"`);

        // Iterate over all images marked for responsive behavior.
        $(`img.${DISPLAY_PROFILES.TARGET_IMAGE_CLASS}`).each(function () {
            const currentImage = $(this);
            const initialSrc = currentImage.attr('src');

            // Type III: Guard clause for images without a source attribute.
            if (!initialSrc) {
                console.warn('Responsive image element found without a "src" attribute. Skipping.', this);
                return;
            }

            const pathDetails = dissectPath(initialSrc);
            let baseName = pathDetails.base;
            const fileExt = pathDetails.ext;

            // Type III: Universal removal of *any* known device suffix to ensure a clean base path.
            // This is more robust than checking for specific suffixes.
            baseName = baseName
                .replace(DISPLAY_PROFILES.SUFFIX_MOBILE, '')
                .replace(DISPLAY_PROFILES.SUFFIX_TABLET, '');

            let newSrcPath = '';

            // Type III: Specific handling for images designated to be omitted on mobile.
            const shouldOmitOnMobile = currentImage.hasClass(DISPLAY_PROFILES.HIDDEN_MOBILE_CLASS);
            if (activeDeviceSuffix === DISPLAY_PROFILES.SUFFIX_MOBILE && shouldOmitOnMobile) {
                // If it's mobile and the image should be hidden, we can either
                // skip updating the src (assuming CSS handles display: none)
                // or set a transparent placeholder, or remove the src entirely.
                // For this clone, we'll ensure the base path is used without any suffix,
                // and let CSS handle the actual hiding.
                newSrcPath = `${baseName}.${fileExt}`;
            } else {
                // Construct the new path with the appropriate device suffix.
                newSrcPath = `${baseName}${activeDeviceSuffix}.${fileExt}`;
            }

            // Type III: Only update the DOM if the source path has actually changed.
            if (currentImage.attr('src') !== newSrcPath) {
                currentImage.attr('src', newSrcPath);
                // console.log(`Updated image source: ${initialSrc} -> ${newSrcPath}`);
            }
        });
    }

    // --- Event Handling and Debouncing ---

    const DEBOUNCE_INTERVAL_MS = 200; // Milliseconds to wait before executing after a resize/orientation event.
    let debounceTimerIdentifier;

    /**
     * Debounces the execution of a function, ensuring it's only called after
     * a specified delay has passed without further calls.
     */
    function scheduleAssetAdjustment() {
        clearTimeout(debounceTimerIdentifier);
        debounceTimerIdentifier = setTimeout(adjustVisualAssets, DEBOUNCE_INTERVAL_MS);
    }

    // --- Initialize on Document Ready ---
    $(document).ready(function () {
        // Execute once immediately when the DOM is fully loaded.
        adjustVisualAssets();

        // Bind to window resize events, using the debounced handler.
        $(globalScope).on('resize', scheduleAssetAdjustment);

        // Bind to window load event (useful for images that might affect layout after initial ready).
        $(globalScope).on('load', adjustVisualAssets); // No debounce needed for a single load event.

        // Type III: Check for orientation change event support more broadly.
        if ('onorientationchange' in globalScope) {
            globalScope.addEventListener('orientationchange', scheduleAssetAdjustment, false);
        }
    });

})(window, jQuery); // Pass global objects into the IIFE for scope isolation and alias creation.