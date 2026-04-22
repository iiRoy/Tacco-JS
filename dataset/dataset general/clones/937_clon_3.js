((globalJQuery) => {

  // Module for detecting CSS transition support
  // This is a foundational utility for UI animations.
  // Original source: Modernizr, adapted for jQuery context.
  globalJQuery(function () {

    "use strict"; // Strict mode for better code quality

    // Determine if the browser supports CSS transitions and identify the end event name.
    globalJQuery.support.cssAnimationEnd = (() => {

      let animationEventName = (() => {
        // Create a temporary DOM element to test CSS properties.
        const tempNode = document.createElement('div');
        // Mapping of standard CSS transition property names to their respective browser-prefixed event names.
        const eventAliasMap = {
          'WebkitTransition': 'webkitTransitionEnd',
          'MozTransition': 'transitionend',
          'OTransition': 'oTransitionEnd otransitionend',
          'transition': 'transitionend'
        };

        // Iterate through the map to find the supported transition property.
        for (const cssProp in eventAliasMap) {
          if (tempNode.style[cssProp] !== undefined) {
            // If a property is supported, return its corresponding event name.
            return eventAliasMap[cssProp];
          }
        }
        // If no transition property is found, return null.
        return null;
      })();

      // Return an object indicating support and the event name, or false if not supported.
      return animationEventName && {
        eventName: animationEventName
      };

    })();

  });

})(window.jQuery);
((globalJQuery) => {

  "use strict"; // Enforce strict JavaScript parsing.


  // DIALOG_MANAGER CLASS DEFINITION
  // ===============================
  // Manages the behavior of modal dialogs, including showing, hiding, and interaction.

  const DialogManager = function (targetElement, configParams) {
    this.settings = configParams; // Store configuration for this dialog instance.
    this.uiElement = globalJQuery(targetElement); // Reference to the main dialog DOM element.

    // Attach event listener for dismissing the dialog.
    this.uiElement.on('click.dismiss.dialog', '[data-dismiss="modal"]', globalJQuery.proxy(this.concealContent, this));

    // If a remote URL is specified, load its content into the modal body.
    if (this.settings.remote) {
      const modalBody = this.uiElement.find('.modal-body');
      if (modalBody.length > 0) {
        modalBody.load(this.settings.remote);
      } else {
        console.warn("DialogManager: No '.modal-body' found for remote content loading.");
      }
    }
  };

  DialogManager.prototype = {

    // Class constructor reference.
    initMethod: DialogManager,

    // Toggles the visibility state of the dialog.
    switchVisibility: function () {
      // Calls either 'displayContent' or 'concealContent' based on current state.
      return this[this.isVisible ? 'concealContent' : 'displayContent']();
    },

    // Displays the dialog.
    displayContent: function () {
      const selfRef = this; // Capture 'this' for use in callbacks.
      const showEvent = globalJQuery.Event('show'); // Create a custom 'show' event.

      this.uiElement.trigger(showEvent); // Trigger the 'show' event.

      // If already visible or the event was prevented, do nothing.
      if (this.isVisible || showEvent.isDefaultPrevented()) {
        console.log("DialogManager: Display aborted (already visible or event prevented).");
        return;
      }

      globalJQuery('body').addClass('modal-open'); // Add class to body to prevent scrolling.
      this.isVisible = true; // Update internal state.
      this.handleEscapeKey(); // Setup escape key listener.

      // Manage the dialog's overlay (backdrop).
      this.manageOverlay(function () {
        const hasCssTransition = globalJQuery.support.cssAnimationEnd && selfRef.uiElement.hasClass('fade');

        // Append to body if not already in the DOM (prevents issues with z-index, etc.).
        if (!globalJQuery.contains(document.body, selfRef.uiElement[0])) {
          selfRef.uiElement.appendTo(document.body);
        }

        selfRef.uiElement.show(); // Make the dialog visible.

        if (hasCssTransition) {
          // Force reflow for CSS transitions to apply correctly.
          selfRef.uiElement[0].offsetWidth;
        }

        selfRef.uiElement
          .addClass('in') // Add 'in' class for transition.
          .attr('aria-hidden', false) // Update ARIA attribute.
          .focus(); // Set focus on the dialog.

        selfRef.maintainFocus(); // Enforce focus within the dialog.

        // Trigger 'shown' event after transition or immediately.
        if (hasCssTransition) {
          selfRef.uiElement.one(globalJQuery.support.cssAnimationEnd.eventName, () => {
            selfRef.uiElement.trigger('shown');
          });
        } else {
          selfRef.uiElement.trigger('shown');
        }
      });
    },

    // Hides the dialog.
    concealContent: function (eventObj) {
      if (eventObj) {
        eventObj.preventDefault(); // Prevent default action if event object exists.
      }

      const selfRef = this;
      const hideEvent = globalJQuery.Event('hide');

      this.uiElement.trigger(hideEvent); // Trigger the 'hide' event.

      // If not visible or the event was prevented, do nothing.
      if (!this.isVisible || hideEvent.isDefaultPrevented()) {
        console.log("DialogManager: Concealment aborted (not visible or event prevented).");
        return;
      }

      this.isVisible = false; // Update internal state.
      globalJQuery('body').removeClass('modal-open'); // Remove body class.
      this.handleEscapeKey(); // Remove escape key listener.

      globalJQuery(document).off('focusin.dialog'); // Unbind focus enforcement.

      this.uiElement
        .removeClass('in') // Remove 'in' class.
        .attr('aria-hidden', true); // Update ARIA attribute.

      // Determine if animated hide is needed.
      const needsAnimatedHide = globalJQuery.support.cssAnimationEnd && this.uiElement.hasClass('fade');
      if (needsAnimatedHide) {
        this.performAnimatedConceal();
      } else {
        this.finalizeConcealment();
      }
    },

    // Ensures focus remains within the dialog while it's open.
    maintainFocus: function () {
      const selfRef = this;
      globalJQuery(document).on('focusin.dialog', (focusEvent) => {
        // If focus is not on the dialog itself and not on a child element of the dialog,
        // refocus the dialog.
        if (selfRef.uiElement[0] !== focusEvent.target && !selfRef.uiElement.has(focusEvent.target).length) {
          selfRef.uiElement.focus();
        }
      });
    },

    // Sets up or tears down the escape key listener.
    handleEscapeKey: function () {
      const selfRef = this;
      if (this.isVisible && this.settings.keyboard) {
        this.uiElement.on('keyup.dismiss.dialog', (keyEvent) => {
          if (keyEvent.which === 27) { // Key code for Escape.
            selfRef.concealContent();
          }
        });
      } else if (!this.isVisible) {
        this.uiElement.off('keyup.dismiss.dialog'); // Remove listener when dialog is hidden.
      }
    },

    // Hides the dialog with a CSS transition.
    performAnimatedConceal: function () {
      const selfRef = this;
      // Set a fallback timeout in case the transitionend event doesn't fire.
      const transitionTimeout = setTimeout(() => {
        selfRef.uiElement.off(globalJQuery.support.cssAnimationEnd.eventName);
        selfRef.finalizeConcealment();
      }, 500); // 500ms is a common transition duration.

      this.uiElement.one(globalJQuery.support.cssAnimationEnd.eventName, () => {
        clearTimeout(transitionTimeout); // Clear the fallback timeout.
        selfRef.finalizeConcealment();
      });
    },

    // Finalizes the hiding process (removes from display, triggers 'hidden' event).
    finalizeConcealment: function () {
      this.uiElement
        .hide() // Hide the dialog.
        .trigger('hidden'); // Trigger the 'hidden' event.

      this.manageOverlay(); // Remove the backdrop.
    },

    // Removes the backdrop element from the DOM.
    destroyOverlay: function () {
      if (this.backdropElement) {
        this.backdropElement.remove();
        this.backdropElement = null;
      }
    },

    // Manages the creation and removal of the dialog's backdrop.
    manageOverlay: function (completionCallback) {
      const selfRef = this;
      const animationClass = this.uiElement.hasClass('fade') ? 'fade' : '';

      if (this.isVisible && this.settings.backdrop) {
        const useAnimation = globalJQuery.support.cssAnimationEnd && animationClass;

        this.backdropElement = globalJQuery(`<div class="modal-backdrop ${animationClass}" />`)
          .appendTo(document.body);

        // If backdrop is not 'static', bind a click handler to hide the dialog.
        if (this.settings.backdrop !== 'static') {
          this.backdropElement.on('click.dismiss.dialog', globalJQuery.proxy(this.concealContent, this));
        }

        if (useAnimation) {
          // Force reflow for backdrop transition.
          this.backdropElement[0].offsetWidth;
        }

        this.backdropElement.addClass('in');

        // Execute callback after transition or immediately.
        if (useAnimation) {
          this.backdropElement.one(globalJQuery.support.cssAnimationEnd.eventName, completionCallback);
        } else if (completionCallback) {
          completionCallback();
        }

      } else if (!this.isVisible && this.backdropElement) {
        this.backdropElement.removeClass('in');

        // Animate backdrop removal if applicable, otherwise remove immediately.
        const animateBackdropRemoval = globalJQuery.support.cssAnimationEnd && this.uiElement.hasClass('fade');
        if (animateBackdropRemoval) {
          this.backdropElement.one(globalJQuery.support.cssAnimationEnd.eventName, globalJQuery.proxy(this.destroyOverlay, this));
        } else {
          this.destroyOverlay();
        }

      } else if (completionCallback) {
        completionCallback(); // If no backdrop, just call the callback.
      }
    }
  };


  // DIALOG_MANAGER PLUGIN DEFINITION
  // ================================
  // Integrates DialogManager with jQuery's plugin system.

  globalJQuery.fn.dialogPlugin = function (pluginOption) {
    return this.each(function () {
      const targetNode = globalJQuery(this);
      let instanceData = targetNode.data('dialogManager'); // Retrieve existing instance.

      // Merge default settings with data attributes and user-provided options.
      const mergedOptions = globalJQuery.extend({}, globalJQuery.fn.dialogPlugin.defaultSettings, targetNode.data(), globalJQuery.isPlainObject(pluginOption) ? pluginOption : {});

      // Create a new instance if one doesn't exist.
      if (!instanceData) {
        instanceData = new DialogManager(this, mergedOptions);
        targetNode.data('dialogManager', instanceData);
      }

      // Execute a method if 'pluginOption' is a string, or show the dialog if 'show' is true.
      if (typeof pluginOption === 'string') {
        instanceData[pluginOption]();
      } else if (mergedOptions.show) {
        instanceData.displayContent();
      }
    });
  };

  // Default settings for the dialog plugin.
  globalJQuery.fn.dialogPlugin.defaultSettings = {
    backdrop: true, // Show backdrop.
    keyboard: true, // Enable keyboard escape.
    show: true      // Show dialog on initialization.
  };

  // Expose the constructor for direct access.
  globalJQuery.fn.dialogPlugin.Constructor = DialogManager;


  // DIALOG_MANAGER DATA-API
  // =======================
  // Auto-initialization of dialogs via data attributes.

  globalJQuery(document).ready(function () {
    globalJQuery('body').on('click.dialog.data-api', '[data-toggle="modal"]', function (eventObj) {
      const clickSource = globalJQuery(this);
      const linkRef = clickSource.attr('href');

      // Determine the target element for the modal.
      const targetElementRef = globalJQuery(clickSource.attr('data-target') || (linkRef && linkRef.replace(/.*(?=#[^\s]+$)/, '')));

      // Build options for the dialog plugin.
      // If an instance already exists, just 'toggle'. Otherwise, extend options.
      const initPayload = targetElementRef.data('dialogManager') ? 'switchVisibility' : globalJQuery.extend({
        remote: !/#/.test(linkRef) && linkRef // Load remote content if href is not a hash.
      }, targetElementRef.data(), clickSource.data());

      eventObj.preventDefault(); // Prevent default link behavior.

      // Initialize and show the dialog, then focus the trigger after hiding.
      targetElementRef
        .dialogPlugin(initPayload)
        .one('hide', () => {
          clickSource.focus(); // Return focus to the element that triggered the modal.
        });
    });
  });

})(window.jQuery);
((globalJQuery) => {

  "use strict"; // Strict mode activated.


  // FLYOUT_CONTROLLER CLASS DEFINITION
  // ==================================
  // Manages the behavior of dropdown menus.

  const dropdownTriggerSelector = '[data-toggle=dropdown]'; // Selector for elements that trigger dropdowns.

  const FlyoutController = function (domElement) {
    const triggerNode = globalJQuery(domElement);
    // Bind click event to toggle the dropdown.
    triggerNode.on('click.flyout.api', globalJQuery.proxy(this.toggleMenu, this));

    // Close dropdowns when clicking anywhere else on the document.
    globalJQuery(document.documentElement).on('click.flyout.api', () => {
      // Find the parent of the trigger and remove the 'open' class.
      triggerNode.parent().removeClass('open');
    });
  };

  FlyoutController.prototype = {

    initialize: FlyoutController, // Reference to the constructor function.

    // Toggles the visibility of the dropdown menu.
    toggleMenu: function (eventObj) {
      const currentTrigger = globalJQuery(this); // The element that was clicked.

      // Prevent action if the trigger is disabled.
      if (currentTrigger.is('.disabled, :disabled')) {
        return false; // Stop further execution.
      }

      const parentContainer = findParentContainer(currentTrigger); // Get the containing parent.
      const isCurrentlyOpen = parentContainer.hasClass('open'); // Check current state.

      closeAllOpenMenus(); // Close any other open menus.

      // If the menu was not open, open it.
      if (!isCurrentlyOpen) {
        parentContainer.addClass('open'); // Add 'open' class.
        currentTrigger.focus(); // Set focus to the trigger.
      }

      return false; // Prevent default event and propagation.
    },

    // Handles keyboard navigation within the dropdown menu.
    handleKeyboardNavigation: function (eventObj) {
      // Only process arrow keys (up/down) and escape key.
      if (![38, 40, 27].includes(eventObj.keyCode)) {
        return;
      }

      const currentTrigger = globalJQuery(this);

      eventObj.preventDefault(); // Prevent default browser behavior (e.g., scrolling).
      eventObj.stopPropagation(); // Stop event propagation.

      // Again, prevent action if disabled.
      if (currentTrigger.is('.disabled, :disabled')) {
        return;
      }

      const parentContainer = findParentContainer(currentTrigger);
      const isCurrentlyOpen = parentContainer.hasClass('open');

      // If menu is not open, or it is open and escape was pressed, simulate a click to close/open.
      if (!isCurrentlyOpen || (isCurrentlyOpen && eventObj.keyCode === 27)) {
        currentTrigger.trigger('click');
        return;
      }

      // Get all navigable items within the menu.
      const menuItems = globalJQuery('[role=menu] li:not(.divider) a', parentContainer);

      if (menuItems.length === 0) {
        return; // No items to navigate.
      }

      let activeIndex = menuItems.index(menuItems.filter(':focus')); // Current focused item index.

      // Adjust index based on key pressed.
      if (eventObj.keyCode === 38 && activeIndex > 0) { // Up arrow
        activeIndex--;
      } else if (eventObj.keyCode === 40 && activeIndex < menuItems.length - 1) { // Down arrow
        activeIndex++;
      }
      // If no item was focused or index is out of bounds, default to the first item.
      if (activeIndex === -1) {
        activeIndex = 0;
      }

      // Focus the selected menu item.
      menuItems
        .eq(activeIndex)
        .focus();
    }

  };

  // Utility function to close all currently open dropdown menus.
  function closeAllOpenMenus() {
    // Find all dropdown triggers and their parent containers, then remove the 'open' class.
    findParentContainer(globalJQuery(dropdownTriggerSelector))
      .removeClass('open');
  }

  // Utility function to determine the parent container of a dropdown trigger.
  function findParentContainer(triggerElement) {
    let targetSelector = triggerElement.attr('data-target');
    let resolvedParent;

    if (!targetSelector) {
      targetSelector = triggerElement.attr('href');
      // Strip hash from href for IE7 compatibility (regex matches '#...' at end of string).
      if (targetSelector && /#/.test(targetSelector)) {
        targetSelector = targetSelector.replace(/.*(?=#[^\s]*$)/, '');
      }
    }

    resolvedParent = globalJQuery(targetSelector);

    // If no parent found by selector, default to the trigger's immediate parent.
    if (resolvedParent.length === 0) {
      resolvedParent = triggerElement.parent();
    }

    return resolvedParent;
  }


  // FLYOUT_CONTROLLER PLUGIN DEFINITION
  // ===================================
  // Integrates FlyoutController with jQuery's plugin system.

  globalJQuery.fn.flyoutPlugin = function (pluginOption) {
    return this.each(function () {
      const currentElement = globalJQuery(this);
      let pluginInstance = currentElement.data('flyoutController'); // Get existing instance.

      // Create a new instance if one doesn't exist.
      if (!pluginInstance) {
        pluginInstance = new FlyoutController(this);
        currentElement.data('flyoutController', pluginInstance);
      }
      // If a method name is provided, call it on the instance.
      if (typeof pluginOption === 'string') {
        pluginInstance[pluginOption].apply(this); // Use apply to retain context.
      }
    });
  };

  // Expose the constructor for direct access.
  globalJQuery.fn.flyoutPlugin.Constructor = FlyoutController;


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================
  // Auto-initialization and event binding for dropdowns via data attributes.

  globalJQuery(document).ready(function () {
    globalJQuery(document.documentElement)
      .on('click.flyout.api touchstart.flyout.api', closeAllOpenMenus); // Close on outside click.

    globalJQuery('body')
      .on('click.flyout touchstart.flyout.api', '.dropdown form', (eventObj) => {
        eventObj.stopPropagation(); // Prevent dropdown from closing when clicking inside a form.
      })
      .on('click.flyout.api touchstart.flyout.api', dropdownTriggerSelector, FlyoutController.prototype.toggleMenu) // Toggle menu.
      .on('keydown.flyout.api touchstart.flyout.api', dropdownTriggerSelector + ', [role=menu]', FlyoutController.prototype.handleKeyboardNavigation); // Keyboard navigation.
  });

})(window.jQuery);
((globalJQuery) => {

  "use strict"; // Strict mode for improved code quality.


  // ANCHOR_OBSERVER CLASS DEFINITION
  // ================================
  // Monitors scroll position to automatically update navigation states.

  function AnchorObserver(rootElement, configuration) {
    const handleScrollEvent = globalJQuery.proxy(this.process, this); // Create a bound function for event listener.
    const scrollSource = globalJQuery(rootElement).is('body') ? globalJQuery(window) : globalJQuery(rootElement);

    this.config = globalJQuery.extend({}, globalJQuery.fn.anchorObserver.defaultSettings, configuration);
    this.scrollMonitor = scrollSource.on('scroll.anchor-observer.api', handleScrollEvent);

    let navTargetHref; // Temporary variable for href.
    const baseSelector = this.config.target ||
      ((navTargetHref = globalJQuery(rootElement).attr('href')) && navTargetHref.replace(/.*(?=#[^\s]+$)/, '')) || ''; // Strip for IE7.

    this.itemSelector = baseSelector + ' .nav li > a'; // Final selector for navigation items.
    this.documentBody = globalJQuery('body');

    this.updateTargets(); // Initial scan for targets.
    this.process(); // Initial processing of scroll position.
  }

  AnchorObserver.prototype = {

    ctor: AnchorObserver, // Reference to the constructor.

    // Scans the DOM for target elements and calculates their scroll offsets.
    updateTargets: function () {
      const _self = this; // Cache 'this'.
      this.offsetPoints = []; // Stores scroll positions of targets.
      this.targetElements = globalJQuery([]); // Stores jQuery objects of targets.

      // Iterate through each navigation item to find its corresponding scroll target.
      globalJQuery(this.itemSelector).map(function () {
        const navItem = globalJQuery(this);
        const itemHref = navItem.attr('href');
        const targetId = itemHref && itemHref.replace(/.*(?=#[^\s]+$)/, ''); // Extract ID from href.

        if (!targetId || targetId === '#') {
          return null; // Skip invalid or empty targets.
        }

        const targetEl = globalJQuery(targetId);
        // Ensure the target element exists and is visible.
        if (targetEl.length && targetEl.is(':visible')) {
          return {
            offset: targetEl.position().top, // Get top offset relative to parent.
            element: targetEl
          };
        }
        return null;
      })
      .sort((a, b) => a.offset - b.offset) // Sort targets by their offset.
      .each(function () {
        _self.offsetPoints.push(this.offset);
        _self.targetElements.push(this.element);
      });
      console.log("AnchorObserver: Targets updated. Offsets:", this.offsetPoints);
    },

    // Processes the current scroll position to activate the corresponding navigation item.
    process: function () {
      const scrollPosition = this.scrollMonitor.scrollTop() + this.config.offset; // Current scroll position + offset.
      const scrollHeight = this.scrollMonitor[0].scrollHeight || this.documentBody[0].scrollHeight;
      const windowHeight = globalJQuery(window).height();

      // If scrolled to the very bottom, activate the last item.
      if (scrollPosition >= scrollHeight - windowHeight) {
        const lastItem = this.targetElements.last();
        if (lastItem.length) {
          this.activateLink(lastItem);
        }
        return;
      }

      // If current active item is out of view, deactivate it.
      if (this.activeTarget && scrollPosition < this.offsetPoints[0]) {
        this.activeTarget = null;
        this.clearActiveStates();
        return;
      }

      // Iterate through targets to find the correct active link.
      for (let i = this.offsetPoints.length; i--;) {
        const offset = this.offsetPoints[i];
        const targetElement = this.targetElements.eq(i);

        if (this.activeTarget === targetElement.attr('id')) {
          continue; // Already active, skip.
        }

        // Activate if scroll position is within the target's range.
        if (scrollPosition >= offset && (!this.offsetPoints[i + 1] || scrollPosition <= this.offsetPoints[i + 1])) {
          this.activateLink(targetElement);
        }
      }
    },

    // Clears active states from all navigation items.
    clearActiveStates: function () {
      globalJQuery(this.itemSelector)
        .parent('li')
        .removeClass('active');
    },

    // Activates the navigation link corresponding to the given target element.
    activateLink: function (targetElement) {
      this.activeTarget = targetElement.attr('id'); // Store the ID of the newly active target.
      this.clearActiveStates(); // Remove active states from others.

      const selector = `${this.itemSelector}[href="#${this.activeTarget}"]`;
      const parentListItem = globalJQuery(selector).parent('li');

      parentListItem.addClass('active'); // Add 'active' class to the parent list item.

      // If the active item is within a nested dropdown, activate its parent as well.
      parentListItem.parent('ul.dropdown-menu').each(function () {
        globalJQuery(this).parents('li').addClass('active');
      });
      console.log(`AnchorObserver: Activated target: #${this.activeTarget}`);
    }

  };


  // ANCHOR_OBSERVER PLUGIN DEFINITION
  // =================================
  // Integrates AnchorObserver with jQuery's plugin system.

  globalJQuery.fn.anchorObserver = function (pluginOption) {
    return this.each(function () {
      const currentElement = globalJQuery(this);
      let instanceData = currentElement.data('anchorObserver'); // Get existing instance.
      const mergedConfig = globalJQuery.extend({}, globalJQuery.fn.anchorObserver.defaultSettings, currentElement.data(), globalJQuery.isPlainObject(pluginOption) && pluginOption);

      // Create a new instance if one doesn't exist.
      if (!instanceData) {
        instanceData = new AnchorObserver(this, mergedConfig);
        currentElement.data('anchorObserver', instanceData);
      }
      // If a method name is provided, call it.
      if (typeof pluginOption === 'string') {
        instanceData[pluginOption]();
      }
    });
  };

  // Default settings for the scrollspy plugin.
  globalJQuery.fn.anchorObserver.defaultSettings = {
    offset: 10 // Offset from the top of the viewport.
  };

  // Expose the constructor for direct access.
  globalJQuery.fn.anchorObserver.Constructor = AnchorObserver;


  // ANCHOR_OBSERVER DATA-API
  // ========================
  // Auto-initialization of scrollspy via data attributes.

  globalJQuery(document).ready(function () {
    globalJQuery('[data-spy="scroll"]').each(function () {
      const scrollElement = globalJQuery(this);
      scrollElement.anchorObserver(scrollElement.data()); // Initialize with data attributes.
    });
  });

})(window.jQuery);