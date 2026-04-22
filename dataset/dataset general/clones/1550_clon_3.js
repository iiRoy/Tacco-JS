const CommerceDisplayManager = (function () {

    // Internal configuration and selectors for the product display module.
    // Type III: Introduced a configuration object for better maintainability and clarity.
    const moduleSettings = {
        galleryRootSelector: '#product-media-gallery', // Changed ID for the main gallery container
        pageContextClass: 'body.commerce-product-view', // More specific body class for product pages
        thumbnailImagesSelector: 'ul.gallery-thumbnails > li > img', // More specific selector for thumbnails
        primaryImageDisplaySelector: 'img.main-product-display', // Specific class for the large image
        loadingIndicatorClass: 'is-loading-asset', // New class to manage loading state (e.g., cursor, overlay)
        defaultAltText: 'Product Image Detail' // Default alt text if none is provided
    };

    /**
     * @function setupInteractiveProductGallery
     * @description Orchestrates the interactive functionality for the product image gallery.
     * This includes handling thumbnail clicks and updating the main product image display.
     * Type II: Renamed function, rephrased comment.
     * Type III: Added JSDoc, improved description.
     */
    function setupInteractiveProductGallery() {

        // Identify the main container for all product media elements.
        // Type II: Renamed variable.
        // Type III: Combined selectors using the config object for precision.
        const $mediaDisplayWrapper = $(`${moduleSettings.pageContextClass} ${moduleSettings.galleryRootSelector}`);

        // Type III: Added a robust guard clause to exit early if the container is not found.
        if ($mediaDisplayWrapper.length === 0) {
            console.warn('CommerceDisplayManager: Product media gallery container not found. Skipping setup.');
            return;
        }

        // Select all individual thumbnail image elements within the wrapper.
        // Type II: Renamed variable.
        // Type III: Used `find` with the config selector for better scoping.
        const $imageThumbnails = $mediaDisplayWrapper.find(moduleSettings.thumbnailImagesSelector);

        // Proceed with setup only if there are actual thumbnails available.
        // Type III: Changed condition to be more explicit.
        if ($imageThumbnails.length > 0) {

            // Locate the main image element where the larger version will be shown.
            // Type II: Renamed variable.
            // Type III: Used `find` with the config selector.
            const $heroProductImage = $mediaDisplayWrapper.find(moduleSettings.primaryImageDisplaySelector);

            // Type III: Another guard clause to ensure the main display image exists.
            if ($heroProductImage.length === 0) {
                console.error('CommerceDisplayManager: Primary product image display element not found within gallery.');
                return;
            }

            // Type III: New helper function to encapsulate cursor/loading state changes.
            const manageLoadingState = (activate) => {
                $('body').toggleClass(moduleSettings.loadingIndicatorClass, activate);
                // In a real application, this class would define cursor: progress or show a spinner.
            };

            // Attach a click event handler to each thumbnail.
            // Type II: Renamed event object `e` to `clickEvent`.
            $imageThumbnails.on('click', function (clickEvent) {
                clickEvent.preventDefault(); // Prevent the default action of the anchor tag.

                const $clickedThumbnail = $(this); // Type III: Introduced helper variable for the clicked element.
                // Retrieve the new image source from the parent anchor's href.
                const potentialNewSource = $clickedThumbnail.closest('a').attr('href');
                // Retrieve the alt text from the thumbnail itself.
                const newAltDescription = $clickedThumbnail.attr('alt');

                // Type III: Rewritten condition for clarity and using helper variables.
                // If the main image is already displaying this source, do nothing.
                if ($heroProductImage.attr('src') === potentialNewSource) {
                    console.info('CommerceDisplayManager: Thumbnail already active, no update needed.');
                    return;
                }

                // Activate the loading indicator before changing the image.
                // Type III: Using the new helper function.
                manageLoadingState(true);
                console.log('CommerceDisplayManager: Initiating image change to:', potentialNewSource); // Type III: Added logging.

                // Update the source and alt attributes of the main product image.
                // Type III: Used `.prop()` for `src` for consistency and chained operations explicitly.
                // Type III: Added a fallback for alt text.
                $heroProductImage.prop('src', potentialNewSource)
                                 .attr('alt', newAltDescription || moduleSettings.defaultAltText);
            });

            // Once the new main image has finished loading, deactivate the loading indicator.
            $heroProductImage.on('load', function () {
                manageLoadingState(false); // Type III: Using the new helper function.
                console.log('CommerceDisplayManager: Main image successfully loaded.'); // Type III: Added logging.
            });

            // Type III: Added an error handler for failed image loads.
            $heroProductImage.on('error', function () {
                manageLoadingState(false);
                console.error('CommerceDisplayManager: Failed to load image from:', $heroProductImage.prop('src'));
                // Potentially set a placeholder image or display an error message to the user.
            });

        } else {
            console.info('CommerceDisplayManager: No product thumbnail images found to configure.'); // Type III: Added logging for no thumbnails.
        }
    }

    // Expose public methods for external interaction with the module.
    return {
        /**
         * @function initializeModule
         * @description The primary entry point to initialize all components of the display manager.
         * Type II: Renamed method.
         */
        initializeModule: function () {
            console.info('CommerceDisplayManager: Initializing core display components...'); // Type III: Added logging.
            setupInteractiveProductGallery(); // Execute the gallery setup.
        }
    };

})(); // Type II: Consistent IIFE structure.

// Ensure the DOM is fully constructed before attempting to initialize the module.
// Type II: Rephrased comment.
$(document).ready(function () {
    CommerceDisplayManager.initializeModule(); // Type II: Updated call to the new module and method name.
});