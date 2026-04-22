angular.module('SuggestiveInputModule', [])
.directive('suggestiveInput', ["$delayService", "$browserWindow", "$pageDocument", "$promiseService", function ($delayService, $browserWindow, $pageDocument, $promiseService) {
  'use strict';

  // Core configuration settings for the directive.
  const DEFAULT_SETTINGS = {
    positionDelay: 150, // Delay for repositioning the suggestion box.
    attachmentDelay: 300, // Delay for attaching behavior to an input.
    suggestionFetchDelay: 200, // Delay for initiating suggestion queries.
    blurDetachmentDelay: 150, // Delay for detaching behavior after input blur.
    autoSelectFirstItem: false // Whether to automatically highlight the first suggestion.
  };

  return {
    restrict: "A", // Attribute directive.
    scope: { inputConfiguration: '&suggestiveInput' }, // Isolate scope with an expression for options.
    transclude: true, // Allow content inside the directive to be transcluded.
    template:
      '<span ng-transclude></span>' + // Placeholder for the transcluded input element.
      '<div class="suggest-box-wrapper" ng-show="displaySuggestions && suggestionList.length > 1" style="position:absolute; z-index: 1000; display: block;">' + // The suggestion container.
        '<ul class="suggest-list" role="listbox" ng-class="{\'is-loading\': isFetchingSuggestions}">' + // List of suggestions.
          // ng-repeat starts from the second item because the first is often the original search term.
          '<li ng-repeat="item in suggestionList track by $index" ng-if="$index > 0" ' +
            'class="suggest-item" role="option" id="{{ \'suggest-item-\' + $index }}" ' +
            'ng-class="$index === currentSelectionIndex ? \'suggest-item-active\': \'\'">' +
            '<a href ng-click="confirmSelection($index)" ng-bind-html="item.label || item.value"></a>' +
          '</li>' +
        '</ul>' +
      '</div>',
    link: function (scope, element) {
      // Find the suggestion container within the directive's template.
      const containerElement = element[0].getElementsByClassName('suggest-box-wrapper')[0];
      if (containerElement) {
        scope.suggestionContainer = angular.element(containerElement);
      } else {
        console.warn('SuggestiveInput: Suggestion container element not found in template.');
      }
    },
    controller: ["$scope", function ($scope) {
      // Self-reference for closure contexts.
      var selfRef = this;

      // Key codes for keyboard navigation.
      const KEY_CODES = {
        TAB_KEY: 9,
        ESCAPE_KEY: 27,
        ENTER_KEY: 13,
        ARROW_UP: 38,
        ARROW_DOWN: 40
      };

      // DOM event names.
      const DOM_EVENTS = {
        KEY_DOWN: 'keydown',
        WINDOW_RESIZE: 'resize',
        INPUT_BLUR: 'blur',
        INPUT_FOCUS: 'focus'
      };

      // Merge user-provided options with defaults.
      var initialUserConfig = $scope.inputConfiguration() || {};
      var activeConfiguration = angular.extend({}, DEFAULT_SETTINGS, {
        debounce_position: initialUserConfig.debounce_position || DEFAULT_SETTINGS.positionDelay,
        debounce_attach: initialUserConfig.debounce_attach || DEFAULT_SETTINGS.attachmentDelay,
        debounce_suggest: initialUserConfig.debounce_suggest || DEFAULT_SETTINGS.suggestionFetchDelay,
        debounce_blur: initialUserConfig.debounce_blur || DEFAULT_SETTINGS.blurDetachmentDelay,
        auto_select_first: initialUserConfig.auto_select_first || DEFAULT_SETTINGS.autoSelectFirstItem
      });

      // Internal state variables for the current active input.
      var focusedInputElem,       // The input element currently attached to this autocomplete instance.
          boundNgModel,           // The ngModel controller of the focused input.
          inputFieldOptions,      // Options specific to the currently focused input.
          initialInputValue,      // Value of the input when it was first focused (for ESC reset).
          modelValueWatcher,      // Function to deregister the ngModel watcher.
          recentlyChosenValue;    // Stores the last value selected from the suggestions to prevent re-suggestion.

      // Scope variables for template rendering.
      $scope.displaySuggestions = false;
      $scope.suggestionList = [];
      $scope.currentSelectionIndex = -1;
      $scope.isFetchingSuggestions = false;

      /**
       * Generic debouncing function (similar to Underscore/Lodash).
       * Ensures a function is not called too frequently.
       * @param {Function} targetFunc The function to debounce.
       * @param {number} delayMs The delay in milliseconds.
       * @param {boolean} executeImmediately If true, `targetFunc` is called on the leading edge.
       * @returns {Function} The debounced function.
       */
      function throttleFunction(targetFunc, delayMs, executeImmediately) {
          let timeoutHandle;
          let lastArgs;
          let lastContext;

          return function() {
              lastContext = this;
              lastArgs = arguments;

              const later = function() {
                  timeoutHandle = null;
                  if (!executeImmediately) {
                    targetFunc.apply(lastContext, lastArgs);
                  }
              };

              const callNow = executeImmediately && !timeoutHandle;
              clearTimeout(timeoutHandle);
              timeoutHandle = $delayService(later, delayMs); // Use Angular's $timeout for digest cycle integration.
              if (callNow) {
                targetFunc.apply(lastContext, lastArgs);
              }
          };
      }

      /**
       * Calculates and sets the position and width of the suggestion box
       * relative to the currently focused input element.
       */
      function repositionSuggestionBox() {
        if (!focusedInputElem || !$scope.suggestionContainer || !$scope.suggestionContainer[0]) {
          return; // Exit if elements are not available.
        }

        const inputRect = focusedInputElem[0].getBoundingClientRect();
        // Calculate scroll offsets for accurate positioning.
        const pageScrollTop = $pageDocument[0].body.scrollTop || $pageDocument[0].documentElement.scrollTop || $browserWindow.pageYOffset;
        const pageScrollLeft = $pageDocument[0].body.scrollLeft || $pageDocument[0].documentElement.scrollLeft || $browserWindow.pageXOffset;

        // Apply styles to the suggestion container.
        const containerStyle = $scope.suggestionContainer[0].style;
        containerStyle.top = (inputRect.top + inputRect.height + pageScrollTop) + 'px';
        containerStyle.left = (inputRect.left + pageScrollLeft) + 'px';
        containerStyle.width = inputRect.width + 'px';
      }
      // Debounced version of the positioning function.
      const throttledReposition = throttleFunction(repositionSuggestionBox, activeConfiguration.debounce_position);

      /**
       * Attaches autocomplete behavior to a specific input element.
       * @param {Object} modelController The ngModel controller of the input.
       * @param {Object} targetElement The Angular element of the input.
       * @param {Object} customOptions User-defined options for this specific input.
       */
      function activateInputBehavior(modelController, targetElement, customOptions) {
        // Guard against invalid inputs.
        if (!modelController || !targetElement || !targetElement[0] || !customOptions) {
          console.warn('SuggestiveInput: Attempted to activate with invalid parameters.', {modelController, targetElement, customOptions});
          return;
        }

        // If the element is already attached, no need to re-attach.
        if (focusedInputElem && focusedInputElem[0] === targetElement[0]) {
          return;
        }

        // Detach any previously attached elements to avoid conflicts.
        if (focusedInputElem) {
          selfRef.detach();
        }

        // Ensure the target element is actually the active element before proceeding.
        // This helps prevent attaching to elements that briefly gain focus then lose it.
        if (targetElement[0] !== $pageDocument[0].activeElement) {
          return;
        }

        // Validate the `suggest` function in options.
        if (typeof customOptions.suggest !== 'function') {
          console.error('SuggestiveInput: The `suggest` function is missing or not a function in the provided options.', customOptions);
          return;
        }

        // Call the on_attach hook if provided.
        customOptions.on_attach && customOptions.on_attach();

        // Store references to the currently active input.
        focusedInputElem = targetElement;
        boundNgModel = modelController;
        inputFieldOptions = customOptions;
        initialInputValue = modelController.$viewValue; // Store initial value for ESC key.

        // Initialize scope variables for a new attachment.
        $scope.suggestionList = [];
        $scope.currentSelectionIndex = -1;
        $scope.displaySuggestions = false;
        $scope.isFetchingSuggestions = false;
        recentlyChosenValue = undefined; // Reset last selected value.

        // Add accessibility attributes to the input.
        focusedInputElem.attr({
          'aria-expanded': 'false',
          'aria-haspopup': 'listbox',
          'aria-autocomplete': 'list'
        });

        // Bind DOM events to the input element and window.
        attachInputEventHandlers();

        // Watch for changes in the ngModel value to trigger suggestions.
        modelValueWatcher = $scope.$watch(
          function () {
            return boundNgModel.$modelValue;
          },
          function (currentModelVal, previousModelVal) {
            // Prevent suggestion cycle if the model value is the last value selected from the menu.
            if (currentModelVal === recentlyChosenValue) {
              return;
            }

            // Reposition the autocomplete box and fetch new suggestions.
            throttledReposition();
            throttledSuggestionFetch(currentModelVal, focusedInputElem);
          }
        );
      }
      // Debounced version of the attachment function.
      selfRef.attach = throttleFunction(activateInputBehavior, activeConfiguration.debounce_attach);

      /**
       * Fetches and displays suggestions based on the current search query.
       * @param {string} searchQuery The text to search for suggestions.
       * @param {Object} triggeringElement The element that triggered the suggestion request.
       */
      function fetchAndDisplaySuggestions(searchQuery, triggeringElement) {
        $scope.currentSelectionIndex = 0; // Reset selection index.
        $scope.isFetchingSuggestions = true; // Indicate loading state.
        $scope.displaySuggestions = false; // Hide suggestions temporarily.

        // Only fetch if query is a non-empty string.
        if (typeof searchQuery === 'string' && searchQuery.length > 0) {
          $promiseService.when(inputFieldOptions.suggest(searchQuery)).then(
            function suggestionSuccess(suggestions) {
              // Crucial check: Ensure the response is for the currently active input.
              // This handles cases where a slow remote request returns after the user
              // has moved focus to another input.
              if (!focusedInputElem || focusedInputElem[0] !== triggeringElement[0]) {
                return;
              }

              // Ensure suggestions is an array.
              const validSuggestions = Array.isArray(suggestions) ? suggestions : [];

              if (validSuggestions.length > 0) {
                // Prepend the original search query to the suggestion list.
                // This allows the user to easily revert to their typed value.
                $scope.suggestionList = [{ value: searchQuery, label: searchQuery}].concat(validSuggestions);
                $scope.displaySuggestions = true;
                focusedInputElem.attr('aria-expanded', 'true');

                // Automatically select the first user suggestion (index 1 after prepending).
                if (activeConfiguration.auto_select_first) {
                    updateSelectionAndInputValue(1);
                }
              } else {
                // No suggestions found.
                $scope.suggestionList = [];
                $scope.displaySuggestions = false;
                focusedInputElem.attr('aria-expanded', 'false');
              }
            },
            function suggestionFailure(error) {
              // Handle errors during suggestion fetching.
              console.error('SuggestiveInput: Suggestion fetching failed:', error);
              $scope.displaySuggestions = false;
              focusedInputElem.attr('aria-expanded', 'false');
              $scope.suggestionList = []; // Clear suggestions on error.
              inputFieldOptions.on_error && inputFieldOptions.on_error(error);
            }
          ).finally(function suggestionCompletion() {
            // Always reset loading state and apply changes to scope.
            $scope.isFetchingSuggestions = false;
            $scope.$applyAsync(); // Use applyAsync to avoid digest conflicts if promise resolves synchronously.
          });
        } else {
          // If query is empty, hide suggestions and reset state.
          $scope.isFetchingSuggestions = false;
          $scope.displaySuggestions = false;
          focusedInputElem.attr('aria-expanded', 'false');
          $scope.suggestionList = [];
          $scope.$applyAsync();
        }
      }
      // Debounced version of the suggestion fetching function.
      const throttledSuggestionFetch = throttleFunction(fetchAndDisplaySuggestions, activeConfiguration.debounce_suggest);

      /**
       * Detaches all autocomplete behavior from the current input element.
       * This includes unbinding events and clearing references.
       */
      selfRef.detach = function () {
        if (focusedInputElem) {
          // Sync the model value one last time before detaching.
          const finalValue = focusedInputElem.val();
          syncModelViewValue(finalValue);
          inputFieldOptions.on_detach && inputFieldOptions.on_detach(finalValue);

          // Unbind all event listeners from the element.
          focusedInputElem.off(DOM_EVENTS.KEY_DOWN);
          focusedInputElem.off(DOM_EVENTS.INPUT_BLUR);
          focusedInputElem.removeAttr('aria-expanded aria-haspopup aria-autocomplete aria-activedescendant'); // Clean up accessibility attributes.
        }

        // Unbind window resize listener.
        angular.element($browserWindow).off(DOM_EVENTS.WINDOW_RESIZE, throttledReposition);

        // Deregister the ngModel watcher.
        if (modelValueWatcher) {
          modelValueWatcher();
          modelValueWatcher = null;
        }

        // Clear all references and scope state.
        $scope.displaySuggestions = false;
        $scope.suggestionList = [];
        $scope.currentSelectionIndex = -1;
        $scope.isFetchingSuggestions = false;

        focusedInputElem = null;
        boundNgModel = null;
        inputFieldOptions = null;
        initialInputValue = null;
        recentlyChosenValue = undefined;

        // Ensure scope updates are reflected.
        $scope.$applyAsync();
      };

      /**
       * Updates Angular's model view value and triggers a render.
       * This ensures the model is in sync with the visible input value.
       * @param {string} newValue The value to set on the model.
       */
      function syncModelViewValue(newValue) {
        if (boundNgModel && boundNgModel.$modelValue !== newValue) {
          boundNgModel.$setViewValue(newValue);
          boundNgModel.$render(); // Force re-render the view with the new value.
        }
      }

      /**
       * Updates the current selection index and sets the input element's value.
       * @param {number} newIndex The index of the item to select in `suggestionList`.
       * @returns {Object|undefined} The selected item, or undefined if index is out of bounds.
       */
      function updateSelectionAndInputValue(newIndex) {
        if (newIndex >= 0 && newIndex < $scope.suggestionList.length) {
          const selectedItem = $scope.suggestionList[newIndex];
          focusedInputElem.val(selectedItem.value); // Update input field directly.
          $scope.currentSelectionIndex = newIndex;
          focusedInputElem.attr('aria-activedescendant', `suggest-item-${newIndex}`); // Update ARIA attribute.
          return selectedItem;
        }
        // If index is out of bounds, reset selection.
        $scope.currentSelectionIndex = -1;
        focusedInputElem.removeAttr('aria-activedescendant');
        return undefined;
      }

      /**
       * Applies and accepts the currently highlighted selection from the menu.
       * This function is also called when a user clicks on a suggestion.
       * @param {number} selectedIndex The index of the item to confirm.
       */
      $scope.confirmSelection = function (selectedIndex) {
        if (!$scope.displaySuggestions || selectedIndex < 0 || selectedIndex >= $scope.suggestionList.length) {
          return; // Invalid selection.
        }

        const chosenItem = updateSelectionAndInputValue(selectedIndex);
        if (chosenItem) {
          recentlyChosenValue = chosenItem.value; // Store to prevent re-suggestion.
          syncModelViewValue(chosenItem.value); // Update the ngModel.
          $scope.displaySuggestions = false; // Hide suggestions.
          focusedInputElem.attr('aria-expanded', 'false');

          // Call the on_select hook if provided.
          inputFieldOptions.on_select && inputFieldOptions.on_select(chosenItem);
        }

        // Re-focus the input element after selection, crucial for continued interaction.
        focusedInputElem[0].focus();
      };

      /**
       * Binds all necessary event listeners to the input element and window.
       */
      function attachInputEventHandlers() {
        // Bind window resize to reposition the suggestion box.
        angular.element($browserWindow).on(DOM_EVENTS.WINDOW_RESIZE, throttledReposition);

        // Handle blur event for detaching.
        focusedInputElem.on(DOM_EVENTS.INPUT_BLUR, function () {
          // Use $delayService to allow time for click events on suggestions to register
          // before detaching. If focus returns to the input, don't detach.
          $delayService(function() {
            if (!focusedInputElem || focusedInputElem[0] !== $pageDocument[0].activeElement) {
              selfRef.detach();
            }
          }, activeConfiguration.debounce_blur);
        });

        // Handle keyboard navigation.
        focusedInputElem.on(DOM_EVENTS.KEY_DOWN, function (eventObject) {
          // Ignore key combinations involving Shift key.
          if (eventObject.shiftKey) {
            return;
          }

          switch (eventObject.keyCode) {
            case KEY_CODES.ESCAPE_KEY:
              if ($scope.displaySuggestions) {
                // If suggestions are open, close them.
                $scope.displaySuggestions = false;
                focusedInputElem.attr('aria-expanded', 'false');
                focusedInputElem.removeAttr('aria-activedescendant');
                $scope.$apply();
              } else {
                // If suggestions are closed, revert input to its initial value.
                focusedInputElem.val(initialInputValue);
                syncModelViewValue(initialInputValue);
              }
              break;

            case KEY_CODES.ENTER_KEY:
              // Only confirm selection if suggestions are displayed and an item is selected.
              if ($scope.displaySuggestions && $scope.currentSelectionIndex > 0 && !$scope.isFetchingSuggestions) {
                $scope.confirmSelection($scope.currentSelectionIndex);
                // Prevent default behavior to avoid form submission or newlines in input.
                eventObject.stopPropagation();
                eventObject.preventDefault();
              }
              $scope.displaySuggestions = false; // Hide suggestions after ENTER.
              focusedInputElem.attr('aria-expanded', 'false');
              focusedInputElem.removeAttr('aria-activedescendant');
              $scope.$apply();
              break;

            case KEY_CODES.TAB_KEY:
              // If suggestions are open, prevent default tab behavior to allow navigation within suggestions.
              if ($scope.displaySuggestions) {
                eventObject.preventDefault();
              }
              // Fall through to ARROW_DOWN logic for TAB to move to next item.
              // Note: This is a common UX pattern for autocomplete.
            case KEY_CODES.ARROW_DOWN:
              if ($scope.suggestionList.length > 1) { // Only navigate if there are actual suggestions beyond the original term.
                if ($scope.displaySuggestions) {
                  // Move to the next item, wrapping around to the first if at the end.
                  const nextIndex = $scope.currentSelectionIndex + 1;
                  updateSelectionAndInputValue(nextIndex >= $scope.suggestionList.length ? 0 : nextIndex);
                } else {
                  // If suggestions are not displayed but exist, show them and select the first.
                  $scope.displaySuggestions = true;
                  focusedInputElem.attr('aria-expanded', 'true');
                  updateSelectionAndInputValue(0); // Select the first item (original term).
                }
                $scope.$apply();
              }
              break;

            case KEY_CODES.ARROW_UP:
              if ($scope.displaySuggestions && $scope.suggestionList.length > 1) {
                eventObject.preventDefault(); // Prevent cursor from moving to start of input.
                // Move to the previous item, wrapping around to the last if at the beginning.
                const prevIndex = $scope.currentSelectionIndex - 1;
                updateSelectionAndInputValue(prevIndex < 0 ? $scope.suggestionList.length - 1 : prevIndex);
                $scope.$apply();
              }
              break;
          }
        });
      }

      // Cleanup on scope destruction.
      $scope.$on('$destroy', function () {
        selfRef.detach();
        if ($scope.suggestionContainer) {
          $scope.suggestionContainer.remove(); // Remove the container from the DOM.
        }
      });
    }]
  };
}])

.directive('suggestiveInputField', function () {
  'use strict';

  return {
    restrict: "A",
    require: ["^suggestiveInput", "ngModel"], // Requires the parent directive and ngModel.
    scope: {'fieldOptions' : "&suggestiveInputField"}, // Isolate scope for field-specific options.
    link: function (scope, element, attributes, requiredControllers) {
      const parentSuggestiveInput = requiredControllers[0]; // The controller of `suggestiveInput`.
      const ngModelController = requiredControllers[1];    // The ngModel controller of the input.

      // Prevent browser's native autocomplete.
      attributes.$set('autocomplete', 'off');

      // Attach behavior when the input field gains focus.
      element.on(DOM_EVENTS.INPUT_FOCUS, function () {
        const fieldSpecificOptions = scope.fieldOptions();
        if (!fieldSpecificOptions) {
          console.warn('SuggestiveInputField: Options for this input are missing or invalid. Please provide a valid object to suggestive-input-field attribute.');
          return;
        }
        // Delegate the attachment logic to the parent directive's controller.
        parentSuggestiveInput.attach(ngModelController, element, fieldSpecificOptions);
      });
    }
  };
});