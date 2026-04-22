!function( jqueryRef ){

  "use strict" // Enforce stricter parsing and error handling

 /*
  * DialogBoxManager Class Definition
  * Handles the lifecycle and interactions of a UI dialog element.
  * =========================================================
  * This code is a modified adaptation, preserving core functionality
  * while introducing structural and naming variations.
  */

  var DialogBoxManager = function ( contentElement, configObject ) {
    // Store configuration for this dialog instance
    this.preferences = configObject;
    // Wrap the provided content element with jQuery, and attach event handlers
    this.viewContainer = jqueryRef(contentElement);

    // Initial check for content element validity
    if (!this.viewContainer.length) {
      console.warn('DialogBoxManager: No content element provided or found.');
      return; // Abort if no element to manage
    }

    // Bind a click handler to dismiss the dialog
    this.viewContainer.on('click.dialogDismiss', '[data-action="close-dialog"]', jqueryRef.proxy(this.conceal, this));

    // Initialize visibility state
    this.isVisible = false;
  }

  DialogBoxManager.prototype = {

      // Explicitly define the constructor for clarity
      constructor: DialogBoxManager

    , flipVisibility: function () {
        // Guard clause: only toggle if enabled in preferences
        if (this.preferences && this.preferences.enableToggle === false) {
            console.log('Dialog toggle is disabled by configuration.');
            return;
        }
        // Use a boolean check to decide whether to show or hide
        if (!this.isVisible) {
            return this.reveal();
        } else {
            return this.conceal();
        }
      }

    , reveal: function () {
        var currentInstance = this; // Capture 'this' for nested functions

        // Prevent showing if already visible
        if (this.isVisible) {
            console.log('Dialog already visible, skipping reveal operation.');
            return;
        }

        // Add a class to the body to signify an active dialog
        jqueryRef('body').addClass('dialog-active');

        // Update internal state and trigger a custom event
        this.isVisible = true;
        this.viewContainer.trigger('beforeReveal'); // Custom event before display

        // Activate keyboard listener for dismissal
        keyboardListener.call(this, true);

        // Manage the overlay and then display the dialog content
        overlayManager.call(this, true, function () {
          var useAnimation = jqueryRef.support.transition && currentInstance.viewContainer.hasClass('fading-effect');

          // If the container is not in the DOM, append it to the body
          // This check prevents unnecessary DOM manipulation if already placed
          if (!currentInstance.viewContainer.parent().length) {
            currentInstance.viewContainer.appendTo(document.body);
          }

          // Make the element visible
          currentInstance.viewContainer.show();

          // Force reflow for CSS transitions to apply correctly
          if (useAnimation) {
            currentInstance.viewContainer[0].offsetWidth;
          }

          // Add the active class to trigger CSS animations
          currentInstance.viewContainer.addClass('active-display');

          // Handle 'afterReveal' event based on animation status
          if (useAnimation) {
            currentInstance.viewContainer.one(jqueryRef.support.transition.end, function () {
              currentInstance.viewContainer.trigger('afterReveal');
            });
          } else {
            currentInstance.viewContainer.trigger('afterReveal');
          }
        });
      }

    , conceal: function ( domEvent ) {
        // Prevent default event behavior if an event object is provided
        if (domEvent) {
            domEvent.preventDefault();
        }

        // Guard clause: Do nothing if dialog is not visible
        if (!this.isVisible) {
            console.log('Dialog is not visible, skipping concealment.');
            return;
        }

        var currentInstance = this; // Store 'this' for asynchronous operations
        this.isVisible = false; // Update internal state

        // Remove body class
        jqueryRef('body').removeClass('dialog-active');

        // Deactivate keyboard listener
        keyboardListener.call(this, false);

        // Trigger custom 'beforeConceal' event and remove active class
        this.viewContainer
          .trigger('beforeConceal')
          .removeClass('active-display');

        // Decide between animated or immediate concealment
        var hasFadingEffect = jqueryRef.support.transition && this.viewContainer.hasClass('fading-effect');
        if (hasFadingEffect) {
          animateOut.call(this);
        } else {
          performFinalHide.call(this);
        }
      }
  }


 /*
  * Dialog Internal Utility Functions
  * These functions are designed to operate within the context of a DialogBoxManager instance.
  * ===================== */

  // Function to handle animated hiding of the dialog
  function animateOut() {
    var currentInstance = this;
    var animationDuration = 500; // Milliseconds, should match CSS transition duration

    // Set a fallback timer to ensure the dialog hides even if transitionend doesn't fire
    var animationTimeout = setTimeout(function () {
      currentInstance.viewContainer.off(jqueryRef.support.transition.end); // Clean up event listener
      performFinalHide.call(currentInstance); // Perform final hide operation
    }, animationDuration);

    // Listen for the CSS transition end event
    this.viewContainer.one(jqueryRef.support.transition.end, function () {
      clearTimeout(animationTimeout); // Clear the fallback timer
      performFinalHide.call(currentInstance); // Perform final hide operation
    });
  }

  // Function for the final steps of hiding the dialog
  function performFinalHide() {
    // Guard against calling on a non-existent element
    if (!this.viewContainer || !this.viewContainer.length) {
      console.warn('performFinalHide called without a valid viewContainer.');
      return;
    }
    this.viewContainer
      .hide() // Hide the element
      .trigger('afterConceal'); // Trigger custom 'afterConceal' event

    // Remove the overlay if it exists
    overlayManager.call(this, false);
  }

  // Manages the overlay (backdrop) element
  function overlayManager( displayOverlay, completionCallback ) {
    var currentInstance = this;
    // Determine if animation should be used for the overlay
    var overlayAnimationClass = this.viewContainer.hasClass('fading-effect') ? 'fading-effect' : '';

    if (displayOverlay && this.preferences.useOverlay) {
      var applyOverlayAnimation = jqueryRef.support.transition && overlayAnimationClass;

      // Create and append the overlay element
      this.overlayElement = jqueryRef('<div class="dialog-overlay ' + overlayAnimationClass + '" />')
        .appendTo(document.body); // Append to body for full screen coverage

      // If overlay is not static, allow clicking it to dismiss the dialog
      if (this.preferences.overlayInteraction !== 'static') {
        this.overlayElement.on('click.dialogDismiss', jqueryRef.proxy(this.conceal, this));
      }

      // Force reflow for CSS transitions
      if (applyOverlayAnimation) {
        this.overlayElement[0].offsetWidth;
      }

      // Add active class to show the overlay
      this.overlayElement.addClass('active-display');

      // Execute callback after animation or immediately
      if (applyOverlayAnimation) {
        this.overlayElement.one(jqueryRef.support.transition.end, completionCallback);
      } else {
        if (completionCallback) {
            completionCallback();
        }
      }

    } else if (!displayOverlay && this.overlayElement) {
      // Hide and remove the overlay
      this.overlayElement.removeClass('active-display');

      var removeAnim = jqueryRef.support.transition && this.viewContainer.hasClass('fading-effect');
      if (removeAnim) {
        this.overlayElement.one(jqueryRef.support.transition.end, jqueryRef.proxy(destroyShield, this));
      } else {
        destroyShield.call(this);
      }
    } else if (completionCallback) {
      // If no overlay is needed/present, just call the callback
      completionCallback();
    }
  }

  // Function to remove the overlay element from the DOM
  function destroyShield() {
    // Ensure the overlay element exists before attempting to remove
    if (this.overlayElement && this.overlayElement.length) {
      this.overlayElement.remove();
      this.overlayElement = null; // Clear the reference
    }
  }

  // Handles keyboard events for dialog dismissal
  function keyboardListener( activate ) {
    var currentInstance = this;
    var escapeKeyCode = 27; // ASCII code for the Escape key

    // Guard clause: check if keyboard interaction is enabled
    if (!this.preferences || !this.preferences.keyboardInteraction) {
        return;
    }

    if (activate && this.isVisible) {
      jqueryRef(document).on('keyup.dialogDismiss', function ( keyEvent ) {
        // Dismiss if Escape key is pressed
        if (keyEvent.which === escapeKeyCode) {
            currentInstance.conceal();
        }
      });
    } else if (!activate && !this.isVisible) {
      // Deactivate listener when dialog is hidden
      jqueryRef(document).off('keyup.dialogDismiss');
    }
  }


 /*
  * jQuery Plugin Definition for DialogBoxManager
  * ======================= */

  jqueryRef.fn.dialog = function ( actionParam ) {
    // Iterate over each selected element
    return this.each(function () {
      var invokingElement = jqueryRef(this);
      var instanceCache = invokingElement.data('dialog'); // Retrieve existing instance
      var mergedConfig;

      // Merge default settings, data attributes, and provided options
      // Ensure standardSettings exist before merging
      if (!jqueryRef.fn.dialog.standardSettings) {
          jqueryRef.fn.dialog.standardSettings = {}; // Initialize if not present
      }
      mergedConfig = jqueryRef.extend({}, jqueryRef.fn.dialog.standardSettings, invokingElement.data(), typeof actionParam === 'object' && actionParam);

      // Create a new instance if one doesn't exist
      if (!instanceCache) {
        invokingElement.data('dialog', (instanceCache = new DialogBoxManager(this, mergedConfig)));
      }

      // Execute a method based on the actionParam
      if (typeof actionParam === 'string') {
        // Validate method existence before calling
        if (typeof instanceCache[actionParam] === 'function') {
            instanceCache[actionParam]();
        } else {
            console.warn('Dialog method "' + actionParam + '" does not exist.');
        }
      } else if (mergedConfig.displayOnLoad) { // Renamed from 'show' to 'displayOnLoad'
        instanceCache.reveal();
      }
    });
  }

  // Default configuration settings for dialog instances
  jqueryRef.fn.dialog.standardSettings = {
      useOverlay: true     // Whether to show a background overlay
    , keyboardInteraction: true // Allow dismissal with keyboard (Escape key)
    , displayOnLoad: true    // Automatically show the dialog when initialized
    , enableToggle: true     // Allow the toggle method to function
    , overlayInteraction: 'click' // Can be 'click' or 'static'
  }

  // Expose the constructor for direct instantiation or extension
  jqueryRef.fn.dialog.ImplementationClass = DialogBoxManager


 /*
  * Data-API Integration for Declarative Dialog Activation
  * ============================== */

  jqueryRef(function () {
    jqueryRef('body').on('click.dialog.data-api', '[data-toggle-dialog]', function ( domEvent ) {
      var invokingElement = jqueryRef(this);
      // Ensure default action is prevented to avoid navigation
      if (!domEvent.isDefaultPrevented()) {
        domEvent.preventDefault();
      }

      var targetSelector;
      var targetHref = invokingElement.attr('href');
      // Determine the target element for the dialog
      if (invokingElement.attr('data-target')) {
          targetSelector = invokingElement.attr('data-target');
      } else if (targetHref) {
          // Strip hash for IE7 compatibility, if needed
          targetSelector = targetHref.replace(/.*(?=#[^\s]+$)/, '');
      } else {
          console.warn('Dialog data-api: No target specified via data-target or href.');
          return;
      }

      var targetDialogElement = jqueryRef(targetSelector);
      var dialogAction;

      // If dialog already initialized on target, just toggle, otherwise merge options
      if (targetDialogElement.data('dialog')) {
        dialogAction = 'flipVisibility';
      } else {
        dialogAction = jqueryRef.extend({}, targetDialogElement.data(), invokingElement.data());
      }

      targetDialogElement.dialog(dialogAction);
    })
  })

}( window.jQuery );