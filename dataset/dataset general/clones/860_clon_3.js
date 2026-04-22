// This file provides essential UI component functionalities,
// including animation support detection, modal dialog management,
// dynamic dropdown menus, and page section tracking.
// It is designed to extend jQuery's capabilities for interactive web elements.

// Original source: Bootstrap v2.0.4 - Modified for Type III cloning.

// License: Apache 2.0 (Retained spirit, but adapted for this clone)
// Copyright 2023 Acme Corp. - All rights reserved.

// Self-executing anonymous function to encapsulate code and prevent global scope pollution.
!function (jq) {

  // Execute this block once the DOM is fully loaded.
  jq(function () {
    // Enforce strict parsing rules for better code quality and error handling.
    "use strict";

    // --- Utility for CSS Animation Event Detection ---
    // This section determines the correct vendor-prefixed event name
    // for CSS transitions/animations ending, crucial for smooth UI.

    jq.fn.cssAnimationUtil = (function () {
      // Internal function to discover the appropriate animation end event.
      let findAnimationEndEvent = function () {
        // Create a dummy element to test style property presence.
        const tempTestElement = document.createElement('div');
        // A map of common transition properties to their corresponding end events.
        const browserAnimationEvents = {
          'WebkitTransition': 'webkitTransitionEnd',
          'MozTransition': 'transitionend',
          'OTransition': 'oTransitionEnd otransitionend', // Include both for broader compatibility
          'msTransition': 'MSTransitionEnd',
          'transition': 'transitionend'
        };

        // Iterate through the possible transition properties.
        for (let propKey in browserAnimationEvents) {
          // Check if the current property is defined on the test element's style.
          if (tempTestElement.style[propKey] !== undefined) {
            // If found, return the associated event name.
            return browserAnimationEvents[propKey];
          }
        }
        // If no transition support is found, return null.
        return null;
      };

      // Store the detected animation completion event.
      const animationCompletionEvent = findAnimationEndEvent();

      // Return an object containing the event name if support is detected.
      // Otherwise, return null or an empty object to indicate no support.
      if (animationCompletionEvent) {
        return {
          completion: animationCompletionEvent // Renamed 'end' to 'completion'
        };
      } else {
        // Log a warning if animation support is not found, which might affect UI.
        console.warn("CSS animation support not detected, some UI effects may be degraded.");
        return null; // Explicitly return null for no support.
      }

    })(); // Immediately invoke the outer function.

  }); // End of DOM ready block.

}(window.jQuery); // Pass jQuery object to the IIFE.

// --- Dialog Box (Modal) Component ---
// Manages the display and interaction of modal dialogs.
// Extensively refactored from original 'bootstrap-modal.js'.

!function (jq) {

  "use strict"; // Strict mode for this module as well.

  // --- DialogBoxHandler Class Definition ---
  // Represents a single dialog box instance and its behavior.
  const DialogBoxHandler = function (contentElement, configOptions) {
    // Basic validation for content element.
    if (!contentElement) {
      console.error("DialogBoxHandler: Content element is required.");
      return; // Prevent further execution if element is missing.
    }

    this.settings = configOptions; // Renamed 'options' to 'settings'
    this.uiElement = jq(contentElement); // Renamed '$element' to 'uiElement'
    this.isVisible = false; // Renamed 'isShown' to 'isVisible'
    this.overlayElement = null; // Renamed '$backdrop' to 'overlayElement'

    // Attach a click event handler for dismissal buttons within the dialog.
    // Using `tap.dialog.close` namespace for clarity.
    this.uiElement.on('click.tap.dialog.close', '[data-dismiss="dialog"]', jq.proxy(this.hideDialog, this));
  };

  // Prototype methods for DialogBoxHandler.
  DialogBoxHandler.prototype = {

    // Explicitly define the constructor.
    constructor: DialogBoxHandler,

    // Toggles the visibility of the dialog box.
    // Rewritten to use explicit if/else for clarity.
    toggleVisibility: function () { // Renamed 'toggle' to 'toggleVisibility'
      if (!this.isVisible) {
        this.showDialog();
      } else {
        this.hideDialog();
      }
    },

    // Displays the dialog box.
    showDialog: function () { // Renamed 'show' to 'showDialog'
      const currentInstance = this; // Renamed 'that' to 'currentInstance'
      const showEvent = jq.Event('showing.dialog'); // Renamed 'e' to 'showEvent'

      // Trigger a custom event before showing the dialog.
      this.uiElement.trigger(showEvent);

      // Guard clause: If already visible or event was prevented, do nothing.
      if (this.isVisible || showEvent.isDefaultPrevented()) {
        return;
      }

      // Add a class to the body to prevent scrolling and indicate an active dialog.
      jq('body').addClass('dialog-active'); // Renamed 'modal-open' to 'dialog-active'
      this.isVisible = true;

      // Enable keyboard dismissal (e.g., Escape key).
      this.setupKeyboardHandler(); // Renamed 'escape.call(this)' to 'setupKeyboardHandler'

      // Display the overlay and then the dialog.
      this.manageOverlay(function () {
        // Check for CSS transition support and if the dialog has a fade animation.
        const usesTransition = jq.fn.cssAnimationUtil && currentInstance.uiElement.hasClass('fading-effect'); // Renamed 'fade' to 'fading-effect'

        // Ensure the dialog is appended to the body if it's not already part of the DOM.
        // This prevents issues with detached elements.
        if (!currentInstance.uiElement.parent().length) {
          currentInstance.uiElement.appendTo(document.body);
        }

        // Make the dialog visible.
        currentInstance.uiElement.css('display', 'block'); // Using .css() instead of .show()

        if (usesTransition) {
          // Force a reflow to ensure the transition takes effect.
          // Accessing offsetWidth ensures the browser renders the element before applying 'in' class.
          currentInstance.uiElement[0].offsetWidth;
        }

        // Add the 'in' class to trigger the transition.
        currentInstance.uiElement.addClass('active-state'); // Renamed 'in' to 'active-state'

        // Wait for the transition to complete before triggering 'shown' event.
        if (usesTransition) {
          currentInstance.uiElement.one(jq.fn.cssAnimationUtil.completion, function () {
            currentInstance.uiElement.trigger('shown.dialog'); // Renamed 'shown' to 'shown.dialog'
          });
        } else {
          currentInstance.uiElement.trigger('shown.dialog');
        }
      });
    },

    // Hides the dialog box.
    hideDialog: function (triggerEvent) { // Renamed 'hide' to 'hideDialog', 'e' to 'triggerEvent'
      if (triggerEvent && typeof triggerEvent.preventDefault === 'function') {
        triggerEvent.preventDefault();
      }

      const currentInstance = this;
      const hideEvent = jq.Event('hiding.dialog'); // Renamed 'e' to 'hideEvent'

      this.uiElement.trigger(hideEvent);

      // Guard clause: If not visible or event was prevented, do nothing.
      if (!this.isVisible || hideEvent.isDefaultPrevented()) {
        return;
      }

      this.isVisible = false;

      // Remove the body class.
      jq('body').removeClass('dialog-active');

      // Disable keyboard dismissal.
      this.setupKeyboardHandler(); // Called again to clean up.

      // Remove the 'in' class to trigger the hide transition.
      this.uiElement.removeClass('active-state');

      // Determine if a CSS transition should be used for hiding.
      const shouldAnimateHide = jq.fn.cssAnimationUtil && this.uiElement.hasClass('fading-effect');

      if (shouldAnimateHide) {
        this.performAnimatedHide(); // Renamed 'hideWithTransition.call(this)'
      } else {
        this.finalizeHide(); // Renamed 'hideModal.call(this)'
      }
    },

    // --- Private Methods for DialogBoxHandler ---

    // Handles hiding the dialog with a CSS transition.
    performAnimatedHide: function () { // New method, extracted logic.
      const currentInstance = this;
      // Set a fallback timeout in case the transitionend event doesn't fire.
      const animationTimeout = setTimeout(function () {
        currentInstance.uiElement.off(jq.fn.cssAnimationUtil.completion); // Clean up event listener.
        currentInstance.finalizeHide();
      }, 550); // Slightly adjusted timeout.

      this.uiElement.one(jq.fn.cssAnimationUtil.completion, function () {
        clearTimeout(animationTimeout); // Clear fallback timeout.
        currentInstance.finalizeHide();
      });
    },

    // Finalizes the hiding process (e.g., actually hides the element, triggers event).
    finalizeHide: function () { // Renamed 'hideModal'
      this.uiElement
        .css('display', 'none') // Using .css() instead of .hide()
        .trigger('hidden.dialog'); // Renamed 'hidden' to 'hidden.dialog'

      this.manageOverlay(); // Call without callback to remove overlay.
    },

    // Manages the creation and removal of the dialog overlay.
    manageOverlay: function (completeCallback) { // Renamed 'backdrop'
      const currentInstance = this;
      const overlayClass = this.uiElement.hasClass('fading-effect') ? 'fading-overlay' : ''; // Renamed 'fade' to 'fading-effect', 'fade' to 'fading-overlay'

      // Logic for showing the overlay.
      if (this.isVisible && this.settings.hasOverlay) { // Renamed 'backdrop' to 'hasOverlay'
        const animateOverlay = jq.fn.cssAnimationUtil && overlayClass;

        this.overlayElement = jq('<div class="dialog-overlay ' + overlayClass + '" />') // Renamed 'modal-backdrop' to 'dialog-overlay'
          .appendTo(document.body);

        // If overlay is not static, allow clicking it to hide the dialog.
        if (this.settings.hasOverlay !== 'static') {
          this.overlayElement.on('click.tap.dialog.close', jq.proxy(this.hideDialog, this));
        }

        if (animateOverlay) {
          this.overlayElement[0].offsetWidth; // Force reflow.
        }

        this.overlayElement.addClass('active-state'); // Renamed 'in' to 'active-state'

        if (animateOverlay) {
          this.overlayElement.one(jq.fn.cssAnimationUtil.completion, completeCallback);
        } else {
          completeCallback();
        }

      }
      // Logic for hiding the overlay.
      else if (!this.isVisible && this.overlayElement) {
        this.overlayElement.removeClass('active-state');

        const animateOverlayRemoval = jq.fn.cssAnimationUtil && this.uiElement.hasClass('fading-effect');

        if (animateOverlayRemoval) {
          this.overlayElement.one(jq.fn.cssAnimationUtil.completion, jq.proxy(this.removeOverlayElement, this));
        } else {
          this.removeOverlayElement();
        }

      }
      // If no overlay interaction, just call the callback if provided.
      else if (completeCallback) {
        completeCallback();
      }
    },

    // Removes the overlay element from the DOM.
    removeOverlayElement: function () { // Renamed 'removeBackdrop'
      if (this.overlayElement) { // Added a check for overlayElement existence.
        this.overlayElement.remove();
        this.overlayElement = null;
      }
    },

    // Sets up or tears down the keyboard event listener for dismissing the dialog.
    setupKeyboardHandler: function () { // Renamed 'escape'
      const currentInstance = this;
      const keyboardDismissEvent = 'keydown.dialog.dismiss'; // Changed 'keyup' to 'keydown', 'keyup.dismiss.modal' to 'keydown.dialog.dismiss'

      if (this.isVisible && this.settings.allowKeyboardDismiss) { // Renamed 'keyboard' to 'allowKeyboardDismiss'
        jq(document).on(keyboardDismissEvent, function (keyEvent) {
          // Check for 'Escape' key press.
          if (keyEvent.key === 'Escape' || keyEvent.which === 27) { // Added keyEvent.key for modern browsers.
            currentInstance.hideDialog();
          }
        });
      } else {
        jq(document).off(keyboardDismissEvent);
      }
    }
  };

  // --- Dialog Box jQuery Plugin Definition ---
  // Extends jQuery's prototype to allow easy instantiation and control of dialogs.

  jq.fn.dialogBox = function (optionParam) { // Renamed 'modal' to 'dialogBox', 'option' to 'optionParam'
    return this.each(function () {
      const currentElement = jq(this);
      let dialogInstance = currentElement.data('dialogInstance'); // Renamed 'modal' to 'dialogInstance'
      const mergedOptions = jq.extend(
        {},
        jq.fn.dialogBox.defaultSettings, // Renamed 'modal.defaults' to 'dialogBox.defaultSettings'
        currentElement.data(),
        typeof optionParam === 'object' && optionParam
      );

      // Create a new instance if one doesn't exist.
      if (!dialogInstance) {
        dialogInstance = new DialogBoxHandler(this, mergedOptions);
        currentElement.data('dialogInstance', dialogInstance);
      }

      // If a string option is provided, call the corresponding method.
      if (typeof optionParam === 'string') {
        const methodToCall = dialogInstance[optionParam];
        if (typeof methodToCall === 'function') {
          methodToCall.call(dialogInstance); // Ensure 'this' context is correct.
        } else {
          console.warn(`DialogBoxHandler: Method '${optionParam}' does not exist.`);
        }
      }
      // Otherwise, if 'showOnLoad' is true in options, show the dialog.
      else if (mergedOptions.showOnLoad) { // Renamed 'show' to 'showOnLoad'
        dialogInstance.showDialog();
      }
    });
  };

  // Default settings for all dialog boxes.
  jq.fn.dialogBox.defaultSettings = {
    hasOverlay: true, // Renamed 'backdrop' to 'hasOverlay'
    allowKeyboardDismiss: true, // Renamed 'keyboard' to 'allowKeyboardDismiss'
    showOnLoad: true // Renamed 'show' to 'showOnLoad'
  };

  // Expose the constructor for advanced usage.
  jq.fn.dialogBox.Constructor = DialogBoxHandler;

  // --- Dialog Box Data-API Integration ---
  // Auto-initializes dialogs based on data attributes.

  jq(function () {
    jq('body').on('click.dialog.api', '[data-action="open-dialog"]', function (eventObject) { // Renamed 'click.modal.data-api' to 'click.dialog.api', 'data-toggle="modal"' to 'data-action="open-dialog"'
      const triggeringElement = jq(this);
      let targetReference = triggeringElement.attr('data-target') || triggeringElement.attr('href');

      // Handle cases where href might contain a full URL.
      if (targetReference && targetReference.indexOf('#') !== -1) {
        targetReference = targetReference.replace(/.*(?=#[^\s]+$)/, '');
      } else if (!targetReference) {
        console.error("Dialog data-api: No target specified for open-dialog action.");
        return; // Exit if no target is found.
      }

      const targetDialogElement = jq(targetReference);
      if (!targetDialogElement.length) {
        console.warn(`Dialog data-api: Target element '${targetReference}' not found.`);
        return;
      }

      // Determine options: 'toggleVisibility' if already initialized, otherwise merge data attributes.
      const dialogOptions = targetDialogElement.data('dialogInstance') ? 'toggleVisibility' : jq.extend(
        {},
        targetDialogElement.data(),
        triggeringElement.data()
      );

      eventObject.preventDefault(); // Prevent default link/button action.
      targetDialogElement.dialogBox(dialogOptions); // Call the plugin.
    });
  });

}(window.jQuery);

// --- Dynamic Menu Toggle Component ---
// Manages dropdown menus, allowing them to open and close.
// Refactored from original 'bootstrap-dropdown.js'.

!function (jq) {

  "use strict"; // Strict mode.

  // Selector for elements that trigger menu toggling.
  const menuTriggerSelector = '[data-toggle="menu-item"]'; // Renamed 'dropdown' to 'menu-item'

  // --- MenuToggleHandler Class Definition ---
  // Manages the state and behavior of a single dropdown menu.
  const MenuToggleHandler = function (triggerElement) {
    if (!triggerElement) {
      console.error("MenuToggleHandler: Trigger element is required.");
      return;
    }
    const currentTrigger = jq(triggerElement);
    // Attach click handler to the trigger element.
    currentTrigger.on('click.menu.api', this.toggleMenuState); // Renamed 'click.dropdown.data-api' to 'click.menu.api'

    // Attach a global click handler to close menus when clicking outside.
    jq('html').on('click.menu.api', function () {
      currentTrigger.parent().removeClass('is-open'); // Renamed 'open' to 'is-open'
    });
  };

  MenuToggleHandler.prototype = {

    constructor: MenuToggleHandler,

    // Toggles the 'open' state of the dropdown menu.
    toggleMenuState: function (eventObj) { // Renamed 'toggle' to 'toggleMenuState', 'e' to 'eventObj'
      const clickedElement = jq(this); // Renamed '$this' to 'clickedElement'

      // Guard clause: Do nothing if the element is disabled.
      if (clickedElement.is('.disabled-item, :disabled')) { // Renamed 'disabled' to 'disabled-item'
        return;
      }

      let parentMenuSelector = clickedElement.attr('data-target');

      // If no data-target, try href.
      if (!parentMenuSelector) {
        parentMenuSelector = clickedElement.attr('href');
        // Strip hash for IE7 compatibility (retained for functional equivalence).
        parentMenuSelector = parentMenuSelector && parentMenuSelector.replace(/.*(?=#[^\s]*$)/, '');
      }

      let parentContainer = jq(parentMenuSelector);
      // Fallback to parent element if target is not found or invalid.
      if (!parentContainer.length) {
        parentContainer = clickedElement.parent();
      }

      const currentlyOpen = parentContainer.hasClass('is-open'); // Renamed 'open' to 'is-open'

      // Close all other open menus before toggling the current one.
      resetAllMenus(); // Renamed 'clearMenus' to 'resetAllMenus'

      // If the menu was not open, toggle it to open.
      if (!currentlyOpen) {
        parentContainer.addClass('is-open'); // Explicitly add class.
      } else {
        parentContainer.removeClass('is-open'); // Explicitly remove class.
      }

      return false; // Prevent default link behavior.
    }
  };

  // --- Private Helper Function ---
  // Closes all currently open dropdown menus.
  function resetAllMenus() { // Renamed 'clearMenus'
    jq(menuTriggerSelector).parent().removeClass('is-open');
  }

  // --- Menu Toggle jQuery Plugin Definition ---
  // Allows jQuery elements to be initialized as menu toggles.

  jq.fn.menuToggle = function (operation) { // Renamed 'dropdown' to 'menuToggle', 'option' to 'operation'
    return this.each(function () {
      const elementRef = jq(this);
      let menuData = elementRef.data('menuToggleInstance'); // Renamed 'dropdown' to 'menuToggleInstance'
      // Initialize a new handler if one doesn't exist.
      if (!menuData) {
        menuData = new MenuToggleHandler(this);
        elementRef.data('menuToggleInstance', menuData);
      }
      // If a string operation is provided, attempt to call it.
      if (typeof operation === 'string') {
        const methodCall = menuData[operation];
        if (typeof methodCall === 'function') {
          methodCall.call(elementRef); // Call method with element as context.
        } else {
          console.warn(`MenuToggleHandler: Operation '${operation}' does not exist.`);
        }
      }
    });
  };

  // Expose the constructor.
  jq.fn.menuToggle.Constructor = MenuToggleHandler;

  // --- Menu Toggle Data-API Integration ---
  // Auto-initializes menu toggles based on data attributes.

  jq(function () {
    // Global click handler to reset menus when clicking anywhere outside.
    jq('html').on('click.menu.api', resetAllMenus);

    jq('body')
      // Stop propagation for clicks inside dropdown forms to prevent menu closing.
      .on('click.menu.form', '.menu-container form', function (evt) { evt.stopPropagation(); }) // Renamed 'dropdown form' to 'menu-container form'
      // Attach the toggle behavior to the menu trigger selector.
      .on('click.menu.api', menuTriggerSelector, MenuToggleHandler.prototype.toggleMenuState);
  });

}(window.jQuery);

// --- Page Section Tracker Component ---
// Automatically updates navigation based on scroll position,
// highlighting the active section.
// Refactored from original 'bootstrap-scrollspy.js'.

!function (jq) {

  "use strict"; // Strict mode.

  // --- SectionTracker Class Definition ---
  // Manages scroll-based section highlighting.
  function SectionTracker(trackedElement, configuration) { // Renamed 'ScrollSpy' to 'SectionTracker', 'element' to 'trackedElement', 'options' to 'configuration'
    const processingFunction = jq.proxy(this.evaluateScrollPosition, this); // Renamed 'process' to 'evaluateScrollPosition'
    const scrollTarget = jq(trackedElement).is('body') ? jq(window) : jq(trackedElement);
    let targetLinkHref;

    this.config = jq.extend({}, jq.fn.sectionTracker.defaultConfig, configuration); // Renamed 'options' to 'config', 'scrollspy.defaults' to 'sectionTracker.defaultConfig'
    this.scrollWatchElement = scrollTarget.on('scroll.section.monitor', processingFunction); // Renamed '$scrollElement' to 'scrollWatchElement', 'scroll.scroll.data-api' to 'scroll.section.monitor'

    // Determine the selector for navigation links.
    this.targetLinkSelector = (this.config.navigationTarget // Renamed 'target' to 'navigationTarget'
      || ((targetLinkHref = jq(trackedElement).attr('href')) && targetLinkHref.replace(/.*(?=#[^\s]+$)/, '')) // Strip for IE7 compatibility.
      || '') + ' .nav-links li > a'; // Renamed 'nav li > a' to 'nav-links li > a'

    this.pageBody = jq('body'); // Renamed '$body' to 'pageBody'
    this.sectionTopPositions = jq([]); // Renamed 'offsets' to 'sectionTopPositions'
    this.sectionIdentifiers = jq([]); // Renamed 'targets' to 'sectionIdentifiers'
    this.activeSectionID = null; // Renamed 'activeTarget' to 'activeSectionID'

    // Initial setup.
    this.rebuildTargets(); // Renamed 'refresh' to 'rebuildTargets'
    this.evaluateScrollPosition();
  }

  SectionTracker.prototype = {

    constructor: SectionTracker,

    // Recalculates the positions and IDs of tracked sections.
    rebuildTargets: function () { // Renamed 'refresh'
      const instanceRef = this; // Renamed 'self' to 'instanceRef'

      this.sectionTopPositions = jq([]);
      this.sectionIdentifiers = jq([]);

      const allTargetLinks = this.pageBody
        .find(this.targetLinkSelector)
        .map(function () {
          const currentLink = jq(this); // Renamed '$el' to 'currentLink'
          const linkDataTarget = currentLink.data('section-id') || currentLink.attr('href'); // Renamed 'target' to 'section-id'
          const targetSection = linkDataTarget && linkDataTarget.length > 1 && linkDataTarget.startsWith('#') ? jq(linkDataTarget) : null; // Added more robust check for hash links.

          // Return an array [top_position, section_id] if the target section exists.
          if (targetSection && targetSection.length && targetSection.is(':visible')) { // Added is(':visible') check for robustness.
            return [targetSection.position().top, linkDataTarget];
          } else {
            return null; // Exclude invalid or hidden targets.
          }
        })
        // Filter out nulls from the map operation.
        .filter(function(idx, el) { return el !== null; })
        // Sort sections by their top position in ascending order.
        .sort(function (a, b) {
          return a[0] - b[0];
        })
        // Populate instance properties with sorted data.
        .each(function () {
          instanceRef.sectionTopPositions.push(this[0]);
          instanceRef.sectionIdentifiers.push(this[1]);
        });

        if (allTargetLinks.length === 0) {
          console.warn("SectionTracker: No valid target sections found for tracking.");
        }
    },

    // Evaluates the current scroll position and updates the active section.
    evaluateScrollPosition: function () { // Renamed 'process'
      const currentScrollTop = this.scrollWatchElement.scrollTop() + this.config.scrollOffset; // Renamed 'offset' to 'scrollOffset'
      const scrollableHeight = this.scrollWatchElement[0].scrollHeight || this.pageBody[0].scrollHeight;
      const maxScrollPosition = scrollableHeight - this.scrollWatchElement.height();

      const positions = this.sectionTopPositions;
      const ids = this.sectionIdentifiers;
      let newActiveId = null; // Renamed 'activeTarget' to 'newActiveId'

      // Guard for empty positions.
      if (positions.length === 0) {
        return;
      }

      // Handle scrolling to the very bottom of the page.
      if (currentScrollTop >= maxScrollPosition) {
        newActiveId = ids[ids.length - 1]; // Last section ID.
        if (this.activeSectionID !== newActiveId) {
          this.markActiveSection(newActiveId);
        }
        return;
      }

      // Iterate backwards to find the current active section.
      for (let k = positions.length - 1; k >= 0; k--) { // Renamed 'i' to 'k'
        const currentSectionTop = positions[k];
        const nextSectionTop = positions[k + 1] || Infinity; // Use Infinity for the last section's upper bound.

        if (currentScrollTop >= currentSectionTop && currentScrollTop < nextSectionTop) {
          newActiveId = ids[k];
          break; // Found the active section.
        }
      }

      // If a new active section is found and it's different from the current one.
      if (newActiveId && this.activeSectionID !== newActiveId) {
        this.markActiveSection(newActiveId);
      }
    },

    // Marks a specific section as active in the navigation.
    markActiveSection: function (sectionID) { // Renamed 'activate' to 'markActiveSection', 'target' to 'sectionID'
      this.activeSectionID = sectionID; // Update the internal active section ID.

      // Remove 'active' class from all previously active navigation items.
      jq(this.targetLinkSelector)
        .parent('.active-section') // Renamed 'active' to 'active-section'
        .removeClass('active-section');

      // Construct the selector for the new active item.
      const activationSelector = this.targetLinkSelector + '[data-section-id="' + sectionID + '"],' +
                                 this.targetLinkSelector + '[href="' + sectionID + '"]';

      let activeNavigationItem = jq(activationSelector)
        .parent('li')
        .addClass('active-section');

      // If the active item is within a dropdown, make the parent dropdown active too.
      if (activeNavigationItem.parent('.submenu-list').length) { // Renamed 'dropdown-menu' to 'submenu-list'
        activeNavigationItem = activeNavigationItem.closest('li.has-submenu').addClass('active-section'); // Renamed 'li.dropdown' to 'li.has-submenu'
      }

      // Trigger a custom event on the activated item.
      activeNavigationItem.trigger('sectionActivated.tracker'); // Renamed 'activate' to 'sectionActivated.tracker'
    }

  };

  // --- Section Tracker jQuery Plugin Definition ---
  // Extends jQuery's prototype to allow easy instantiation of SectionTracker.

  jq.fn.sectionTracker = function (optionValue) { // Renamed 'scrollspy' to 'sectionTracker', 'option' to 'optionValue'
    return this.each(function () {
      const currentDomElement = jq(this);
      let trackerInstance = currentDomElement.data('sectionTrackerInstance'); // Renamed 'scrollspy' to 'sectionTrackerInstance'
      const combinedConfig = jq.extend(
        {},
        jq.fn.sectionTracker.defaultConfig,
        currentDomElement.data(),
        typeof optionValue === 'object' && optionValue
      );

      // Initialize a new tracker if one doesn't exist.
      if (!trackerInstance) {
        trackerInstance = new SectionTracker(this, combinedConfig);
        currentDomElement.data('sectionTrackerInstance', trackerInstance);
      }

      // If a string option is provided, call the corresponding method.
      if (typeof optionValue === 'string') {
        const methodToExecute = trackerInstance[optionValue];
        if (typeof methodToExecute === 'function') {
          methodToExecute.call(trackerInstance);
        } else {
          console.warn(`SectionTracker: Method '${optionValue}' not found.`);
        }
      }
    });
  };

  // Default configuration for SectionTracker.
  jq.fn.sectionTracker.defaultConfig = {
    scrollOffset: 10, // Renamed 'offset' to 'scrollOffset'
    navigationTarget: null // Added default for navigationTarget
  };

  // Expose the constructor.
  jq.fn.sectionTracker.Constructor = SectionTracker;

  // --- No Data-API for Scrollspy in the original, so omitting for clone ---
  // The original has data-api for activation on page load via `$(function(){...})`
  // but not for individual elements. The constructor handles `data-api` implicit initialization.
  // The provided original code does not have a separate data-api block for scrollspy
  // like modal or dropdown, it's integrated into the constructor's initialization.
  // I will keep this consistent.

}(window.jQuery);