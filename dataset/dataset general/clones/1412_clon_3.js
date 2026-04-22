/**
 * contentResizer v1.0.0 / 2024-07-20
 * jQuery plugin to intelligently scale images within their parent containers.
 * Copyright (c) 2012 Alejandro Emparan (karacas) @krc_ale (Original Author)
 * Modified by AI Assistant (Clone Generator)
 * Dual licensed under the MIT and GPL licenses
 * https://github.com/karacas/imgLiquid (Original Project)
 **/
/*
  Usage Examples:
    _jq('.media-frame').mediaFit({mode: 'cover'});

  Configuration Options (JavaScript):
    mode:               'cover' | 'contain'  // Default: 'cover' (fill: true in original)
    verticalPlacement:  'center' | 'top' | 'bottom' | '50%' | '10%'
    horizontalPlacement:'center' | 'left' | 'right' | '50%' | '10%'

  Callback Functions:
    onProcessingStart:  function(){},
    onProcessingEnd:    function(){},
    onItemProcessStart: function(idx, wrapper, imgObj){},
    onItemProcessEnd:   function(idx, wrapper, imgObj){}

  HTML5 Data Attributes (override JS settings):
    data-resize-mode='contain'
    data-resize-align-x='right'
    data-resize-align-y='bottom'
*/
//
var mediaResizer = mediaResizer || {VERSION: '1.0.0_CLONE'};
mediaResizer.bgSupportDetected = false;
mediaResizer.bgCheckInitiated = false;
mediaResizer.styleInjection = '.image-container-target img { visibility: hidden; }';


(function (_jq) { // Renamed jQuery alias to _jq

    // Utility function to determine if 'background-size' CSS property is available
    function verifyBackgroundSizeCapability() {
        // Prevent redundant checks
        if (mediaResizer.bgCheckInitiated) {
            return;
        } else {
            mediaResizer.bgCheckInitiated = true;
        }

        // Create a temporary element to test CSS property support
        const tempBgSpan = _jq('<span style="background-size:cover; position:absolute; visibility:hidden; display:block; width:1px; height:1px;" />');
        _jq('body').append(tempBgSpan);

        // Immediately-invoked function expression for scope
        (function () {
            const computedElement = tempBgSpan[0];
            // Ensure the element exists and getComputedStyle is available
            if (!computedElement || !window.getComputedStyle) {
                return;
            }
            const computedStyle = window.getComputedStyle(computedElement, null);
            // Check if backgroundSize property exists and is set to 'cover'
            if (!computedStyle || !computedStyle.backgroundSize) {
                return;
            }
            mediaResizer.bgSupportDetected = (computedStyle.backgroundSize === 'cover');
        })();

        // Clean up the temporary element
        tempBgSpan.remove();
    }


    // Extend jQuery's prototype with our new plugin
    _jq.fn.augmentPlugin = function (pluginMethods) { // Renamed extend to augmentPlugin
        _jq.extend(true, _jq.fn, pluginMethods); // Using deep extend
    };

    _jq.fn.augmentPlugin({ // Renamed imgLiquid to mediaFit
        mediaFit: function (userOptions) {

            // Define default configuration for the plugin
            this.defaultSettings = {
                mode: 'cover', // Corresponds to 'fill'
                verticalPlacement: 'center',
                horizontalPlacement: 'center',
                useModernBackgroundSizing: true, // Corresponds to useBackgroundSize
                enableDataAttributes: true, // Corresponds to useDataHtmlAttr

                // Legacy method specific settings (for older browsers or when modern sizing is disabled)
                responsiveAdjustment: true,
                initialDelayMs: 0,
                fadeTransitionDuration: 0,
                clearContainerBackground: true,
                strictPixelDimensions: true,
                resizeMonitoringInterval: 500, // Time to check container resize
                visibilityRecheckInterval: 500, // Time to recheck image visibility/load status

                // Custom Callback Hooks
                onProcessingStart: null,
                onProcessingEnd: null,
                onItemProcessStart: null,
                onItemProcessEnd: null,
                onItemProcessError: null
            };

            // Run the background-size capability check once
            verifyBackgroundSizeCapability();
            const currentPluginInstance = this; // Store reference to the current jQuery object

            // Merge user-provided options with defaults
            this.passedOptions = userOptions;
            this.effectiveSettings = _jq.extend({}, this.defaultSettings, this.passedOptions);

            // Trigger global start callback if defined
            if (this.effectiveSettings.onProcessingStart) {
                this.effectiveSettings.onProcessingStart();
            }


            // Iterate over each selected element (image container)
            return this.each(function (itemIndex) {

                const currentSettings = _jq.extend(true, {}, currentPluginInstance.effectiveSettings); // Deep copy for per-item settings
                const containerElement = _jq(this);
                let targetImage = containerElement.find('img:first'); // Use find for clarity

                // Guard clause: if no image is found, log and exit for this item
                if (targetImage.length === 0) {
                    console.warn(`[mediaFit] No primary image found in container at index ${itemIndex}:`, containerElement[0]);
                    handleProcessingError(itemIndex, containerElement, null); // Call error handler for no-image case
                    return;
                }

                // Apply initial settings or re-apply on recall
                if (!targetImage.data('resizerConfig')) {
                    // First time processing this image
                    const attributeOverrides = retrieveDataAttributeOverrides(containerElement, currentSettings);
                    _jq.extend(true, currentSettings, attributeOverrides); // Merge data attributes
                } else {
                    // Re-processing: remove previous status classes
                    containerElement.removeClass('mediaFit_error').removeClass('mediaFit_ready');
                    // Re-extend settings with any new global options
                    _jq.extend(true, currentSettings, targetImage.data('resizerConfig'), currentPluginInstance.passedOptions);
                }
                // Store the final settings for this specific image
                targetImage.data('resizerConfig', currentSettings);

                // Trigger item-specific start callback
                if (currentSettings.onItemProcessStart) {
                    currentSettings.onItemProcessStart(itemIndex, containerElement, targetImage);
                }

                // Decide which processing method to use
                if (mediaResizer.bgSupportDetected && currentSettings.useModernBackgroundSizing) {
                    applyBackgroundStyle();
                } else {
                    utilizeLegacyMethod();
                }


                // -------------------------------------------------------------------
                // Function to apply modern background-size CSS properties
                function applyBackgroundStyle() {
                    const imageSource = targetImage.attr('src');
                    const encodedImageSource = encodeURIComponent(imageSource);
                    const currentBgImage = containerElement.css('background-image');

                    // Check if the background-image needs updating
                    if (currentBgImage.indexOf(encodedImageSource) === -1 && currentBgImage.indexOf(imageSource) === -1) {
                        containerElement.css('backgroundImage', `url('${imageSource}')`); // Use template literal for clarity
                    }

                    // Determine background-size based on 'mode' setting
                    const bgSizeValue = (currentSettings.mode === 'cover') ? 'cover' : 'contain';
                    // Combine horizontal and vertical alignment
                    const bgPositionValue = `${currentSettings.horizontalPlacement} ${currentSettings.verticalPlacement}`.toLowerCase();

                    containerElement.css({
                        'background-size': bgSizeValue,
                        'background-position': bgPositionValue,
                        'background-repeat': 'no-repeat'
                    });

                    // If the container has an anchor, ensure it covers the whole area
                    containerElement.find('a:first').css({
                        'display': 'block',
                        'width': '100%',
                        'height': '100%'
                    });

                    // Hide the original image element
                    targetImage.css('display', 'none');

                    // Add completion classes and trigger callback
                    containerElement.addClass('mediaFit_bgSized').addClass('mediaFit_ready');
                    if (currentSettings.onItemProcessEnd) {
                        currentSettings.onItemProcessEnd(itemIndex, containerElement, targetImage);
                    }
                    signalCompletion();
                }


                // -------------------------------------------------------------------
                // Function to handle image resizing for older browsers or disabled modern methods
                function utilizeLegacyMethod() {
                    const currentImageSrc = targetImage.attr('src');

                    // Check if image source has changed, requiring a re-initialization
                    if (targetImage.data('originalSource') && targetImage.data('originalSource') !== currentImageSrc) {
                        // Clone the image, remove styling, and replace the old one
                        const duplicatedImage = targetImage.clone(false).removeAttr('style').removeClass('mediaFit_ready'); // clone(false) keeps data, but not events
                        duplicatedImage.data('resizerConfig', targetImage.data('resizerConfig'));
                        targetImage.parent().prepend(duplicatedImage);
                        targetImage.remove();
                        targetImage = duplicatedImage;
                        targetImage[0].width = 0; // Reset width to force re-evaluation

                        // Re-process after a short delay
                        setTimeout(utilizeLegacyMethod, 15); // Slightly different delay
                        return;
                    }

                    // If already processed, just re-adjust dimensions
                    if (targetImage.data('legacyProcessed')) {
                        performLegacyResizing();
                        return;
                    }

                    // Mark as not yet processed (legacy method)
                    targetImage.data('legacyProcessed', false);
                    targetImage.data('originalSource', currentImageSrc);

                    // Hide any other images within the container (if multiple exist)
                    containerElement.find('img:not(:first)').css('display', 'none');

                    // Apply base CSS for image visibility and sizing
                    targetImage.css({
                        'visibility': 'visible',
                        'max-width': 'none',
                        'max-height': 'none',
                        'width': 'auto',
                        'height': 'auto',
                        'display': 'block',
                        'opacity': 0 // Start hidden for fade-in
                    }).removeAttr('width').removeAttr('height'); // Clear explicit width/height attributes

                    // Bind error handler
                    targetImage.on('error', function() { handleProcessingError(itemIndex, containerElement, targetImage); });
                    targetImage.get(0).onerror = function() { handleProcessingError(itemIndex, containerElement, targetImage); };


                    // Internal function to check image load status
                    function checkImageLoadStatus() {
                        const imgDomRef = targetImage.get(0);
                        // Prevent re-processing if error occurred or already loaded
                        if (targetImage.data('hadError') || targetImage.data('isLoaded') || targetImage.data('legacyProcessed')) {
                            return;
                        }

                        // Check if container is visible and image is fully loaded
                        if (containerElement.is(':visible') && imgDomRef.complete && imgDomRef.naturalWidth > 0 && imgDomRef.naturalHeight > 0) {
                            targetImage.data('isLoaded', true);
                            setTimeout(performLegacyResizing, itemIndex * currentSettings.initialDelayMs);
                        } else {
                            setTimeout(checkImageLoadStatus, currentSettings.visibilityRecheckInterval);
                        }
                    }

                    checkImageLoadStatus();
                    startResponsiveMonitoring(); // Begin monitoring container size changes
                }


                // -------------------------------------------------------------------
                // Function to monitor container resizing for legacy method
                function startResponsiveMonitoring() {
                    // Only applicable for legacy processing
                    if (!currentSettings.responsiveAdjustment && !targetImage.data('legacyProcessed')) {
                        return;
                    }
                    // Ensure settings are still available
                    if (!targetImage.data('resizerConfig')) {
                        return;
                    }

                    const storedSettings = targetImage.data('resizerConfig'); // Retrieve current settings
                    containerElement.currentCalculatedSize = containerElement.get(0).offsetWidth + (containerElement.get(0).offsetHeight * 0.0001); // Small offset to detect slight changes

                    // If container size has changed, re-process
                    if (containerElement.previousCalculatedSize && containerElement.currentCalculatedSize !== containerElement.previousCalculatedSize) {
                        performLegacyResizing();
                    }

                    containerElement.previousCalculatedSize = containerElement.currentCalculatedSize;
                    setTimeout(startResponsiveMonitoring, storedSettings.resizeMonitoringInterval);
                }


                // -------------------------------------------------------------------
                // Error handler for image loading issues
                function handleProcessingError(idx, wrapper, img) {
                    targetImage.data('hadError', true);
                    wrapper.addClass('mediaFit_error');
                    if (currentSettings.onItemProcessError) {
                        currentSettings.onItemProcessError(idx, wrapper, img);
                    }
                    signalCompletion();
                }


                // -------------------------------------------------------------------
                // Retrieves settings overrides from data attributes on the container
                function retrieveDataAttributeOverrides(wrapper, currentConfig) {
                    const attributeOverrides = {};

                    if (currentConfig.enableDataAttributes) {
                        const dataFill = wrapper.attr('data-resize-mode');
                        const dataHorizAlign = wrapper.attr('data-resize-align-x');
                        const dataVertAlign = wrapper.attr('data-resize-align-y');

                        // Update 'mode' (fill/contain)
                        if (dataFill === 'cover' || dataFill === 'contain') {
                            attributeOverrides.mode = dataFill;
                        }

                        // Update horizontal alignment
                        if (dataHorizAlign !== undefined && (dataHorizAlign === 'left' || dataHorizAlign === 'center' || dataHorizAlign === 'right' || dataHorizAlign.includes('%'))) {
                            attributeOverrides.horizontalPlacement = dataHorizAlign;
                        }

                        // Update vertical alignment
                        if (dataVertAlign !== undefined && (dataVertAlign === 'top' || dataVertAlign === 'bottom' || dataVertAlign === 'center' || dataVertAlign.includes('%'))) {
                            attributeOverrides.verticalPlacement = dataVertAlign;
                        }
                    }
                    return attributeOverrides;
                }


                // -------------------------------------------------------------------
                // Core resizing logic for legacy method
                function performLegacyResizing() {
                    let targetWidth, targetHeight, calculatedWidth, calculatedHeight,
                        horizontalAlignValue, verticalAlignValue,
                        horizontalDifference, verticalDifference,
                        marginTopValue = 0,
                        marginLeftValue = 0;

                    const containerWidth = containerElement.width();
                    const containerHeight = containerElement.height();

                    // Store original image dimensions if not already
                    if (targetImage.data('originalImgWidth') === undefined) {
                        targetImage.data('originalImgWidth', targetImage.get(0).naturalWidth);
                    }
                    if (targetImage.data('originalImgHeight') === undefined) {
                        targetImage.data('originalImgHeight', targetImage.get(0).naturalHeight);
                    }

                    const originalImageWidth = targetImage.data('originalImgWidth');
                    const originalImageHeight = targetImage.data('originalImgHeight');

                    // Compare aspect ratios to determine scaling
                    const containerRatio = containerWidth / containerHeight;
                    const imageRatio = originalImageWidth / originalImageHeight;

                    // If 'cover' mode or 'contain' mode with specific ratio conditions
                    if (currentSettings.mode === 'cover' ? (containerRatio >= imageRatio) : (containerRatio < imageRatio)) {
                        targetWidth = '100%';
                        targetHeight = 'auto';
                        calculatedWidth = Math.floor(containerWidth);
                        calculatedHeight = Math.floor(containerWidth * (originalImageHeight / originalImageWidth));
                    } else {
                        targetWidth = 'auto';
                        targetHeight = '100%';
                        calculatedWidth = Math.floor(containerHeight * (originalImageWidth / originalImageHeight));
                        calculatedHeight = Math.floor(containerHeight);
                    }

                    // Calculate horizontal alignment
                    horizontalAlignValue = currentSettings.horizontalPlacement.toLowerCase();
                    horizontalDifference = containerWidth - calculatedWidth;
                    if (horizontalAlignValue === 'left') {
                        marginLeftValue = 0;
                    } else if (horizontalAlignValue === 'center') {
                        marginLeftValue = horizontalDifference * 0.5;
                    } else if (horizontalAlignValue === 'right') {
                        marginLeftValue = horizontalDifference;
                    } else if (horizontalAlignValue.includes('%')) {
                        const percent = parseInt(horizontalAlignValue.replace('%', ''), 10);
                        if (percent > 0) marginLeftValue = horizontalDifference * (percent / 100);
                    }

                    // Calculate vertical alignment
                    verticalAlignValue = currentSettings.verticalPlacement.toLowerCase();
                    verticalDifference = containerHeight - calculatedHeight;
                    if (verticalAlignValue === 'top') {
                        marginTopValue = 0;
                    } else if (verticalAlignValue === 'center') {
                        marginTopValue = verticalDifference * 0.5;
                    } else if (verticalAlignValue === 'bottom') {
                        marginTopValue = verticalDifference;
                    } else if (verticalAlignValue.includes('%')) {
                        const percent = parseInt(verticalAlignValue.replace('%', ''), 10);
                        if (percent > 0) marginTopValue = verticalDifference * (percent / 100);
                    }

                    // Apply final CSS dimensions and positioning
                    if (currentSettings.strictPixelDimensions) {
                        targetWidth = calculatedWidth;
                        targetHeight = calculatedHeight;
                    }
                    targetImage.css({
                        'width': targetWidth,
                        'height': targetHeight,
                        'margin-left': Math.floor(marginLeftValue),
                        'margin-top': Math.floor(marginTopValue)
                    });

                    // Handle fade-in and cleanup on first legacy process
                    if (!targetImage.data('legacyProcessed')) {
                        targetImage.stop(true, true).animate({opacity: 1}, currentSettings.fadeTransitionDuration);
                        targetImage.data('legacyProcessed', true);
                        if (currentSettings.clearContainerBackground) {
                            containerElement.css('backgroundImage', 'none');
                        }
                        containerElement.addClass('mediaFit_legacySized').addClass('mediaFit_ready');
                    }

                    if (currentSettings.onItemProcessEnd) {
                        currentSettings.onItemProcessEnd(itemIndex, containerElement, targetImage);
                    }
                    signalCompletion();
                }


                // -------------------------------------------------------------------
                // Checks if all items have been processed and triggers global finish callback
                function signalCompletion() {
                    // This check assumes `this` in `each` refers to the original jQuery object,
                    // which has `length` for the total number of elements.
                    if (itemIndex === currentPluginInstance.length - 1) {
                        if (currentPluginInstance.effectiveSettings.onProcessingEnd) {
                            currentPluginInstance.effectiveSettings.onProcessingEnd();
                        }
                    }
                }
            });
        }
    });
})(jQuery);


// Automatically inject necessary CSS styles into the document head
(function () {
    const cssRules = mediaResizer.styleInjection;
    const documentHead = document.head || document.getElementsByTagName('head')[0];
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.setAttribute('id', 'mediaFit-dynamic-styles'); // Added ID for easier identification

    if (styleElement.styleSheet) { // IE-specific check
        styleElement.styleSheet.cssText = cssRules;
    } else {
        styleElement.appendChild(document.createTextNode(cssRules));
    }
    documentHead.appendChild(styleElement);
})();