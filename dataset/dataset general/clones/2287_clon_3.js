/* eslint-disable no-console */
/* global jQuery: true, App: true */

// This module provides functionality for managing modal dialog windows within the application.
// It supports various animations, remote content loading, and user interaction options.

;(function ($, windowRef, documentRef, undefined) {
  'use strict';

  // Ensure our global App object exists and its components namespace
  if (typeof windowRef.App === 'undefined') {
    windowRef.App = {};
  }
  if (typeof App.components === 'undefined') {
    App.components = {};
  }

  // --- Main Modal Window Component Definition ---
  App.components.modalWindow = {
    id: 'modalWindow',
    release: '1.1.0-alpha', // Updated version number for this cloned component
    isBusy: false, // Renamed from 'locked' to indicate active operation (prevents re-entry)
    focusElements: 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]', // Selector for elements that can receive focus

    // Default configuration for modal instances
    configuration: {
      transitionEffect: 'slideFade', // Renamed from 'animation' (e.g., 'fade', 'pop', 'slideFade', 'none')
      transitionDuration: 350, // Renamed from 'animationSpeed' (milliseconds)
      dismissOnOverlayClick: true, // Renamed from 'closeOnBackgroundClick'
      dismissOnEscape: true, // Renamed from 'closeOnEsc'
      closeTriggerClass: 'dismiss-modal-trigger', // Renamed from 'dismissModalClass'
      overlayClass: 'modal-window-overlay', // Renamed from 'bgClass', class for the background overlay
      dialogContainerClass: 'modal-window-dialog', // Class applied to the main modal content container
      onOpenStart: $.noop, // Callback function before modal begins opening animation
      onOpenComplete: $.noop, // Callback function after modal opening animation completes
      onCloseStart: $.noop, // Callback function before modal begins closing animation
      onCloseComplete: $.noop, // Callback function after modal closing animation completes
      overlayElement: null, // jQuery object for the overlay, initialized on first use
      styleProps: { // Renamed from 'css', defines CSS properties for active/inactive states
        active: {
          'opacity': 1,
          'visibility': 'visible',
          'display': 'block' // Can be 'flex' for advanced centering with CSS
        },
        inactive: {
          'opacity': 0,
          'visibility': 'hidden',
          'display': 'none'
        }
      },
      focusOnOpen: true, // If true, attempts to focus the first interactive element on open
      trapFocus: true, // If true, traps keyboard focus within the modal (functionality added in setupAccessibility)
      ariaModal: true // If true, adds ARIA attributes for improved accessibility
    },

    // --- Internal Utility Function (Cloned and Modified from Foundation.delay) ---
    // Debounces or delays execution of a function.
    deferExecution: function (callback, timeout) {
      var timer;
      // Return a function that, when called, will clear any previous timer
      // and set a new one to execute the callback after 'timeout' milliseconds.
      return function () {
        var args = Array.prototype.slice.call(arguments); // Capture arguments for the callback
        clearTimeout(timer);
        timer = setTimeout(function () {
          callback.apply(this, args); // Apply captured arguments to the callback
        }.bind(this), timeout);
      };
    },

    // Initializes the modal window component for a given context element.
    // Can be called with options for configuration or a string for a method call.
    initialize: function (contextElement, actionName, parameters) {
      // Validate jQuery presence, which is essential for this component
      if (typeof jQuery === 'undefined') {
        console.error('jQuery is required for App.components.modalWindow to function.');
        return;
      }

      // Store the context element (expected to be a jQuery object) for the instance
      this.contextElement = contextElement;

      // Handle configuration merging:
      // If the second argument is an object, it's a configuration object.
      // If the third argument exists, it's a configuration object.
      if (typeof actionName === 'object') {
        $.extend(true, this.configuration, actionName);
      } else if (typeof parameters !== 'undefined') {
        $.extend(true, this.configuration, parameters);
      }

      // If a specific action (method name) is provided as a string, execute it.
      // Otherwise, set up event listeners for the component.
      if (typeof actionName !== 'string') {
        this.setupEventListeners();
        // Indicate successful initialization
        return true;
      } else {
        // Ensure the requested action exists and is a function before calling
        if (typeof this[actionName] === 'function') {
          return this[actionName].call(this, parameters);
        } else {
          console.warn('Modal window action "' + actionName + '" not found on App.components.modalWindow.');
          return false;
        }
      }
    },

    // Sets up all necessary event listeners for modal interactions (triggers, dismissals, keyboard)
    setupEventListeners: function () {
      var instanceRef = this; // Renamed from 'self' for better readability in callbacks
      var $document = $(documentRef); // Cached document reference for efficiency

      // Event delegation on the context element (e.g., 'body' or a specific container)
      $(this.contextElement)
        .off('.app.modal') // Clear all previous event handlers for this namespace to prevent duplicates
        .on('click.app.modal', '[data-modal-id]', function (eventObj) { // Detect clicks on modal trigger elements
          eventObj.preventDefault(); // Prevent default link/button action

          if (instanceRef.isBusy) {
            console.log('Modal system busy, ignoring trigger click.');
            return; // Guard clause: prevent multiple modal actions simultaneously
          }

          var $trigger = $(this); // The element that triggered the modal
          var remoteContentSource = $trigger.data('modal-ajax'); // Check for remote content loading via AJAX

          instanceRef.isBusy = true; // Set busy state to prevent re-entry during an operation

          if (typeof remoteContentSource === 'undefined') {
            // Open modal directly if no AJAX content is specified
            instanceRef.display.call(instanceRef, $trigger);
          } else {
            // Load content via AJAX if 'data-modal-ajax' is present
            var resourcePath = remoteContentSource === true ? $trigger.attr('href') : remoteContentSource;
            if (!resourcePath) {
              console.warn('No resource path found for remote content modal. Trigger:', $trigger[0]);
              instanceRef.isBusy = false; // Reset busy state on error
              return;
            }
            instanceRef.display.call(instanceRef, $trigger, { url: resourcePath });
          }
        })
        .on('click.app.modal pointerup.app.modal', this.getDismissTriggers(), function (eventObj) { // Event for dismissing modals
          eventObj.preventDefault(); // Prevent default action for dismiss triggers

          if (instanceRef.isBusy) {
            console.log('Modal system busy, ignoring dismiss click/tap.');
            return; // Guard clause
          }

          // Find the closest dialog element to the clicked target
          var $dialogToClose = $(this).closest('.' + instanceRef.configuration.dialogContainerClass);
          if ($dialogToClose.length === 0) {
              console.warn('Dismiss trigger clicked but no parent modal dialog found to close. Target:', eventObj.target);
              return;
          }

          // Get settings, potentially overridden by data attributes on the modal itself
          var currentSettings = $.extend({}, instanceRef.configuration, instanceRef.extractDataAttributes($dialogToClose));

          // If the click target is the overlay and overlay dismissal is disabled, do nothing
          if ($(eventObj.target)[0] === $('.' + currentSettings.overlayClass)[0] && !currentSettings.dismissOnOverlayClick) {
            console.log('Overlay click ignored due to dismissOnOverlayClick setting.');
            return;
          }

          instanceRef.isBusy = true; // Set busy state
          instanceRef.conceal.call(instanceRef, $dialogToClose); // Close the detected dialog
        })
        // Custom events for modal lifecycle hooks, allowing external code to react
        .on('modalOpenStart.app.modal', '.' + this.configuration.dialogContainerClass, this.configuration.onOpenStart)
        .on('modalOpenComplete.app.modal', '.' + this.configuration.dialogContainerClass, this.configuration.onOpenComplete)
        .on('modalOpenComplete.app.modal', '.' + this.configuration.dialogContainerClass, this.embedVideo)
        .on('modalCloseStart.app.modal', '.' + this.configuration.dialogContainerClass, this.configuration.onCloseStart)
        .on('modalCloseComplete.app.modal', '.' + this.configuration.dialogContainerClass, this.configuration.onCloseComplete)
        .on('modalCloseComplete.app.modal', '.' + this.configuration.dialogContainerClass, this.unembedVideo)
        .on('modalCloseComplete.app.modal', '.' + this.configuration.dialogContainerClass, function () {
          instanceRef.resetState(); // Always reset busy state after a modal closes
        });

      // Keyboard event listener for Escape key dismissal, delegated to document
      $document.on('keyup.app.modal', function (eventObj) {
        var $activeDialog = $('.' + instanceRef.configuration.dialogContainerClass + '[data-modal-active="true"]');
        if ($activeDialog.length === 0) return; // No active dialog to dismiss

        var currentSettings = $.extend({}, instanceRef.configuration, instanceRef.extractDataAttributes($activeDialog));
        if (eventObj.which === 27 && currentSettings.dismissOnEscape) { // 27 is the keycode for the Escape key
          if (instanceRef.isBusy) {
            console.log('Modal system busy, ignoring escape key press.');
            return;
          }
          instanceRef.isBusy = true; // Set busy state
          instanceRef.conceal.call(instanceRef, $activeDialog);
        }
      });

      // Add a resize listener to re-center active modals (new addition for responsive design)
      $(windowRef).on('resize.app.modal', this.deferExecution(function() {
        var $activeDialog = $('.' + instanceRef.configuration.dialogContainerClass + '[data-modal-active="true"]');
        if ($activeDialog.length > 0) {
          instanceRef.centerDialog($activeDialog);
        }
      }, 100)); // Debounce resize event to prevent performance issues

      return true;
    },

    // Displays a modal dialog, optionally loading content via AJAX.
    // $triggerElement: The element that initiated the open (e.g., a button).
    // fetchOptions: An object containing AJAX settings if content needs to be loaded.
    display: function ($triggerElement, fetchOptions) {
      var instanceRef = this;
      var $dialogElement;

      // Determine the target dialog element based on the trigger or the component's context
      if ($triggerElement && $triggerElement.data('modal-id')) {
        $dialogElement = $('#' + $triggerElement.data('modal-id'));
      } else if (this.contextElement) {
        // If contextElement is the dialog itself or contains it
        $dialogElement = $(this.contextElement).filter('.' + this.configuration.dialogContainerClass);
        if ($dialogElement.length === 0) {
          $dialogElement = $(this.contextElement).find('.' + this.configuration.dialogContainerClass).first();
        }
      }

      if (!$dialogElement || $dialogElement.length === 0) {
        console.error('No valid dialog element found for display. Trigger:', $triggerElement ? $triggerElement[0] : 'N/A');
        this.isBusy = false; // Reset busy state if no dialog is found
        return;
      }

      // Only proceed if the dialog is not already active
      if ($dialogElement.attr('data-modal-active') !== 'true') {
        var $currentlyOpenDialog = $('.' + this.configuration.dialogContainerClass + '[data-modal-active="true"]');

        // Cache initial top position and calculate offset for animation if not already done
        if (typeof $dialogElement.data('initial-top') === 'undefined') {
          $dialogElement.data('initial-top', parseFloat($dialogElement.css('top')) || 0)
            .data('computed-offset', this.calculateInitialOffset($dialogElement));
        }

        // Trigger custom open start event, allowing external handlers to prepare
        $dialogElement.trigger('modalOpenStart.app.modal');

        // Manage overlay display (show it if no other modals are currently active)
        if ($currentlyOpenDialog.length < 1) {
          this.manageOverlay($dialogElement);
        }

        // Handle remote content loading via AJAX
        if (typeof fetchOptions === 'undefined' || !fetchOptions.url) {
          // No AJAX, just show the modal directly
          this.conceal($currentlyOpenDialog, this.configuration.styleProps.inactive); // Hide any other open modals first
          this.reveal($dialogElement, this.configuration.styleProps.active); // Show the target modal
          this.isBusy = false; // Reset busy state immediately if no AJAX
        } else {
          // AJAX content loading
          var originalSuccessHandler = typeof fetchOptions.success !== 'undefined' ? fetchOptions.success : $.noop;

          $.extend(fetchOptions, {
            success: function (responseContent, statusText, xhrObject) {
              if ($.isFunction(originalSuccessHandler)) {
                originalSuccessHandler(responseContent, statusText, xhrObject);
              }

              $dialogElement.html(responseContent);
              // Trigger a custom event for content refreshed, allowing other components to re-initialize
              $dialogElement.trigger('modalContentRefreshed.app.modal');

              instanceRef.conceal($currentlyOpenDialog, instanceRef.configuration.styleProps.inactive);
              instanceRef.reveal($dialogElement, instanceRef.configuration.styleProps.active);
              instanceRef.isBusy = false; // Reset busy state after AJAX and display
            },
            error: function(xhr, status, error) { // Added comprehensive error handling for AJAX requests
              console.error('Failed to load modal content:', error, status, xhr);
              instanceRef.isBusy = false; // Reset busy state on error
              $dialogElement.trigger('modalLoadError.app.modal', [error, status, xhr]);
            }
          });

          // Perform the AJAX request
          $.ajax(fetchOptions);
        }
        this.setupAccessibility($dialogElement); // New: setup ARIA attributes for screen readers
        this.centerDialog($dialogElement); // New: ensure dialog is centered on screen, especially after content load
        this.focusFirstElement($dialogElement); // New: focus the first interactive element for accessibility
      } else {
        console.log('Dialog is already active, ignoring display request for:', $dialogElement[0]);
        this.isBusy = false; // Reset busy state if no action was taken
      }
    },

    // Conceals (closes) a modal dialog.
    // $dialogElementToClose: The specific dialog element to close. If not provided, attempts to find the active one.
    conceal: function ($dialogElementToClose) {
      var instanceRef = this;

      // Prioritize the passed dialog, then check the instance's context, then globally for any active modal
      var $dialogElement = ($dialogElementToClose && $dialogElementToClose.length) ? $dialogElementToClose : $(this.contextElement).filter('[data-modal-active="true"]');
      if ($dialogElement.length === 0) {
        $dialogElement = $('.' + this.configuration.dialogContainerClass + '[data-modal-active="true"]').first();
      }

      if ($dialogElement.length === 0) {
        console.warn('No active modal dialog found to conceal.');
        this.isBusy = false; // Reset busy state if nothing to close
        return;
      }

      // Trigger custom close start event
      $dialogElement.trigger('modalCloseStart.app.modal');

      this.manageOverlay($dialogElement); // Manage overlay display (hide if no other modals are open)
      this.teardownAccessibility($dialogElement); // New: remove ARIA attributes for accessibility
      this.hide($dialogElement, this.configuration.styleProps.inactive, function() {
        instanceRef.resetState(); // Ensure busy state is reset after animation completes
      });
    },

    // Determines which elements should trigger modal dismissal (e.g., close button, overlay).
    getDismissTriggers: function () {
      var baseSelector = '.' + this.configuration.closeTriggerClass;

      if (this.configuration.dismissOnOverlayClick) {
        return baseSelector + ', .' + this.configuration.overlayClass;
      }

      return baseSelector;
    },

    // Manages the display of the modal overlay element (creating it if necessary).
    manageOverlay: function ($dialogElement) {
      var $overlay = this.configuration.overlayElement;

      // Create overlay if it doesn't exist or is not attached to the DOM
      if (!$overlay || $overlay.length === 0 || !$overlay.parent().length) {
        $overlay = $('<div />', { 'class': this.configuration.overlayClass, 'tabindex': '-1' }) // Added tabindex for accessibility
          .appendTo('body');
        this.configuration.overlayElement = $overlay; // Cache the created overlay for future use
      }

      var $activeModals = $('.' + this.configuration.dialogContainerClass + '[data-modal-active="true"]');

      // Logic to show/hide overlay based on active modal count
      if ($dialogElement.attr('data-modal-active') !== 'true' && $activeModals.length === 0) {
        // Dialog is becoming active, and no other modals are open -> show overlay
        this.reveal($overlay);
      } else if ($dialogElement.attr('data-modal-active') === 'true' && $activeModals.length === 1) {
        // Dialog is active and being closed, and it's the only one -> hide overlay
        this.conceal($overlay);
      }
      // If multiple modals are open or closing, the overlay state won't change here
      // (it remains visible until the last modal closes).
    },

    // Reveals (shows) an element with animation. Used for both dialogs and overlays.
    reveal: function ($element, styleProps) {
      var instanceRef = this;
      var currentSettings = $.extend({}, this.configuration, this.extractDataAttributes($element));
      var animationType = currentSettings.transitionEffect.toLowerCase();
      var animationDuration = currentSettings.transitionDuration;
      var $window = $(windowRef);

      // If styleProps are provided, it's a modal dialog; apply specific animations
      if (styleProps) {
        if (/slidefade|pop/i.test(animationType)) {
          var initialTop = $element.data('initial-top') || 0;
          var offset = $element.data('computed-offset') || 0;

          // Set initial state for animation (off-screen above, transparent)
          $element.css($.extend({}, styleProps, {
            top: ($window.scrollTop() - offset) + 'px',
            opacity: 0
          }));

          var targetStyle = {
            top: ($window.scrollTop() + initialTop) + 'px', // Animate to original top position
            opacity: 1
          };

          // Use deferExecution to ensure initial CSS is applied before animation starts
          this.deferExecution(function () {
            $element
              .animate(targetStyle, animationDuration, 'easeOutQuad', function () { // Using 'easeOutQuad' easing
                $element.trigger('modalOpenComplete.app.modal');
              })
              .attr('data-modal-active', 'true'); // Mark as active using data attribute
          }, animationDuration / 4)(); // Short delay before animation starts
        } else if (/fade/i.test(animationType)) {
          $element.css($.extend({}, styleProps, { opacity: 0 })); // Start transparent
          var targetStyle = { opacity: 1 };

          this.deferExecution(function () {
            $element
              .animate(targetStyle, animationDuration, 'easeOutQuad', function () {
                $element.trigger('modalOpenComplete.app.modal');
              })
              .attr('data-modal-active', 'true');
          }, animationDuration / 4)();
        } else { // No animation, just show instantly
          $element.css(styleProps).show().css({ opacity: 1 }).attr('data-modal-active', 'true').trigger('modalOpenComplete.app.modal');
        }
      } else { // This is likely the background overlay, animate it
        if (/fade/i.test(animationType)) {
          $element.fadeIn(animationDuration / 2);
        } else {
          $element.show();
        }
      }
    },

    // Conceals (hides) an element with animation. Used for both dialogs and overlays.
    conceal: function ($element, styleProps, callback) {
      var instanceRef = this;
      var currentSettings = $.extend({}, this.configuration, this.extractDataAttributes($element));
      var animationType = currentSettings.transitionEffect.toLowerCase();
      var animationDuration = currentSettings.transitionDuration;
      var $window = $(windowRef);

      // Callback to execute after animation/hide completes
      var completeCallback = function() {
        $element.css(styleProps).trigger('modalCloseComplete.app.modal');
        $element.removeAttr('data-modal-active'); // Remove active marker
        if (typeof callback === 'function') {
          callback();
        }
      };

      // If styleProps are provided, it's a modal dialog; apply specific animations
      if (styleProps) {
        if (/slidefade|pop/i.test(animationType)) {
          var offset = $element.data('computed-offset') || 0;
          var targetStyle = {
            top: ($window.scrollTop() - offset) + 'px', // Animate off-screen upwards
            opacity: 0
          };

          this.deferExecution(function () {
            $element
              .animate(targetStyle, animationDuration, 'easeInQuad', completeCallback); // Using 'easeInQuad' easing
          }, animationDuration / 4)();
        } else if (/fade/i.test(animationType)) {
          var targetStyle = { opacity: 0 };

          this.deferExecution(function () {
            $element
              .animate(targetStyle, animationDuration, 'easeInQuad', completeCallback);
          }, animationDuration / 4)();
        } else { // No animation, just hide instantly
          $element.hide().css(styleProps).removeAttr('data-modal-active').trigger('modalCloseComplete.app.modal');
          if (typeof callback === 'function') {
            callback();
          }
        }
      } else { // This is likely the background overlay, animate it
        if (/fade/i.test(animationType)) {
          $element.fadeOut(animationDuration / 2, callback);
        } else {
          $element.hide();
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    },

    // Handles embedding video content (e.g., from YouTube/Vimeo) on modal open to start playback.
    embedVideo: function (eventObj) {
      var $dialogElement = $(this);
      var $videoContainer = $dialogElement.find('.flex-video');
      var $videoFrame = $videoContainer.find('iframe');

      if ($videoFrame.length > 0) {
        var dataSrc = $videoFrame.attr('data-src');
        if (dataSrc) {
          $videoFrame.attr('src', dataSrc); // Restore original src from data-src
        } else {
          // If no data-src, re-setting src often restarts video playback (e.g., for YouTube's autoplay)
          var currentSrc = $videoFrame.attr('src');
          if (currentSrc) $videoFrame.attr('src', currentSrc);
        }
        $videoContainer.show();
      }
    },

    // Handles unembedding video content on modal close to stop playback and save resources.
    unembedVideo: function (eventObj) {
      var $dialogElement = $(this);
      var $videoContainer = $dialogElement.find('.flex-video');
      var $videoFrame = $videoContainer.find('iframe');

      if ($videoFrame.length > 0) {
        // Store current src in data-src if not already set, then clear src to stop video
        if (!$videoFrame.attr('data-src')) {
          $videoFrame.attr('data-src', $videoFrame.attr('src'));
        }
        $videoFrame.attr('src', 'about:blank'); // Clear src to stop video playback
        $videoContainer.hide();
      }
    },

    // Calculates the initial vertical offset for animation purposes, ensuring accurate positioning.
    calculateInitialOffset: function ($dialogElement) {
      if ($dialogElement.length === 0) return 0;

      // Temporarily show element to get accurate dimensions, then revert to original state
      var originalDisplay = $dialogElement.css('display');
      var originalVisibility = $dialogElement.css('visibility');
      $dialogElement.css({
        visibility: 'hidden',
        display: 'block' // Ensure it's block-level for correct height calculation
      });
      var calculatedHeight = $dialogElement.outerHeight();
      var currentTop = parseFloat($dialogElement.css('top')) || 0;
      $dialogElement.css({
        display: originalDisplay,
        visibility: originalVisibility // Restore original display/visibility
      });

      return calculatedHeight + currentTop;
    },

    // Dynamically centers the dialog element on the screen (new addition for better UX).
    centerDialog: function($dialogElement) {
      if ($dialogElement.length === 0) return;

      var $window = $(windowRef);
      var windowHeight = $window.height();
      var windowWidth = $window.width();
      var dialogHeight = $dialogElement.outerHeight();
      var dialogWidth = $dialogElement.outerWidth();

      // Calculate new top and left positions, ensuring it stays within viewport
      var newTop = Math.max(0, ($window.scrollTop() + (windowHeight - dialogHeight) / 2));
      var newLeft = Math.max(0, (windowWidth - dialogWidth) / 2);

      $dialogElement.css({
        top: newTop + 'px',
        left: newLeft + 'px',
        margin: 0 // Clear any interfering margins that might offset positioning
      });
    },

    // Focuses the first interactive element inside the modal for improved accessibility (new addition).
    focusFirstElement: function($dialogElement) {
      var currentSettings = $.extend({}, this.configuration, this.extractDataAttributes($dialogElement));
      if (!currentSettings.focusOnOpen) return;

      // Find visible, focusable elements within the dialog
      var $focusableElements = $dialogElement.find(this.focusElements).filter(':visible');
      if ($focusableElements.length > 0) {
        setTimeout(function() { // Defer focus to ensure modal is fully rendered and visible
          $focusableElements.first().focus();
        }, 100);
      }
    },

    // Sets up ARIA attributes for screen readers to announce the modal's presence and role (new addition).
    setupAccessibility: function($dialogElement) {
      var currentSettings = $.extend({}, this.configuration, this.extractDataAttributes($dialogElement));
      if (!currentSettings.ariaModal) return;

      // Ensure the modal has an ID for aria-labelledby and other references
      var modalId = $dialogElement.attr('id') || 'modal-' + Math.random().toString(36).substr(2, 9);
      $dialogElement.attr({
        'id': modalId,
        'role': 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': $dialogElement.find('h1, h2, h3, h4, h5, h6').first().attr('id') || '', // Link to a heading for accessible name
        'tabindex': '-1' // Make modal itself focusable to receive initial focus
      });

      $('body').attr('aria-hidden', 'true'); // Hide content behind modal for screen readers
      $dialogElement.focus(); // Focus the modal itself on open
    },

    // Removes ARIA attributes when the modal closes (new addition).
    teardownAccessibility: function($dialogElement) {
      var currentSettings = $.extend({}, this.configuration, this.extractDataAttributes($dialogElement));
      if (!currentSettings.ariaModal) return;

      $dialogElement.removeAttr('role aria-modal aria-labelledby tabindex');
      $('body').removeAttr('aria-hidden');
      // In a more complete implementation, focus would be returned to the element that triggered the modal.
    },

    // Resets the component's internal state, particularly the busy flag.
    resetState: function() {
      this.isBusy = false;
      // Future: could clear any other temporary state or timers here
    },

    // Cleans up all event listeners and removes the overlay from the DOM when the component is destroyed.
    teardown: function () {
      $(this.contextElement).off('.app.modal');
      $(documentRef).off('keyup.app.modal');
      $(windowRef).off('resize.app.modal');
      if (this.configuration.overlayElement && this.configuration.overlayElement.length) {
        this.configuration.overlayElement.remove(); // Remove overlay from DOM
        this.configuration.overlayElement = null;
      }
      this.resetState(); // Reset state on teardown
    },

    // Extracts configuration options from element's data attributes, overriding defaults.
    extractDataAttributes: function ($element) {
      var dataOptions = {};
      if ($element && $element.data()) {
        if ($element.data('modal-effect')) dataOptions.transitionEffect = $element.data('modal-effect');
        if ($element.data('modal-speed')) dataOptions.transitionDuration = $element.data('modal-speed');
        if (typeof $element.data('dismiss-on-overlay-click') !== 'undefined') dataOptions.dismissOnOverlayClick = $element.data('dismiss-on-overlay-click');
        if (typeof $element.data('dismiss-on-escape') !== 'undefined') dataOptions.dismissOnEscape = $element.data('dismiss-on-escape');
        if (typeof $element.data('focus-on-open') !== 'undefined') dataOptions.focusOnOpen = $element.data('focus-on-open');
        if (typeof $element.data('trap-focus') !== 'undefined') dataOptions.trapFocus = $element.data('trap-focus');
        if (typeof $element.data('aria-modal') !== 'undefined') dataOptions.ariaModal = $element.data('aria-modal');
      }
      return dataOptions;
    }
    // The empty 'reflow' method from the original was removed as it served no functional purpose.
  };

  // Extend jQuery prototype to allow calling this component as a plugin.
  // This enables chainable calls like:
  //   $(element).modalWindow('display', { url: '/content.html' }); // Call a method
  //   $(element).modalWindow({ transitionEffect: 'slide' });      // Initialize with configuration
  //   $('#myModal').modalWindow('conceal');                       // Close a specific modal
  $.fn.modalWindow = function (action, parameters) {
    var args = Array.prototype.slice.call(arguments, 1); // Get all arguments after the action

    // If the first argument is a string, it's a method call.
    // Otherwise, it's an initialization or configuration update.
    if (typeof action === 'string') {
      // For method calls, we typically act on the first element in the jQuery collection
      // or ensure an instance exists for the element the method is called on.
      var $this = $(this);
      var instance = $this.data('modalWindowInstance'); // Retrieve existing instance

      if (!instance) {
        // If no instance, create one for the first element and initialize it
        instance = Object.create(App.components.modalWindow);
        instance.initialize($this, {}); // Initialize with default config
        $this.data('modalWindowInstance', instance); // Store the instance on the element's data
      }

      if (typeof instance[action] === 'function') {
        // Call the method on the instance
        return instance[action].apply(instance, args);
      } else {
        $.error('Method "' + action + '" does not exist on App.components.modalWindow.');
      }
    } else {
      // If action is not a string, it's an initialization or configuration update
      return this.each(function () {
        var $this = $(this);
        var instance = $this.data('modalWindowInstance');
        if (!instance) {
          // Create and initialize a new instance for each element in the collection
          instance = Object.create(App.components.modalWindow);
          instance.initialize($this, action, parameters); // Initialize with passed config
          $this.data('modalWindowInstance', instance); // Store the instance
        } else {
          // If already initialized, just update configuration on the existing instance
          instance.initialize($this, action, parameters);
        }
      });
    }
  };

}(jQuery, window, document));