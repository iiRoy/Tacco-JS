/**
 * @file imgLiquid.js
 * @version 0.9.944 (Updated March 5, 2013)
 * @author Alejandro Emparan (karacas) @krc_ale
 * @license Dual licensed under the MIT and GPL licenses
 * @link https://github.com/karacas/imgLiquid
 *
 * This jQuery plugin is designed to intelligently resize images
 * to perfectly fit within their parent container elements.
 * It provides flexible options for controlling image scaling
 * (fill/cover or contain), vertical and horizontal alignment,
 * and handles responsiveness.
 *
 * Usage examples:
 * -----------------
 *
 * // Basic usage: apply imgLiquid to elements with class 'imgLiquid'
 * $('.imgLiquid').imgLiquid({ fill: true });
 *
 * // Custom options:
 * // - fill: (boolean) true for 'cover' behavior, false for 'contain'.
 * // - verticalAlign: (string) 'center', 'top', 'bottom', or percentage like '50%', '10%'.
 * // - horizontalAlign: (string) 'center', 'left', 'right', or percentage like '50%', '10%'.
 *
 * // Example with specific alignment
 * $('.myImageContainer').imgLiquid({
 *   fill: false,
 *   verticalAlign: 'top',
 *   horizontalAlign: 'left'
 * });
 *
 * Callbacks:
 * ----------
 *
 * // Available callback functions for custom logic:
 * // - onStart: (function) Called once before processing any images.
 * // - onFinish: (function) Called once after all images have been processed.
 * // - onItemStart: (function(index, container, img)) Called before processing each individual image.
 * // - onItemFinish: (function(index, container, img)) Called after processing each individual image.
 * // - onItemError: (function(index, container, img)) Called if an image fails to load.
 *
 * HTML5 Data Attributes (can override JS options):
 * ------------------------------------------------
 *
 * // You can specify options directly in your HTML using data attributes.
 * // These attributes will take precedence over options passed via JavaScript.
 *
 * <div class="imgLiquid" data-imgLiquid-fill="true"
 *      data-imgLiquid-horizontalAlign="center"
 *      data-imgLiquid-verticalAlign="center">
 *   <img src="path/to/your/image.jpg" alt="Description">
 * </div>
 *
 **/


// Ensure imgLiquid namespace exists, initialize if not.
var imgLiquid = imgLiquid || { VER: '0.9.944' };

// Flag to indicate if background-size CSS property is supported by the browser.
imgLiquid.bgs_Available = false;

// Flag to ensure the background-size check runs only once.
imgLiquid.bgs_CheckRunned = false;

// Default CSS to hide images initially to prevent FOUC (Flash Of Unstyled Content).
imgLiquid.injectCss = '.imgLiquid img {visibility:hidden}';


// Self-executing anonymous function to encapsulate the plugin logic,
// protecting it from global scope pollution and ensuring jQuery is available.
(function ($) {


  // ___________________________________________________________________
  // Helper function to detect background-size support.

  function checkBgsIsavailable() {

    // If the check has already been performed, exit early.
    if (imgLiquid.bgs_CheckRunned) {
      return;
    }
    // Mark the check as run.
    else {
      imgLiquid.bgs_CheckRunned = true;
    }

    // Create a temporary span element to test background-size property.
    var spanBgs = $('<span style="background-size:cover" />');

    // Append the temporary element to the body.
    $('body').append(spanBgs);

    // Immediately invoked function expression (IIFE) to perform the check.
    !function () {

      var bgs_Check = spanBgs[0];

      // If element or getComputedStyle is not available, cannot check.
      if (!bgs_Check || !window.getComputedStyle) {
        return;
      }

      // Get the computed style of the temporary element.
      var compStyle = window.getComputedStyle(bgs_Check, null);

      // If computed style or backgroundSize property is not found, return.
      if (!compStyle || !compStyle.backgroundSize) {
        return;
      }

      // Determine if 'cover' is supported.
      imgLiquid.bgs_Available = (compStyle.backgroundSize === 'cover');

    }(); // Execute the IIFE.

    // Remove the temporary element from the DOM.
    spanBgs.remove();

  } // End of checkBgsIsavailable function.


  // ___________________________________________________________________
  // Extend jQuery's prototype to add the imgLiquid plugin.

  $.fn.extend({

    imgLiquid: function (options) {

      // Define default settings for the plugin.
      this.defaults = {
        fill: true,                               // Determines if image should 'cover' (true) or 'contain' (false) its container.
        verticalAlign: 'center',                  // Vertical alignment: 'top', 'bottom', 'center', or percentage.
        horizontalAlign: 'center',                // Horizontal alignment: 'left', 'right', 'center', or percentage.
        useBackgroundSize: true,                  // Whether to use CSS background-size property (modern browsers) or fallback method.
        useDataHtmlAttr: true,                    // Whether to allow options to be overridden by data attributes.

        responsive: true,                         /* Only applicable when useBackgroundSize is false (older browsers). */
        delay: 0,                                 /* Delay before processing each image in milliseconds (for older browsers). */
        fadeInTime: 0,                            /* Fade-in duration for images (for older browsers). */
        removeBoxBackground: true,                /* Remove container's background-image when using fallback method. */
        hardPixels: true,                         /* Use exact pixel values for width/height in fallback method. */
        responsiveCheckTime: 500,                 /* Interval to check for container resizing (for older browsers). */
        timecheckvisibility: 500,                 /* Interval to recheck image visibility/load status (for older browsers). */

        // CALLBACK FUNCTIONS
        onStart: null,                            // Fired once at the beginning of the plugin execution.
        onFinish: null,                           // Fired once after all images in the collection are processed.
        onItemStart: null,                        // Fired for each image before processing. Parameters: (index, container, img).
        onItemFinish: null,                       // Fired for each image after processing. Parameters: (index, container, img).
        onItemError: null                         // Fired if an image fails to load. Parameters: (index, container, img).
      };


      // Perform the background-size availability check.
      checkBgsIsavailable();

      // Store a reference to the current imgLiquid instance (the jQuery object).
      var imgLiquidRoot = this;

      // Merge default settings with user-provided options.
      this.options = options;
      this.settings = $.extend({}, this.defaults, this.options);

      // Execute the onStart callback if provided.
      if (this.settings.onStart) {
        this.settings.onStart();
      }


      // ___________________________________________________________________
      // Iterate over each selected element (image container).

      return this.each(function ($i) {

        // --- MAIN LOGIC: Process each image container ---

        var settings = imgLiquidRoot.settings,
          $imgBoxCont = $(this),
          $img = $('img:first', $imgBoxCont); // Get the first image within the container.

        // If no image is found in the container, call onError and skip.
        if (!$img.length) {
          onError();
          return;
        }


        // Determine current settings: either initial or updated on recall.
        if (!$img.data('imgLiquid_settings')) {
          // First time processing this image container.
          // Extend global settings with any data-html attributes.
          settings = $.extend({}, imgLiquidRoot.settings, getSettingsOverwrite());
        } else {
          // This container has been processed before (recall scenario).
          // Remove previous status classes.
          $imgBoxCont.removeClass('imgLiquid_error').removeClass('imgLiquid_ready');
          // Update settings by merging stored settings with new options.
          settings = $.extend({}, $img.data('imgLiquid_settings'), imgLiquidRoot.options);
        }
        // Store the final settings on the image itself.
        $img.data('imgLiquid_settings', settings);


        // Execute the onItemStart callback for the current image.
        if (settings.onItemStart) {
          settings.onItemStart($i, $imgBoxCont, $img); /* << CallBack */
        }


        // Decide which processing method to use: CSS background-size or old fallback.
        if (imgLiquid.bgs_Available && settings.useBackgroundSize) {
          processBgSize(); // Use modern CSS background-size.
        } else {
          processOldMethod(); // Use older, JavaScript-driven method.
        }

        // --- END MAIN LOGIC ---


        // ___________________________________________________________________
        // Handles image resizing using CSS `background-size`.
        // This is the preferred method for modern browsers.

        function processBgSize() {

          // Check if the background-image needs to be updated.
          // This prevents unnecessary CSS changes if the image source hasn't changed.
          if ($imgBoxCont.css('background-image').indexOf(encodeURI($img.attr('src'))) === -1) {
            // Update the background-image property.
            $imgBoxCont.css({ 'background-image': 'url("' + encodeURI($img.attr('src')) + '")' });
          }

          // Apply background-size and background-position based on settings.
          $imgBoxCont.css({
            'background-size': (settings.fill) ? 'cover' : 'contain', // 'cover' or 'contain'
            'background-position': (settings.horizontalAlign + ' ' + settings.verticalAlign).toLowerCase(),
            'background-repeat': 'no-repeat'
          });

          // If the container has an anchor tag, make it cover the entire box.
          $('a:first', $imgBoxCont).css({
            'display': 'block',
            'width': '100%',
            'height': '100%'
          });

          // Hide the actual <img> tag, as it's now replaced by background-image.
          $('img', $imgBoxCont).css({ 'display': 'none' });

          // Execute the onItemFinish callback.
          if (settings.onItemFinish) {
            settings.onItemFinish($i, $imgBoxCont, $img); /* << CallBack */
          }

          // Add classes to indicate processing method and readiness.
          $imgBoxCont.addClass('imgLiquid_bgSize');
          $imgBoxCont.addClass('imgLiquid_ready');

          // Check if all items are finished to trigger onFinish callback.
          checkFinish();
        }


        // ___________________________________________________________________
        // Handles image resizing using traditional JavaScript and CSS
        // for browsers that do not support `background-size` or when
        // `useBackgroundSize` is explicitly set to `false`.

        function processOldMethod() {

          // If the image source has changed, re-initialize the image element.
          if ($img.data('oldSrc') && $img.data('oldSrc') !== $img.attr('src')) {

            /* Clone the image, remove inline styles, and replace the old one. */
            var $imgCopy = $img.clone().removeAttr('style');
            $imgCopy.data('imgLiquid_settings', $img.data('imgLiquid_settings'));
            $img.parent().prepend($imgCopy);
            $img.remove();
            $img = $imgCopy;
            $img[0].width = 0; // Reset width to force re-measurement.

            // Bug fix for IE: if (!$img[0].complete && $img[0].width) onError();
            // Re-call processOldMethod after a short delay to allow DOM update.
            setTimeout(processOldMethod, 10);
            return;
          }


          // If already processed, simply re-apply styles.
          if ($img.data('imgLiquid_oldProcessed')) {
            makeOldProcess();
            return;
          }


          // Set initial data flags for the image.
          $img.data('imgLiquid_oldProcessed', false);
          $img.data('oldSrc', $img.attr('src')); // Store original source.


          // Hide any other images within the container (only process the first).
          $('img:not(:first)', $imgBoxCont).css('display', 'none');


          // Apply initial CSS styles to the container and image.
          $imgBoxCont.css({ 'overflow': 'hidden' }); // Hide overflow for positioning.
          $img.fadeTo(0, 0) // Hide image initially with no fade (will fade in later).
            .removeAttr('width') // Remove any existing width/height attributes.
            .removeAttr('height')
            .css({
              'visibility': 'visible',    // Make visible after initial hide.
              'max-width': 'none',        // Important for scaling.
              'max-height': 'none',       // Important for scaling.
              'width': 'auto',            // Allow natural sizing.
              'height': 'auto',           // Allow natural sizing.
              'display': 'block'          // Ensure it's a block element for alignment.
            });


          // Attach error handler for the image.
          $img.on('error', onError);
          $img[0].onerror = onError; // Fallback for some browsers.


          // Inner function to wait for image load and visibility.
          function onLoad() {
            // If error, loaded, or already processed, exit.
            if ($img.data('imgLiquid_error') || $img.data('imgLiquid_loaded') || $img.data('imgLiquid_oldProcessed')) {
              return;
            }

            // Check if container is visible and image is fully loaded and has dimensions.
            if ($imgBoxCont.is(':visible') && $img[0].complete && $img[0].width > 0 && $img[0].height > 0) {
              $img.data('imgLiquid_loaded', true); // Mark as loaded.
              // Process after a delay, staggered by index to prevent network congestion.
              setTimeout(makeOldProcess, $i * settings.delay);
            } else {
              // If not ready, recheck after a delay.
              setTimeout(onLoad, settings.timecheckvisibility);
            }
          }


          onLoad(); // Start the loading check.
          checkResponsive(); // Start responsive checks.
        }


        // ___________________________________________________________________
        // Monitors the container for size changes when `responsive` is true
        // and `useBackgroundSize` is false.

        function checkResponsive() {

          /* This function is only for the old processing method; background-size does not need it. */

          // If not responsive or already processed, or settings are missing, exit.
          if (!settings.responsive && !$img.data('imgLiquid_oldProcessed')) {
            return;
          }
          if (!$img.data('imgLiquid_settings')) {
            return;
          }

          // Retrieve current settings (could have been updated).
          settings = $img.data('imgLiquid_settings');

          // Calculate current size of the container. Adding a small fraction to height
          // helps in detecting subtle changes that might otherwise be missed due to rounding.
          $imgBoxCont.actualSize = $imgBoxCont.get(0).offsetWidth + ($imgBoxCont.get(0).offsetHeight / 10000);

          // If the container's size has changed, re-process the image.
          if ($imgBoxCont.sizeOld && $imgBoxCont.actualSize !== $imgBoxCont.sizeOld) {
            makeOldProcess();
          }

          // Store the current size for the next comparison.
          $imgBoxCont.sizeOld = $imgBoxCont.actualSize;

          // Schedule the next responsive check.
          setTimeout(checkResponsive, settings.responsiveCheckTime);
        }


        // ___________________________________________________________________
        // Error handler for image loading failures.

        function onError() {
          $img.data('imgLiquid_error', true); // Mark image as errored.
          $imgBoxCont.addClass('imgLiquid_error'); // Add error class to container.

          // Execute the onItemError callback if provided.
          if (settings.onItemError) {
            settings.onItemError($i, $imgBoxCont, $img); /* << CallBack */
          }

          checkFinish(); // Check if all items are finished.
        }


        // ___________________________________________________________________
        // Retrieves settings overrides from HTML data attributes.

        function getSettingsOverwrite() {
          var SettingsOverwrite = {};

          // Only process data attributes if enabled.
          if (imgLiquidRoot.settings.useDataHtmlAttr) {
            var dif = $imgBoxCont.attr('data-imgLiquid-fill'),
              ha = $imgBoxCont.attr('data-imgLiquid-horizontalAlign'),
              va = $imgBoxCont.attr('data-imgLiquid-verticalAlign');

            // Override 'fill' if data attribute is 'true' or 'false'.
            if (dif === 'true' || dif === 'false') {
              SettingsOverwrite.fill = Boolean(dif === 'true');
            }

            // Override 'horizontalAlign' if valid value is provided.
            if (ha !== undefined && (ha === 'left' || ha === 'center' || ha === 'right' || ha.indexOf('%') !== -1)) {
              SettingsOverwrite.horizontalAlign = ha;
            }

            // Override 'verticalAlign' if valid value is provided.
            if (va !== undefined && (va === 'top' || va === 'bottom' || va === 'center' || va.indexOf('%') !== -1)) {
              SettingsOverwrite.verticalAlign = va;
            }
          }

          // Special handling for IE: disable fade-in animation if specified.
          if (imgLiquid.isIE && imgLiquidRoot.settings.ieFadeInDisabled) {
            SettingsOverwrite.fadeInTime = 0; // IE no animations.
          }
          return SettingsOverwrite;
        }


        // ___________________________________________________________________
        // The core logic for scaling and positioning images using the
        // older, JavaScript-driven method (when background-size is not used).

        function makeOldProcess() { /* Only for old browsers, or useBackgroundSize set to false */

          // Declare variables for width, height, natural dimensions, alignment, and margins.
          var w, h, wn, hn, ha, va, hdif, vdif,
            margT = 0,
            margL = 0,
            $imgCW = $imgBoxCont.width(),  // Container's current width.
            $imgCH = $imgBoxCont.height(); // Container's current height.


          // Store original image dimensions if not already stored.
          if ($img.data('owidth') === undefined) {
            $img.data('owidth', $img[0].width);
          }
          if ($img.data('oheight') === undefined) {
            $img.data('oheight', $img[0].height);
          }


          // Calculate new image dimensions based on 'fill' setting.
          // This compares aspect ratios of container and image.
          if (settings.fill === (($imgCW / $imgCH) >= ($img.data('owidth') / $img.data('oheight')))) {
            // 'fill' (cover) behavior: image fully covers container.
            // One dimension matches container, other is scaled proportionally.
            w = '100%';
            h = 'auto';
            wn = Math.floor($imgCW); // New image width.
            hn = Math.floor($imgCW * ($img.data('oheight') / $img.data('owidth'))); // New image height.
          } else {
            // 'contain' behavior: image is fully contained within container.
            w = 'auto';
            h = '100%';
            wn = Math.floor($imgCH * ($img.data('owidth') / $img.data('oheight'))); // New image width.
            hn = Math.floor($imgCH); // New image height.
          }

          // Calculate horizontal alignment (margin-left).
          ha = settings.horizontalAlign.toLowerCase();
          hdif = $imgCW - wn; // Difference between container width and new image width.
          if (ha === 'left') {
            margL = 0;
          }
          if (ha === 'center') {
            margL = hdif * 0.5;
          }
          if (ha === 'right') {
            margL = hdif;
          }
          if (ha.indexOf('%') !== -1) {
            ha = parseInt(ha.replace('%', ''), 10);
            if (ha > 0) {
              margL = hdif * ha * 0.01; // Calculate percentage-based margin.
            }
          }


          // Calculate vertical alignment (margin-top).
          va = settings.verticalAlign.toLowerCase();
          vdif = $imgCH - hn; // Difference between container height and new image height.
          if (va === 'top') {
            margT = 0;
          }
          if (va === 'center') {
            margT = vdif * 0.5;
          }
          if (va === 'bottom') {
            margT = vdif;
          }
          if (va.indexOf('%') !== -1) {
            va = parseInt(va.replace('%', ''), 10);
            if (va > 0) {
              margT = vdif * va * 0.01; // Calculate percentage-based margin.
            }
          }


          // Apply the calculated CSS styles to the image.
          if (settings.hardPixels) {
            w = wn;
            h = hn;
          } // Use hard pixel values if enabled.
          $img.css({
            'width': w,
            'height': h,
            'margin-left': Math.floor(margL), // Apply calculated left margin.
            'margin-top': Math.floor(margT)   // Apply calculated top margin.
          });


          // Fade-in the image, only on the first processing.
          if (!$img.data('imgLiquid_oldProcessed')) {
            $img.fadeTo(settings.fadeInTime, 1); // Fade to full opacity.
            $img.data('imgLiquid_oldProcessed', true); // Mark as processed.

            // Remove background image from container if option is set.
            if (settings.removeBoxBackground) {
              $imgBoxCont.css('background-image', 'none');
            }

            // Add classes to indicate processing method and readiness.
            $imgBoxCont.addClass('imgLiquid_nobgSize');
            $imgBoxCont.addClass('imgLiquid_ready');
          }


          // Execute the onItemFinish callback.
          if (settings.onItemFinish) {
            settings.onItemFinish($i, $imgBoxCont, $img); /* << CallBack */
          }

          checkFinish(); // Check if all items are finished.
        }


        // ___________________________________________________________________
        // Checks if all images in the current collection have been processed
        // and triggers the `onFinish` callback if they have.

        function checkFinish() { /* Check callBack */
          // If this is the last image in the collection, call the onFinish callback.
          if ($i === imgLiquidRoot.length - 1) {
            if (imgLiquidRoot.settings.onFinish) {
              imgLiquidRoot.settings.onFinish();
            }
          }
        }


      }); // End of $.each loop.

    } // End of imgLiquid function.

  }); // End of $.fn.extend.

})(jQuery); // Pass jQuery object to the IIFE.


// Inject necessary CSS styles into the document head.
// This IIFE ensures the CSS is added once when the script loads.
!function () {
  var css = imgLiquid.injectCss, // Get the CSS string from imgLiquid namespace.
    head = document.getElementsByTagName('head')[0], // Get the document head element.
    style = document.createElement('style'); // Create a new style element.

  style.type = 'text/css'; // Set the style type.

  // Handle cross-browser injection of CSS.
  if (style.styleSheet) {
    // For IE.
    style.styleSheet.cssText = css;
  } else {
    // For other browsers.
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style); // Append the style element to the head.
}(); // Execute the CSS injection IIFE.