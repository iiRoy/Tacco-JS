// This file implements a collapsible menu system, designed as a jQuery plugin.
// It allows for nested lists to be expanded and collapsed, with optional animation
// and hover-based activation.
//
// Original concept by Ivan Prignano (Tendina jQuery plugin v0.11.1).
// This is a Type III clone, maintaining core functionality while extensively
// refactoring and modifying the structure, variable names, and logic.

(function() {
  // Enclose the plugin definition within an IIFE to prevent global variable pollution.
  (function($, currentWindow) {
    // Basic validation: Ensure jQuery is loaded before attempting to define the plugin.
    if (typeof $ === 'undefined' || typeof $.fn === 'undefined') {
      console.error('CollapsibleMenuHandler: jQuery is required for this plugin to function.');
      return;
    }

    // Define the core class for managing collapsible menu behavior.
    let CollapsibleMenuHandler;

    CollapsibleMenuHandler = (function() {
      // Default configuration options for each menu instance.
      const configDefaults = {
        useTransitions: true, // If true, enables smooth slide animations for expanding/collapsing.
        transitionDuration: 500, // Speed of the slide animation in milliseconds.
        activateOnHover: false, // If true, menu sections expand/collapse on mouse hover.
        hoverActivationDelay: 200, // Delay (ms) before a hover event triggers expansion.
        initialActiveElement: null, // A selector string or jQuery object for an initially open menu path.
        onPanelOpen: null, // Optional callback function executed when a panel opens.
        onPanelClose: null // Optional callback function executed when a panel closes.
      };

      /**
       * Constructor for the CollapsibleMenuHandler class.
       * Initializes a new collapsible menu instance for a given root element.
       * @param {HTMLElement} rootElement - The raw DOM element that serves as the menu's root.
       * @param {object} userOptions - An object containing user-defined settings to override defaults.
       */
      function CollapsibleMenuHandler(rootElement, userOptions) {
        // Bind the `handleInteraction` method to the instance's context to ensure `this` is correct.
        this.handleInteraction = this.handleInteraction.bind(this);

        // Merge default configuration with any provided user options.
        this.currentConfig = $.extend({}, configDefaults, userOptions);

        // Store the jQuery-wrapped root element for consistent access.
        this.$rootContainer = $(rootElement);

        // Attempt to derive a unique CSS selector string for the root container.
        this.rootContainerSelector = this.deriveElementSelector(this.$rootContainer);

        // Add a distinguishing class to the root element for styling and identification.
        this.$rootContainer.addClass('collapsible-nav');

        // Construct a selector for all interactive links within this menu instance.
        this.triggerLinkSelector = `${this.rootContainerSelector} a`;

        // Prepare the initial display state of the menu (hide all, then activate specified).
        this.setupInitialDisplay();

        // Determine the primary event type ('click' or 'mouseenter') based on configuration.
        this.interactionEventType = this.currentConfig.activateOnHover ? 'mouseenter.collapsible' : 'click.collapsible';

        // Attach all necessary event listeners to handle user interactions.
        this.attachListeners();
      }

      /**
       * Sets up the initial visual state of the menu.
       * All nested lists are initially hidden, then any specified active path is revealed.
       */
      CollapsibleMenuHandler.prototype.setupInitialDisplay = function() {
        this.hideAllNestedLists(); // Collapse all panels by default.

        // If an initial active element is specified in the config, open its path.
        if (this.currentConfig.initialActiveElement !== null) {
          this.initializeActiveState(this.currentConfig.initialActiveElement);
        }
      };

      /**
       * Attaches event listeners for menu interactions (click or hover).
       * Uses event delegation on the document for performance and dynamic content support.
       */
      CollapsibleMenuHandler.prototype.attachListeners = function() {
        // Listen for the primary interaction event on links within the menu.
        $(document).on(this.interactionEventType, this.triggerLinkSelector, this.handleInteraction);

        // If hover activation is enabled, also bind a mouseleave event to close sections.
        if (this.currentConfig.activateOnHover) {
          $(document).on('mouseleave.collapsible', this.triggerLinkSelector, (e) => {
            const $eventTargetLink = $(e.currentTarget);
            // Only close a section if it's currently active and has nested content.
            if (this.isSectionActive($eventTargetLink) && this.hasNestedList($eventTargetLink)) {
              this.collapseSection($eventTargetLink);
            }
          });
        }
      };

      /**
       * Detaches all event listeners previously bound by this plugin instance.
       */
      CollapsibleMenuHandler.prototype.detachListeners = function() {
        $(document).off(this.interactionEventType, this.triggerLinkSelector);
        if (this.currentConfig.activateOnHover) {
          $(document).off('mouseleave.collapsible', this.triggerLinkSelector);
        }
      };

      /**
       * Generates a unique CSS selector string for a given jQuery element.
       * Prioritizes ID, then the first class, falling back to tag name if necessary.
       * @param {jQuery} $element - The jQuery object to derive the selector from.
       * @returns {string} The CSS selector string for the element.
       */
      CollapsibleMenuHandler.prototype.deriveElementSelector = function($element) {
        const elementId = $element.attr('id');
        if (elementId) {
          return `#${elementId}`;
        }
        // Use optional chaining for safer access to class attribute.
        const firstCssClass = $element.attr('class')?.split(' ')[0];
        if (firstCssClass) {
          return `.${firstCssClass}`;
        }
        // Fallback to tag name if no ID or class is present. This might not be unique.
        console.warn('CollapsibleMenuHandler: Root element has no ID or class. Generated selector may not be unique.');
        return $element.prop('tagName').toLowerCase();
      };

      /**
       * The primary event handler for user interactions (click or hover) on menu links.
       * @param {Event} interactionEvent - The DOM event object.
       */
      CollapsibleMenuHandler.prototype.handleInteraction = function(interactionEvent) {
        const $eventTargetLink = $(interactionEvent.currentTarget);

        // Guard clause: Ensure the event target is a descendant of this plugin instance's root container.
        if (!$.contains(this.$rootContainer[0], $eventTargetLink[0])) {
          return;
        }

        const hasNestedContent = this.hasNestedList($eventTargetLink);
        const isNestedContentHidden = this.isNestedListHidden($eventTargetLink);
        const isSectionCurrentlyActive = this.isSectionActive($eventTargetLink);

        if (hasNestedContent) {
          // Prevent the default link behavior for menu items that act as toggles.
          interactionEvent.preventDefault();

          if (isNestedContentHidden) {
            // If the section is closed, initiate its expansion.
            if (this.currentConfig.activateOnHover) {
              // For hover activation, introduce a delay and re-check hover status.
              setTimeout(() => {
                if ($eventTargetLink.is(':hover')) { // Confirm still hovering after delay.
                  this.expandSection($eventTargetLink);
                }
              }, this.currentConfig.hoverActivationDelay);
            } else {
              this.expandSection($eventTargetLink);
            }
          } else if (isSectionCurrentlyActive && !this.currentConfig.activateOnHover) {
            // If the section is open and not hover-activated, collapse it on click.
            this.collapseSection($eventTargetLink);
          }
        }
      };

      /**
       * Expands a target menu section, collapsing any sibling sections at the same level.
       * @param {jQuery} $triggerLink - The link element that initiated the expansion.
       */
      CollapsibleMenuHandler.prototype.expandSection = function($triggerLink) {
        const $targetNestedList = $triggerLink.next('ul');
        const $parentListItem = $triggerLink.parent('li');

        // Guard clause: Do nothing if no nested list or if the section is already active.
        if ($targetNestedList.length === 0 || $parentListItem.hasClass('selected')) {
          return;
        }

        // Collapse all 'selected' sibling lists and their active descendants.
        // This ensures only one panel at a time is open at the top level.
        // Also ensure we don't close ancestral lists of the current target.
        const $openSiblings = $parentListItem.siblings('.selected').find('> ul');
        $openSiblings.each((_idx, el) => {
          const $siblingList = $(el);
          this.concealElement($siblingList);
          $siblingList.parent('li').removeClass('selected');
        });

        // Add the 'selected' class to the parent list item to mark it as active.
        $parentListItem.addClass('selected');

        // Reveal the target nested list.
        this.revealElement($targetNestedList);

        // Execute the optional `onPanelOpen` callback.
        if (typeof this.currentConfig.onPanelOpen === 'function') {
          this.currentConfig.onPanelOpen($parentListItem);
        }
      };

      /**
       * Collapses a target menu section and all its active nested descendants.
       * @param {jQuery} $triggerLink - The link element that initiated the collapse.
       */
      CollapsibleMenuHandler.prototype.collapseSection = function($triggerLink) {
        const $targetNestedList = $triggerLink.next('ul');
        const $parentListItem = $triggerLink.parent('li');

        // Guard clause: Do nothing if no nested list or if the section is not active.
        if ($targetNestedList.length === 0 || !$parentListItem.hasClass('selected')) {
          return;
        }

        // Find all active (selected) descendant list items within the target nested list.
        const $activeDescendants = $targetNestedList.find('li.selected');

        // Remove the 'selected' class from the parent list item.
        $parentListItem.removeClass('selected');

        // Conceal the target nested list.
        this.concealElement($targetNestedList);

        // Iterate through all active descendants, remove their 'selected' class,
        // and conceal any nested 'ul' elements they might contain.
        $activeDescendants.removeClass('selected').find('ul').each((_idx, el) => {
          this.concealElement($(el));
        });

        // Execute the optional `onPanelClose` callback.
        if (typeof this.currentConfig.onPanelClose === 'function') {
          this.currentConfig.onPanelClose($parentListItem);
        }
      };

      /**
       * Makes a jQuery element visible, optionally using a slide-down animation.
       * @param {jQuery} $elementToReveal - The element to be shown.
       */
      CollapsibleMenuHandler.prototype.revealElement = function($elementToReveal) {
        if (this.currentConfig.useTransitions) {
          // Stop any ongoing animation and clear the queue before starting a new one.
          $elementToReveal.stop(true, true).slideDown(this.currentConfig.transitionDuration);
        } else {
          $elementToReveal.show();
        }
      };

      /**
       * Hides a jQuery element, optionally using a slide-up animation.
       * @param {jQuery} $elementToConceal - The element to be hidden.
       */
      CollapsibleMenuHandler.prototype.concealElement = function($elementToConceal) {
        if (this.currentConfig.useTransitions) {
          // Stop any ongoing animation and clear the queue before starting a new one.
          $elementToConceal.stop(true, true).slideUp(this.currentConfig.transitionDuration);
        } else {
          $elementToConceal.hide();
        }
      };

      /**
       * Checks if a given link element is immediately followed by a nested 'ul'.
       * @param {jQuery} $targetLink - The link element to inspect.
       * @returns {boolean} True if a nested list exists, false otherwise.
       */
      CollapsibleMenuHandler.prototype.hasNestedList = function($targetLink) {
        return $targetLink.next('ul').length > 0;
      };

      /**
       * Checks if the nested 'ul' element following a given link is currently hidden.
       * @param {jQuery} $targetLink - The link element whose nested list's visibility is checked.
       * @returns {boolean} True if the nested list is hidden, false otherwise.
       */
      CollapsibleMenuHandler.prototype.isNestedListHidden = function($targetLink) {
        return $targetLink.next('ul').is(':hidden');
      };

      /**
       * Checks if the parent 'li' of a given link element has the 'selected' class,
       * indicating that its section is currently active/open.
       * @param {jQuery} $targetLink - The link element to check.
       * @returns {boolean} True if the section is active, false otherwise.
       */
      CollapsibleMenuHandler.prototype.isSectionActive = function($targetLink) {
        return $targetLink.parent('li').hasClass('selected');
      };

      /**
       * Hides all nested 'ul' elements within the entire menu container.
       */
      CollapsibleMenuHandler.prototype.hideAllNestedLists = function() {
        this.$rootContainer.find('ul').hide();
      };

      /**
       * Shows all nested 'ul' elements and adds the 'selected' class to their parent 'li's.
       * This effectively opens every panel in the menu.
       */
      CollapsibleMenuHandler.prototype.showAllNestedLists = function() {
        this.$rootContainer.find('ul').show();
        this.$rootContainer.find('li').addClass('selected');
      };

      /**
       * Sets the initial active state of the menu by revealing the path to a specified element.
       * @param {string|jQuery} activeElementIdentifier - A CSS selector string or a jQuery object
       *                                                  representing the link to be made active.
       */
      CollapsibleMenuHandler.prototype.initializeActiveState = function(activeElementIdentifier) {
        let $initialActiveLink;

        // Determine the jQuery object for the initial active link.
        if (activeElementIdentifier instanceof jQuery) {
          $initialActiveLink = activeElementIdentifier;
        } else if (typeof activeElementIdentifier === 'string') {
          $initialActiveLink = this.$rootContainer.find(activeElementIdentifier);
        } else {
          console.warn('CollapsibleMenuHandler: Invalid initialActiveElement provided. Must be a selector or jQuery object.');
          return;
        }

        // Guard clause: If the specified element is not found, do nothing.
        if ($initialActiveLink.length === 0) {
          // console.warn('CollapsibleMenuHandler: Initial active element not found within the menu.');
          return;
        }

        // Find all parent <li> elements of the active link, and then their direct child <a> links.
        const $parentLinksToActivate = $initialActiveLink.parents('li').find('> a');

        // Combine the initial active link with its parent links, ensuring correct order (ancestors first).
        const $allLinksToActivate = $parentLinksToActivate.add($initialActiveLink).get().reverse(); // Reverse to process from root down.

        // Iterate through all links that need to be activated to reveal the path.
        $allLinksToActivate.forEach((linkEl) => {
          const $currentLink = $(linkEl);
          const $nestedList = $currentLink.next('ul');
          const $parentLi = $currentLink.parent('li');

          // Add the 'selected' class to mark the parent list item as active.
          $parentLi.addClass('selected');

          // If there's a nested list, ensure it is visible.
          if ($nestedList.length > 0) {
            this.revealElement($nestedList);
          }
        });
      };

      /**
       * Disposes of the plugin instance, cleaning up event listeners, data, and restoring the DOM.
       */
      CollapsibleMenuHandler.prototype.dispose = function() {
        this.$rootContainer.removeData('collapsibleMenu'); // Remove plugin data from the element.
        this.detachListeners(); // Unbind all event handlers.
        this.showAllNestedLists(); // Restore all submenus to their visible state.
        this.$rootContainer.removeClass('collapsible-nav'); // Remove the plugin's root class.
        // Remove all 'selected' classes from list items within this menu instance.
        this.$rootContainer.find('.selected').removeClass('selected');
      };

      /**
       * Public method: Hides all panels in the menu and removes their active states.
       */
      CollapsibleMenuHandler.prototype.hideAllPanels = function() {
        this.hideAllNestedLists();
        this.$rootContainer.find('.selected').removeClass('selected'); // Also clear all active states.
      };

      /**
       * Public method: Shows all panels in the menu, expanding all nested lists.
       */
      CollapsibleMenuHandler.prototype.showAllPanels = function() {
        this.showAllNestedLists();
      };

      return CollapsibleMenuHandler;
    })();

    // Integrate CollapsibleMenuHandler as a jQuery plugin.
    $.fn.extend({
      collapsibleMenu: function() {
        const methodOrOptions = arguments[0];
        // Convert `arguments` object to a real array, skipping the first element (methodOrOptions).
        const methodArguments = Array.prototype.slice.call(arguments, 1);

        // Iterate over each selected element in the jQuery collection.
        return this.each(function() {
          const $contextElement = $(this);
          let instanceData = $contextElement.data('collapsibleMenu'); // Retrieve existing instance data.

          // If no instance exists, create a new one.
          if (!instanceData) {
            instanceData = new CollapsibleMenuHandler(this, methodOrOptions);
            $contextElement.data('collapsibleMenu', instanceData); // Store the new instance.
          }

          // If the first argument is a string, it's a call to a public method.
          if (typeof methodOrOptions === 'string' && instanceData) {
            // Check if the method exists on the instance.
            if (typeof instanceData[methodOrOptions] === 'function') {
              // Call the method with the collected arguments.
              instanceData[methodOrOptions].apply(instanceData, methodArguments);
            } else {
              console.warn(`CollapsibleMenuHandler: Method "${methodOrOptions}" does not exist on this instance.`);
            }
          }
        });
      }
    });
  })(window.jQuery, window); // Explicitly pass jQuery and window objects to the IIFE.

}).call(this); // Execute the outer IIFE in the context of the global object (`window` in browsers).