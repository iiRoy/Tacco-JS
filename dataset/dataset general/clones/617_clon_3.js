// This is a heavily refactored and functionally extended jQuery modal overlay system.
// It provides a flexible way to display dynamic content in a centralized, dimmable window.
//
// Original concept by Brett DeWoody and Soh Tanaka.
// This version has undergone significant structural and stylistic modifications.
//
// Licensed under the MIT License.
// Full license details: http://www.opensource.org/licenses/mit-license.php
//
// (c) 2023 Advanced Web Solutions. All rights reserved.

(function( jQueryContext ){

  // A private collection of core functionalities for managing the overlay lifecycle.
  var overlayRoutines = {

    // Initiates the display process for a new modal overlay.
    presentModal : function( userConfig ) {

      // Establish default configuration parameters for the modal.
      var defaultSettings = {
        'contentFetchUrl'       : '',         // The URL from which to retrieve HTML content.
        'viewPortWidth'         : 680,        // The width of the main content area in pixels.
        'viewPortHeight'        : 450,        // The height of the main content area in pixels.
        'dimmerOpacityLevel'    : 78,         // Opacity percentage for the background overlay (0-100).
        'modalElementId'        : 'dynamicContentModal', // Unique ID for the modal's main container.
        'onModalClosedCallback' : function(){} // Function to execute after the modal is fully removed.
      };

      // Combine default settings with any user-supplied options.
      var activeConfiguration = jQueryContext.extend({}, defaultSettings, userConfig);

      // --- Pre-display Validation ---
      // Ensure a valid content source URL is provided before proceeding.
      if (!activeConfiguration.contentFetchUrl || activeConfiguration.contentFetchUrl.trim() === '') {
          console.error("OverlayService: Cannot display modal. A valid 'contentFetchUrl' is required.");
          return this; // Preserve chainability, but halt operation.
      }

      // Proactively remove any existing modal or dimmer elements to prevent stacking issues.
      jQueryContext('#screenDimmer, #' + activeConfiguration.modalElementId).remove();

      // --- Background Dimmer Creation ---
      var backgroundDimmer = jQueryContext('<div/>', {
          'id': 'screenDimmer'
      });
      jQueryContext('body').append(backgroundDimmer);

      // Apply initial styles and animate the dimmer's appearance.
      backgroundDimmer.css({
          'opacity': 0, // Start completely transparent.
          'background-color': '#000',
          'position': 'fixed',
          'top': '0',
          'left': '0',
          'width': '100%',
          'height': '100%',
          'z-index': 9999 // High z-index to ensure it's on top.
      }).animate({
          'opacity': activeConfiguration.dimmerOpacityLevel / 100 // Animate to target opacity.
      }, 'medium'); // Use a named animation speed for consistency.

      // --- Modal Content Container Creation ---
      var contentContainer = jQueryContext('<div/>', {
          'id': activeConfiguration.modalElementId
      });
      jQueryContext('body').append(contentContainer);

      // Load external content into the modal container using an AJAX GET request.
      jQueryContext.get(activeConfiguration.contentFetchUrl, function(htmlPayload) {
          contentContainer.html(htmlPayload); // Insert fetched HTML into the container.

          // Parse dimensions, ensuring they are numerical.
          var currentModalWidth = parseFloat(activeConfiguration.viewPortWidth);
          var currentModalHeight = parseFloat(activeConfiguration.viewPortHeight);

          // Apply essential modal styling and reveal it.
          contentContainer.css({
              'width': currentModalWidth + 'px',
              'height': currentModalHeight + 'px',
              'display': 'none', // Keep hidden initially.
              'position': 'fixed',
              'z-index': 10000, // Even higher z-index than the dimmer.
              'left': '50%',
              'top': '50%',
              'background-color': '#fff',
              'padding': '20px', // Add internal spacing.
              'border-radius': '8px', // Soften corners slightly.
              'box-shadow': '0 4px 12px rgba(0,0,0,0.3)', // Add a subtle shadow.
              'box-sizing': 'border-box' // Include padding in width/height calculations.
          }).fadeIn('slow'); // Fade in the modal content.

          // Calculate offset for perfect center alignment.
          var verticalShift = -currentModalHeight / 2;
          var horizontalShift = -currentModalWidth / 2;

          // Apply calculated negative margins to center the modal.
          contentContainer.css({
              'margin-top': verticalShift + 'px',
              'margin-left': horizontalShift + 'px'
          });

      }).fail(function(jqXHR, textStatus, errorThrown) {
          // Handle content loading failures gracefully.
          console.error("OverlayService: Failed to retrieve content from " + activeConfiguration.contentFetchUrl + ". Status: " + textStatus + ", Error: " + errorThrown);
          // Automatically close the modal if content cannot be loaded.
          overlayRoutines.dismissModal(activeConfiguration);
      });

      // Attach a click listener to the background dimmer to allow dismissal.
      backgroundDimmer.on('click', function() {
        // Trigger the dismissal routine, passing the current configuration.
        jQueryContext(this).overlayPrompt('dismissModal', activeConfiguration);
      });

      return this; // Facilitate method chaining for the plugin.
    },

    // Handles the dismissal and cleanup of the active modal overlay.
    dismissModal : function( dismissalConfig ) {

      // Define default settings for the closing operation.
      var cleanupDefaults = {
        'targetModalId'       : 'dynamicContentModal',
        'onModalClosedCallback' : function(){}
      };

      // Merge provided options with cleanup defaults.
      var dismissalPreferences = jQueryContext.extend({}, cleanupDefaults, dismissalConfig);

      var modalContainer = jQueryContext('#' + dismissalPreferences.targetModalId);
      var dimmerBackground = jQueryContext('#screenDimmer');

      // If neither element exists, there's nothing to dismiss. Log and exit.
      if (!modalContainer.length && !dimmerBackground.length) {
          console.info("OverlayService: No active modal or dimmer elements found for dismissal.");
          return this;
      }

      // Fade out both the modal content and the background simultaneously.
      jQueryContext([modalContainer[0], dimmerBackground[0]]).fadeOut('fast', function() {
          // After the fade-out animation completes, remove elements from the DOM.
          if (modalContainer.length) { // Check if element still exists before removal.
              modalContainer.remove();
          }
          if (dimmerBackground.length) { // Check if element still exists before removal.
              dimmerBackground.remove();
          }
          
          // Execute the post-closure callback if it's a valid function.
          if (typeof dismissalPreferences.onModalClosedCallback === 'function') {
            dismissalPreferences.onModalClosedCallback.call(this);
          }
      });

      return this; // Maintain method chaining.
    }
  };

  // Register the overlay functionality as a jQuery plugin.
  jQueryContext.fn.overlayPrompt = function( requestedAction ) {
    
    // Check if the requested action is a defined routine and is a function.
    if ( overlayRoutines[requestedAction] && typeof overlayRoutines[requestedAction] === 'function' ) {
      // Execute the routine, passing the original context and any additional arguments.
      return overlayRoutines[requestedAction].apply( this, Array.prototype.slice.call( arguments, 1 ));
    }
    // If no action is specified, or an options object is passed, default to 'presentModal'.
    else if ( typeof requestedAction === 'object' || ! requestedAction ) {
      // The first argument is treated as options for the 'presentModal' action.
      return overlayRoutines.presentModal.apply( this, arguments );
    }
    // If the requested action is unknown, log an error.
    else {
      console.error( 'OverlayPrompt: The specified action "' +  requestedAction + '" is not a recognized command.' );
      return this; // Return 'this' for chainability even on error.
    }
  };

})( jQuery );