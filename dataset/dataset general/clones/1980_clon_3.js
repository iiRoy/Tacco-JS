/*
 * Core framework utility for browser capability detection.
 * Identifies the correct CSS transition end event name for animations.
 * This script is a foundational component for dynamic UI effects.
 */
(function (jqAlias) {
  // Execute module logic once the DOM is fully loaded.
  jqAlias(function () {
    // Encapsulated logic to determine browser's animation completion event.
    // This result is stored in jQuery's support object for global access.
    jqAlias.support.animationEndEvent = (function () {

      var animationFinishEvent = (function () {
        // Create a temporary, detached DOM element to test CSS property support.
        var transientElement = document.createElement('div');
        // Map of standard and vendor-prefixed transition property names to their corresponding event names.
        var potentialEvents = {
          'WebkitTransition': 'webkitTransitionEnd',
          'MozTransition': 'transitionend',
          'OTransition': 'oTransitionEnd otransitionend',
          'transition': 'transitionend'
        };
        var detectedEventName = null; // Variable to hold the discovered event name.

        // Iterate through the potential CSS transition properties.
        for (var cssProp in potentialEvents) {
          // Ensure the property belongs to the object itself, not its prototype chain.
          if (Object.prototype.hasOwnProperty.call(potentialEvents, cssProp)) {
            var styleCheckResult = transientElement.style[cssProp]; // Check if the style property exists.
            if (styleCheckResult !== undefined) {
              detectedEventName = potentialEvents[cssProp]; // Store the event name if property is supported.
              break; // Exit the loop as soon as a supported property is found.
            }
          }
        }
        return detectedEventName; // Return the detected event or null if none found.
      })(); // Self-executing function for event detection.

      // If an animation finish event was successfully detected,
      // return an object containing it under a 'finish' key.
      if (animationFinishEvent) {
        return {
          finish: animationFinishEvent
        };
      } else {
        // If no transition event is supported, return null.
        return null;
      }
    })(); // Self-executing function for overall support check.
  });
})(window.jQuery);

/*
 * Custom module for managing dismissable notification elements.
 * Handles UI interactions for closing alert messages.
 */
(function (jQ) {
  // Configuration for dismissable elements
  var closeTriggerSelector = '[data-dismiss="notification-item"]'; // Renamed data-dismiss attribute
  var activeClassName = 'is-visible'; // New variable for active class
  var fadeClassName = 'has-fade-effect'; // New variable for fade class

  // NotificationHandler constructor function.
  // Initializes a new instance for a given component element.
  var NotificationHandler = function (componentElem) {
    // Attach a delegated click event listener to the component.
    // When an element matching `closeTriggerSelector` is clicked, `handleDismiss` is called.
    jQ(componentElem).on('click', closeTriggerSelector, jQ.proxy(this.handleDismiss, this));
  };

  // Prototype methods for NotificationHandler, defining its behavior.
  NotificationHandler.prototype.handleDismiss = function (eventObj) {
    var currentTrigger = jQ(this); // Reference to the element that initiated the dismissal.
    var targetIdentifier = currentTrigger.attr('data-target-id'); // Attempt to get target from custom attribute.
    var targetContainer; // Variable to hold the actual element to be dismissed.

    // If no explicit target ID, try to derive it from the 'href' attribute.
    if (!targetIdentifier) {
      targetIdentifier = currentTrigger.attr('href');
      // Special handling for IE7 to strip everything before the hash.
      if (targetIdentifier && targetIdentifier.indexOf('#') !== -1) {
        targetIdentifier = targetIdentifier.substring(targetIdentifier.indexOf('#'));
      }
    }

    // Try to find the target container using the resolved identifier.
    if (targetIdentifier) {
      targetContainer = jQ(targetIdentifier);
    }

    // If an event object is present, prevent its default action (e.g., navigating a link).
    if (eventObj) {
      eventObj.preventDefault();
    }

    // If `targetContainer` is still not found or is empty,
    // determine it based on whether the trigger itself is the notification or its parent.
    if (!targetContainer || targetContainer.length === 0) {
      if (currentTrigger.hasClass('notification-item')) { // Check for a specific notification class.
        targetContainer = currentTrigger;
      } else {
        targetContainer = currentTrigger.parent(); // Default to parent element.
      }
    }

    // Create and trigger a custom 'beforeClose' event on the target container.
    var dismissalEvent = jQ.Event('beforeClose.notification');
    targetContainer.trigger(dismissalEvent);

    // If any handler for 'beforeClose' prevented the default action, stop the dismissal process.
    if (dismissalEvent.isDefaultPrevented()) {
      return;
    }

    // Remove the 'is-visible' class, which typically triggers a CSS hiding animation.
    targetContainer.removeClass(activeClassName);

    // Inner function to perform the final removal of the element from the DOM.
    var performRemoval = function () {
      targetContainer.trigger('afterClosed.notification'); // Trigger a custom 'afterClosed' event.
      targetContainer.remove(); // Physically remove the element.
    };

    // Check if CSS transitions are supported and if the element has the fade class.
    var isTransitionSupported = jQ.support.animationEndEvent;
    var hasFadeClass = targetContainer.hasClass(fadeClassName);

    if (isTransitionSupported && hasFadeClass) {
      // If transitions are supported and the element has a fade effect,
      // wait for the transition to complete before removing the element.
      targetContainer.one(jQ.support.animationEndEvent.finish, performRemoval);
    } else {
      // Otherwise, remove the element immediately.
      performRemoval();
    }
  };


  // jQuery Plugin Definition for NotificationHandler.
  // Allows `jQ().notification(operation)` calls.
  jQ.fn.notification = function (operation) {
    return this.each(function () {
      var currentElement = jQ(this);
      var instanceData = currentElement.data('notificationInstance'); // Retrieve or store instance reference.
      var configOptions = typeof operation === 'object' ? operation : null; // Extract options if provided.

      // If no instance exists for this element, create a new one.
      if (!instanceData) {
        instanceData = new NotificationHandler(this);
        currentElement.data('notificationInstance', instanceData);
      }

      // If a string operation is provided, attempt to call the corresponding method.
      if (typeof operation === 'string') {
        if (instanceData[operation] && typeof instanceData[operation] === 'function') {
          instanceData[operation].call(currentElement);
        } else {
          console.warn('Notification method "' + operation + '" not found on instance.'); // Log a warning for unknown methods.
        }
      }
    });
  };

  // Expose the constructor publicly via the plugin for advanced usage.
  jQ.fn.notification.Constructor = NotificationHandler;


  // Data-API for automatic initialization and event binding based on DOM attributes.
  jQ(function () {
    jQ('body').on('click.notification.data-api', closeTriggerSelector, NotificationHandler.prototype.handleDismiss);
  });

})(window.jQuery);

/*
 * Manages interactive button states and toggling behavior.
 * This module provides functionality for visual feedback on button actions.
 */
(function (jqObj) {
  // Constant for the disabled attribute string, promoting consistency.
  var disabledAttribute = 'disabled';
  var activeClassIdentifier = 'active-btn'; // Custom class name for active state.

  // InteractionButton constructor function.
  // Initializes a new button instance with its DOM element and configuration.
  var InteractionButton = function (domElement, configSettings) {
    this.associatedElement = jqObj(domElement); // Store jQuery-wrapped DOM element.
    // Merge default settings with provided configuration options.
    this.configuration = jqObj.extend({}, jqObj.fn.actionButton.defaultOptions, configSettings);
  };

  // Method to update the button's visual state (e.g., 'loading', 'reset').
  InteractionButton.prototype.updateVisualState = function (visualMode) {
    var currentButton = this.associatedElement;
    var buttonStoredData = currentButton.data(); // Access data attributes stored on the element.
    // Determine whether to use `val()` for input elements or `html()` for others.
    var contentMethod = currentButton.is('input') ? 'val' : 'html';

    // Construct the full key for the state-specific text (e.g., 'loadingText').
    var stateKey = visualMode + 'Text';

    // Store the original text content of the button if it hasn't been saved yet.
    if (!buttonStoredData.originalTextContent) {
      currentButton.data('originalTextContent', currentButton[contentMethod]());
    }

    // Update button content with the appropriate state text from data or configuration.
    var newContent = buttonStoredData[stateKey] || this.configuration[stateKey];
    currentButton[contentMethod](newContent);

    // Use `setTimeout(..., 0)` to defer execution, allowing the browser to render
    // content changes and ensuring forms can submit before the button is disabled.
    setTimeout(function () {
      if (visualMode === 'loadingText') { // If the state is 'loading', disable the button.
        currentButton.addClass(disabledAttribute).attr(disabledAttribute, disabledAttribute);
      } else { // For other states, re-enable the button.
        currentButton.removeClass(disabledAttribute).removeAttr(disabledAttribute);
      }
    }, 0);
  };

  // Method to toggle the 'active' state of a button, especially within groups.
  InteractionButton.prototype.switchActiveState = function () {
    var buttonGroup = this.associatedElement.closest('[data-behavior="radio-group"]'); // Find a parent button group.

    // If the button is part of a radio-button group, deactivate other active buttons.
    if (buttonGroup.length > 0) {
      buttonGroup.find('.' + activeClassIdentifier).removeClass(activeClassIdentifier);
    }

    // Toggle the custom active class on the current button.
    this.associatedElement.toggleClass(activeClassIdentifier);
  };


  // jQuery Plugin Definition for InteractionButton.
  // Enables `jqObj().actionButton(command)` calls on selected elements.
  jqObj.fn.actionButton = function (operationCommand) {
    return this.each(function () {
      var currentContext = jqObj(this);
      var instanceReference = currentContext.data('interactionButton'); // Get or set the instance data.
      var componentOptions = typeof operationCommand === 'object' ? operationCommand : null; // Extract options.

      // Initialize a new instance if one does not already exist for this element.
      if (!instanceReference) {
        instanceReference = new InteractionButton(this, componentOptions);
        currentContext.data('interactionButton', instanceReference);
      }

      // Execute specific methods based on the provided command string.
      if (operationCommand === 'toggleState') {
        instanceReference.switchActiveState();
      } else if (typeof operationCommand === 'string') {
        // If it's another string command, assume it's a state update.
        instanceReference.updateVisualState(operationCommand);
      }
    });
  };

  // Default options for the `actionButton` plugin.
  jqObj.fn.actionButton.defaultOptions = {
    loadingText: 'Processing...' // Custom loading text.
  };

  // Expose the constructor publicly for direct instantiation if needed.
  jqObj.fn.actionButton.Constructor = InteractionButton;


  // Data-API for automatic initialization and event binding based on DOM attributes.
  jqObj(function () {
    jqObj('body').on('click.actionButton.data-api', '[data-behavior^="button-trigger"]', function (eventObject) {
      var clickedButton = jqObj(eventObject.target);

      // Traverse up the DOM to find the actual button element if a child was clicked.
      if (!clickedButton.hasClass('ui-button')) { // Check for a custom button class.
        clickedButton = clickedButton.closest('.ui-button');
      }

      // If a valid button element is found, trigger its toggle state.
      if (clickedButton.length > 0) {
        clickedButton.actionButton('toggleState');
      } else {
        console.warn('Clicked element is not a recognized UI button or part of one.'); // Warn if no button found.
      }
      eventObject.preventDefault(); // Prevent default link/button action.
    });
  });

})(window.jQuery);

/*
 * Manages an interactive content slider or image rotator.
 * Provides auto-play, navigation, and transition effects for sequential content.
 */
(function (jqCore) {
  var ITEM_CLASS = 'slider-item'; // Class for individual slides.
  var ACTIVE_CLASS = 'is-active'; // Class for the currently visible slide.
  var SLIDE_CLASS = 'has-slide-animation'; // Class indicating the slider uses CSS transitions.
  var NEXT_CLASS = 'move-next'; // Class applied for 'next' transition direction.
  var PREV_CLASS = 'move-prev'; // Class applied for 'prev' transition direction.

  // SliderWidget constructor function.
  // Initializes a new slider instance for a given root element and configuration.
  var SliderWidget = function (rootElement, configuration) {
    this.widgetContainer = jqCore(rootElement); // Store jQuery-wrapped container.
    this.configuration = configuration;
    this.isTransitioning = false; // Flag to prevent multiple simultaneous transitions.
    this.isPaused = false; // Flag to control auto-play.
    this.autoplayTimer = null; // Timer ID for auto-play interval.

    // Trigger an initial slide if specified in the configuration.
    if (this.configuration.initialSlide) {
      this.transitionSlide(this.configuration.initialSlide);
    }

    // Bind hover events for pausing/resuming auto-play if configured.
    if (this.configuration.autoPause === 'onHover') {
      this.widgetContainer
        .on('mouseenter', jqCore.proxy(this.stopAutoPlay, this))
        .on('mouseleave', jqCore.proxy(this.startAutoPlay, this));
    }
  };

  // Prototype methods for SliderWidget, defining its behavior.
  SliderWidget.prototype = {

    // Starts the automatic progression of slides based on the configured interval.
    startAutoPlay: function (triggerEvt) {
      // If not triggered by an event, ensure the slider is not explicitly paused.
      if (!triggerEvt) {
        this.isPaused = false;
      }

      // Only start if an interval duration is set and the slider is not paused.
      if (this.configuration.intervalDuration && !this.isPaused) {
        // Clear any existing timer to prevent multiple intervals running.
        if (this.autoplayTimer) {
          clearInterval(this.autoplayTimer);
        }
        this.autoplayTimer = setInterval(jqCore.proxy(this.showNextSlide, this), this.configuration.intervalDuration);
      }
      return this; // Allow method chaining.
    },

    // Navigates to a specific slide identified by its zero-based index.
    goToIndex: function (targetIndex) {
      var currentActiveSlide = this.widgetContainer.find('.' + ITEM_CLASS + '.' + ACTIVE_CLASS);
      var allSlides = currentActiveSlide.parent().children('.' + ITEM_CLASS); // Ensure only slider items are considered.
      var currentActiveIndex = allSlides.index(currentActiveSlide);
      var selfRef = this; // Store reference to 'this' for use in callbacks.

      // Validate the provided target index.
      if (targetIndex >= allSlides.length || targetIndex < 0) {
        console.warn('Invalid slide index provided:', targetIndex, '. Index must be within [0, ' + (allSlides.length - 1) + '].');
        return;
      }

      // If a transition is already in progress, queue this navigation to happen after.
      if (this.isTransitioning) {
        return this.widgetContainer.one('slideTransitionComplete.slider', function () {
          selfRef.goToIndex(targetIndex);
        });
      }

      // If the target is the current slide, just ensure auto-play is running.
      if (currentActiveIndex === targetIndex) {
        return this.stopAutoPlay().startAutoPlay();
      }

      // Determine the direction of transition and the specific slide element to activate.
      var directionToMove = targetIndex > currentActiveIndex ? 'next' : 'prev';
      var slideToActivate = jqCore(allSlides[targetIndex]);
      return this.transitionSlide(directionToMove, slideToActivate);
    },

    // Stops the automatic progression of slides.
    stopAutoPlay: function (triggerEvt) {
      // If not triggered by an event, explicitly set the paused flag.
      if (!triggerEvt) {
        this.isPaused = true;
      }

      // If there's an ongoing transition (indicated by next/prev classes)
      // and transition support is available, force the transition to complete.
      if (this.widgetContainer.find('.' + NEXT_CLASS + ', .' + PREV_CLASS).length && jqCore.support.animationEndEvent && jqCore.support.animationEndEvent.finish) {
        this.widgetContainer.trigger(jqCore.support.animationEndEvent.finish);
        // A brief cycle restart might be needed depending on the forced completion logic.
        // For simplicity, we'll just clear the interval.
      }

      clearInterval(this.autoplayTimer); // Clear the auto-play timer.
      this.autoplayTimer = null;
      return this;
    },

    // Advances to the next slide in sequence.
    showNextSlide: function () {
      if (this.isTransitioning) {
        return; // Prevent action if already animating.
      }
      return this.transitionSlide('next');
    },

    // Moves to the previous slide in sequence.
    showPreviousSlide: function () {
      if (this.isTransitioning) {
        return; // Prevent action if already animating.
      }
      return this.transitionSlide('prev');
    },

    // Core method to handle the visual transition between slides.
    transitionSlide: function (transitionDirection, nextSlideElement) {
      var currentActiveSlide = this.widgetContainer.find('.' + ITEM_CLASS + '.' + ACTIVE_CLASS);
      var wasCycling = this.autoplayTimer !== null; // Check if auto-play was active.
      var animationDirectionClass = transitionDirection === 'next' ? 'animate-left' : 'animate-right';
      var boundaryFallback = transitionDirection === 'next' ? 'first' : 'last'; // For wrapping around at ends.
      var selfRef = this;

      // Create a custom event object for 'beforeSlide' to allow interception.
      var beforeSlideEvent = jqCore.Event('beforeSlide.slider', {
        relatedTarget: nextSlideElement ? nextSlideElement[0] : undefined
      });

      this.isTransitioning = true; // Set flag to indicate animation is in progress.

      // Pause auto-play temporarily if it was active.
      if (wasCycling) {
        this.stopAutoPlay();
      }

      // If `nextSlideElement` was not explicitly provided, determine it based on direction.
      if (!nextSlideElement || nextSlideElement.length === 0) {
        var potentialNext = currentActiveSlide[transitionDirection]('.' + ITEM_CLASS); // Find next/prev item.
        // If no next/prev, wrap around to the first/last item.
        nextSlideElement = potentialNext.length ? potentialNext : this.widgetContainer.find('.' + ITEM_CLASS)[boundaryFallback]();
      }

      // If the determined next slide is already active, no transition is needed.
      if (nextSlideElement.hasClass(ACTIVE_CLASS)) {
        this.isTransitioning = false; // Reset flag.
        if (wasCycling) this.startAutoPlay(); // Resume auto-play if it was active.
        return;
      }

      // Check for browser transition support and if the slider has the necessary animation class.
      var hasTransitionSupport = jqCore.support.animationEndEvent && jqCore.support.animationEndEvent.finish;
      var hasSlideAnimation = this.widgetContainer.hasClass(SLIDE_CLASS);

      if (hasTransitionSupport && hasSlideAnimation) {
        this.widgetContainer.trigger(beforeSlideEvent); // Trigger custom event.
        if (beforeSlideEvent.isDefaultPrevented()) {
          this.isTransitioning = false; // Reset flag if event handler prevented action.
          if (wasCycling) this.startAutoPlay();
          return;
        }

        nextSlideElement.addClass(transitionDirection); // Add class like 'next' or 'prev'.
        var reflowTrigger = nextSlideElement[0].offsetWidth; // Force browser reflow for CSS transition.
        currentActiveSlide.addClass(animationDirectionClass);
        nextSlideElement.addClass(animationDirectionClass);

        // Bind to the transition end event for cleanup.
        this.widgetContainer.one(jqCore.support.animationEndEvent.finish, function () {
          nextSlideElement.removeClass([transitionDirection, animationDirectionClass].join(' ')).addClass(ACTIVE_CLASS);
          currentActiveSlide.removeClass([ACTIVE_CLASS, animationDirectionClass].join(' '));
          selfRef.isTransitioning = false; // Clear animation flag.
          // Trigger completion event asynchronously to ensure DOM is updated.
          setTimeout(function () {
            selfRef.widgetContainer.trigger('slideTransitionComplete.slider');
          }, 0);
        });
      } else {
        // Fallback for environments without transition support or animation classes.
        this.widgetContainer.trigger(beforeSlideEvent);
        if (beforeSlideEvent.isDefaultPrevented()) {
          this.isTransitioning = false;
          if (wasCycling) this.startAutoPlay();
          return;
        }
        currentActiveSlide.removeClass(ACTIVE_CLASS);
        nextSlideElement.addClass(ACTIVE_CLASS);
        this.isTransitioning = false;
        this.widgetContainer.trigger('slideTransitionComplete.slider');
      }

      // Resume auto-play if it was active before the transition.
      if (wasCycling) {
        this.startAutoPlay();
      }

      return this;
    }
  };


  // jQuery Plugin Definition for SliderWidget.
  // Allows `jqCore().contentSlider(operation)` calls on elements.
  jqCore.fn.contentSlider = function (operation) {
    return this.each(function () {
      var currentElement = jqCore(this);
      var instanceData = currentElement.data('sliderInstance'); // Retrieve or store instance data.
      var optionsFromCall = jqCore.extend({}, jqCore.fn.contentSlider.defaultSettings, typeof operation === 'object' && operation);
      var commandToExecute = typeof operation === 'string' ? operation : optionsFromCall.initialSlide; // Determine command.

      // Initialize a new instance if one doesn't already exist.
      if (!instanceData) {
        instanceData = new SliderWidget(this, optionsFromCall);
        currentElement.data('sliderInstance', instanceData);
      }

      // Execute commands based on the `operation` type.
      if (typeof operation === 'number') {
        instanceData.goToIndex(operation); // Navigate to a specific index.
      } else if (commandToExecute && typeof instanceData[commandToExecute] === 'function') {
        instanceData[commandToExecute](); // Execute a named method.
      } else if (optionsFromCall.intervalDuration) {
        instanceData.startAutoPlay(); // Start auto-play if interval is configured.
      }
    });
  };

  // Default settings for the `contentSlider` plugin.
  jqCore.fn.contentSlider.defaultSettings = {
    intervalDuration: 6000, // Custom interval duration in milliseconds.
    autoPause: 'onHover', // Custom setting for auto-pause behavior.
    initialSlide: null // No initial slide specified by default.
  };

  // Expose the constructor publicly.
  jqCore.fn.contentSlider.Constructor = SliderWidget;


  // Data-API for automatic initialization and event binding based on DOM attributes.
  jqCore(function () {
    jqCore('body').on('click.contentSlider.data-api', '[data-trigger="slider-nav"]', function (eventObject) {
      var triggerElement = jqCore(this);
      var linkReference;
      // Get target selector from data attribute or href, stripping hash for IE7.
      var targetElementId = triggerElement.attr('data-target-slider') || (linkReference = triggerElement.attr('href')) && linkReference.replace(/.*(?=#[^\s]+$)/, '');
      var targetSlider = jqCore(targetElementId);
      // Determine slider options, ensuring not to override existing instance data.
      var sliderOptions = targetSlider.data('sliderInstance') ? null : jqCore.extend({}, targetSlider.data(), triggerElement.data());

      // If a target slider element is found, initialize or operate on it.
      if (targetSlider.length > 0) {
        targetSlider.contentSlider(sliderOptions);
      } else {
        console.warn('Could not find target slider element for selector:', targetElementId);
      }
      eventObject.preventDefault(); // Prevent default link behavior.
    });
  });

})(window.jQuery);

/*
 * Manages expandable/collapsible sections, often used in accordions.
 * Provides functionality to show, hide, and toggle content areas with transitions.
 */
(function (jQHandler) {
  // Common class names used in the module, abstracted for easier modification.
  var WIDTH_CLASS = 'section-width'; // Class name indicating width-controlled collapse.
  var COLLAPSE_BASE_CLASS = 'collapsed-panel'; // Base class for collapsible elements.
  var HIDDEN_CLASS = 'is-hidden'; // Class indicating a hidden state.
  var VISIBLE_CLASS = 'is-expanded'; // Class indicating an expanded state.
  var ACCORDION_GROUP_SELECTOR = '> .panel-group > .' + VISIBLE_CLASS; // Selector for active accordion siblings.

  // ExpandableSection constructor function.
  // Initializes a new instance for a given section element and configuration.
  var ExpandableSection = function (sectionElement, configParams) {
    this.managedSection = jQHandler(sectionElement); // Store jQuery-wrapped section element.
    // Merge default settings with provided configuration parameters.
    this.configuration = jQHandler.extend({}, jQHandler.fn.expandable.defaultSettings, configParams);
    this.isAnimating = false; // Flag to indicate if an animation is currently running.

    // If a parent selector is provided, store a reference to the accordion group.
    if (this.configuration.parentElement) {
      this.accordionGroup = jQHandler(this.configuration.parentElement);
    }

    // Immediately toggle visibility if `autoToggle` is set to true in config.
    if (this.configuration.autoToggle) {
      this.toggleVisibility();
    }
  };

  // Prototype methods for ExpandableSection, defining its behavior.
  ExpandableSection.prototype = {
    // Explicitly define the constructor property.
    constructor: ExpandableSection,

    // Determines the CSS dimension property ('width' or 'height') to animate.
    getDimensionProperty: function () {
      var isWidthControlled = this.managedSection.hasClass(WIDTH_CLASS);
      return isWidthControlled ? 'width' : 'height';
    },

    // Expands the section to reveal its content.
    expandSection: function () {
      if (this.isAnimating) {
        console.log('ExpandableSection: Expansion already in progress, request ignored.');
        return;
      }

      var currentDimension = this.getDimensionProperty();
      // Construct the scroll property name (e.g., 'scrollHeight', 'scrollWidth').
      var scrollDimensionProperty = jQHandler.camelCase(['scroll', currentDimension].join('-'));
      var activeSiblings;
      var siblingHasInstance;

      // If this section is part of an accordion group, collapse other currently open sections.
      if (this.accordionGroup) {
        activeSiblings = this.accordionGroup.find(ACCORDION_GROUP_SELECTOR);
        if (activeSiblings.length > 0) {
          siblingHasInstance = activeSiblings.data('expandableInstance'); // Check for existing instance.
          if (siblingHasInstance && siblingHasInstance.isAnimating) {
            console.log('ExpandableSection: Active sibling is animating, waiting before collapsing others.');
            return; // Wait if another sibling is already animating.
          }
          activeSiblings.expandable('hide'); // Call the 'hide' method on active siblings.
          if (!siblingHasInstance) {
            activeSiblings.removeData('expandableInstance'); // Clean up data if no instance was found.
          }
        }
      }

      // Set initial dimension to 0 to prepare for CSS transition.
      this.managedSection[currentDimension](0);
      var initialEvent = jQHandler.Event('beforeExpand.expandable'); // Custom event before expansion.
      this.performAnimation('addClass', initialEvent, 'afterExpand.expandable'); // Perform animation.

      // Apply the full scroll dimension for the transition if supported.
      var hasTransitionSupport = jQHandler.support.animationEndEvent && jQHandler.support.animationEndEvent.finish;
      if (hasTransitionSupport) {
        this.managedSection[currentDimension](this.managedSection[0][scrollDimensionProperty]);
      } else {
        // Fallback: if no transition support, immediately set dimension to 'auto'.
        this.managedSection[currentDimension]('auto');
      }
    },

    // Collapses the section to hide its content.
    collapseSection: function () {
      if (this.isAnimating) {
        console.log('ExpandableSection: Collapse already in progress, request ignored.');
        return;
      }

      var currentDimension = this.getDimensionProperty();
      var currentSize = this.managedSection[currentDimension](); // Get current computed size.
      this.restoreInitialState(currentSize); // Reset classes and potentially size.
      var initialEvent = jQHandler.Event('beforeCollapse.expandable'); // Custom event before collapse.
      this.performAnimation('removeClass', initialEvent, 'afterCollapse.expandable'); // Perform animation.

      // Set dimension to 0 to trigger the collapse transition.
      this.managedSection[currentDimension](0);
    },

    // Resets the section's CSS classes and potentially its dimension after an animation.
    restoreInitialState: function (targetSize) {
      var currentDimension = this.getDimensionProperty();
      this.managedSection
        .removeClass(COLLAPSE_BASE_CLASS)
        .addClass(HIDDEN_CLASS)
        [currentDimension](targetSize || 'auto'); // Set to a specific size or 'auto'.
    },

    // Helper method to manage CSS class changes and transition events.
    performAnimation: function (classAction, eventBefore, eventAfter) {
      var selfInst = this; // Reference to 'this' for use in callbacks.
      var animationCompleteCallback = function () {
        // If it was an expansion, reset state after animation completes.
        if (eventBefore.type === 'beforeExpand') {
          selfInst.restoreInitialState();
        }
        selfInst.isAnimating = false; // Clear animation flag.
        selfInst.managedSection.trigger(eventAfter); // Trigger the final completion event.
      };

      this.managedSection.trigger(eventBefore); // Trigger the initial event (e.g., 'beforeExpand').

      // If any event handler prevented the default action, stop the animation.
      if (eventBefore.isDefaultPrevented()) {
        console.log('ExpandableSection: Animation prevented by an event handler.');
        return;
      }

      this.isAnimating = true; // Set flag to indicate animation is active.

      // Apply/remove base collapse classes and the 'is-expanded' class.
      this.managedSection[classAction](COLLAPSE_BASE_CLASS)[classAction](VISIBLE_CLASS);

      // Check for transition support and if the element has the base collapse class.
      var hasTransitionSupport = jQHandler.support.animationEndEvent && jQHandler.support.animationEndEvent.finish;
      var hasCollapseClass = this.managedSection.hasClass(COLLAPSE_BASE_CLASS);

      if (hasTransitionSupport && hasCollapseClass) {
        // If transitions are supported, wait for the transition end event.
        this.managedSection.one(jQHandler.support.animationEndEvent.finish, animationCompleteCallback);
      } else {
        // Otherwise, execute the completion callback immediately.
        animationCompleteCallback();
      }
    },

    // Toggles the visibility of the section between expanded and collapsed states.
    toggleVisibility: function () {
      var isCurrentlyVisible = this.managedSection.hasClass(VISIBLE_CLASS);
      if (isCurrentlyVisible) {
        this.collapseSection();
      } else {
        this.expandSection();
      }
    }
  };


  // jQuery Plugin Definition for ExpandableSection.
  // Allows `jQHandler().expandable(actionCommand)` calls on elements.
  jQHandler.fn.expandable = function (actionCommand) {
    return this.each(function () {
      var currentElement = jQHandler(this);
      var instanceReference = currentElement.data('expandableInstance'); // Retrieve or store instance.
      var pluginOptions = typeof actionCommand === 'object' ? actionCommand : null; // Extract options.

      // Initialize a new instance if one does not already exist for this element.
      if (!instanceReference) {
        instanceReference = new ExpandableSection(this, pluginOptions);
        currentElement.data('expandableInstance', instanceReference);
      }

      // If a string command is provided, attempt to execute the corresponding method.
      if (typeof actionCommand === 'string') {
        if (instanceReference[actionCommand] && typeof instanceReference[actionCommand] === 'function') {
          instanceReference[actionCommand]();
        } else {
          console.warn('ExpandableSection: Method "' + actionCommand + '" not found on instance.'); // Warn for unknown methods.
        }
      }
    });
  };

  // Default settings for the `expandable` plugin.
  jQHandler.fn.expandable.defaultSettings = {
    autoToggle: true, // Default to auto-toggle behavior.
    parentElement: null // No parent element specified by default.
  };

  // Expose the constructor publicly.
  jQHandler.fn.expandable.Constructor = ExpandableSection;


  // Data-API for automatic initialization and event binding based on DOM attributes.
  jQHandler(function () {
    jQHandler('body').on('click.expandable.data-api', '[data-toggle="collapsible"]', function (clickEvent) {
      var triggerElement = jQHandler(this);
      var linkReference;
      // Get target selector from 'data-target-panel' or 'href', stripping hash for IE7 compatibility.
      var targetSelector = triggerElement.attr('data-target-panel') || (linkReference = triggerElement.attr('href')) && linkReference.replace(/.*(?=#[^\s]+$)/, '');

      // If the target is not explicitly set via 'data-target-panel', prevent default link action.
      if (!triggerElement.attr('data-target-panel')) {
        clickEvent.preventDefault();
      }

      var targetPanel = jQHandler(targetSelector);
      // Determine the action: 'toggleVisibility' if an instance exists, otherwise use data attributes for options.
      var actionParameter = targetPanel.data('expandableInstance') ? 'toggleVisibility' : triggerElement.data();
      targetPanel.expandable(actionParameter); // Call the plugin method on the target panel.
    });
  });

})(window.jQuery);