angular.module('my-autocompleter-app')
  .directive('myAutocompleter', ['$parserService', function($parserService) {
    // This directive serves as the main container for the autocompletion functionality.
    return {
      restrict: 'AE', // Can be used as an element or an attribute
      compile: autocompleterCompiler, // Custom compilation logic
      scope: true, // Creates an isolated scope
      controller: 'MainCompleterController' // Associates with the primary controller
    };

    /**
     * Compiler function for the main autocompleter directive.
     * It sets up the initial structure.
     * @param {object} templateElement - The template element
     * @param {object} attributes - The element's attributes
     */
    function autocompleterCompiler(templateElement, attributes) {
      // The post-link function for this directive
      return function(currentScope, domElement, elementAttributes) {
        // No specific linking logic needed for the main directive itself
        // All interaction happens via the input and suggestions directives
      };
    }

  }])
  .directive('myAutocompleterInput',
    ['$compilerService', '$parserService', '$documentService', '$timerService', 'CompleterUtils', 'CompleterEvents',
      function(compiler, parser, doc, timer, utilities, notifications) {
        // This directive integrates autocompletion features into an input field.
        return {
          restrict: 'A', // Used as an attribute
          require: '^myAutocompleter', // Requires the parent autocompleter directive
          terminal: true, // Prevents other directives on the same element from running
          compile: completerInputCompiler, // Custom compilation for input setup
          scope: false // Shares the parent scope
        };

        /**
         * Compiler function for the autocompleter input directive.
         * Handles initial setup and dynamic changes to the input.
         * @param {object} templateEl - The template element of the input
         * @param {object} elementAttrs - The attributes of the input element
         */
        function completerInputCompiler(templateEl, elementAttrs) {
          // Determine if the input needs recompilation (e.g., if ng-model is missing)
          var needsRecompilation = !elementAttrs.ngModel;
          // If ng-model is missing, add a default one for the autocompleter's search text
          if (needsRecompilation) {
            templateEl.attr('ng-model', 'Completer.searchText');
          }

          // Return the post-link function
          return function(currentScope, inputDomElement, inputAttributes) {
            // Recompile the input if ng-model was added dynamically
            if (needsRecompilation) {
              compiler(inputDomElement)(currentScope);
              return; // Exit as the element will be re-processed
            }

            // Create and insert the suggestion hint element
            var suggestionDisplay = generateSuggestionDisplay(inputDomElement);
            suggestionDisplay.attr('ng-show', 'Completer.displaySuggestions'); // Bind visibility
            inputDomElement.parent()[0].insertBefore(suggestionDisplay[0], inputDomElement[0]);
            compiler(suggestionDisplay)(currentScope); // Compile the hint element

            // Bind keydown events for navigation and selection
            inputDomElement.bind('keydown', function(keyEvent) {
              suggestionDisplay.val(''); // Clear hint on key press

              // Handle down arrow key
              if (keyEvent.keyCode === 40) { // Down arrow key code
                if (currentScope.Completer.proposedItems.length > 0) {
                  keyEvent.preventDefault(); // Prevent default scroll behavior
                }
                currentScope.$apply(function() {
                  currentScope.Completer.highlightItem(currentScope.Completer.highlightedItem + 1);
                });
              }
              // Handle up arrow key
              else if (keyEvent.keyCode === 38) { // Up arrow key code
                if (currentScope.Completer.proposedItems.length > 0) {
                  keyEvent.preventDefault(); // Prevent default scroll behavior
                }
                currentScope.$apply(function() {
                  currentScope.Completer.highlightItem(currentScope.Completer.highlightedItem - 1);
                });
              }
              // Handle Enter key
              else if (keyEvent.keyCode === 13) { // Enter key code
                keyEvent.preventDefault(); // Prevent form submission or new line
                currentScope.$apply(function() {
                  // Attempt to complete the input with the selected suggestion
                  if (currentScope.Completer.attemptCompletion()) {
                    currentScope.$emit(notifications.COMPLETED_INPUT, {
                      val: currentScope.Completer.retrieveValue(), // Get the completed value
                      cause: notifications.triggers.enterKey, // Triggered by enter key
                      modelRef: currentScope.Completer.modelBinding // Reference to the model
                    });
                  }
                });
              }
              // Handle Right arrow key
              else if (keyEvent.keyCode === 39) { // Right arrow key code
                // Only complete if right arrow completion is enabled
                if (!currentScope.Completer.completionSettings.rightArrow) {
                  return;
                }
                // Only complete if cursor is at the end of the input
                if (getCursorPosition(inputDomElement[0]) < inputDomElement.val().length) {
                  return;
                }
                keyEvent.preventDefault(); // Prevent default cursor movement

                // Get the currently suggested item
                var proposed = currentScope.Completer.getProposedItem(true);
                currentScope.$apply(function() {
                  // Try to complete and update suggestion display status
                  currentScope.Completer.displaySuggestions = !currentScope.Completer.attemptCompletion();
                  // If autocomplete was successful
                  if (!currentScope.Completer.displaySuggestions) {
                    currentScope.$emit(notifications.COMPLETED_INPUT, {
                      val: currentScope.Completer.retrieveValue(),
                      cause: notifications.triggers.rightArrowKey,
                      modelRef: currentScope.Completer.modelBinding
                    });
                  }
                });
              }
              // Handle Tab key
              else if (keyEvent.keyCode === 9) { // Tab key code
                // Only complete if tab completion is enabled
                if (!currentScope.Completer.completionSettings.tabKey) {
                  return;
                }
                // If an item is highlighted, attempt completion
                if (currentScope.Completer.highlightedItem > -1) {
                  currentScope.$apply(function() {
                    // Try to complete and update suggestion display status
                    currentScope.Completer.displaySuggestions = !currentScope.Completer.attemptCompletion();
                    // If autocomplete was successful
                    if (!currentScope.Completer.displaySuggestions) {
                      currentScope.$emit(notifications.COMPLETED_INPUT, {
                        val: currentScope.Completer.retrieveValue(),
                        cause: notifications.triggers.tabKey,
                        modelRef: currentScope.Completer.modelBinding
                      });
                    }
                  });
                } else {
                  // If no item is highlighted, just hide suggestions
                  currentScope.$apply(function() {
                    currentScope.Completer.displaySuggestions = false;
                  });
                }
              }
            });

            // Bind keyup event to update the hint text
            inputDomElement.bind('keyup', function(keyEvent) {
              var proposed = currentScope.Completer.getProposedItem(true);
              var formattedValue = currentScope.Completer.formatItem(proposed);
              // Only show hint if suggestions are visible and the hint starts with current input
              if (currentScope.Completer.displaySuggestions && utilities.startsWith(formattedValue, inputDomElement.val())) {
                suggestionDisplay.val(formattedValue);
              }
            });

            // Prevent event propagation on input click to avoid closing suggestions
            inputDomElement.bind('click', function(keyEvent) {
              keyEvent.stopPropagation();
            });

            // Handle blur event to hide suggestions after a short delay
            inputDomElement.bind('blur', function(keyEvent) {
              timer(function() {
                currentScope.Completer.displaySuggestions = false; // Hide suggestions
              }, 25); // Small delay to allow click events on suggestions to register
            });

            // Bind click event on the document to hide suggestions if clicking outside
            doc.bind('click', function(keyEvent) {
              currentScope.$apply(function() {
                currentScope.Completer.displaySuggestions = false;
              });
            });
          };
        }

        /**
         * Retrieves the current cursor position in an input field.
         * Supports IE and other modern browsers.
         * @param {HTMLInputElement} inputField - The input DOM element.
         * @returns {number} The cursor position.
         */
        function getCursorPosition(inputField) {
          var cursorPosition = 0;
          // Support for Internet Explorer
          if (document.selection) {
            inputField.focus(); // Set focus on the element
            var selectionRange = document.selection.createRange(); // Get empty selection range
            selectionRange.moveStart('character', -inputField.value.length); // Move selection start to 0
            cursorPosition = selectionRange.text.length; // Cursor position is selection length
          }
          // Support for other browsers (Firefox, Chrome, etc.)
          else if (inputField.selectionStart || inputField.selectionStart === 0) {
            cursorPosition = inputField.selectionStart;
          }
          return cursorPosition;
        }

        /**
         * Creates a hint input element with styles matching the main input.
         * @param {object} inputElementRef - The jQuery/jqLite wrapped input element.
         * @returns {object} The jQuery/jqLite wrapped hint input element.
         */
        function generateSuggestionDisplay(inputElementRef) {
          // Create a new input element for the hint
          return angular.element('<input class="completer-hint" type="text" autocomplete="false" spellcheck="false" disabled>')
            .css({
              padding: inputElementRef.css('padding'),
              fontFamily: inputElementRef.css('font-family'),
              fontSize: inputElementRef.css('font-size'),
              fontStyle: inputElementRef.css('font-style'),
              fontVariant: inputElementRef.css('font-variant'),
              fontWeight: inputElementRef.css('font-weight'),
              wordSpacing: inputElementRef.css('word-spacing'),
              letterSpacing: inputElementRef.css('letter-spacing'),
              textIndent: inputElementRef.css('text-indent'),
              textRendering: inputElementRef.css('text-rendering'),
              textTransform: inputElementRef.css('text-transform'),
              color: 'gray', // Hint text color
              width: inputElementRef.css('width') // Match input width
            });
        }

      }])
  .directive('myAutocompleterSuggestions', ['$parserService', '$compilerService', function($parserService, $compilerService) {
    // This directive displays the list of autocompletion suggestions.
    var suggestionTemplate = [
      '<li ',
      'ng-repeat="item in Completer.proposedItems track by (Completer._idProperty ? item[Completer._idProperty] : $id(item))"',
      'ng-click="handleItemClick($index); $event.stopPropagation(); $event.preventDefault()" ',
      'ng-class="{ highlighted : $index === Completer.highlightedItem }" ',
      'ng-mouseover="Completer.highlightItem($index)">',
      '<ng-switch on="$templateUrl">',
      '  <span ng-switch-when="false">{{ Completer.formatItem(item) }}</span>',
      '  <ng-switch-default><ng-include src="$templateUrl"></ng-include></ng-switch-default>',
      '</ng-switch>',
      '</li>'
    ].join(''); // Join array elements to form a single template string

    return {
      require: '^myAutocompleter', // Requires the parent autocompleter directive
      restrict: 'AE', // Can be used as an element or an attribute
      scope: false, // Shares the parent scope
      compile: function(directiveElement, elementAttributes) {
        // Check if ng-show attribute is present, otherwise add a default
        var needsRecompilation = !elementAttributes.ngShow;
        directiveElement.attr('ng-show', 'Completer.displaySuggestions');

        // Return a link object with pre and post linking functions
        return {
          preLink: function(currentScope, domElement, attributes) {
            // If ng-show was added, recompile the element to apply it
            if (needsRecompilation) {
              domElement[0].innerHTML = suggestionTemplate; // Set the inner HTML
              $compilerService(domElement)(currentScope); // Recompile the element
              return; // Exit preLink as recompilation will re-process
            }
            // Set the template URL for custom suggestion rendering
            currentScope.$templateUrl = attributes.templateUrlPath ? $parserService(attributes.templateUrlPath)(currentScope) : false;
          },
          postLink: angular.noop // No specific post-linking logic needed
        };
      }
    };
  }]);