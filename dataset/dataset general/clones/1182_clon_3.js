if (typeof jQuery === 'undefined') {
    throw new Error("Responsive Background Image Plugin requires jQuery to operate.");
}

(function($) {
    // --- Plugin Configuration Storage ---
    // This object holds the current active settings for the background image management.
    // It is deliberately designed as a shared variable within this closure, emulating
    // the original plugin's `jqez` global approach. This means subsequent calls to
    // the plugin will overwrite previous configurations for the singleton background.
    let _activeBackgroundSettings = {};

    // --- Internal Utility: Recalculates and Applies Image Dimensions ---
    // This function is the core logic for ensuring the background image
    // correctly fills the viewport, maintaining its aspect ratio.
    // It's invoked upon initial setup and whenever the window is resized.
    const adjustImageDisplay = function() {
        // Locate the main container element for the background.
        const backgroundWrapper = $(`#${_activeBackgroundSettings.containerElementId}`);

        // If the wrapper isn't found, there's nothing to adjust.
        if (backgroundWrapper.length === 0) {
            // console.warn("Background wrapper element not found. Skipping image dimension adjustment.");
            return;
        }

        // Get the actual image tag within the wrapper.
        const targetImage = backgroundWrapper.children('img');

        // Apply fundamental CSS properties to the wrapper.
        backgroundWrapper.css({
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': '-1000', // Ensure it's deep behind all other content
            'overflow': 'hidden',
            'width': `${$(window).width()}px`,
            'height': `${$(window).height()}px`,
            'opacity': _activeBackgroundSettings.displayOpacity // Apply configured opacity
        });

        // Position the image relatively within its container to allow for centering.
        targetImage.css('position', 'relative');

        // --- Aspect Ratio and Scaling Logic ---
        // Retrieve the stored original dimensions of the image.
        const actualImageWidth = _activeBackgroundSettings.originalWidth;
        const actualImageHeight = _activeBackgroundSettings.originalHeight;

        // Get the current dimensions of the browser viewport.
        const currentViewportWidth = $(window).width();
        const currentViewportHeight = $(window).height();

        let appliedImageWidth;
        let appliedImageHeight;

        // Calculate aspect ratios for both the image and the viewport.
        const imageAspectRatio = actualImageWidth / actualImageHeight;
        const viewportAspectRatio = currentViewportWidth / currentViewportHeight;

        // Decide whether to scale primarily by width or height to ensure the viewport is covered.
        if (viewportAspectRatio > imageAspectRatio) {
            // Viewport is wider relative to the image; scale image width to match viewport.
            appliedImageWidth = currentViewportWidth;
            appliedImageHeight = Math.round(currentViewportWidth / imageAspectRatio);
        } else {
            // Viewport is taller relative to the image; scale image height to match viewport.
            appliedImageHeight = currentViewportHeight;
            appliedImageWidth = Math.round(currentViewportHeight * imageAspectRatio);
        }

        // Apply the calculated dimensions to the image element.
        targetImage.css({
            'width': `${appliedImageWidth}px`,
            'height': `${appliedImageHeight}px`
        });

        // --- Image Centering Feature ---
        // If the 'centerImage' option is enabled, adjust the image's top/left
        // positions to ensure it appears centered within the viewport.
        if (_activeBackgroundSettings.centerImage) {
            const isImageWiderThanViewport = appliedImageWidth > currentViewportWidth;
            const isImageTallerThanViewport = appliedImageHeight > currentViewportHeight;

            let horizontalShift = 0;
            let verticalShift = 0;

            if (isImageWiderThanViewport) {
                horizontalShift = (appliedImageWidth - currentViewportWidth) / 2;
            }
            if (isImageTallerThanViewport) {
                verticalShift = (appliedImageHeight - currentViewportHeight) / 2;
            }

            targetImage.css({
                'left': `${-horizontalShift}px`,
                'top': `${-verticalShift}px`
            });
        } else {
            // If centering is disabled, ensure the image is aligned to the top-left.
            targetImage.css({
                'left': '0',
                'top': '0'
            });
        }

        // After all sizing and positioning, make the background wrapper visible.
        backgroundWrapper.css('visibility', 'visible');

        // Reset the body's overflow property to allow normal page scrolling.
        $('body').css('overflow', 'auto');
    };

    // --- jQuery Plugin Definition ---
    // Extends jQuery's prototype to provide the new 'fullScreenImage' plugin.
    $.fn.fullScreenImage = function(userProvidedOptions) {
        // Define the default configuration settings for the plugin.
        const defaultPluginOptions = {
            imageSources: [], // Can be a single string or an array of image URLs.
            displayOpacity: 1, // Opacity level for the background image (0.0 to 1.0).
            centerImage: true, // Boolean: If true, the image will be centered.
            containerElementId: 'full_screen_background_div', // ID for the background container.
            containerElementClass: 'responsive-background-wrapper', // CSS class for the container.
            initialFadeInDuration: 0 // Duration in milliseconds for a fade-in effect.
        };

        // Merge the default options with any user-provided options.
        // This creates the final configuration object for the current plugin call.
        _activeBackgroundSettings = $.extend(true, {}, defaultPluginOptions, userProvidedOptions);

        // --- Input Validation and Normalization ---
        // Ensure 'imageSources' is always an array for consistent handling.
        if (typeof _activeBackgroundSettings.imageSources === 'string') {
            _activeBackgroundSettings.imageSources = [_activeBackgroundSettings.imageSources];
        } else if (!$.isArray(_activeBackgroundSettings.imageSources)) {
            console.error("The 'imageSources' option must be a string or an array of strings.");
            return this; // Return chainable jQuery object.
        }

        // Guard clause: Exit if no valid image source is provided.
        if (_activeBackgroundSettings.imageSources.length === 0 || !_activeBackgroundSettings.imageSources[0]) {
            console.warn("No primary image source specified for the fullScreenImage plugin. Operation aborted.");
            return this;
        }

        // --- Image Preloading and Setup ---
        // Create an in-memory image element to preload the background image.
        // This allows us to fetch its natural dimensions before it's displayed.
        const temporaryImageLoader = $('<img/>');

        temporaryImageLoader.on('load', function() {
            // Store the true original dimensions of the loaded image.
            _activeBackgroundSettings.originalWidth = this.naturalWidth || this.width;
            _activeBackgroundSettings.originalHeight = this.naturalHeight || this.height;

            // --- DOM Construction for Background ---
            // Check if the background container already exists in the DOM.
            let backgroundContainer = $(`#${_activeBackgroundSettings.containerElementId}`);

            if (backgroundContainer.length === 0) {
                // If it doesn't exist, create it and append to the body.
                backgroundContainer = $('<div>')
                    .attr('id', _activeBackgroundSettings.containerElementId)
                    .addClass(_activeBackgroundSettings.containerElementClass)
                    .css({ 'visibility': 'hidden' }) // Keep hidden during initial setup
                    .appendTo('body');
            }

            // Construct the image element to be placed inside the container.
            const displayImageElement = $('<img>')
                .attr('src', _activeBackgroundSettings.imageSources[0])
                .attr('alt', 'Dynamic Background Image'); // Add an alt attribute for accessibility.

            // Clear existing content and append the new image.
            backgroundContainer.empty().append(displayImageElement);

            // Temporarily hide body overflow to prevent scrollbar issues during initial resize.
            $('body').css('overflow', 'hidden');

            // Execute the initial dimension adjustment.
            adjustImageDisplay();

            // Apply a fade-in effect if a duration is specified.
            if (_activeBackgroundSettings.initialFadeInDuration > 0) {
                backgroundContainer.css('opacity', 0).animate({ opacity: _activeBackgroundSettings.displayOpacity }, _activeBackgroundSettings.initialFadeInDuration);
            }

        }).on('error', function() {
            // Handle cases where the image fails to load.
            console.error(`Failed to load background image from: ${_activeBackgroundSettings.imageSources[0]}`);
            // Ensure body overflow is reset even if the image fails.
            $('body').css('overflow', 'auto');
        }).attr('src', _activeBackgroundSettings.imageSources[0]); // Initiate image loading.

        // --- Responsive Event Handling ---
        // Attach a debounced resize event handler to the window.
        // Debouncing prevents the resize function from firing too rapidly,
        // which can cause performance issues during continuous resizing.
        let resizeTimeoutIdentifier;
        $(window).on('resize.fullScreenImageEffect', function() {
            clearTimeout(resizeTimeoutIdentifier);
            resizeTimeoutIdentifier = setTimeout(adjustImageDisplay, 120); // Wait 120ms after resizing stops.
        });

        return this; // Preserve jQuery chainability.
    };

    // --- Public Method: Plugin Cleanup ---
    // Provides a way to explicitly remove the background image and its related elements
    // and unbind event listeners, cleaning up the DOM and event space.
    $.fn.fullScreenImage.destroy = function() {
        const containerToRemoveId = _activeBackgroundSettings.containerElementId || 'full_screen_background_div';
        $(`#${containerToRemoveId}`).remove(); // Remove the background container.
        $(window).off('resize.fullScreenImageEffect'); // Unbind the specific resize event.
        $('body').css('overflow', 'auto'); // Restore body overflow to default.
        _activeBackgroundSettings = {}; // Clear the plugin's configuration.
        // console.log("Full screen background image plugin destroyed.");
    };

})(jQuery);