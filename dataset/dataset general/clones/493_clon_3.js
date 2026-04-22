((jq) => {
  'use strict';

  // Defensive check: Ensure jQuery is loaded before attempting to extend its prototype.
  if (typeof jq === 'undefined') {
    console.error('Core library (jQuery) is not found. The sliding navigation plugin cannot be initialized.');
    return;
  }

  // Utility function to parse a CSS dimension string (e.g., '15.625em', '250px').
  // Returns an object containing the numeric value, unit, and the original CSS string.
  const extractDimensionDetails = (dimensionInput) => {
    const unitPattern = /^(\d+(\.\d+)?)(em|px|vw|vh|%|rem)?$/;
    const dimensionMatch = dimensionInput.match(unitPattern);
    if (dimensionMatch) {
      return {
        numericValue: parseFloat(dimensionMatch[1]),
        unitString: dimensionMatch[3] || 'px', // Default to pixels if no unit is specified
        fullCssString: dimensionInput
      };
    }
    // Fallback for invalid or unparseable dimension strings.
    console.warn(`Invalid dimension format for: ${dimensionInput}. Defaulting to '250px'.`);
    return { numericValue: 250, unitString: 'px', fullCssString: '250px' };
  };

  // Utility function to generate a CSS object with vendor-prefixed transition properties.
  const constructTransitionStyles = (cssProperty, durationMillis, timingFunc = 'ease-out') => {
    const transitionDefinition = `${cssProperty} ${durationMillis}ms ${timingFunc}`;
    return {
      '-webkit-transition': transitionDefinition,
      '-moz-transition': transitionDefinition,
      '-ms-transition': transitionDefinition,
      '-o-transition': transitionDefinition,
      'transition': transitionDefinition
    };
  };

  /**
   * jQuery plugin for a responsive sliding navigation panel.
   *
   * @param {object} userConfiguration - An object containing user-defined options
   *                                     to override the default settings.
   * @returns {jq} The original jQuery object for method chaining.
   */
  jq.fn.slideNav = function(userConfiguration) {
    // The DOM element (or jQuery object) that triggers the navigation panel's visibility toggle.
    const navigationActivator = this;

    // Define the default configuration parameters for the plugin.
    const baseConfiguration = {
      navPanelSelector: '#menu',           // Selector for the actual navigation panel.
      contentAreaSelector: '.push',        // Selector for the main content area to be pushed.
      panelPositionSide: 'left',           // 'left' or 'right' - determines from which side the panel slides.
      panelWidthDimension: '15.625em',     // Width of the navigation panel (e.g., '200px', '18rem').
      animationDurationMs: 300,            // Duration of the slide animation in milliseconds.
      initialPanelStatus: 'closed',        // 'open' or 'closed' - starting state of the panel.
      activeButtonClass: 'is-active',      // CSS class applied to the activator when the panel is open.
      closeOnOutsideClick: false           // Boolean: if true, clicking outside the panel closes it.
    };

    // Deep merge user-provided options with the base configuration.
    const effectiveConfiguration = jq.extend(true, {}, baseConfiguration, userConfiguration);

    // Parse the panel width for internal calculations and CSS application.
    const panelSizeDetails = extractDimensionDetails(effectiveConfiguration.panelWidthDimension);

    // Internal flag to prevent rapid, overlapping animations from multiple clicks.
    let isTransitionInProgress = false;

    // Manages the current state of the navigation panel (open/closed).
    const panelStateManager = {
      currentVisibilityState: effectiveConfiguration.initialPanelStatus, // 'open' or 'closed'

      /**
       * Checks if the panel is currently in an 'open' state.
       * @returns {boolean} True if the panel is open, false otherwise.
       */
      isCurrentlyOpen: function() {
        return this.currentVisibilityState === 'open';
      },

      /**
       * Toggles the panel's visibility state between 'open' and 'closed'.
       */
      flipVisibilityState: function() {
        this.currentVisibilityState = this.isCurrentlyOpen() ? 'closed' : 'open';
      }
    };

    // Orchestrates the plugin's logic, coordinating state and visual updates.
    const coreLogicController = {
      /**
       * Initializes the plugin by preparing the DOM and setting up event handlers.
       */
      initiateModule: function() {
        domRenderer.prepareInitialLayout();
        domRenderer.attachInteractionListeners();
      },

      /**
       * Executes the action to toggle the navigation panel's display.
       * Includes a guard to prevent re-triggering during an ongoing animation.
       */
      executePanelToggle: function() {
        if (isTransitionInProgress) {
            // Ignore requests to toggle if an animation is already running.
            return;
        }

        isTransitionInProgress = true;
        panelStateManager.flipVisibilityState(); // Update the internal state.

        if (panelStateManager.isCurrentlyOpen()) {
          domRenderer.displayNavigationPanel();
        } else {
          domRenderer.concealNavigationPanel();
        }

        // Reset the animation flag after the transition is expected to complete.
        setTimeout(() => {
          isTransitionInProgress = false;
        }, effectiveConfiguration.animationDurationMs);
      }
    };

    // Handles all direct DOM manipulation, styling, and visual rendering.
    const domRenderer = {
      jqNavPanel: null,          // jQuery object for the navigation panel.
      jqContentPusher: null,     // jQuery object for the main content area.
      panelWidthCSS: panelSizeDetails.fullCssString, // e.g., '15.625em'
      panelSide: effectiveConfiguration.panelPositionSide, // 'left' or 'right'

      /**
       * Caches essential DOM elements and applies initial CSS for positioning.
       */
      prepareInitialLayout: function() {
        this.jqNavPanel = jq(effectiveConfiguration.navPanelSelector);
        this.jqContentPusher = jq(effectiveConfiguration.contentAreaSelector);

        // Determine the 'off-screen' transform value based on the panel's side.
        const offScreenTransformValue = this.panelSide === 'left' ?
          `translateX(-${this.panelWidthCSS})` :
          `translateX(${this.panelWidthCSS})`;

        // Generate vendor-prefixed CSS for smooth 'transform' transitions.
        const panelTransitionCSS = constructTransitionStyles('transform', effectiveConfiguration.animationDurationMs);

        // Apply foundational styles to the navigation panel.
        this.jqNavPanel.css({
          'position': 'fixed',
          'top': '0',
          'bottom': '0',
          'height': '100%',
          'width': this.panelWidthCSS,
          'z-index': '9999', // Ensure the panel is always on top.
          'overflow-y': 'auto' // Allow scrolling within the panel if content overflows.
        }).css(panelTransitionCSS); // Apply the transition properties.

        // Apply the same transition properties to the content pusher for synchronized movement.
        this.jqContentPusher.css(panelTransitionCSS);

        // Set the initial visual state of the panel and content pusher.
        if (!panelStateManager.isCurrentlyOpen()) {
          this.jqNavPanel.css('transform', offScreenTransformValue);
          this.jqContentPusher.css('transform', 'translateX(0)');
        } else {
          // If the panel starts 'open', position it correctly from the outset.
          this.jqNavPanel.css('transform', 'translateX(0)'); // Panel is visible.
          const contentPushAmount = this.panelSide === 'left' ?
            `translateX(${this.panelWidthCSS})` :
            `translateX(-${this.panelWidthCSS})`;
          this.jqContentPusher.css('transform', contentPushAmount);
          navigationActivator.addClass(effectiveConfiguration.activeButtonClass);
        }
      },

      /**
       * Binds event listeners to the navigation activator and optionally the document body.
       */
      attachInteractionListeners: function() {
        // Event listener for the primary toggle element (e.g., hamburger icon).
        navigationActivator.on('click.slideNav touchstart.slideNav', (interactionEvent) => {
          // Prevent default only for relevant events (left-click or touchstart).
          if (interactionEvent.type === 'touchstart' || (interactionEvent.type === 'click' && interactionEvent.which === 1)) {
            interactionEvent.preventDefault();
            coreLogicController.executePanelToggle();
          }
        });

        // Implement 'close on outside click' functionality if enabled.
        if (effectiveConfiguration.closeOnOutsideClick) {
          jq('body').on('click.slideNav', (clickEvent) => {
            // Determine if the click occurred inside the navigation panel or on the activator.
            const wasClickInsidePanel = jq(clickEvent.target).closest(effectiveConfiguration.navPanelSelector).length > 0;
            const wasClickOnActivator = jq(clickEvent.target).closest(navigationActivator).length > 0;

            // If click was outside both the panel and the activator, and the panel is open, close it.
            if (!wasClickInsidePanel && !wasClickOnActivator && panelStateManager.isCurrentlyOpen()) {
              coreLogicController.executePanelToggle(); // This will trigger the close action.
            }
          });
        }
      },

      /**
       * Visually opens the navigation panel by sliding it into view.
       */
      displayNavigationPanel: function() {
        // Move the navigation panel to its visible position (no X-translation).
        this.jqNavPanel.css('transform', 'translateX(0)');

        // Translate the main content area to make space for the panel.
        const contentTranslationAmount = this.panelSide === 'left' ? this.panelWidthCSS : `-${this.panelWidthCSS}`;
        this.jqContentPusher.css('transform', `translateX(${contentTranslationAmount})`);

        // Add the active class to the activator element.
        navigationActivator.addClass(effectiveConfiguration.activeButtonClass);
      },

      /**
       * Visually closes the navigation panel by sliding it out of view.
       */
      concealNavigationPanel: function() {
        // Move the navigation panel back off-screen.
        const offScreenTransform = this.panelSide === 'left' ?
          `translateX(-${this.panelWidthCSS})` :
          `translateX(${this.panelWidthCSS})`;
        this.jqNavPanel.css('transform', offScreenTransform);

        // Reset the main content area's position.
        this.jqContentPusher.css('transform', 'translateX(0)');

        // Remove the active class from the activator element.
        navigationActivator.removeClass(effectiveConfiguration.activeButtonClass);
      }
    };

    // Begin the plugin's lifecycle.
    coreLogicController.initiateModule();

    // Allow for jQuery method chaining.
    return this;
  };

})(jQuery);