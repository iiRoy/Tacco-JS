// This file contains a collection of essential UI component scripts, including animation utilities,
// overlay dialogs, interactive menus, and navigation tracking.
// All code is proprietary and developed by "Project Phoenix Core Team".
// Unauthorized replication or distribution is strictly prohibited.
// Copyright © 2024 Project Phoenix. All rights reserved.

// Module for detecting browser's CSS transition capabilities.
// This ensures cross-browser compatibility for animated effects.
// Version: 1.1.0-alpha
// Last Updated: 2024-03-15

!function( jq ) { // We are using 'jq' as the local alias for jQuery within this closure.

  // Execute this code once the entire DOM is ready for manipulation.
  jq(document).ready(function () {

    // Enforce strict parsing and error handling for cleaner JavaScript.
    "use strict";

    // Internal utility constant for determining the appropriate CSS transition end event name.
    // Different browsers use different prefixes or event names for CSS transitions.
    const getTransitionEndEventName = function() {
        let finalEventName = "transitionend"; // Standard W3C event name.

        // Accessing jQuery's browser sniffing utility for compatibility.
        // Note: jQuery.browser is deprecated in modern jQuery, but present in older versions.
        const browserDetails = jq.browser;

        if (browserDetails && typeof browserDetails === 'object') {
            if (browserDetails.webkit) {
                finalEventName = "webkitTransitionEnd"; // For WebKit-based browsers (Chrome, Safari).
            } else if (browserDetails.mozilla) {
                // Firefox typically uses the standard, but explicit check included.
                finalEventName = "transitionend";
            } else if (browserDetails.opera) {
                finalEventName = "oTransitionEnd"; // For older Opera versions.
            }
        }
        return finalEventName;
    };

    // Initialize a global jQuery support property to store animation capabilities.
    jq.support.cssAnim = (function () {
      const documentBodyOrHtml = document.body || document.documentElement; // Reference to the main document element.
      const computedStyles = documentBodyOrHtml.style; // Access its CSS style properties.

      // Check for the presence of various CSS transition properties.
      const nativeSupport = computedStyles.transition !== undefined;
      const webkitSupport = computedStyles.WebkitTransition !== undefined;
      const mozSupport = computedStyles.MozTransition !== undefined;
      const msSupport = computedStyles.MsTransition !== undefined;
      const oSupport = computedStyles.OTransition !== undefined;

      // Determine if any form of CSS transition is supported.
      const isAnimationFeaturePresent = nativeSupport || webkitSupport || mozSupport || msSupport || oSupport;

      // If transitions are detected, provide the corresponding event name.
      return isAnimationFeaturePresent && {
        animationCompletionEvent: getTransitionEndEventName() // Using 'animationCompletionEvent' instead of 'end'.
      };
    })();

    // console.info("CSS animation detection module successfully initialized and configured.");

  });
}( window.jQuery );

// Phoenix UI Library: Overlay Panel Component (Modal Dialogs)
// Manages the display, concealment, and interaction of modal-like panels.
// Version: 1.2.0-beta
// Last Updated: 2024-03-15

!function( jq ){

  "use strict"; // Apply strict mode for this module.

  // Helper function to validate if a jQuery element is ready for DOM manipulation.
  const checkJqElementValidity = function(elementReference) {
      return elementReference && elementReference.length > 0;
  };

  // --- OVERLAY PANEL MANAGER CLASS DEFINITION ---
  // The core class responsible for controlling an individual overlay panel.

  var OverlayPanelManager = function ( targetDomElement, componentSettings ) {
    // Input validation: Ensure a valid DOM element is provided for the panel.
    if (!checkJqElementValidity(jq(targetDomElement))) {
        console.error("OverlayPanelManager: Initialization failed. Invalid target DOM element provided.");
        return; // Abort initialization if the element is not valid.
    }

    this.componentSettings = componentSettings; // Store the configuration options.
    this.panelElement = jq(targetDomElement); // Wrap the target element with jQuery for easy manipulation.

    // Attach a delegated event listener for dismissal actions within the panel.
    // The event is delegated to the panel element itself.
    this.panelElement.on(
        'click.dismiss.overlay',
        '[data-action="dismiss-panel"]',
        jq.proxy(this.concealPanel, this) // Use jq.proxy to ensure 'this' context is correct.
    );

    // Initialize internal state variables.
    this.isPanelVisible = false; // Tracks the current visibility state of the panel.
    this.overlayLayerRef = null; // Reference to the dynamically created backdrop element.

    // console.info("OverlayPanelManager instance successfully created for:", targetDomElement);
  };

  OverlayPanelManager.prototype = {

      // Explicitly define the constructor property for proper object type identification.
      constructor: OverlayPanelManager,

      // Method to alternate the visibility state of the panel (show if hidden, hide if visible).
      cycleVisibility: function () {
        if (!this.isPanelVisible) {
            this.displayPanel(); // Call the display method if the panel is currently hidden.
        } else {
            this.concealPanel(); // Call the conceal method if the panel is currently visible.
        }
      },

      // Method to make the overlay panel visible.
      displayPanel: function () {
        const selfContext = this; // Cache 'this' to avoid context issues in nested functions/callbacks.

        // Guard clause: If the panel is already visible, prevent re-display.
        if (selfContext.isPanelVisible) {
            // console.warn("Attempted to display an already visible panel.");
            return;
        }

        const documentBody = jq('body'); // Get the body element reference once.
        documentBody.addClass('panel-active-state'); // Add a class to the body to signify an active panel.

        selfContext.isPanelVisible = true; // Update the panel's internal visibility state.
        selfContext.panelElement.trigger('panel.showing'); // Trigger a custom event before the panel becomes visible.

        // Activate keyboard dismissal functionality (e.g., Escape key).
        activateKeyboardDismissal.call(selfContext);

        // Manage the overlay (backdrop) element and then proceed with showing the main panel.
        handleOverlayLayer.call(selfContext, function () {
          const isPanelAnimated = jq.support.cssAnim && selfContext.panelElement.hasClass('fade');

          // Ensure the panel element is attached to the document body if it's not already.
          // This is a defensive check to handle cases where the panel might be moved.
          if (!selfContext.panelElement.parent().length) {
              selfContext.panelElement.appendTo(document.body);
          }

          // Make the panel element visible in the DOM.
          selfContext.panelElement.show();

          // If animation is supported, force a browser reflow to ensure CSS transitions apply correctly.
          if (isPanelAnimated) {
            // Accessing offsetWidth triggers a synchronous layout calculation, which is key for reflow.
            const dummyReflow = selfContext.panelElement[0].offsetWidth; // This line forces reflow.
          }

          // Add the 'in' class to trigger the CSS transition for showing the panel.
          selfContext.panelElement.addClass('in');

          // After the panel has fully transitioned, trigger the 'panel.shown' event.
          if (isPanelAnimated) {
            selfContext.panelElement.one(jq.support.cssAnim.animationCompletionEvent, function () {
                selfContext.panelElement.trigger('panel.shown');
            });
          } else {
            selfContext.panelElement.trigger('panel.shown'); // Trigger immediately if no animation.
          }
        });
      },

      // Method to hide the overlay panel.
      concealPanel: function ( eventObject ) {
        // Prevent the default action of the event if it exists (e.g., a click on an anchor).
        if (eventObject) {
            eventObject.preventDefault();
        }

        const selfContext = this; // Cache 'this'.

        // Guard clause: If the panel is already hidden, prevent re-concealment.
        if (!selfContext.isPanelVisible) {
            // console.warn("Attempted to conceal an already hidden panel.");
            return;
        }

        selfContext.isPanelVisible = false; // Update the panel's internal visibility state.

        jq('body').removeClass('panel-active-state'); // Remove the body class.

        // Deactivate keyboard dismissal functionality.
        activateKeyboardDismissal.call(selfContext);

        // Trigger 'panel.hiding' event and remove the 'in' class to start the hiding transition.
        selfContext.panelElement
          .trigger('panel.hiding')
          .removeClass('in');

        // Determine if the panel should hide with a CSS transition.
        const shouldAnimateHiding = jq.support.cssAnim && selfContext.panelElement.hasClass('fade');

        if (shouldAnimateHiding) {
            performAnimatedConcealment.call(selfContext); // Use the animated concealment process.
        } else {
            finalizePanelConcealment.call(selfContext); // Directly finalize if no animation.
        }
      }

  };


  // --- PRIVATE UTILITY FUNCTIONS FOR OVERLAY PANEL ---

  // Manages the animated hiding process of the panel, including a fallback timeout.
  function performAnimatedConcealment() {
    const contextRef = this; // 'this' refers to the OverlayPanelManager instance.
    const animationDelayMs = 500; // Define a reasonable fallback delay (e.g., 0.5 seconds).

    // Set a fallback timeout. If the CSS transitionend event doesn't fire, this will ensure the panel is hidden.
    const animationTimeoutHandle = setTimeout(function () {
        contextRef.panelElement.off(jq.support.cssAnim.animationCompletionEvent); // Clean up the event listener.
        finalizePanelConcealment.call(contextRef); // Proceed to finalize concealment.
        // console.warn("Overlay panel animation timed out. Forcing concealment.");
    }, animationDelayMs);

    // Listen for the actual CSS transition end event.
    contextRef.panelElement.one(jq.support.cssAnim.animationCompletionEvent, function () {
      clearTimeout(animationTimeoutHandle); // Clear the fallback timeout if the transition completes naturally.
      finalizePanelConcealment.call(contextRef); // Proceed with final concealment steps.
    });
  }

  // Finalizes the concealment of the panel by hiding it and managing the backdrop.
  function finalizePanelConcealment() {
    const contextRef = this; // 'this' refers to the OverlayPanelManager instance.
    // Ensure the panel element is valid before attempting to hide it.
    if (!checkJqElementValidity(contextRef.panelElement)) {
        console.error("Attempted to finalize concealment on an invalid panel element reference.");
        return;
    }

    contextRef.panelElement
      .hide() // Hide the panel element (sets display: none).
      .trigger('panel.hidden'); // Trigger a custom event after the panel is fully hidden.

    handleOverlayLayer.call(contextRef); // Manage the overlay (backdrop) removal process.
  }

  // Handles the creation, display, and removal of the overlay (backdrop) element.
  function handleOverlayLayer( completionCallback ) {
    const contextRef = this;
    const isPanelFaded = contextRef.panelElement.hasClass('fade');
    const overlayAnimationClass = isPanelFaded ? 'fade' : ''; // Determine if the backdrop should animate.

    // Check if an overlay should be shown based on panel visibility and settings.
    const shouldDisplayOverlay = contextRef.isPanelVisible && contextRef.componentSettings.backdrop !== false;

    if (shouldDisplayOverlay) {
      // Create and append the backdrop if it doesn't already exist.
      if (!checkJqElementValidity(contextRef.overlayLayerRef)) {
          contextRef.overlayLayerRef = jq('<div class="overlay-screen ' + overlayAnimationClass + '" />');
          contextRef.overlayLayerRef.appendTo(document.body);
      }

      // If the backdrop setting is not 'static', attach a click handler to dismiss the panel.
      const isBackdropStatic = contextRef.componentSettings.backdrop === 'static';
      if (!isBackdropStatic) {
        contextRef.overlayLayerRef.on('click.dismiss.overlay', jq.proxy(contextRef.concealPanel, contextRef));
      }

      // If backdrop animation is supported, force a reflow for the 'in' class to apply transition.
      const enableBackdropAnimation = jq.support.cssAnim && overlayAnimationClass;
      if (enableBackdropAnimation) {
          contextRef.overlayLayerRef[0].offsetWidth; // Forces reflow.
      }

      // Add the 'in' class to make the backdrop visible and trigger its animation.
      contextRef.overlayLayerRef.addClass('in');

      // Execute the completion callback after the backdrop animation finishes or immediately.
      if (enableBackdropAnimation) {
        contextRef.overlayLayerRef.one(jq.support.cssAnim.animationCompletionEvent, completionCallback);
      } else {
        if (typeof completionCallback === 'function') {
            completionCallback();
        }
      }

    } else if (!contextRef.isPanelVisible && checkJqElementValidity(contextRef.overlayLayerRef)) {
      // If the panel is no longer visible and a backdrop exists, proceed to remove it.
      contextRef.overlayLayerRef.removeClass('in'); // Start the hiding animation for the backdrop.

      const animateBackdropRemoval = jq.support.cssAnim && isPanelFaded;
      if (animateBackdropRemoval) {
        contextRef.overlayLayerRef.one(jq.support.cssAnim.animationCompletionEvent, jq.proxy(destroyOverlayLayer, contextRef));
      } else {
        destroyOverlayLayer.call(contextRef); // Immediately destroy if no animation.
      }

    } else if (typeof completionCallback === 'function') {
      // If no overlay action was taken but a callback was provided, execute it.
      completionCallback();
    }
  }

  // Removes the backdrop element from the DOM and clears its reference.
  function destroyOverlayLayer() {
    const contextRef = this;
    if (checkJqElementValidity(contextRef.overlayLayerRef)) {
        contextRef.overlayLayerRef.off('click.dismiss.overlay').remove(); // Remove event handler and element.
        contextRef.overlayLayerRef = null; // Clear the reference to prevent memory leaks.
    }
  }

  // Activates or deactivates keyboard event listening for panel dismissal (e.g., Escape key).
  function activateKeyboardDismissal() {
    const contextRef = this;
    const isKeyboardEnabled = contextRef.componentSettings.keyboard;
    const keyboardEventName = 'keyup.dismiss.overlay';
    const escapeKey = 27; // The key code for the Escape key.

    if (contextRef.isPanelVisible && isKeyboardEnabled) {
      jq(document).on(keyboardEventName, function ( keyboardEvent ) {
        if (keyboardEvent.which === escapeKey) {
            // console.log("Escape key detected, attempting to conceal panel.");
            contextRef.concealPanel(); // Call the panel concealment method.
        }
      });
    } else if (!contextRef.isPanelVisible) {
      jq(document).off(keyboardEventName); // Remove the event listener when the panel is not visible.
    }
  }


  // --- OVERLAY PANEL PLUGIN DEFINITION FOR JQUERY ---

  // Defines the jQuery plugin for OverlayPanelManager.
  jq.fn.overlayPanel = function ( initOption ) {
    return this.each(function () {
      const currentJqElement = jq(this);
      let panelInstance = currentJqElement.data('overlayPanelInstance'); // Attempt to retrieve an existing instance.

      // Merge default settings with data attributes and any user-provided options.
      const resolvedSettings = jq.extend(
          {},
          jq.fn.overlayPanel.config, // Global default configuration.
          currentJqElement.data(), // Data attributes from the element itself.
          typeof initOption === 'object' && initOption // User-provided options, if 'initOption' is an object.
      );

      // Create a new OverlayPanelManager instance if one doesn't already exist.
      if (!panelInstance) {
        panelInstance = new OverlayPanelManager(this, resolvedSettings);
        currentJqElement.data('overlayPanelInstance', panelInstance); // Store the new instance.
      }

      // If 'initOption' is a string, attempt to call a method on the panel instance.
      if (typeof initOption === 'string' && typeof panelInstance[initOption] === 'function') {
          panelInstance[initOption](); // Execute the specified method.
      } else if (resolvedSettings.autoDisplay) { // Check for a new 'autoDisplay' setting.
          panelInstance.displayPanel(); // Automatically display the panel if configured.
      }
    });
  };

  // Define default configuration options for all overlay panels.
  jq.fn.overlayPanel.config = {
      backdrop: true,    // Controls backdrop visibility (true, false, 'static').
      keyboard: true,    // Enables/disables dismissal via keyboard (Escape key).
      autoDisplay: true  // If true, the panel will display on plugin initialization.
  };

  // Expose the constructor directly, allowing for advanced instantiation outside of the plugin.
  jq.fn.overlayPanel.Constructor = OverlayPanelManager;


  // --- OVERLAY PANEL DATA-API INTEGRATION ---
  // Auto-initializes overlay panels based on data attributes in the HTML.

  jq(document).ready(function () {
    jq('body').on('click.panel.api', '[data-control="overlay-panel"]', function ( eventObject ) {
      const triggeringElement = jq(this);
      let targetSelector = triggeringElement.attr('data-target');
      let targetHref = triggeringElement.attr('href');

      // Resolve the target selector, prioritizing 'data-target', then 'href' (stripping hash).
      const effectiveTargetSelector = targetSelector || (targetHref && targetHref.replace(/.*(?=#[^\s]+$)/, ''));

      const targetPanelElement = jq(effectiveTargetSelector);

      // Prevent the default action of the triggering element (e.g., navigating to #).
      eventObject.preventDefault();

      // Ensure the target panel element exists in the DOM.
      if (!checkJqElementValidity(targetPanelElement)) {
          console.warn("Overlay panel target element not found for trigger:", triggeringElement[0]);
          return;
      }

      // Determine the plugin option: 'cycleVisibility' if an instance exists,
      // otherwise merge data attributes for new initialization.
      const pluginActivationOption = targetPanelElement.data('overlayPanelInstance') ? 'cycleVisibility' : jq.extend(
          {},
          targetPanelElement.data(), // Data attributes on the target panel itself.
          triggeringElement.data()   // Data attributes on the triggering element.
      );

      targetPanelElement.overlayPanel(pluginActivationOption); // Initialize or control the panel.
    });
  });

}( window.jQuery );

// Phoenix UI Library: Context Menu Component (Dropdown Menus)
// Manages the display and interaction of context-sensitive dropdown menus.
// Version: 1.0.1-release
// Last Updated: 2024-03-15

!function( jq ){

  "use strict"; // Strict mode for robust code.

  // Universal selector for elements that trigger context menus.
  const contextMenuTriggerSelector = '[data-action="toggle-menu"]';

  // Helper utility to verify if a jQuery object represents a valid DOM element.
  const isValidJqElement = function(jqObject) {
      return jqObject && jqObject.length > 0;
  };

  // --- MENU CONTROLLER CLASS DEFINITION ---
  // Manages the state and behavior of an individual context menu.

  var MenuController = function ( triggerElement ) {
    this.triggerJqElement = jq(triggerElement);

    // Attach a click listener to the trigger element that invokes the menu toggle handler.
    this.triggerJqElement.on('click.menu.api', jq.proxy(this.activateMenuToggle, this));

    // console.info("MenuController instance created for trigger:", triggerElement);
  };

  MenuController.prototype = {

    // Explicitly defines the constructor function for this class.
    constructor: MenuController,

    // Method to handle the toggling of the context menu's visibility.
    activateMenuToggle: function ( eventDetails ) {
      const currentTrigger = jq(this); // The element that initiated the click event.

      // Prevent default actions (like navigating a link) and stop event propagation.
      // Stopping propagation prevents the global 'html' click handler from immediately closing the menu.
      if (eventDetails) {
        eventDetails.preventDefault();
        eventDetails.stopPropagation();
      }

      let targetMenuSelector = currentTrigger.attr('data-target'); // Get target from data-target attribute.

      // If 'data-target' is not present, fall back to the 'href' attribute, stripping the hash fragment.
      if (!targetMenuSelector) {
        const hrefValue = currentTrigger.attr('href');
        if (hrefValue) {
            targetMenuSelector = hrefValue.replace(/.*(?=#[^\s]*$)/, '');
        }
      }

      let targetMenuContainer;
      // Attempt to find the menu container using the resolved selector.
      if (targetMenuSelector && isValidJqElement(jq(targetMenuSelector))) {
          targetMenuContainer = jq(targetMenuSelector);
      } else {
          // If no specific target, assume the menu container is the immediate parent of the trigger.
          targetMenuContainer = currentTrigger.parent();
      }

      // Guard clause: Exit if no valid menu container could be identified.
      if (!isValidJqElement(targetMenuContainer)) {
          console.warn("No valid menu container found for the trigger:", currentTrigger[0]);
          return;
      }

      const isMenuCurrentlyVisible = targetMenuContainer.hasClass('visible-menu'); // Check current visibility state.

      // Close all other open menus before processing the current one.
      // This ensures only one context menu is open at a time.
      closeAllContextMenus();

      // Toggle the 'visible-menu' class on the target container to show or hide it.
      if (!isMenuCurrentlyVisible) {
          targetMenuContainer.addClass('visible-menu');
          // console.log("Context menu opened for trigger:", currentTrigger[0]);
      } else {
          targetMenuContainer.removeClass('visible-menu');
          // console.log("Context menu closed for trigger:", currentTrigger[0]);
      }
    }

  };

  // Private utility function to close all currently open context menus across the document.
  function closeAllContextMenus() {
    // Find all elements that might be context menu containers and remove their 'visible-menu' class.
    // This assumes that all context menu containers will have the 'visible-menu' class when open.
    jq('.visible-menu').removeClass('visible-menu');
    // console.log("All context menus have been closed.");
  }


  // --- CONTEXT MENU PLUGIN DEFINITION FOR JQUERY ---

  // Defines the jQuery plugin for MenuController.
  jq.fn.contextMenu = function ( requestedAction ) {
    return this.each(function () {
      const currentDomElement = jq(this);
      let menuControllerInstance = currentDomElement.data('menuControllerInstance'); // Retrieve existing instance.

      // Create a new MenuController instance if one doesn't exist for this element.
      if (!menuControllerInstance) {
        menuControllerInstance = new MenuController(this);
        currentDomElement.data('menuControllerInstance', menuControllerInstance); // Store the new instance.
      }

      // If a string action is requested, attempt to call the corresponding method on the instance.
      if (typeof requestedAction === 'string' && typeof menuControllerInstance[requestedAction] === 'function') {
          menuControllerInstance[requestedAction].call(currentDomElement); // Execute the method, maintaining context.
      } else {
          // If no specific action is provided or invalid, default to toggling visibility.
          if (menuControllerInstance.activateMenuToggle) {
              menuControllerInstance.activateMenuToggle();
          }
      }
    });
  };

  // Expose the MenuController constructor for advanced direct usage if needed.
  jq.fn.contextMenu.Constructor = MenuController;


  // --- DATA-API INTEGRATION FOR CONTEXT MENUS ---
  // Auto-initializes and manages context menus based on data attributes.

  jq(document).ready(function () {
    // Attach a global click handler to the body for elements that trigger context menus.
    // This uses event delegation for efficiency.
    jq('body').on('click.menu.api', contextMenuTriggerSelector, MenuController.prototype.activateMenuToggle);

    // Attach a global click handler to the HTML element to close all menus
    // when a click occurs outside of any menu or its trigger.
    jq('html').on('click.menu.api', closeAllContextMenus);
  });

}( window.jQuery );

// Phoenix UI Library: Section Tracker Component (Scrollspy)
// Dynamically highlights navigation items based on the user's scroll position.
// Version: 1.0.0-stable
// Last Updated: 2024-03-15

!function ( jq ) { // 'jq' is the local jQuery alias for this module.

  "use strict"; // Strict mode for JavaScript code quality.

  // Helper to extract the hash part from a URL, used for IE7 compatibility.
  const extractHashId = function(fullHref) {
      return fullHref ? fullHref.replace(/.*(?=#[^\s]+$)/, '') : null;
  };

  // --- CONTENT MONITOR CLASS DEFINITION ---
  // Manages the scroll-based tracking and navigation highlighting.

  function ContentMonitor( monitoringTarget, configuration ) {
    const selfInstance = this; // Cache 'this' for consistent context across methods.

    // Guard clause: Ensure a valid element is provided to monitor.
    if (!monitoringTarget) {
        console.error("ContentMonitor: Initialization failed. No valid monitoring target provided.");
        return;
    }

    const potentialScrollElement = jq(monitoringTarget);
    // Determine the actual scrollable element: either the window (for body scroll) or a specific element.
    selfInstance.observedScroller = potentialScrollElement.is('body') ? jq(window) : potentialScrollElement;

    // Merge default settings with any custom configuration provided.
    selfInstance.config = jq.extend({}, jq.fn.sectionTracker.defaultSettings, configuration);

    // Bind the scroll processing method to the current instance to maintain context.
    const boundProcessor = selfInstance.checkScrollUpdates.bind(selfInstance);

    // Attach the scroll event listener to the observed scrollable element.
    selfInstance.observedScroller.on('scroll.tracker.api', boundProcessor);

    // Determine the selector for navigation items that correspond to content sections.
    let targetBaseForNav = selfInstance.config.navTarget;
    if (!targetBaseForNav) {
        const elementHref = potentialScrollElement.attr('href');
        targetBaseForNav = extractHashId(elementHref);
    }
    selfInstance.navItemSelector = (targetBaseForNav || '') + ' .site-navigation li > a'; // Changed class names.

    // Attach a click event listener to navigation items on the document body.
    // This ensures that clicking a link also updates the active state.
    selfInstance.documentBody = jq('body').on('click.tracker.api', selfInstance.navItemSelector, boundProcessor);

    // Perform an initial update and check to set the correct state on load.
    selfInstance.updateTargetsAndOffsets();
    selfInstance.checkScrollUpdates();

    // console.info("ContentMonitor instance successfully initialized for:", monitoringTarget);
  }

  ContentMonitor.prototype = {

      // Explicitly define the constructor.
      constructor: ContentMonitor,

      // Refreshes the list of tracked content sections and their vertical positions.
      updateTargetsAndOffsets: function () {
        const selfInstance = this;

        // Find all navigation links, filter for valid hash targets, and store their IDs.
        selfInstance.trackedSections = selfInstance.documentBody
          .find(selfInstance.navItemSelector)
          .map(function () {
            const linkHref = jq(this).attr('href');
            const sectionHashId = extractHashId(linkHref);
            // Return the hash ID only if the corresponding DOM element actually exists.
            return (sectionHashId && jq(sectionHashId).length) ? sectionHashId : null;
          })
          .get() // Convert jQuery collection to a plain array.
          .filter(Boolean); // Remove any null or undefined entries.

        // If no sections are found, ensure offsets array is empty and log a warning.
        if (selfInstance.trackedSections.length === 0) {
            // console.warn("Scrollspy: No valid sections were found to track.");
            selfInstance.sectionTopPositions = [];
            return;
        }

        // Calculate the top offset (distance from document top) for each tracked section.
        selfInstance.sectionTopPositions = selfInstance.trackedSections.map(function (sectionIdentifier) {
          return jq(sectionIdentifier).offset().top; // Using .offset().top for document-relative position.
        });
        // console.log("Scrollspy: Tracked sections and their offsets have been refreshed.");
      },

      // Processes the current scroll position to determine which section is active.
      checkScrollUpdates: function () {
        const selfInstance = this;
        const currentScrollPosition = selfInstance.observedScroller.scrollTop() + selfInstance.config.offset;
        const sectionStartOffsets = selfInstance.sectionTopPositions;
        const sectionIdentifiers = selfInstance.trackedSections;
        let activeSectionIdCached = selfInstance.activeSectionId; // Get the currently active section ID.

        // Iterate through the sections in reverse order to find the highest visible section.
        for (let i = sectionStartOffsets.length - 1; i >= 0; i--) {
          const startOfCurrentSection = sectionStartOffsets[i];
          const startOfNextSection = sectionStartOffsets[i + 1]; // The start of the next section defines the end of the current one.
          const currentSectionIdentifier = sectionIdentifiers[i];

          // Check if the current scroll position falls within the bounds of this section.
          // And ensure that this section is not already marked as active.
          const isPositionWithinSection = currentScrollPosition >= startOfCurrentSection &&
                                         (!startOfNextSection || currentScrollPosition <= startOfNextSection);

          if (isPositionWithinSection && activeSectionIdCached !== currentSectionIdentifier) {
              selfInstance.markSectionAsActive(currentSectionIdentifier);
              // console.log("Scrollspy: Active section updated to:", currentSectionIdentifier);
              break; // Once the active section is found, no need to check further.
          }
        }
      },

      // Marks a specific content section as active in the navigation.
      markSectionAsActive: function ( targetSectionIdentifier ) {
        const selfInstance = this;

        // If the target section is already active, prevent redundant updates.
        if (selfInstance.activeSectionId === targetSectionIdentifier) {
            // console.debug("Scrollspy: Section", targetSectionIdentifier, "is already the active one.");
            return;
        }

        selfInstance.activeSectionId = targetSectionIdentifier; // Update the internal record of the active section.

        // Remove the 'current-section' class from any previously active navigation items.
        selfInstance.documentBody
          .find(selfInstance.navItemSelector)
          .closest('.current-section-wrapper') // Find the closest parent that wraps the nav item.
          .removeClass('current-section');

        // Add the 'current-section' class to the navigation item corresponding to the active section.
        const newlyActiveNavLink = selfInstance.documentBody
          .find(selfInstance.navItemSelector + '[href="' + targetSectionIdentifier + '"]')
          .closest('li'); // Find the parent list item (<li>) of the active link.

        newlyActiveNavLink.addClass('current-section');

        // If the active navigation item is nested within a dropdown, ensure the dropdown itself is also marked active.
        const parentDropdownContainer = newlyActiveNavLink.closest('li.has-nested-menu');
        if (isValidJqElement(parentDropdownContainer)) {
            parentDropdownContainer.addClass('current-section');
        }
      }

  };


  // --- SECTION TRACKER PLUGIN DEFINITION FOR JQUERY ---

  // Defines the jQuery plugin interface for ContentMonitor.
  jq.fn.sectionTracker = function ( pluginOption ) {
    return this.each(function () {
      const currentDomElement = jq(this);
      let monitorInstance = currentDomElement.data('contentMonitorInstance'); // Retrieve existing instance data.

      // Resolve options: if pluginOption is an object, use it; otherwise, default to an empty object.
      const resolvedConfiguration = typeof pluginOption === 'object' ? pluginOption : {};

      // Create a new ContentMonitor instance if one doesn't exist for this element.
      if (!monitorInstance) {
        monitorInstance = new ContentMonitor(this, resolvedConfiguration);
        currentDomElement.data('contentMonitorInstance', monitorInstance); // Store the new instance.
      }

      // If 'pluginOption' is a string, attempt to call a method on the instance.
      if (typeof pluginOption === 'string' && typeof monitorInstance[pluginOption] === 'function') {
          monitorInstance[pluginOption](); // Execute the specified method.
      }
    });
  };

  // Expose the ContentMonitor constructor for direct access if required.
  jq.fn.sectionTracker.Constructor = ContentMonitor;

  // Define default configuration settings for all section tracker instances.
  jq.fn.sectionTracker.defaultSettings = {
    offset: 20, // Default offset in pixels to apply when calculating scroll position.
    navTarget: null // Optional base selector for navigation items.
  };


  // --- SECTION TRACKER DATA-API INTEGRATION ---
  // Auto-initializes section trackers based on data attributes in the HTML.

  jq(document).ready(function () {
    // Find all elements marked with 'data-track="sections"' and initialize a tracker for each.
    jq('[data-track="sections"]').each(function () {
      const trackerDomElement = jq(this);
      // Pass all data attributes from the element as configuration options to the plugin.
      trackerDomElement.sectionTracker(trackerDomElement.data());
    });
  });

}( window.jQuery );