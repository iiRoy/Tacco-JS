/*
 * This script executes when the entire page, including all assets,
 * has been fully loaded and parsed by the browser.
 */
jQuery(document).ready(
  function()
  {

    /*
     * Handlers for device orientation changes and window resizing.
     * This typically applies to tablets (e.g., iPad portrait/landscape)
     * and mobile devices, but also desktop window resizes.
     */

    function myOrientResizeFunction()
    {

      /*
       * Responsive Image Management Logic
       * ========================================================================
       * This section dynamically determines the current viewport or container width
       * based on CSS properties upon page load and subsequent resizing events.
       * Knowing the primary container's width allows us to infer the device type
       * (e.g., desktop, tablet, mobile).
       *
       * The script then iterates through all `<img>` elements that possess
       * the class "responsive". For each such image, its `src` attribute is
       * intelligently modified to point to a device-specific version of the image.
       *
       * For example, an image with `src="images/steve-en.jpg"` might be
       * transformed into `images/steve-en-tablet.jpg` when a tablet viewport
       * is detected, or `images/steve-en-mobile.jpg` for mobile.
       *
       * The `.container-12` element's width (e.g., 960px for desktop, 720px for tablet)
       * is used as the primary indicator for device classification.
       */

      var responsiveSize = jQuery(".container-12").width();
      var deviceType;

      if ( responsiveSize == 960 ) {
        // Desktop version - no specific suffix needed for images,
        // as the base image name is typically the desktop version.
        deviceType = "_desktop";
      }

      else if ( responsiveSize == 720 ) {
        // Tablet mode detected. Images will be suffixed with '_tablet'.
        deviceType = "_tablet";
      }

      else {
        // Default to mobile if neither desktop nor tablet widths are matched.
        // Images will be suffixed with '_mobile'.
        deviceType = "_mobile";
      }


      /*
       * Iterate through all images marked with the 'responsive' class.
       * This loop ensures that image sources are updated in real-time
       * to match the detected device type.
       * For instance, 'steve_desktop.jpg' could become 'steve_tablet.jpg'.
       */
      jQuery(".responsive").each(
        function()
        {

          var imgName = jQuery(this).attr("src");
          var extFull = imgName.split('.');
          var ext = imgName.split('.').pop(); // Get file extension

          // Based on the determined deviceType, modify the image source.
          switch (deviceType) {

            case "_desktop":
              // For desktop, we want the base image.
              // Check if a '_tablet' or '_mobile' suffix exists and remove it.
              if ( searchStr("_tablet", extFull[0]) ) {
                var imgType = extFull[0].split('_tablet');
                var imgResponsive = imgType[0] + "." + extFull[1];
                jQuery(this).attr( { src: imgResponsive } );
              }

              else if ( searchStr("_mobile", extFull[0]) ) {

                var imgType = extFull[0].split('_mobile');
                var imgResponsive = imgType[0] + "." + extFull[1];
                jQuery(this).attr( { src: imgResponsive } );
              }
              // If no specific suffix found, assume it's already the desktop version.
            break;

            case "_tablet":
              // Handle tablet-specific image loading.
              // If the image already has the '_tablet' suffix, do nothing.
              if ( searchStr(deviceType, extFull[0]) ) {
                // console.log(deviceType + " Found in array"); // Debugging line, removed
              }

              // If it's a mobile image, revert it to the base and then add '_tablet'.
              else if ( searchStr("_mobile", extFull[0]) ) {

                var imgType = extFull[0].split('_mobile');
                var imgResponsive = imgType[0] + deviceType + "." + extFull[1]; // Rebuild with _tablet
                jQuery(this).attr( { src: imgResponsive } );
              }
              // If it's the initial load or a desktop image, add the '_tablet' suffix.
              else {
                var imgResponsive = extFull[0] + deviceType + "." + extFull[1];
                jQuery(this).attr( { src: imgResponsive } );
              }

            break;

            case "_mobile":
              // Handle mobile-specific image loading.
              // If the image already has the '_mobile' suffix, no action needed.
              if ( searchStr(deviceType, extFull[0]) ) {
                // console.log(deviceType + " Found in array"); // Debugging line, removed
              }

              // If it's a tablet image, revert it to the base and then add '_mobile'.
              else if ( searchStr("_tablet", extFull[0]) ) {
                /*
                 * Special handling for images that might need to be hidden
                 * on mobile, as indicated by the 'hide-mobile' class.
                 */
                if ( jQuery(this).hasClass("hide-mobile") ) {
                  // The image is intended to be hidden by CSS on mobile,
                  // so we don't need to change its source.
                }

                else {
                  var imgType = extFull[0].split('_tablet');
                  var imgResponsive = imgType[0] + deviceType + "." + extFull[1]; // Rebuild with _mobile
                  jQuery(this).attr( { src: imgResponsive } );
                }

              }
              // If it's the initial load or a desktop image, add the '_mobile' suffix.
              else {

                /*
                 * Check for specific addon classes that might alter behavior.
                 */
                if ( jQuery(this).hasClass("hide-mobile") ) {
                  // CSS rules will handle hiding this image for mobile.
                }

                else {
                  var imgResponsive = extFull[0] + deviceType + "." + extFull[1];
                  jQuery(this).attr( { src: imgResponsive } );
                }
              }

            break;
          } // End of switch statement

        }
      ); // End of jQuery(".responsive").each()

    } // End of myOrientResizeFunction()


    // Bind the responsive function to the window's resize event.
    // This ensures images adjust if the browser window changes size.
    jQuery(window).resize(
      function()
      {
        myOrientResizeFunction();
      }
    );


    // Also call the function once the entire page has loaded,
    // to correctly size elements and images initially.
    jQuery(window).load(
      function()
      {
        myOrientResizeFunction();
      }
    );


    // Check if the DeviceOrientationEvent is supported by the browser.
    // If it is, attach the function to the 'orientationchange' event,
    // which is specific to mobile devices and tablets.
    if ( window.DeviceOrientationEvent ) {
      window.addEventListener('orientationchange', myOrientResizeFunction, false);
    }


  }
); // End of jQuery(document).ready()