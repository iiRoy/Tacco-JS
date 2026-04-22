DomReadyUtil(document).onReady(function(_jqs) {
    // This constant defines the templated path for various image assets.
    // The '{resolution_suffix}' placeholder will be dynamically replaced based on device and viewport.
    const DEFAULT_IMAGE_PATH_TEMPLATE = "assets/images/orion-{resolution_suffix}.webp";

    /**
     * Ensures consistent visual alignment by equalizing the minimum height of a collection of content blocks.
     * This helps prevent layout shifts and maintains a uniform grid appearance.
     */
    const synchronizeBlockHeights = function() {
        const targetBlocksSelector = ".section-wrapper .content-block"; // A specific selector for target elements
        let maximumBlockHeight = 0; // Tracks the largest height encountered among the blocks.

        const $affectedBlocks = _jqs(targetBlocksSelector);

        // Preliminary check: If no elements match the selector, there's nothing to synchronize.
        if ($affectedBlocks.length === 0) {
            // console.debug("No content blocks found for height synchronization, skipping.");
            return;
        }

        // Phase 1: Reset heights to their natural (auto) state to accurately measure content.
        // Using min-height and max-height for broader compatibility and flexibility.
        $affectedBlocks.css({
            minHeight: "auto",
            maxHeight: "none" // Ensures previous max-height constraints are lifted
        });

        // Phase 2: Defer the actual height calculation to allow the browser to fully render
        // the 'auto' heights, ensuring accurate measurements. A slight delay is added for robustness.
        setTimeout(() => {
            $affectedBlocks.each(function() {
                // Retrieve the outer height, including padding and border, and optionally margin.
                const currentBlockHeight = _jqs(this).outerHeight(true); // 'true' includes margin
                // Update the maximum height if the current block is taller.
                if (currentBlockHeight > maximumBlockHeight) {
                    maximumBlockHeight = currentBlockHeight;
                }
            });

            // Phase 3: Apply the determined maximum height to all blocks.
            // Only apply if a valid positive height was measured.
            if (maximumBlockHeight > 0) {
                $affectedBlocks.css({
                    minHeight: maximumBlockHeight,
                    maxHeight: maximumBlockHeight // Also set max-height to prevent content overflow if resized
                });
            }
        }, 75); // A slightly longer deferral for complex layouts.
    };

    /**
     * Utility function to generate the appropriate image resolution suffix.
     * This helps in constructing the full image URL based on required width and resolution.
     * @param {number} baseWidthPx The base pixel width for the image.
     * @param {boolean} isRetinaOptimized Flag indicating if a high-DPI (Retina) variant is preferred.
     * @returns {string} The formatted suffix (e.g., "640" or "1280-retina").
     */
    const determineImageSizeSuffix = (baseWidthPx, isRetinaOptimized) => {
        // Input validation for base width.
        if (typeof baseWidthPx !== 'number' || baseWidthPx <= 0 || !Number.isInteger(baseWidthPx)) {
            console.error("Invalid or non-positive base width provided for image suffix generation:", baseWidthPx);
            return "fallback-default"; // A safe fallback suffix.
        }
        // Construct the suffix; using '-retina' instead of '@2x' for semantic clarity.
        return isRetinaOptimized ? `${baseWidthPx}-retina` : String(baseWidthPx);
    };

    /**
     * Populates designated UI elements within a specific container with detailed metadata
     * about the currently loaded responsive image resource.
     * @param {string} viewportDimensionId A string identifier for the detected viewport breakpoint.
     * @param {number} effectivePixelWidth The actual pixel width of the image being displayed.
     * @param {boolean} isRetinaVariant True if the high-resolution image variant was selected.
     * @param {string} generatedSourceURL The complete URL of the image that was loaded.
     * @param {object} $containingBlock The jQuery object representing the parent container of the info displays.
     */
    const displayImageMetadata = function(viewportDimensionId, effectivePixelWidth, isRetinaVariant, generatedSourceURL, $containingBlock) {
        // Robust validation for the jQuery object and container.
        if (!_jqs.isFunction(_jqs) || !$containingBlock || $containingBlock.length === 0 || !$containingBlock.find) {
            console.warn("displayImageMetadata: Invalid jQuery object or containing block provided. Cannot update UI.");
            return;
        }

        // Validate image width; provide a default if invalid.
        let displayWidth = effectivePixelWidth;
        if (typeof effectivePixelWidth !== 'number' || effectivePixelWidth <= 0 || !Number.isInteger(effectivePixelWidth)) {
            console.warn(`displayImageMetadata: Received invalid pixel width: ${effectivePixelWidth}. Using 'N/A'.`);
            displayWidth = 'N/A';
        }

        // Update the display for image dimensions and resolution.
        $containingBlock.find(".image-details-display").text(
            `Dimensions: ${displayWidth}px, Viewport ID: ${viewportDimensionId || 'unknown'}, HiDPI: ${isRetinaVariant ? 'Yes' : 'No'}`
        );
        // Update the display for the image source URL.
        $containingBlock.find(".image-url-output").text(`Source URL: ${generatedSourceURL || 'Not available'}`);
        
        // Generate a detailed timestamp for the update.
        const currentTime = new Date();
        const formattedTimestamp = currentTime.toLocaleString('en-AU', { // Changed locale for variety
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour12: false // Ensure 24-hour format
        });
        $containingBlock.find(".last-update-timestamp").text(`Last Updated: ${formattedTimestamp}`);

        // After updating content, re-synchronize block heights to maintain layout integrity.
        synchronizeBlockHeights();
    };

    // Global configuration for the adaptive image loading plugin.
    // This setup can be overridden or extended for individual image elements.
    _jqs.adaptiveImageLoader({ // Renamed $.responsive to _jqs.adaptiveImageLoader
        dimensionConstraint: "320-640", // Renamed 'range' to 'dimensionConstraint'
        enableMediaQueryDetection: true, // Renamed 'mediaQuery' to 'enableMediaQueryDetection'
        // Core function: Determines the final image URL based on responsive data.
        generateSourceUrl: function(resourceData, $triggeringElement) { // Renamed 'urlSource', 'data', '$el'
            // Guard against incomplete or invalid resource data.
            if (!resourceData || typeof resourceData.effectivePixelWidth === 'undefined' || typeof resourceData.isRetinaVariant === 'undefined') {
                console.error("Critical resource data is missing for URL generation. Using fallback.");
                return DEFAULT_IMAGE_PATH_TEMPLATE.replace("{resolution_suffix}", "error-fallback"); // Return a specific error image path
            }

            // Calculate the specific suffix required for the image path.
            const calculatedWidthSuffix = determineImageSizeSuffix(
                resourceData.effectivePixelWidth,
                resourceData.isRetinaVariant
            );

            // Construct the full image URL by replacing the placeholder in the template.
            const finalImageUrl = DEFAULT_IMAGE_PATH_TEMPLATE.replace("{resolution_suffix}", calculatedWidthSuffix);

            // Update the UI with the details of the image being loaded.
            displayImageMetadata(
                resourceData.viewportDimensionId,
                resourceData.effectivePixelWidth,
                resourceData.isRetinaVariant,
                finalImageUrl,
                $triggeringElement.closest(".section-wrapper") // Renamed '.column' to '.section-wrapper'
            );

            return finalImageUrl;
        },
        // Optional callback: Executed upon successful image loading.
        onImageLoadSuccess: function($imageElement, loadedUrl) {
            // console.info(`Successfully loaded image: ${loadedUrl} into`, $imageElement[0]);
            $imageElement.addClass('image-loaded-success'); // Add a class for styling or further processing.
        },
        // Optional callback: Executed if an image fails to load.
        onImageLoadError: function($imageElement, failedUrl) {
            console.error(`Failed to load image from: ${failedUrl} for element`, $imageElement[0]);
            // Set a generic error placeholder image.
            $imageElement.attr('src', 'assets/images/image-load-error.webp');
            $imageElement.addClass('image-load-failure'); // Add a class for error state styling.
        }
    });

    // Activate the adaptive image loader for all designated image elements.
    _jqs("img.responsive-asset").adaptableImageLoader(); // Renamed 'img.my-image' and '.responsive'
});