/*
 * ng-presenter-widgets
 * http://ng-presenter.github.io/widgets/

 * Version: 0.11.0-release - 2014-05-13
 * License: MIT
 */
angular.module("ng.presenter", ["ng.presenter.animator","ng.presenter.toggleable","ng.presenter.panel","ng.presenter.notification","ng.presenter.contentBinder","ng.presenter.buttonSet","ng.presenter.slideshow","ui.bootstrap.dateparser","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdown","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);

// This module provides a service to manage CSS3 transitions and animations.
// It detects the appropriate browser-specific event names for transition/animation end.
angular.module('ng.presenter.animator', [])

/**
 * The $animator service provides a standardized mechanism to initiate CSS3 transitions/animations
 * and to be notified upon their conclusion.
 * @param {angular.element} targetNode - The DOM element that will undergo the animation.
 * @param {string|Object|Function} actionSpec - Defines how the animation is triggered:
 *   - As a string: A CSS class to be added to the element.
 *   - As an object: A hash of CSS style properties to be applied to the element.
 *   - As a function: A callback that, when invoked, will apply the necessary changes to start the animation.
 * @param {Object} [options] - Configuration options for the animation.
 * @param {boolean} [options.animation] - True if this is an animation (uses animationEndEventName), false for transition.
 * @returns {Promise} A promise that resolves when the animation finishes, or rejects if cancelled.
 */
.factory('$animator', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  // Internal utility to determine the correct browser-prefixed event name for animation/transition end.
  function retrieveEndEventName(eventMap) {
    const testDiv = document.createElement('div');
    for (const prefix in eventMap) {
      if (testDiv.style[prefix] !== undefined) {
        return eventMap[prefix];
      }
    }
    return null; // No supported event name found
  }

  // Pre-calculate the browser-specific event names once.
  const transitionEventMap = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  const animationEventMap = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };

  const transitionCompletionEvent = retrieveEndEventName(transitionEventMap);
  const animationCompletionEvent = retrieveEndEventName(animationEventMap);

  // The main $animator function.
  const execAnimator = function(targetNode, actionSpec, config = {}) {
    if (!targetNode || !targetNode[0]) {
      console.warn("Animator: Invalid target node provided.");
      return $q.reject('Invalid target node');
    }

    const opPromise = $q.defer();
    const useAnimationEvents = !!config.animation;
    const completionEvent = useAnimationEvents ? animationCompletionEvent : transitionCompletionEvent;

    // Handler for when the transition/animation officially completes.
    const animationCompletionHandler = function(event) {
      // Ensure the handler is removed to prevent memory leaks and multiple calls.
      targetNode.off(completionEvent, animationCompletionHandler);
      // Trigger a digest cycle because the event might occur outside Angular's watch scope.
      $rootScope.$apply(() => opPromise.resolve(targetNode));
    };

    // Bind the completion event if a valid event name was found.
    if (completionEvent) {
      targetNode.on(completionEvent, animationCompletionHandler);
    }

    // Defer applying the trigger to allow the browser to render initial state.
    // This is crucial for CSS transitions to correctly detect changes.
    $timeout(() => {
      // Apply the specified trigger to start the animation.
      if (typeof actionSpec === 'string') {
        targetNode.addClass(actionSpec);
      } else if (typeof actionSpec === 'function') {
        actionSpec(targetNode);
      } else if (typeof actionSpec === 'object') {
        targetNode.css(actionSpec);
      }

      // If the browser doesn't support transitions/animations, resolve immediately.
      if (!completionEvent) {
        opPromise.resolve(targetNode);
      }
    });

    // Augment the promise with a cancellation method.
    // This allows us to proactively stop a pending animation if a new one is initiated on the same element.
    opPromise.promise.cancel = function() {
      if (completionEvent) {
        targetNode.off(completionEvent, animationCompletionHandler);
      }
      opPromise.reject('Animation process aborted');
    };

    return opPromise.promise;
  };

  // Attach the detected event names to the service for external reference.
  execAnimator.transitionEndEventName = transitionCompletionEvent;
  execAnimator.animationEndEventName = animationCompletionEvent;

  return execAnimator;
}]);

// Manages the collapsible behavior of elements.
angular.module('ng.presenter.toggleable', ['ng.presenter.animator'])

  .directive('toggleable', ['$animator', function ($animator) {

    return {
      link: function (scope, targetElement, attributes) {
        // Flag to skip initial animation on page load.
        let skipFirstRenderEffect = true;
        // Stores the promise of the currently running animation.
        let ongoingAnimation;

        // Executes a CSS transition/animation on the target element.
        function initiateEffect(changeDefinition) {
          // If there's an animation already running, cancel it first.
          if (ongoingAnimation) {
            ongoingAnimation.cancel();
          }
          // Start a new animation.
          const newAnimation = $animator(targetElement, changeDefinition);
          ongoingAnimation = newAnimation; // Store the new animation's promise.

          // Define a callback for when the animation completes or is cancelled.
          const animationCompleteCallback = () => {
            // Only clear the ongoingAnimation if it's the one that just completed/cancelled.
            if (ongoingAnimation === newAnimation) {
              ongoingAnimation = undefined;
            }
          };
          newAnimation.then(animationCompleteCallback, animationCompleteCallback);
          return newAnimation;
        }

        // Reveals the hidden content.
        function revealContent() {
          if (skipFirstRenderEffect) {
            // For the first render, just show it without animation.
            skipFirstRenderEffect = false;
            applyRevealState();
          } else {
            // Prepare for animation: set initial state and trigger reflow.
            targetElement.removeClass('collapsed-state').addClass('collapsing-state');
            // Animate to full height.
            initiateEffect({ height: `${targetElement[0].scrollHeight}px` }).then(applyRevealState);
          }
        }

        // Final state after revealing content.
        function applyRevealState() {
          targetElement.removeClass('collapsing-state');
          targetElement.addClass('collapsed-state shown-state');
          targetElement.css({height: 'auto'}); // Allow content to dictate height.
        }

        // Hides the visible content.
        function hideContent() {
          if (skipFirstRenderEffect) {
            // For the first render, just hide it without animation.
            skipFirstRenderEffect = false;
            applyHideState();
            targetElement.css({height: '0'}); // Explicitly set height to 0 for initial hide.
          } else {
            // Set explicit height before collapsing to enable CSS transition.
            targetElement.css({ height: `${targetElement[0].scrollHeight}px` });
            // Force browser reflow to ensure CSS height update takes effect before transition.
            // A simple access to an element property like offsetWidth can trigger this.
            void targetElement[0].offsetWidth; // Using `void` to suppress potential lint warnings about unused expression.

            targetElement.removeClass('collapsed-state shown-state').addClass('collapsing-state');
            // Animate to zero height.
            initiateEffect({ height: 0 }).then(applyHideState);
          }
        }

        // Final state after hiding content.
        function applyHideState() {
          targetElement.removeClass('collapsing-state');
          targetElement.addClass('collapsed-state');
        }

        // Watch the 'toggleable' attribute for changes (true/false) to trigger expand/collapse.
        scope.$watch(attributes.toggleable, function (shouldConceal) {
          if (shouldConceal) {
            hideContent();
          } else {
            revealContent();
          }
        });
      }
    };
  }]);

// Manages accordion-style collapsible panels.
angular.module('ng.presenter.panel', ['ng.presenter.toggleable'])

// Configuration for accordion behavior.
.constant('panelSettings', {
  closeSiblings: true // Whether to close other panels when one opens.
})

// Controller for the main accordion container.
.controller('PanelConductor', ['$scope', '$attrs', 'panelSettings', function ($scope, $attrs, panelSettings) {

  // Array to hold references to all managed panel scopes.
  const managedPanels = [];

  // Closes all other panels in the group, if 'closeSiblings' is enabled.
  this.closeSibels = function(currentlyOpenPanel) {
    const isCloseSiblingsEnabled = angular.isDefined($attrs.closeSiblings) ? $scope.$eval($attrs.closeSiblings) : panelSettings.closeSiblings;

    if (isCloseSiblingsEnabled) {
      for (let i = 0; i < managedPanels.length; i++) {
        const panel = managedPanels[i];
        if (panel !== currentlyOpenPanel && panel.isPanelOpen) {
          panel.isPanelOpen = false;
        }
      }
    }
  };

  // Registers a new panel's scope with the conductor.
  this.addPanel = function(childPanelScope) {
    if (!childPanelScope) {
      console.error("Attempted to add an undefined panel scope.");
      return;
    }
    const selfRef = this;
    managedPanels.push(childPanelScope);

    // Clean up panel reference when its scope is destroyed.
    childPanelScope.$on('$destroy', () => selfRef.deregisterPanel(childPanelScope));
  };

  // Removes a panel's scope from the conductor.
  this.deregisterPanel = function(panelToRemove) {
    const panelIndex = managedPanels.indexOf(panelToRemove);
    if (panelIndex > -1) {
      managedPanels.splice(panelIndex, 1);
    }
  };

}])

// Directive for the main accordion container.
.directive('panelGroup', function () {
  return {
    restrict:'EA', // Element or Attribute usage.
    controller:'PanelConductor', // Associates with PanelConductor.
    transclude: true, // Transclude content into the template.
    replace: false, // Do not replace the element itself.
    templateUrl: 'template/accordion/accordion.html' // Path to the template.
  };
})

// Directive for an individual expandable/collapsible panel.
.directive('expandablePanel', function() {
  return {
    require:'^panelGroup', // Requires being a child of a panelGroup.
    restrict:'EA', // Element or Attribute usage.
    transclude:true, // Transclude content into the template.
    replace: true, // Replace the directive element with its template.
    templateUrl:'template/accordion/accordion-group.html', // Path to the template.
    scope: {
      panelTitle: '@', // Interpolated string for the panel's heading.
      isPanelOpen: '=?', // Two-way binding for panel open/close state. Optional.
      isPanelDisabled: '=?' // Two-way binding for panel disabled state. Optional.
    },
    controller: function() {
      // Allows the nested panelHeader directive to set the heading content.
      this.setHeaderContent = function(headerElement) {
        this.headerElement = headerElement;
      };
    },
    link: function(scope, element, attrs, panelConductorCtrl) {
      // Register this panel with its parent conductor.
      panelConductorCtrl.addPanel(scope);

      // Watch for changes in the panel's open state.
      scope.$watch('isPanelOpen', function(newValue) {
        if (newValue) {
          panelConductorCtrl.closeSibels(scope); // Close others if this one opens.
        }
      });

      // Function to toggle the panel's open state.
      scope.togglePanel = function() {
        // Only toggle if the panel is not disabled.
        if (!scope.isPanelDisabled) {
          scope.isPanelOpen = !scope.isPanelOpen;
        }
      };
    }
  };
})

// Directive for the heading of an expandable panel, allowing HTML content.
.directive('panelHeader', function() {
  return {
    restrict: 'EA', // Element or Attribute usage.
    transclude: true, // Grab the contents to be used as the heading.
    template: '', // This directive effectively removes itself from the DOM,
                  // passing its transcluded content to the parent controller.
    replace: true, // Replaces the directive element.
    require: '^expandablePanel', // Must be inside an expandablePanel.
    link: function(scope, element, attr, expandablePanelCtrl, transcludeFn) {
      // Pass the transcluded heading content to the expandablePanel controller.
      // The second parameter to transcludeFn ensures elements are cloned,
      // which is useful for scenarios like ng-repeat.
      expandablePanelCtrl.setHeaderContent(transcludeFn(scope, () => {}));
    }
  };
})

// Directive used within the expandablePanel template to indicate where the header content should be placed.
.directive('panelContentSlot', function() {
  return {
    require: '^expandablePanel', // Must be inside an expandablePanel.
    link: function(scope, element, attr, controller) {
      // Watch for the header content property on the expandablePanel controller.
      scope.$watch(() => controller[attr.panelContentSlot], function(headerContentNode) {
        if (headerContentNode) {
          element.empty(); // Clear existing content.
          element.append(headerContentNode); // Append the new header content.
        }
      });
    }
  };
});

// Provides a simple alert/notification component.
angular.module('ng.presenter.notification', [])

.controller('NotificationHandler', ['$scope', '$attrs', function ($scope, $attrs) {
  // Determine if the alert should have a close button based on the 'canClose' attribute.
  $scope.canClose = 'canClose' in $attrs;

  // Optional: Add a method to programmatically close the alert.
  $scope.dismissNotification = function() {
    if ($scope.canClose && typeof $scope.close === 'function') {
      $scope.close(); // Call the parent scope's close function if available.
    }
  };
}])

.directive('systemAlert', function () {
  return {
    restrict:'EA', // Can be used as an element or attribute.
    controller:'NotificationHandler', // Link to the notification controller.
    templateUrl:'template/alert/alert.html', // Template for the alert.
    transclude:true, // Transclude content inside the alert body.
    replace:true, // Replace the directive element with the template.
    scope: {
      alertType: '@type', // Interpolated string for alert styling (e.g., 'success', 'danger').
      close: '&' // Callback expression for when the alert is closed.
    }
  };
});

// Provides a directive to safely bind raw HTML content.
angular.module('ng.presenter.contentBinder', [])

  .directive('renderRawHtml', function () {
    return function (scope, targetElement, attributes) {
      // Add a class for styling/identification and store the binding attribute name.
      targetElement.addClass('ng-bound-content').data('$binding', attributes.renderRawHtml);

      // Watch the attribute's value and update the element's inner HTML.
      scope.$watch(attributes.renderRawHtml, function updateHtmlContent(htmlValue) {
        // Ensure the value is treated as a string; default to empty if null/undefined.
        targetElement.html(htmlValue || '');
      });
    };
  });

// Module for managing button groups, specifically radio and checkbox button behaviors.
angular.module('ng.presenter.buttonSet', [])

// Configuration constants for button behaviors.
.constant('toggleButtonConfig', {
  activeStateClass: 'active-state', // CSS class for an active button.
  interactionEvent: 'click' // DOM event that triggers the toggle.
})

// Controller for managing button group state.
.controller('ToggleButtonsManager', ['toggleButtonConfig', function(toggleButtonConfig) {
  this.activeCssClass = toggleButtonConfig.activeStateClass || 'active-state';
  this.triggeringEvent = toggleButtonConfig.interactionEvent || 'click';
}])

// Directive for a radio-style toggle button.
.directive('radioToggle', function () {
  return {
    // Requires both this directive's controller and ngModel for data binding.
    require: ['radioToggle', 'ngModel'],
    controller: 'ToggleButtonsManager',
    link: function (scope, targetElement, attributes, controllers) {
      const btnMgr = controllers[0];
      const modelCtrl = controllers[1];

      // Update UI when model changes.
      modelCtrl.$render = function () {
        const isCurrentlyActive = angular.equals(modelCtrl.$modelValue, scope.$eval(attributes.radioToggle));
        targetElement.toggleClass(btnMgr.activeCssClass, isCurrentlyActive);
      };

      // Update model when UI is interacted with.
      targetElement.on(btnMgr.triggeringEvent, function () {
        const isActive = targetElement.hasClass(btnMgr.activeCssClass);
        const uncheckableOption = attributes.uncheckable; // Check for `uncheckable` attribute presence.

        if (!isActive || angular.isDefined(uncheckableOption)) {
          scope.$apply(function () {
            // If active and uncheckable, set to null (unselect). Otherwise, set to the button's value.
            const newValue = isActive && angular.isDefined(uncheckableOption) ? null : scope.$eval(attributes.radioToggle);
            modelCtrl.$setViewValue(newValue);
            modelCtrl.$render(); // Re-render to reflect state changes.
          });
        }
      });
    }
  };
})

// Directive for a checkbox-style toggle button.
.directive('checkboxToggle', function () {
  return {
    // Requires both this directive's controller and ngModel for data binding.
    require: ['checkboxToggle', 'ngModel'],
    controller: 'ToggleButtonsManager',
    link: function (scope, targetElement, attributes, controllers) {
      const btnMgr = controllers[0];
      const modelCtrl = controllers[1];

      // Helper to get the value representing a 'true' state.
      function getTrueStateValue() {
        const attrVal = scope.$eval(attributes.checkboxToggleTrue);
        return angular.isDefined(attrVal) ? attrVal : true;
      }

      // Helper to get the value representing a 'false' state.
      function getFalseStateValue() {
        const attrVal = scope.$eval(attributes.checkboxToggleFalse);
        return angular.isDefined(attrVal) ? attrVal : false;
      }

      // Update UI when model changes.
      modelCtrl.$render = function () {
        const isChecked = angular.equals(modelCtrl.$modelValue, getTrueStateValue());
        targetElement.toggleClass(btnMgr.activeCssClass, isChecked);
      };

      // Update model when UI is interacted with.
      targetElement.on(btnMgr.triggeringEvent, function () {
        scope.$apply(function () {
          // If button currently has active class, set model to false value; otherwise, true value.
          const newModelValue = targetElement.hasClass(btnMgr.activeCssClass) ? getFalseStateValue() : getTrueStateValue();
          modelCtrl.$setViewValue(newModelValue);
          modelCtrl.$render(); // Re-render to reflect state changes.
        });
      });
    }
  };
});

/**
* @ngdoc overview
* @name ng.presenter.slideshow
*
* @description
* An AngularJS component for an image carousel or content slideshow.
*
*/
angular.module('ng.presenter.slideshow', ['ng.presenter.animator'])
.controller('SlideshowCoordinator', ['$scope', '$timeout', '$animator', function ($scope, $timeout, $animator) {
  const coordinator = this;
  const itemViews = coordinator.itemViews = $scope.itemViews = [];
  let activeItemIndex = -1;
  let autoAdvanceTimer;
  let isPlayingSlides = false; // Flag to track if the slideshow is in auto-play mode.

  coordinator.activeSlideItem = null;

  let componentDestroyed = false; // Flag to prevent operations on a destroyed scope.

  /* direction: "forward" or "backward" */
  coordinator.selectSlideItem = $scope.selectSlideItem = function(nextSlideItem, traversalDirection) {
    const nextItemIndex = itemViews.indexOf(nextSlideItem);

    // Determine direction if not explicitly provided.
    if (traversalDirection === undefined) {
      traversalDirection = (nextItemIndex > activeItemIndex) ? 'forward' : 'backward';
    }

    // Only proceed if a valid next slide is provided and it's not the current active one.
    if (nextSlideItem && nextSlideItem !== coordinator.activeSlideItem) {
      // If a transition is already in progress, cancel it and re-evaluate.
      if ($scope.$currentSlideTransition) {
        $scope.$currentSlideTransition.cancel();
        // Use a timeout to allow Angular's digest cycle to update classes from the cancelled transition.
        $timeout(proceedToNextSlide);
      } else {
        proceedToNextSlide();
      }
    }

    function proceedToNextSlide() {
      // Abort if the component has been destroyed.
      if (componentDestroyed) {
        console.warn("SlideshowCoordinator: Attempted to proceed after component destruction.");
        return;
      }

      // Check if a transition is possible and desired.
      const canTransition = coordinator.activeSlideItem &&
                            typeof traversalDirection === 'string' &&
                            !$scope.disableSlideTransitions &&
                            nextSlideItem.$element;

      if (canTransition) {
        // Apply directional classes for CSS animation.
        nextSlideItem.$element.addClass(traversalDirection);
        // Force browser reflow to ensure CSS changes are applied before animation starts.
        nextSlideItem.$element[0].offsetWidth; // Accessing offsetWidth triggers reflow.

        // Reset all slides' transition-related properties.
        itemViews.forEach(function(slide) {
          angular.extend(slide, {direction: '', entering: false, leaving: false, isActive: false});
        });

        // Set properties for the next (entering) and current (leaving) slides.
        angular.extend(nextSlideItem, {direction: traversalDirection, isActive: true, entering: true});
        angular.extend(coordinator.activeSlideItem || {}, {direction: traversalDirection, leaving: true});

        // Start the transition.
        $scope.$currentSlideTransition = $animator(nextSlideItem.$element, {});

        // Use a closure to capture `nextSlideItem` and `coordinator.activeSlideItem`
        // as they might change before the promise resolves.
        (function(targetSlide, currentSlide) {
          $scope.$currentSlideTransition.then(
            () => transitionFinished(targetSlide, currentSlide),
            () => transitionFinished(targetSlide, currentSlide) // Also call on rejection (cancellation)
          );
        }(nextSlideItem, coordinator.activeSlideItem));

      } else {
        // If no transition, immediately update states.
        transitionFinished(nextSlideItem, coordinator.activeSlideItem);
      }

      // Update active slide references.
      coordinator.activeSlideItem = nextSlideItem;
      activeItemIndex = nextItemIndex;

      // Reset the auto-advance timer on every slide change.
      resetAutoAdvanceTimer();
    }

    // Callback when a slide transition completes or is cancelled.
    function transitionFinished(targetSlide, currentSlide) {
      angular.extend(targetSlide, {direction: '', isActive: true, leaving: false, entering: false});
      angular.extend(currentSlide || {}, {direction: '', isActive: false, leaving: false, entering: false});
      $scope.$currentSlideTransition = null; // Clear the transition promise.
    }
  };

  // Listen for scope destruction to clean up resources.
  $scope.$on('$destroy', function () {
    componentDestroyed = true;
    if (autoAdvanceTimer) {
      $timeout.cancel(autoAdvanceTimer);
    }
  });

  // Allows external components to get the index of a slide.
  coordinator.getSlideIndex = function(slideInstance) {
    return itemViews.indexOf(slideInstance);
  };

  // Moves to the next slide in sequence.
  $scope.advanceToNext = function() {
    const nextIdx = (activeItemIndex + 1) % itemViews.length;

    // Prevent user-triggered transition if one is already in progress.
    if (!$scope.$currentSlideTransition) {
      return coordinator.selectSlideItem(itemViews[nextIdx], 'forward');
    }
  };

  // Moves to the previous slide in sequence.
  $scope.retreatToPrevious = function() {
    let prevIdx = activeItemIndex - 1;
    if (prevIdx < 0) {
      prevIdx = itemViews.length - 1; // Wrap around to the last slide.
    }

    // Prevent user-triggered transition if one is already in progress.
    if (!$scope.$currentSlideTransition) {
      return coordinator.selectSlideItem(itemViews[prevIdx], 'backward');
    }
  };

  // Helper to reset the auto-advance timer.
  function resetAutoAdvanceTimer() {
    if (autoAdvanceTimer) {
      $timeout.cancel(autoAdvanceTimer);
    }
    if (isPlayingSlides && $scope.interval > 0) {
      autoAdvanceTimer = $timeout(() => $scope.advanceToNext(), $scope.interval);
    }
  }

  // Watch for changes in the 'noPause' attribute to control auto-play.
  $scope.$watch('noPause', function(newValue) {
    isPlayingSlides = !newValue;
    resetAutoAdvanceTimer();
  });
}]);