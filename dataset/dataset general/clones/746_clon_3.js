/**
 * @ngdoc directive
 * @name  imageDisplayResizer
 * @module  ui.imageViewer
 * @restrict A
 * @description
 *   This attribute directive dynamically adjusts the size of an `<img>` element
 *   and its containing modal components within a UI overlay.
 *   It is intended for use in place of `src` on an `<img>` tag in modal templates.
 */
angular.module('bootstrapLightbox').directive('imageDisplayResizer', [
    '$window', 'contentLoader', 'uiLayoutManager',
    function ($winSvc, assetFetcher, layoutSvc) {
  // Helper function to compute the optimal visual dimensions for an image,
  // respecting minimum and maximum size constraints.
  // The maximum constraints take precedence over minimums if they conflict.
  var computeOptimalImageSize = function (imgMetrics) {
    var originalWidth = imgMetrics.initialWidth;
    var originalHeight = imgMetrics.initialHeight;
    var minAllowedWidth = imgMetrics.minimumWidth;
    var minAllowedHeight = imgMetrics.minimumHeight;
    var maxAllowedWidth = imgMetrics.maximumWidth;
    var maxAllowedHeight = imgMetrics.maximumHeight;

    // Initialize displayed dimensions to original values
    var computedDisplayWidth = originalWidth;
    var computedDisplayHeight = originalHeight;

    // Validate input dimensions to prevent division by zero or NaN results
    if (originalWidth <= 0 || originalHeight <= 0) {
        // Return a default small size or throw an error, depending on desired robustness.
        // For now, let's return a minimal valid size.
        return {
            'finalWidth': minAllowedWidth || 1,
            'finalHeight': minAllowedHeight || 1
        };
    }

    var aspectRatio = originalWidth / originalHeight;

    // Phase 1: Enforce minimum dimensions
    // Check if both dimensions are below their minimums
    if (computedDisplayWidth < minAllowedWidth && computedDisplayHeight < minAllowedHeight) {
      // If both are too small, decide whether to scale by width or height based on aspect ratios
      if (aspectRatio > (maxAllowedWidth / maxAllowedHeight)) { // Compare image aspect to max boundary aspect
        computedDisplayHeight = minAllowedHeight;
        computedDisplayWidth = Math.round(minAllowedHeight * aspectRatio);
      } else {
        computedDisplayWidth = minAllowedWidth;
        computedDisplayHeight = Math.round(minAllowedWidth / aspectRatio);
      }
    } else if (computedDisplayWidth < minAllowedWidth) {
      // Only width is too small
      computedDisplayWidth = minAllowedWidth;
      computedDisplayHeight = Math.round(minAllowedWidth / aspectRatio);
    } else if (computedDisplayHeight < minAllowedHeight) {
      // Only height is too small
      computedDisplayHeight = minAllowedHeight;
      computedDisplayWidth = Math.round(minAllowedHeight * aspectRatio);
    }

    // Phase 2: Enforce maximum dimensions (after potential min-sizing)
    // Re-calculate the current aspect ratio based on potentially adjusted dimensions
    var currentAspectRatio = computedDisplayWidth / computedDisplayHeight;

    // Check if both dimensions exceed their maximums
    if (computedDisplayWidth > maxAllowedWidth && computedDisplayHeight > maxAllowedHeight) {
      // If both are too large, scale down based on aspect ratios
      if (currentAspectRatio > (maxAllowedWidth / maxAllowedHeight)) { // Image wider than max boundary
        computedDisplayWidth = maxAllowedWidth;
        computedDisplayHeight = Math.round(maxAllowedWidth / currentAspectRatio);
      } else { // Image taller than max boundary
        computedDisplayHeight = maxAllowedHeight;
        computedDisplayWidth = Math.round(maxAllowedHeight * currentAspectRatio);
      }
    } else if (computedDisplayWidth > maxAllowedWidth) {
      // Only width is too large
      computedDisplayWidth = maxAllowedWidth;
      computedDisplayHeight = Math.round(maxAllowedWidth / currentAspectRatio);
    } else if (computedDisplayHeight > maxAllowedHeight) {
      // Only height is too large
      computedDisplayHeight = maxAllowedHeight;
      computedDisplayWidth = Math.round(maxAllowedHeight * currentAspectRatio);
    }

    // Ensure non-negative dimensions before returning
    computedDisplayWidth = Math.max(0, computedDisplayWidth);
    computedDisplayHeight = Math.max(0, computedDisplayHeight);

    return {
      'finalWidth': computedDisplayWidth,
      'finalHeight': computedDisplayHeight
    };
  };

  // Stores the actual intrinsic dimensions of the currently loaded image.
  var intrinsicImageWidth = 0;
  var intrinsicImageHeight = 0;

  return {
    'link': function (isolatedScope, domElement, elementAttributes) {
      // Function to dynamically adjust the image and modal container sizes.
      var recalibrateDisplay = function () {
        // Retrieve current viewport dimensions
        var viewportWidth = $winSvc.innerWidth;
        var viewportHeight = $winSvc.innerHeight;

        // Guard against zero dimensions from image or viewport
        if (intrinsicImageWidth <= 0 || intrinsicImageHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
            console.warn('Image or viewport dimensions are zero or negative, cannot recalibrate display.');
            return;
        }

        // Determine the boundary constraints for the image based on the viewport and original image size
        var sizeBoundaries = layoutSvc.calculateImageDimensionLimits({
          'viewportWidth': viewportWidth,
          'viewportHeight': viewportHeight,
          'imageActualWidth': intrinsicImageWidth,
          'imageActualHeight': intrinsicImageHeight
        });

        // Compute the final display dimensions for the image
        var effectiveImageDimensions = computeOptimalImageSize(
          angular.extend({
            'initialWidth': intrinsicImageWidth,
            'initialHeight': intrinsicImageHeight,
            // Default min/max values if not provided by layoutSvc
            'minimumWidth': 1,
            'minimumHeight': 1,
            'maximumWidth': viewportWidth * 0.9, // A bit of padding
            'maximumHeight': viewportHeight * 0.9
          }, sizeBoundaries)
        );

        // Calculate the necessary dimensions for the overall modal container
        var dialogBoxMetrics = layoutSvc.calculateModalDimensions({
          'viewportWidth': viewportWidth,
          'viewportHeight': viewportHeight,
          'imageDisplayWidth': effectiveImageDimensions.finalWidth,
          'imageDisplayHeight': effectiveImageDimensions.finalHeight
        });

        // Apply the calculated dimensions to the image element
        domElement.css({
          'width': effectiveImageDimensions.finalWidth + 'px',
          'height': effectiveImageDimensions.finalHeight + 'px'
        });

        // Target the modal-dialog for width adjustment.
        // Using element traversal for better encapsulation than global querySelector.
        var modalDialogElement = domElement.closest('.modal-content').parent();
        if (modalDialogElement.length) {
            modalDialogElement.css({
                'width': dialogBoxMetrics.width + 'px'
            });
        } else {
            console.warn('Could not find .modal-dialog for resizing.');
        }


        // Target the modal-content for height adjustment.
        // If modal-dialog has a width, modal-content should also follow.
        var modalContentElement = domElement.closest('.modal-content');
        if (modalContentElement.length) {
            modalContentElement.css({
                'height': dialogBoxMetrics.height + 'px'
            });
        } else {
            console.warn('Could not find .modal-content for resizing.');
        }

      };

      // Set up a watch on the directive's attribute to load new images.
      isolatedScope.$watch(function () {
        return elementAttributes.imageDisplayResizer;
      }, function (imageSourceUrl) {
        if (!imageSourceUrl) {
          // If no source is provided, clear the image and stop.
          domElement.attr('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='); // Transparent 1x1 GIF
          intrinsicImageWidth = 0;
          intrinsicImageHeight = 0;
          recalibrateDisplay(); // Recalibrate with no image
          return;
        }

        // Temporarily blank the image to prevent flickering during resize,
        // using a common technique for immediate blanking.
        domElement[0].src = 'about:blank';

        // Load the image asynchronously
        assetFetcher.load(imageSourceUrl).then(function (loadedAsset) {
          // Store the natural dimensions of the loaded image
          intrinsicImageWidth = loadedAsset.naturalWidth;
          intrinsicImageHeight = loadedAsset.naturalHeight;

          // Perform the layout adjustment based on new image dimensions
          recalibrateDisplay();

          // After successful loading and resizing, display the actual image
          domElement[0].src = imageSourceUrl;
        }).catch(function(error) {
            console.error('Failed to load image:', imageSourceUrl, error);
            // Optionally set a broken image placeholder or hide the element
            domElement.attr('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='); // A transparent pixel
            intrinsicImageWidth = 0;
            intrinsicImageHeight = 0;
            recalibrateDisplay();
        });
      });

      // Attach an event listener to the window for dynamic resizing
      angular.element($winSvc).on('resize', recalibrateDisplay);

      // Clean up the event listener when the scope is destroyed
      isolatedScope.$on('$destroy', function() {
        angular.element($winSvc).off('resize', recalibrateDisplay);
      });
    }
  };
}]);