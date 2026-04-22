ngModule.module('MegaSuggest', [])
  .directive('megaSuggest', ["_timeoutService", "_windowRef", "_documentRef", "_promiseService", function (_timeoutService, _windowRef, _documentRef, _promiseService) {
    // Enforce strict parsing rules within this component.
    'use strict';

    return {
      // Attribute-based directive.
      restrict: "A",
      // Isolate scope with an options binding.
      scope: { componentConfig: '&megaSuggest' },
      // Allow content to be inserted.
      transclude: true,
      // Inline template for the suggestion UI.
      template:
        '<span ng-transclude></span>' +
        '<div class="suggestion-panel" ng-show="displaySuggestions && suggestionList.length > 0" style="position: absolute;">' +
          '<ul class="suggestion-menu">' +
            '<li ng-repeat="(itemIndex, item) in suggestionList" ng-if="itemIndex > 0" ' +
              'class="menu-item" ng-class="itemIndex == selectedIndex ? \'item-focused\': \'\'">' +
              '<a href ng-click="confirmSelection(itemIndex)" ng-bind-html="item.displayLabel"></a>' +
            '</li>' +
          '</ul>' +
        '</div>',
      // Link function to manipulate DOM directly after template is compiled.
      link: function (currentScope, hostElement) {
        currentScope.suggestionPanel = ngModule.element(hostElement[0].getElementsByClassName('suggestion-panel')[0]);
      },
      // Main controller for the autocomplete behavior.
      controller: ["_scope", function (_scope) {
        var selfRef = this;

        // Key codes for keyboard navigation.
        var KEY_CODES = {
          TAB_KEY: 9,
          ESCAPE_KEY: 27,
          RETURN_KEY: 13,
          ARROW_UP: 38,
          ARROW_DOWN: 40
        };

        // DOM event names used throughout the directive.
        var DOM_EVENTS = {
          KEY_PRESS: 'keydown',
          WINDOW_RESIZE: 'resize',
          FOCUS_LOST: 'blur'
        };

        // Retrieve and merge user-defined configuration.
        var _initialConfig = _scope.componentConfig() || {};
        var activeConfig = {
          positionDelay: _initialConfig.positionDelay || 150,
          attachDelay: _initialConfig.attachDelay || 300,
          suggestionDelay: _initialConfig.suggestionDelay || 200,
          blurDelay: _initialConfig.blurDelay || 150
        };

        // Variables to maintain the state of the currently active input.
        var activeInput,
            activeModel,
            activeOptions,
            priorValue,
            modelWatcher,
            lastChosenValue;

        // Initialize display state for the suggestion list.
        _scope.displaySuggestions = false;

        // Utility function to debounce repeated calls - inspired by Underscore.js.
        function throttleAction(operation, delayMs, executeNow) {
            var timerId;
            return function() {
                var thisContext = this, argumentsList = arguments;
                var deferredExecution = function() {
                    timerId = null;
                    if (!executeNow) operation.apply(thisContext, argumentsList);
                };
                var shouldExecute = executeNow && !timerId;
                clearTimeout(timerId);
                timerId = setTimeout(deferredExecution, delayMs);
                if (shouldExecute) operation.apply(thisContext, argumentsList);
            };
        }

        // Internal helper to calculate and set the position of the suggestion panel.
        function _repositionPanel() {
          var inputBounds = activeInput[0].getBoundingClientRect(),
              verticalScroll = _documentRef[0].body.scrollTop || _documentRef[0].documentElement.scrollTop || _windowRef.pageYOffset,
              horizontalScroll = _documentRef[0].body.scrollLeft || _documentRef[0].documentElement.scrollLeft || _windowRef.pageXOffset,
              suggestionPanel = _scope.suggestionPanel[0];

          suggestionPanel.style.top = inputBounds.top + inputBounds.height + verticalScroll + 'px';
          suggestionPanel.style.left = inputBounds.left + horizontalScroll + 'px';
          suggestionPanel.style.width = inputBounds.width + 'px';
        }
        // Debounced version of the positioning function.
        var repositionPanel = throttleAction(_repositionPanel, activeConfig.positionDelay);

        // Connect the autocomplete functionality to a specific input field.
        function _connectBehavior(modelControl, targetElement, behaviorOptions) {
          // If this element is already connected, do nothing.
          if (activeInput === targetElement) return;
          // Disconnect any previously connected elements for safety.
          if (activeInput) selfRef.disconnect();
          // Ensure the target element is still the actively focused element.
          if (targetElement[0] !== _documentRef[0].activeElement) return;

          // Execute the optional onConnect callback.
          behaviorOptions.onConnect && behaviorOptions.onConnect();

          activeInput = targetElement;
          activeModel = modelControl;
          activeOptions = behaviorOptions;
          priorValue = modelControl.$viewValue;

          _scope.suggestionList = [];
          _scope.selectedIndex = -1;
          attachListeners();

          // Set up a watch on the model value to trigger suggestions.
          modelWatcher = _scope.$watch(
            function () {
              return modelControl.$modelValue;
            },
            function (newValue, oldValue) {
              // Avoid triggering suggestions if the new value is the same as the last chosen value,
              // which happens when an item is selected from the menu.
              if (newValue === lastChosenValue)
                return;

              _repositionPanel();
              fetchSuggestions(newValue, activeInput);
            }
          );
        }
        // Debounced version of the attachment function.
        selfRef.connect = throttleAction(_connectBehavior, activeConfig.attachDelay);

        // Internal function to request and display suggestions based on a search term.
        function _fetchSuggestions(searchTerm, targetElement) {
          _scope.selectedIndex = 0;
          _scope.awaitingResults = true;

          if (typeof searchTerm === 'string' && searchTerm.length > 0) {
            _promiseService.when(activeOptions.suggest(searchTerm),
              // Success callback for suggestion retrieval.
              function onSuggestionsReceived(potentialResults) {
                // Verify that the suggestions are still relevant to the currently active input field.
                // This prevents issues with asynchronous results arriving after the user has moved to another field.
                if (!activeInput || activeInput !== targetElement)
                  return;

                if (potentialResults && potentialResults.length > 0) {
                  // Prepend the original search term to the results, allowing the user to revert.
                  _scope.suggestionList = [{ actualValue: searchTerm, displayLabel: ''}].concat(potentialResults);
                  _scope.displaySuggestions = true;
                  if (activeOptions.autoSelectFirst)
                      selectEntry(1);
                } else {
                  _scope.suggestionList = [];
                }
              },
              // Error callback for suggestion retrieval.
              function onSuggestionError(fetchError) {
                _scope.displaySuggestions = false;
                activeOptions.onError && activeOptions.onError(fetchError);
              }
            ).finally(function onSuggestionComplete() {
              _scope.awaitingResults = false;
            });
          } else {
            _scope.awaitingResults = false;
            _scope.displaySuggestions = false;
            _scope.$apply();
          }
        }
        // Debounced version of the suggestion fetching function.
        var fetchSuggestions = throttleAction(_fetchSuggestions, activeConfig.suggestionDelay);

        // Disconnects the autocomplete functionality from the current input element.
        // This involves cleaning up event listeners and scope variables.
        selfRef.disconnect = function () {
          if (activeInput) {
            var currentValue = activeInput.val();
            syncModelValue(currentValue);
            activeOptions.onDisconnect && activeOptions.onDisconnect(currentValue);
            activeInput.unbind(DOM_EVENTS.KEY_PRESS);
            activeInput.unbind(DOM_EVENTS.FOCUS_LOST);
          }

          // Reset the display state and clear all associated references and event handlers.
          _scope.displaySuggestions = false;
          ngModule.element(_windowRef).unbind(DOM_EVENTS.WINDOW_RESIZE);
          modelWatcher && modelWatcher(); // Stop watching the model.
          _scope.selectedIndex = _scope.suggestionList = undefined;
          activeModel = activeInput = priorValue = undefined;
        };

        // Ensures the Angular model's view value is synchronized with the actual input value.
        // This is crucial before invoking any callbacks to ensure consistent state.
        function syncModelValue(currentValue) {
          if (activeModel.$modelValue !== currentValue) {
            activeModel.$setViewValue(currentValue);
            activeModel.$render(); // Update the view to reflect the model.
          }
        }

        // Highlights an item in the suggestion list and updates the input field's text.
        function selectEntry(index) {
          // The input's value is updated directly, rather than through the model,
          // to avoid re-triggering the suggestion watch prematurely.
          var chosenEntry = _scope.suggestionList[index];
          activeInput.val(chosenEntry.actualValue);
          _scope.selectedIndex = index;
          return chosenEntry;
        }

        // Confirms the currently selected item, updating the model and hiding suggestions.
        _scope.confirmSelection = function (index) {
          activeInput[0].focus(); // Ensure the input retains focus.
          if (!_scope.displaySuggestions || index > _scope.suggestionList.length || index < 0)
            return;

          var chosenEntry = selectEntry(index);
          lastChosenValue = chosenEntry.actualValue;
          syncModelValue(chosenEntry.actualValue);
          _scope.displaySuggestions = false;

          // Invoke the optional onChoose callback with the selected item.
          activeOptions.onChoose && activeOptions.onChoose(chosenEntry);
        };

        // Binds necessary DOM event listeners to the input element and window.
        function attachListeners() {
          ngModule.element(_windowRef).bind(DOM_EVENTS.WINDOW_RESIZE, repositionPanel);

          activeInput.bind(DOM_EVENTS.FOCUS_LOST, function () {
            // When the input loses focus, a short delay is introduced.
            // This allows time for a potential click on a suggestion to register
            // before detaching the autocomplete, which would prevent selection.
            _timeoutService(function() {
              if (!activeInput || activeInput[0] !== _documentRef[0].activeElement)
                selfRef.disconnect();
            }, activeConfig.blurDelay);
          });

          activeInput.bind(DOM_EVENTS.KEY_PRESS, function (eventObject) {
            // Ignore key combinations involving the Shift key.
            if (eventObject.shiftKey) return;

            switch (eventObject.keyCode) {
              // Handle the Escape key: close suggestions or revert input value.
              case KEY_CODES.ESCAPE_KEY:
                if (_scope.displaySuggestions) {
                  _scope.displaySuggestions = false;
                  _scope.$apply();
                } else {
                  activeInput.val(priorValue); // Revert to the value before suggestions appeared.
                }
                break;

              // Handle the Enter key: confirm selection or allow default behavior.
              case KEY_CODES.RETURN_KEY:
                // A selection is confirmed only if suggestions are visible,
                // an item is highlighted, and no new suggestions are being fetched.
                if (_scope.displaySuggestions &&
                    _scope.selectedIndex > 0 &&
                    !_scope.awaitingResults) {
                  _scope.confirmSelection(_scope.selectedIndex);
                  // Prevent default form submission and event bubbling.
                  eventObject.stopPropagation();
                  eventObject.preventDefault();
                }

                _scope.displaySuggestions = false;
                _scope.$apply();
                break;

              // Handle Tab key for navigation (or fall through to Arrow Down).
              case KEY_CODES.TAB_KEY:
                if (!_scope.displaySuggestions)
                  break; // If suggestions aren't open, let Tab behave normally.

                eventObject.preventDefault(); // Prevent focus shift if suggestions are open.
                /* falls through */ // Intentionally fall through to ARROW_DOWN logic.

              // Handle Arrow Down key: navigate list or open suggestions.
              case KEY_CODES.ARROW_DOWN:
                if (_scope.suggestionList.length > 0) {
                  if (_scope.displaySuggestions) {
                    // Cycle through suggestions, wrapping from bottom to top.
                    selectEntry(_scope.selectedIndex + 1 > _scope.suggestionList.length - 1 ? 0 : _scope.selectedIndex + 1);
                  } else {
                    // If suggestions are hidden but available, show them and select the first.
                    _scope.displaySuggestions = true;
                    _scope.selectedIndex = 0;
                  }
                  _scope.$apply();
                }
                break;

              // Handle Arrow Up key: navigate list, wrapping from top to bottom.
              case KEY_CODES.ARROW_UP:
                if (_scope.displaySuggestions) {
                  eventObject.preventDefault(); // Prevent cursor movement in input.
                  // Cycle through suggestions, wrapping from top to bottom.
                  selectEntry(_scope.selectedIndex - 1 >= 0 ? _scope.selectedIndex - 1 : _scope.suggestionList.length - 1);
                  _scope.$apply();
                }
                break;
            }
          });
        }

        // Cleanup on scope destruction to prevent memory leaks.
        _scope.$on('$destroy', function () {
          selfRef.disconnect();
          _scope.suggestionPanel.remove(); // Remove the panel from the DOM.
        });
      }]
    };
  })

  .directive('megaSuggestItem', function () {
    // Enforce strict parsing for this component.
    'use strict';

    return {
      // This directive is used as an attribute.
      restrict: "A",
      // Requires the parent 'megaSuggest' controller and the 'ngModel' controller.
      require: ["^megaSuggest", "ngModel"],
      // Isolated scope with a configuration binding.
      scope: {'megaSuggestItemConfig' : "&"},
      // Linking function to set up event listeners.
      link: function (itemScope, inputElement, attributes, dependencies) {
        // Disable native browser autocomplete functionality.
        attributes.$set('autocomplete', 'off');

        // Attach autocomplete behavior when the input element gains focus.
        inputElement.bind('focus', function () {
          var behaviorOptions = itemScope.megaSuggestItemConfig();
          if (!behaviorOptions)
            throw "Invalid configuration for megaSuggestItem";
          // Call the connect method on the parent megaSuggest controller.
          dependencies[0].connect(dependencies[1], inputElement, behaviorOptions);
        });
      }
    };
  });