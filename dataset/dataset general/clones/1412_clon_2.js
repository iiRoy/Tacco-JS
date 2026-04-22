var mediaScaler = mediaScaler || {VERSION: '1.0.0'};
mediaScaler.bgCoverSupported = false;
mediaScaler.bgCheckPerformed = false;
mediaScaler.embeddedStyles = '.mediaScaler img { visibility: hidden; }';

(function ($) {

    // ____________________________________________________________________

    // Function to determine if 'background-size: cover' is supported by the browser.
    function verifyBackgroundSizeSupport() {
        if (mediaScaler.bgCheckPerformed) return;
        else mediaScaler.bgCheckPerformed = true;

        var testElement = $('<span style="background-size:cover" />');
        $(document.body).append(testElement);

        (function () {
            var styleTester = testElement[0];
            if (!styleTester || !window.getComputedStyle) { /* Exit if DOM element or getComputedStyle is unavailable */ return; }
            var computedStyleInfo = window.getComputedStyle(styleTester, null);
            if (!computedStyleInfo || !computedStyleInfo.backgroundSize) { /* Exit if style cannot be retrieved */ return; }
            mediaScaler.bgCoverSupported = (computedStyleInfo.backgroundSize === 'cover');
        })();

        testElement.remove();
    }

    // ____________________________________________________________________

    // Extend jQuery prototype with the image scaling plugin.
    $.fn.extend({
        mediaScaler: function (pluginOptions) {

            this.baseSettings = {
                fitToContainer: true,
                verticalPosition: 'center',         // 'top' | 'bottom' | '50%' | '10%'
                horizontalPosition: 'center',       // 'left' | 'right' | '50%' | '10%'
                enableCssBackground: true,
                readHtmlDataAttributes: true,

                dynamicResize: true,               /* Used only with fallback methods (older browsers) */
                initialDelay: 0,                   /* Used only with fallback methods (older browsers) */
                fadeDuration: 0,                   /* Used only with fallback methods (older browsers) */
                clearContainerBg: true,            /* Used only with fallback methods (older browsers) */
                strictPixelSizing: true,           /* Used only with fallback methods (older browsers) */
                resizePollInterval: 500,           /* Time in ms to check for container resize */
                visibilityPollInterval: 500,       /* Time in ms to recheck visibility/load status */

                // CUSTOM CALLBACKS
                onPluginInit: null,                // No parameters
                onAllItemsProcessed: null,         // No parameters
                onItemBegin: null,                 // Parameters: (index, container, image)
                onItemComplete: null,              // Parameters: (index, container, image)
                onItemFailure: null                // Parameters: (index, container, image)
            };

            verifyBackgroundSizeSupport();
            var pluginContext = this;

            // Merge global and user-provided settings
            this.currentOptions = pluginOptions;
            this.activeSettings = $.extend({}, this.baseSettings, this.currentOptions);

            // Execute the initial callback if provided
            if (this.activeSettings.onPluginInit) this.activeSettings.onPluginInit();

            // ____________________________________________________________________

            // Iterate over each selected element
            return this.each(function (itemIndex) {

                // MAIN processing loop for each image
                var currentSettings = pluginContext.activeSettings,
                    containerElement = $(this),
                    imageElement = $('img:first', containerElement);

                // If no image is found, trigger error and exit
                if (!imageElement.length) { handleItemError(); return; }

                // Apply specific settings for this item
                if (!imageElement.data('scalerSettings')) {
                    // First time processing: merge with root settings and data attributes
                    currentSettings = $.extend({}, pluginContext.activeSettings, retrieveOverridingSettings());
                } else {
                    // Re-processing: restore previous settings and merge with current options
                    containerElement.removeClass('scaler-error').removeClass('scaler-ready');
                    currentSettings = $.extend({}, imageElement.data('scalerSettings'), pluginContext.currentOptions);
                }
                imageElement.data('scalerSettings', currentSettings);

                // Trigger item-specific start callback
                if (currentSettings.onItemBegin) currentSettings.onItemBegin(itemIndex, containerElement, imageElement);

                // Choose processing method based on browser support and settings
                if (mediaScaler.bgCoverSupported && currentSettings.enableCssBackground)
                    applyCssBackgroundMethod();
                else
                    applyFallbackMethod();

                // END MAIN processing for item

                // ____________________________________________________________________

                // Applies CSS background-size properties for modern browsers
                function applyCssBackgroundMethod() {

                    // Check if image source needs to be updated in background-image
                    if (containerElement.css('background-image').indexOf(encodeURI(imageElement.attr('src'))) === -1) {
                        containerElement.css({'background-image': 'url("' + encodeURI(imageElement.attr('src')) + '")'});
                    }

                    // Set background-size and position
                    containerElement.css({
                        'background-size':          (currentSettings.fitToContainer) ? 'cover' : 'contain',
                        'background-position':      (currentSettings.horizontalPosition + ' ' + currentSettings.verticalPosition).toLowerCase(),
                        'background-repeat':        'no-repeat'
                    });

                    // Ensure any links within the container cover the entire area
                    containerElement.find('a:first').css({
                        'display':  'block',
                        'width':    '100%',
                        'height':   '100%'
                    });

                    // Hide the actual <img> tag
                    containerElement.find('img').css({'display': 'none'});

                    // Trigger item complete callback
                    if (currentSettings.onItemComplete) currentSettings.onItemComplete(itemIndex, containerElement, imageElement);

                    containerElement.addClass('scaler-bg-cover');
                    containerElement.addClass('scaler-ready');
                    checkAllDone(); // Check if all items are processed
                }

                // ____________________________________________________________________

                // Fallback method for older browsers or when background-size is disabled
                function applyFallbackMethod() {

                    // If image source has changed, re-initialize the image element
                    if (imageElement.data('previousSource') && imageElement.data('previousSource') !== imageElement.attr('src')) {

                        // Clone and reset image attributes to avoid issues
                        var clonedImage = imageElement.clone().removeAttr('style');
                        clonedImage.data('scalerSettings', imageElement.data('scalerSettings'));
                        imageElement.parent().prepend(clonedImage);
                        imageElement.remove();
                        imageElement = clonedImage;
                        imageElement[0].width = 0; // Reset width to force re-evaluation

                        // Re-process after a short delay
                        setTimeout(applyFallbackMethod, 10);
                        return;
                    }

                    // If already processed, just re-run the sizing
                    if (imageElement.data('fallbackProcessed')) {
                        executeFallbackProcessing(); return;
                    }

                    // Store initial data for tracking
                    imageElement.data('fallbackProcessed', false);
                    imageElement.data('previousSource', imageElement.attr('src'));

                    // Hide any other images within the container
                    containerElement.find('img:not(:first)').css('display', 'none');

                    // Apply base CSS for processing
                    containerElement.css({'overflow': 'hidden'});
                    imageElement.fadeTo(0, 0).removeAttr('width').removeAttr('height').css({
                        'visibility': 'visible',
                        'max-width': 'none',
                        'max-height': 'none',
                        'width': 'auto',
                        'height': 'auto',
                        'display': 'block'
                    });

                    // Attach error handler
                    imageElement.on('error', handleItemError);
                    imageElement[0].onerror = handleItemError;

                    // Loop until image is fully loaded and visible
                    function waitForImageLoad() {
                        if (imageElement.data('hadError') || imageElement.data('isLoaded') || imageElement.data('fallbackProcessed')) return;
                        if (containerElement.is(':visible') && imageElement[0].complete && imageElement[0].width > 0 && imageElement[0].height > 0) {
                            imageElement.data('isLoaded', true);
                            setTimeout(executeFallbackProcessing, itemIndex * currentSettings.initialDelay);
                        } else {
                            setTimeout(waitForImageLoad, currentSettings.visibilityPollInterval);
                        }
                    }

                    waitForImageLoad();
                    monitorContainerResize(); // Start monitoring for container size changes
                }

                // ____________________________________________________________________

                // Monitors the container for resize events for responsive behavior
                function monitorContainerResize() {

                    // Only applicable for fallback method (CSS background-size handles responsiveness natively)
                    if (!currentSettings.dynamicResize && !imageElement.data('fallbackProcessed')) return;
                    if (!imageElement.data('scalerSettings')) return;

                    currentSettings = imageElement.data('scalerSettings'); // Re-read current settings

                    containerElement.currentDimensions = containerElement.get(0).offsetWidth + (containerElement.get(0).offsetHeight / 10000); // Small offset to detect height changes
                    if (containerElement.previousDimensions && containerElement.currentDimensions !== containerElement.previousDimensions) {
                        executeFallbackProcessing(); // Re-process if size changed
                    }

                    containerElement.previousDimensions = containerElement.currentDimensions;
                    setTimeout(monitorContainerResize, currentSettings.resizePollInterval);
                }

                // ____________________________________________________________________

                // Handles errors during image loading
                function handleItemError() {
                    imageElement.data('hadError', true);
                    containerElement.addClass('scaler-error');
                    if (currentSettings.onItemFailure) currentSettings.onItemFailure(itemIndex, containerElement, imageElement);
                    checkAllDone(); // Check if all items are processed
                }

                // ____________________________________________________________________

                // Retrieves data attributes that override default settings
                function retrieveOverridingSettings() {
                    var overriddenConfiguration = {};

                    if (pluginContext.activeSettings.readHtmlDataAttributes) {
                        var fillData = containerElement.attr('data-scaler-fill'),
                            horizAlignData = containerElement.attr('data-scaler-horiz-align'),
                            vertAlignData = containerElement.attr('data-scaler-vert-align');

                        if (fillData === 'true' || fillData === 'false') overriddenConfiguration.fitToContainer = Boolean(fillData === 'true');
                        if (horizAlignData !== undefined && (horizAlignData === 'left' || horizAlignData === 'center' || horizAlignData === 'right' || horizAlignData.indexOf('%') !== -1)) overriddenConfiguration.horizontalPosition = horizAlignData;
                        if (vertAlignData !== undefined && (vertAlignData === 'top' || vertAlignData === 'bottom' || vertAlignData === 'center' || vertAlignData.indexOf('%') !== -1)) overriddenConfiguration.verticalPosition = vertAlignData;
                    }

                    // Specific handling for IE for fade-in animations
                    if (mediaScaler.isInternetExplorer && pluginContext.activeSettings.ieFadeDisabled) overriddenConfiguration.fadeDuration = 0;
                    return overriddenConfiguration;
                }

                // ____________________________________________________________________

                // Executes the image sizing logic for the fallback method
                function executeFallbackProcessing() {

                    // Variables for dimensions and alignment
                    var widthValue, heightValue, calculatedWidth, calculatedHeight,
                        horizAlignment, vertAlignment, horizDiff, vertDiff,
                        marginTopValue = 0,
                        marginLeftValue = 0,
                        containerWidth = containerElement.width(),
                        containerHeight = containerElement.height();

                    // Store original image dimensions if not already
                    if (imageElement.data('originalWidth') === undefined) imageElement.data('originalWidth', imageElement[0].width);
                    if (imageElement.data('originalHeight') === undefined) imageElement.data('originalHeight', imageElement[0].height);

                    // Determine dimensions based on 'fitToContainer' setting
                    if (currentSettings.fitToContainer === (containerWidth / containerHeight) >= (imageElement.data('originalWidth') / imageElement.data('originalHeight'))) {
                        widthValue = '100%';
                        heightValue = 'auto';
                        calculatedWidth = Math.floor(containerWidth);
                        calculatedHeight = Math.floor(containerWidth * (imageElement.data('originalHeight') / imageElement.data('originalWidth')));
                    } else {
                        widthValue = 'auto';
                        heightValue = '100%';
                        calculatedWidth = Math.floor(containerHeight * (imageElement.data('originalWidth') / imageElement.data('originalHeight')));
                        calculatedHeight = Math.floor(containerHeight);
                    }

                    // Calculate horizontal alignment
                    horizAlignment = currentSettings.horizontalPosition.toLowerCase();
                    horizDiff = containerWidth - calculatedWidth;
                    if (horizAlignment === 'left') marginLeftValue = 0;
                    if (horizAlignment === 'center') marginLeftValue = horizDiff * 0.5;
                    if (horizAlignment === 'right') marginLeftValue = horizDiff;
                    if (horizAlignment.indexOf('%') !== -1) {
                        horizAlignment = parseInt(horizAlignment.replace('%', ''), 10);
                        if (horizAlignment > 0) marginLeftValue = horizDiff * horizAlignment * 0.01;
                    }

                    // Calculate vertical alignment
                    vertAlignment = currentSettings.verticalPosition.toLowerCase();
                    vertDiff = containerHeight - calculatedHeight;
                    if (vertAlignment === 'top') marginTopValue = 0;
                    if (vertAlignment === 'center') marginTopValue = vertDiff * 0.5;
                    if (vertAlignment === 'bottom') marginTopValue = vertDiff;
                    if (vertAlignment.indexOf('%') !== -1) {
                        vertAlignment = parseInt(vertAlignment.replace('%', ''), 10);
                        if (vertAlignment > 0) marginTopValue = vertDiff * vertAlignment * 0.01;
                    }

                    // Apply calculated CSS to the image
                    if (currentSettings.strictPixelSizing) { widthValue = calculatedWidth; heightValue = calculatedHeight; }
                    imageElement.css({
                        'width': widthValue,
                        'height': heightValue,
                        'margin-left': Math.floor(marginLeftValue),
                        'margin-top': Math.floor(marginTopValue)
                    });

                    // First-time specific actions (fade-in, class additions)
                    if (!imageElement.data('fallbackProcessed')) {
                        imageElement.fadeTo(currentSettings.fadeDuration, 1);
                        imageElement.data('fallbackProcessed', true);
                        if (currentSettings.clearContainerBg) containerElement.css('background-image', 'none');
                        containerElement.addClass('scaler-no-bg-cover');
                        containerElement.addClass('scaler-ready');
                    }

                    // Trigger item complete callback
                    if (currentSettings.onItemComplete) currentSettings.onItemComplete(itemIndex, containerElement, imageElement);
                    checkAllDone(); // Check if all items are processed
                }

                // ____________________________________________________________________

                // Checks if all items in the collection have been processed and calls the final callback
                function checkAllDone() {
                    if (itemIndex === pluginContext.length - 1) {
                        if (pluginContext.activeSettings.onAllItemsProcessed) {
                            pluginContext.activeSettings.onAllItemsProcessed();
                        }
                    }
                }

            }); // End of each loop
        }
    }); // End of $.fn.extend

})(jQuery); // End of IIFE with jQuery alias

// Inject necessary CSS styles into the document head
(function () {
    var cssContent = mediaScaler.embeddedStyles,
        documentHead = document.getElementsByTagName('head')[0],
        styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    if (styleElement.styleSheet) { // For IE
        styleElement.styleSheet.cssText = cssContent;
    } else { // For other browsers
        styleElement.appendChild(document.createTextNode(cssContent));
    }
    documentHead.appendChild(styleElement);
})();