/*
 * @class     frameSource
 * @classdesc This Angular attribute directive manages the 'src' attribute for images
 *   within a modal context. It is responsible for appropriately scaling the
 *   image element and its containing layout components inside the modal window.
 * @memberOf  pictureFrame
 */
angular.module('pictureFrame').directive('frameSource', [
    '$browserWindow',
    'AssetFetcher',
    'VisualFrame',
    function ( $browserWindow , AssetFetcher , VisualFrame ) {

        // Determine the final render dimensions for an image.
        // Overlapping maximums will take precedence over minimums.
        var determineVisualBounds = function ( sizeSpecs ) {
            var initialWidth = sizeSpecs.initialWidth;
            var initialHeight = sizeSpecs.initialHeight;
            var minimumWidth = sizeSpecs.minimumWidth;
            var minimumHeight = sizeSpecs.minimumHeight;
            var maximumWidth = sizeSpecs.maximumWidth;
            var maximumHeight = sizeSpecs.maximumHeight;

            var outputWidth = initialWidth;
            var outputHeight = initialHeight;

            // Scale the asset if its current size is below minimums
            if ( initialWidth < minimumWidth && initialHeight < minimumHeight ) {
                // Asset is both too narrow and too short.
                // Compare aspect ratios to decide whether to prioritize min-width or min-height.
                if ( initialWidth / initialHeight > maximumWidth / maximumHeight ) {
                    outputHeight = minimumHeight;
                    outputWidth = Math.round( initialWidth * minimumHeight / initialHeight );
                } else {
                    outputWidth = minimumWidth;
                    outputHeight = Math.round( initialHeight * minimumWidth / initialWidth );
                }
            } else if ( initialWidth < minimumWidth ) {
                // Asset is only too narrow
                outputWidth = minimumWidth;
                outputHeight = Math.round( initialHeight * minimumWidth / initialWidth );
            } else if ( initialHeight < minimumHeight ) {
                // Asset is only too short
                outputHeight = minimumHeight;
                outputWidth = Math.round( initialWidth * minimumHeight / initialWidth );
            }

            // Scale the asset if its current size exceeds maximums
            if ( initialWidth > maximumWidth && initialHeight > maximumHeight ) {
                // Asset is both too broad and too tall.
                // Compare aspect ratios to decide whether to prioritize max-width or max-height.
                if ( initialWidth / initialHeight > maximumWidth / maximumHeight ) {
                    outputWidth = maximumWidth;
                    outputHeight = Math.round( initialHeight * maximumWidth / initialWidth );
                } else {
                    outputHeight = maximumHeight;
                    outputWidth = Math.round( initialWidth * maximumHeight / initialHeight );
                }
            } else if ( initialWidth > maximumWidth ) {
                // Asset is only too broad
                outputWidth = maximumWidth;
                outputHeight = Math.round( initialHeight * maximumWidth / initialWidth );
            } else if ( initialHeight > maximumHeight ) {
                // Asset is only too tall
                outputHeight = maximumHeight;
                outputWidth = Math.round( initialWidth * minimumHeight / initialHeight );
            }

            return {
                'visualWidth': outputWidth || 0,
                'visualHeight': outputHeight || 0 // Handle cases where initialWidth might be zero, resulting in NaN
            };
        };

        // Store the dimensions of the currently displayed image
        var currentAssetWidth = 0;
        var currentAssetHeight = 0;

        return {
            'link': function ( viewScope , domElement , htmlAttributes ) {
                // This function recalibrates the image element's size and its surrounding modal
                var adjustFrameAndContent = function () {
                    // Obtain the current viewport dimensions
                    var browserWindowWidth = $browserWindow.innerWidth;
                    var browserWindowHeight = $browserWindow.innerHeight;

                    // Calculate the max/min boundary conditions for the image content
                    var contentSizeConstraints = VisualFrame.computeContentRestrictions({
                        'browserWindowWidth': browserWindowWidth,
                        'browserWindowHeight': browserWindowHeight,
                        'contentWidth': currentAssetWidth,
                        'contentHeight': currentAssetHeight
                    });

                    // Compute the dimensions for rendering the image content
                    var renderedContentDimensions = determineVisualBounds(
                        angular.extend({
                            'initialWidth': currentAssetWidth,
                            'initialHeight': currentAssetHeight,
                            'minimumWidth': 1,
                            'minimumHeight': 1,
                            'maximumWidth': 3000,
                            'maximumHeight': 3000,
                        }, contentSizeConstraints)
                    );

                    // Determine the required dimensions for the overall modal container
                    var containerPanelDimensions = VisualFrame.computePanelMeasures({
                        'browserWindowWidth': browserWindowWidth,
                        'browserWindowHeight': browserWindowHeight,
                        'contentRenderWidth': renderedContentDimensions.visualWidth,
                        'contentRenderHeight': renderedContentDimensions.visualHeight
                    });

                    // Apply the new dimensions to the image element
                    domElement.css({
                        'width': renderedContentDimensions.visualWidth + 'px',
                        'height': renderedContentDimensions.visualHeight + 'px'
                    });

                    // Set the width for the modal-dialog.
                    // Note: Setting height on .modal-dialog does not properly expand the background div (.modal-content).
                    angular.element(
                        document.querySelector('.picture-frame-modal .dialog-box')
                    ).css({
                        'width': containerPanelDimensions.visualWidth + 'px'
                    });

                    // The .modal-content element typically lacks a specified width.
                    // If width is only applied to .modal-content, .modal-dialog might retain its default size (e.g., 600px),
                    // causing .modal-content to appear off-center.
                    angular.element(
                        document.querySelector('.picture-frame-modal .dialog-content')
                    ).css({
                        'height': containerPanelDimensions.visualHeight + 'px'
                    });
                };

                // Monitor changes to the directive's attribute to load new images
                viewScope.$watch(function () {
                    return htmlAttributes.frameSource;
                }, function ( sourceURL ) {
                    // Temporarily set the image source to a blank/invalid URL to clear it,
                    // preventing visual artifacts during resizing. See: http://stackoverflow.com/questions/5775469
                    domElement[0].src = '//:0';

                    AssetFetcher.fetchAsset( sourceURL ).then(function ( loadedAsset ) {
                        // These asset dimensions must be updated before 'adjustFrameAndContent' is called,
                        // as they are used within that function.
                        currentAssetWidth = loadedAsset.naturalWidth;
                        currentAssetHeight = loadedAsset.naturalHeight;

                        // Re-evaluate and apply sizes to the image element and its containing modal
                        adjustFrameAndContent();

                        // Finally, display the actual loaded image
                        domElement[0].src = sourceURL;
                    });
                });

                // Attach an event listener to re-adjust image and modal dimensions when the browser window is resized
                angular.element($browserWindow).on('resize', adjustFrameAndContent);
            }
        };
    }
]);