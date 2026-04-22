/*
 *   @class        lightboxSrc
 *   @description  This attribute directive replaces the standard `src` attribute on `<img>`
 *                 elements within the modal template. It is responsible for handling the
 *                 dynamic resizing of both the `<img>` element itself and its
 *                 parent containers within the modal window.
 *   @memberOf     bootstrapLightbox
 */
angular
    .module(
          'bootstrapLightbox'
    )
    .directive(
          'lightboxSrc'
        , [
              '$window'
            , 'ImageLoader'
            , 'Lightbox'
            , function ( $window, ImageLoader, Lightbox )
              {

                  // Helper function to compute the optimal dimensions for displaying an image.
                  // It takes into account minimum and maximum size constraints.
                  var calculateImageDisplayDimensions = function( dimensions )
                  {
                      // Extract all relevant dimension parameters from the input object.
                      var w    = dimensions.width;
                      var h    = dimensions.height;
                      var minW = dimensions.minWidth;
                      var minH = dimensions.minHeight;
                      var maxW = dimensions.maxWidth;
                      var maxH = dimensions.maxHeight;

                      // Initialize display dimensions with original image dimensions.
                      var displayW = w;
                      var displayH = h;

                      // First, check if the image is smaller than the minimum allowed dimensions.
                      if (   w < minW
                          && h < minH
                      ) {
                          // If both width and height are too small, we need to scale up.
                          // Determine whether to prioritize minimum width or minimum height based on aspect ratios.
                          if ( ( w / h ) > ( maxW / maxH ) ) {
                              // Image is relatively wider; scale by height to meet minH.
                              displayH = minH;
                              displayW = Math.round( w * minH / h );
                          } else {
                              // Image is relatively taller or square; scale by width to meet minW.
                              displayW = minW;
                              displayH = Math.round( h * minW / w );
                          }
                      }
                      else if ( w < minW ) {
                          // Only width is too small; scale up to minW while maintaining aspect ratio.
                          displayW = minW;
                          displayH = Math.round( h * minW / w );
                      }
                      else if ( h < minH ) {
                          // Only height is too small; scale up to minH while maintaining aspect ratio.
                          displayH = minH;
                          displayW = Math.round( w * minH / h );
                      }


                      // Next, check if the image is larger than the maximum allowed dimensions.
                      if (   w > maxW
                          && h > maxH
                      ) {
                          // If both width and height are too large, we need to scale down.
                          // Determine whether to prioritize maximum width or maximum height based on aspect ratios.
                          if ( ( w / h ) > ( maxW / maxH ) ) {
                              // Image is relatively wider; scale by width to meet maxW.
                              displayW = maxW;
                              displayH = Math.round( h * maxW / w );
                          } else {
                              // Image is relatively taller or square; scale by height to meet maxH.
                              displayH = maxH;
                              displayW = Math.round( w * maxH / h );
                          }
                      }
                      else if ( w > maxW ) {
                          // Only width is too large; scale down to maxW while maintaining aspect ratio.
                          displayW = maxW;
                          displayH = Math.round( h * maxW / w );
                      }
                      else if ( h > maxH ) {
                          // Only height is too large; scale down to maxH while maintaining aspect ratio.
                          displayH = maxH;
                          displayW = Math.round( w * maxH / h );
                      }

                      // Return the calculated display dimensions. Handle potential NaN for height.
                      return {
                            'width': displayW || 0
                          , 'height': displayH || 0 // If dimensions.width is 0, imageHeight could become NaN.
                      };
                  };


                  // Variables to store the actual (natural) width and height of the image.
                  var imageWidth  = 0;
                  var imageHeight = 0;


                  return {
                      'link': function(scope, element, attrs)
                      {

                          // Define the 'resize' function, which adjusts the image and modal dimensions.
                          var resize = function()
                          {
                              // Retrieve the current dimensions of the browser window.
                              var windowWidth  = $window.innerWidth;
                              var windowHeight = $window.innerHeight;

                              // Calculate the maximum and minimum allowed dimensions for the image
                              // based on the window size and image's natural dimensions.
                              var imageDimensionLimits = Lightbox.calculateImageDimensionLimits(
                                  {
                                        'windowWidth':  windowWidth
                                      , 'windowHeight': windowHeight
                                      , 'imageWidth':   imageWidth
                                      , 'imageHeight':  imageHeight
                                  }
                              );

                              // Determine the final display dimensions for the image using our helper function.
                              var imageDisplayDimensions = calculateImageDisplayDimensions(
                                  angular.extend(
                                      {
                                            'width':     imageWidth
                                          , 'height':    imageHeight
                                          , 'minWidth':  1
                                          , 'minHeight': 1
                                          , 'maxWidth':  3000
                                          , 'maxHeight': 3000
                                      }
                                    , imageDimensionLimits
                                  )
                              );

                              // Calculate the optimal dimensions for the modal container itself.
                              var modalDimensions = Lightbox.calculateModalDimensions(
                                  {
                                        'windowWidth':       windowWidth
                                      , 'windowHeight':      windowHeight
                                      , 'imageDisplayWidth': imageDisplayDimensions.width
                                      , 'imageDisplayHeight': imageDisplayDimensions.height
                                  }
                              );

                              // Apply the calculated dimensions to the image element.
                              element.css(
                                  {
                                        'width':  imageDisplayDimensions.width + 'px'
                                      , 'height': imageDisplayDimensions.height + 'px'
                                  }
                              );


                              // Adjust the width of the '.modal-dialog' element.
                              // Note: Setting height on .modal-dialog does not expand the background div (.modal-content).
                              angular
                                  .element(
                                      document.querySelector(
                                          '.lightbox-modal .modal-dialog'
                                      )
                                  )
                                  .css(
                                      {
                                            'width': modalDimensions.width + 'px'
                                      }
                                  );

                              // Adjust the height of the '.modal-content' element.
                              // If .modal-content width is not set, and only .modal-dialog is,
                              // then .modal-dialog retains its default 600px width, causing misplacement.
                              angular
                                  .element(
                                      document.querySelector(
                                          '.lightbox-modal .modal-content'
                                      )
                                  )
                                  .css(
                                      {
                                            'height': modalDimensions.height + 'px'
                                      }
                                  );
                          };


                          // Watch for changes in the 'lightboxSrc' attribute to load new images.
                          scope.$watch(
                              function()
                              {
                                  return attrs.lightboxSrc;
                              }
                            , function(src)
                              {
                                  // Clear the image source before loading a new one to prevent visual glitches
                                  // during resizing. See: http://stackoverflow.com/questions/5775469
                                  element[0].src = '//:0';

                                  // Load the new image using the ImageLoader service.
                                  ImageLoader
                                      .load(src)
                                      .then(
                                          function(image)
                                          {
                                              // Store the natural dimensions of the loaded image.
                                              // These are crucial for the 'resize' function.
                                              imageWidth  = image.naturalWidth;
                                              imageHeight = image.naturalHeight;

                                              // Trigger the resize operation for the image and modal.
                                              resize();

                                              // Finally, set the actual source to display the image.
                                              element[0].src = src;
                                          }
                                      );
                              }
                          );

                          // Attach a 'resize' event listener to the window object.
                          // This ensures the image and modal are resized whenever the browser window changes size.
                          angular.element($window).on( 'resize' , resize );
                      }
                  };
              }
        ]
    );