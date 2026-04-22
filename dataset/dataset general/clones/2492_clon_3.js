angular.module('autoCompletionModule')
  // Main directive for the auto-completion system
  .directive('autoCompleteProvider', ['expressionParser', function(expressionParser) {
    // This directive serves as the root for the auto-completion component.
    // It primarily sets up the context for child directives.
    return {
      restrict: 'E', // Restrict to element only for clear component definition
      controller: 'ACMainController', // Main controller managing auto-completion logic
      compile: function compileRootElement(tElement, tAttrs) {
        // Pre-compilation phase for the main element
        // No significant DOM manipulation here, primarily for setup or validation.
        tAttrs.$set('role', 'combobox'); // Add a WAI-ARIA role for accessibility
        tElement.addClass('ac-container'); // Apply a base CSS class
        // The linking function. Could be empty if all logic is in the controller.
        return function linkRootElement(scope, element, attrs) {
          // Post-compilation (linking) phase.
          // In this specific case, the root directive has no direct DOM interaction here.
          // Its primary role is to provide a controller scope for its children.
          console.log('Auto-completion root element linked successfully.'); // Debugging fragment
        };
      }
    };
  }])

  // Directive for the input field that triggers auto-completion
  .directive('autoCompleteField',
    ['domCompiler', 'exprEvaluator', 'docService', 'delayService', 'utilityServices', 'autoCompleteEvents',
      function(domCompiler, exprEvaluator, docService, delayService, utils, autoEvents) {
        // This directive transforms a standard input into an auto-completion enabled field.
        return {
          restrict: 'EA', // Can be an element or an attribute
          require: '^autoCompleteProvider', // Requires the parent auto-complete provider
          // terminal: true, // Removed as a Type III change, might affect compilation order but for this case, it's non-essential.
          scope: false, // Inherits scope from parent
          compile: function compileInputField(templateElement, templateAttrs) {
            // Check if ng-model is present; if not, add a default one.
            const needsInitialCompilation = !templateAttrs.ngModel;
            if (needsInitialCompilation) {
              templateElement.attr('ng-model', 'acController.currentQuery'); // Use a renamed model
              templateElement.attr('autocomplete', 'off'); // Explicitly disable browser autocomplete
            }

            return function linkInputField(scope, inputDomElement, elementAttrs) {
              // Retrieve the auto-completion controller instance
              const acCtrl = scope.acController; // Renamed from ATP.

              // If a default ng-model was added, recompile the element to pick it up.
              if (needsInitialCompilation) {
                domCompiler(inputDomElement)(scope);
                return; // Exit early as the element will be recompiled
              }

              // Create and insert the suggestion hint element
              const suggestionHint = createSuggestionOverlay(inputDomElement);
              suggestionHint.attr('ng-show', 'acController.displaySuggestions'); // Renamed property
              inputDomElement.parent()[0].insertBefore(suggestionHint[0], inputDomElement[0]);
              domCompiler(suggestionHint)(scope); // Compile the hint to bind ng-show

              // Helper function to emit the completion event
              const emitCompletionEvent = (triggerSource) => {
                const completionPayload = {
                  value: acCtrl.retrieveValue(), // Renamed method
                  triggeredBy: autoEvents.triggers[triggerSource],
                  model: acCtrl.targetModelExpression // Renamed property
                };
                scope.$emit(autoEvents.COMPLETION_TRIGGERED, completionPayload); // Renamed event
                console.info('Auto-completion event triggered by:', triggerSource); // New logging fragment
              };

              // Attach keyboard event handlers to the input field
              inputDomElement.on('keydown', function(keyboardEvent) {
                suggestionHint.val(''); // Clear hint on any keydown
                const activeKey = keyboardEvent.keyCode;
                const KEY_DOWN = 40;
                const KEY_UP = 38;
                const KEY_ENTER = 13;
                const KEY_RIGHT_ARROW = 39;
                const KEY_TAB = 9;

                if (acCtrl.suggestionList.length === 0 && (activeKey === KEY_DOWN || activeKey === KEY_UP)) {
                  // If no suggestions, no need to prevent default for arrow keys
                  return;
                }

                // Handle navigation and selection keys
                if (activeKey === KEY_DOWN) {
                  keyboardEvent.preventDefault();
                  scope.$apply(() => acCtrl.selectSuggestion(acCtrl.currentSelectionIndex + 1)); // Renamed properties/methods
                } else if (activeKey === KEY_UP) {
                  keyboardEvent.preventDefault();
                  scope.$apply(() => acCtrl.selectSuggestion(acCtrl.currentSelectionIndex - 1));
                } else if (activeKey === KEY_ENTER) {
                  keyboardEvent.preventDefault();
                  scope.$apply(() => {
                    if (acCtrl.attemptCompletion()) { // Renamed method
                      emitCompletionEvent('enterKey'); // Renamed trigger
                    }
                  });
                } else if (activeKey === KEY_RIGHT_ARROW) {
                  if (!acCtrl.completionOptions.onRightArrow) return; // Renamed property
                  // Only complete if caret is at the end of the input value
                  if (getCursorPositionInElement(inputDomElement[0]) < inputDomElement.val().length) return;
                  keyboardEvent.preventDefault();
                  scope.$apply(() => {
                    acCtrl.displaySuggestions = !acCtrl.attemptCompletion();
                    if (!acCtrl.displaySuggestions) {
                      emitCompletionEvent('rightArrowKey');
                    }
                  });
                } else if (activeKey === KEY_TAB) {
                  if (!acCtrl.completionOptions.onTab) return; // Renamed property
                  if (acCtrl.currentSelectionIndex > -1) {
                    keyboardEvent.preventDefault(); // Prevent default tab behavior if a suggestion is selected
                    scope.$apply(() => {
                      acCtrl.displaySuggestions = !acCtrl.attemptCompletion();
                      if (!acCtrl.displaySuggestions) {
                        emitCompletionEvent('tabKey');
                      }
                    });
                  } else {
                    // If no suggestion selected, just hide dropdown
                    scope.$apply(() => acCtrl.displaySuggestions = false);
                  }
                }
              });

              // Attach keyup event for hint display
              inputDomElement.on('keyup', function(keyboardEvent) {
                const currentSuggestion = acCtrl.getFormattedSuggestion(true); // Renamed method
                const inputValue = inputDomElement.val();
                // Check if suggestions are displayed and the hint should be shown
                if (acCtrl.displaySuggestions && utils.stringStartsWith(currentSuggestion, inputValue)) { // Renamed helper
                  suggestionHint.val(currentSuggestion);
                } else {
                  suggestionHint.val(''); // Ensure hint is cleared if conditions not met
                }
              });

              // Stop propagation for input clicks to prevent document click handler from closing dropdown
              inputDomElement.on('click', (ev) => ev.stopPropagation());

              // Handle blur event for the input field
              inputDomElement.on('blur', function(ev) {
                const BLUR_DELAY_MS = 30; // New intermediate variable for delay
                delayService(() => {
                  acCtrl.showSuggested = false; // Renamed property
                }, BLUR_DELAY_MS);
              });

              // Bind a click handler to the document to hide suggestions when clicking outside
              docService.on('click', function(ev) {
                // Add a simple validation: if target is part of the autocomplete, do nothing
                if (angular.element(ev.target).closest('.ac-container').length > 0) {
                  return;
                }
                scope.$apply(() => acCtrl.displaySuggestions = false);
              });
            };
          }
        };

        // DOM-related utility functions

        /**
         * Determines the current cursor position within a text input element.
         * @param {HTMLInputElement} inputElement - The input field.
         * @returns {number} The 0-based index of the cursor position.
         */
        function getCursorPositionInElement(inputElement) {
          let caretPosition = 0;
          if (!inputElement) { // Guard clause for null/undefined element
            return caretPosition;
          }

          // Modern browsers (Firefox, Chrome, etc.)
          if (inputElement.selectionStart || inputElement.selectionStart === 0) {
            caretPosition = inputElement.selectionStart;
          }
          // Legacy IE support
          else if (document.selection) {
            inputElement.focus();
            const textRange = document.selection.createRange();
            textRange.moveStart('character', -inputElement.value.length);
            caretPosition = textRange.text.length;
          }
          return caretPosition;
        }

        /**
         * Creates a hidden input element to serve as a suggestion hint.
         * It copies styling from the original input field.
         * @param {object} sourceInput - The jqLite/jQuery wrapped original input element.
         * @returns {object} The jqLite/jQuery wrapped hint input element.
         */
        function createSuggestionOverlay(sourceInput) {
          const hintElement = angular.element('<input class="ac-hint-overlay" type="text" autocomplete="false" spellcheck="false" disabled>');
          const stylesToCopy = [
            'padding', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight',
            'wordSpacing', 'letterSpacing', 'textIndent', 'textRendering', 'textTransform', 'width'
          ];
          const copiedStyles = {};
          stylesToCopy.forEach(styleProp => {
            copiedStyles[styleProp] = sourceInput.css(styleProp);
          });

          // Apply copied styles and add specific hint styling
          hintElement.css(copiedStyles);
          hintElement.css({
            color: 'lightgray', // Changed from 'gray' to 'lightgray'
            position: 'absolute', // New style fragment
            pointerEvents: 'none' // Ensure it doesn't interfere with original input
          });

          return hintElement;
        }

      }])

  // Directive for displaying the list of auto-completion suggestions
  .directive('autoCompleteDropdown', ['parseExpression', 'compileHtml', function(parseExpression, compileHtml) {
    // Template for a single suggestion item in the dropdown list
    const suggestionItemTemplate = `
      <li role="option"
          ng-repeat="suggestionItem in acController.suggestionList track by (acController.uniqueIdKey ? suggestionItem[acController.uniqueIdKey] : $id(suggestionItem))"
          ng-click="handleSuggestionClick($index); $event.stopPropagation(); $event.preventDefault()"
          ng-class="{ 'is-selected' : $index === acController.currentSelectionIndex }"
          ng-mouseover="acController.selectSuggestion($index)">
        <div ng-if="!$itemTemplateUrl">
          <span class="suggestion-text">{{ acController.formatItem(suggestionItem) }}</span>
        </div>
        <div ng-if="$itemTemplateUrl">
          <ng-include src="$itemTemplateUrl"></ng-include>
        </div>
      </li>`; // Rewritten template, using ng-if instead of ng-switch, renamed variables/classes

    return {
      require: '^autoCompleteProvider', // Requires the parent auto-complete provider
      restrict: 'E', // Restrict to element only
      // scope: false, // Removed as it's the default behavior for directives
      compile: function compileDropdown(elementTemplate, attrsTemplate) {
        // Determine if the element needs initial compilation due to missing ng-show
        const needsInitialCompilation = !attrsTemplate.ngShow;
        // Ensure ng-show is always present for visibility control
        elementTemplate.attr('ng-show', 'acController.displaySuggestions'); // Renamed property
        elementTemplate.addClass('ac-suggestion-list'); // Add a new base class

        return {
          pre: function preLink(scopeObj, elementLink, attrsLink) {
            // If ng-show was missing, inject the default template and recompile
            if (needsInitialCompilation) {
              elementLink[0].innerHTML = suggestionItemTemplate;
              compileHtml(elementLink)(scopeObj);
              return; // Exit pre-link as element will be recompiled
            }

            // Parse and evaluate the custom template URL if provided
            let customTemplatePath = null;
            if (attrsLink.itemTemplateUrl) { // Renamed attribute
              customTemplatePath = parseExpression(attrsLink.itemTemplateUrl)(scopeObj);
            }
            scopeObj.$itemTemplateUrl = customTemplatePath || false; // Renamed scope property

            // Add a new helper function to the scope for click handling
            scopeObj.handleSuggestionClick = function(idx) {
              scopeObj.acController.selectSuggestion(idx);
              scopeObj.acController.attemptCompletion();
              scopeObj.$emit(autoEvents.COMPLETION_TRIGGERED, {
                value: scopeObj.acController.retrieveValue(),
                triggeredBy: autoEvents.triggers.mouseClick, // New trigger type
                model: scopeObj.acController.targetModelExpression
              });
            };
          }
          // post: angular.noop // Removed as it's non-essential and default behavior
        };
      }
    };
  }]);