angular.module('tagInputWidget', []) // Renamed module
  // A utility filter to transform a collection of objects into a comma-separated string based on a specified property.
  .filter('extractPropertyAsCsv', function() {
    return function(sourceCollection, keyName) {
      // Guard clause: If the input collection is not provided or is empty, return an empty string.
      if (!sourceCollection || !Array.isArray(sourceCollection) || sourceCollection.length === 0) {
        return '';
      }

      // Map each object in the collection to the value of the specified key, then join them with a comma and space.
      const mappedValues = sourceCollection.map(function(entry) {
        // Ensure the entry is an object and has the key to prevent errors.
        return (typeof entry === 'object' && entry !== null && entry.hasOwnProperty(keyName)) ? entry[keyName] : '';
      });

      return mappedValues.join(', ');
    };
  })
  // Directive to automatically set focus on an element based on a watched expression.
  .directive('autoFocusElement', ['$timeout', '$parse', function(timerService, expressionEvaluator) {
    return {
      // The `link` function allows direct DOM manipulation and setting up event listeners.
      link: function(isolatedScope, domElement, elementAttributes) {
        // Parse the attribute value into an Angular expression for two-way binding.
        const focusActivationExpression = expressionEvaluator(elementAttributes.autoFocusElement);

        // Watch the expression for changes. When it becomes true, set focus.
        isolatedScope.$watch(focusActivationExpression, function(activationState) {
          // Only proceed if the activation state is explicitly true.
          if (activationState === true) {
            // Use $timeout with a small delay to ensure the element is rendered and ready for focus.
            timerService(() => {
              if (domElement && domElement[0]) {
                domElement[0].focus();
              }
            }, 0, false); // `false` prevents $timeout from calling $apply, relying on the outer digest.
          }
        });

        // Bind a blur event listener to reset the expression when the element loses focus.
        domElement.on('blur', () => {
          // Use $evalAsync to safely update the scope without causing digest conflicts.
          isolatedScope.$evalAsync(() => {
            focusActivationExpression.assign(isolatedScope, false);
          });
        });
      }
    };
  }])
  // Main directive for an interactive tag input widget.
  .directive('interactiveTagInput', function() {
    return {
      restrict: 'EA', // Can be used as an element or an attribute.
      // require: 'ngModel', // Commented out requirement for ngModel, but it's used in scope.
      scope: {
        boundTags: '=ngModel' // Binds the 'tags' property in the controller to the ngModel of the parent scope.
      },
      replace: true, // Replaces the directive's element with the template's root element.
      templateUrl: 'partials/tag-input-template.html', // Path to the HTML template for the widget.
      controller: ['$scope', '$attrs', '$element', '$http', '$filter', function(ctrlScope, attributesMap, hostElement, dataFetcher, utilityFilter) {

        // Initialize configuration object with defaults.
        ctrlScope.widgetConfiguration = {
          displayField: 'name', // Default field to display for a tag.
          fetchEndpoint: 'api/suggestions?query=', // Default API endpoint for suggestions.
          inputPlaceholder: 'Type and press Enter...', // Default placeholder text.
          suggestionsOnly: false // Default to allow custom tags.
        };

        // Override defaults with values from element attributes if provided.
        ctrlScope.widgetConfiguration.displayField = attributesMap.displayField || ctrlScope.widgetConfiguration.displayField;
        ctrlScope.widgetConfiguration.fetchEndpoint = attributesMap.fetchEndpoint || ctrlScope.widgetConfiguration.fetchEndpoint;
        ctrlScope.widgetConfiguration.inputPlaceholder = attributesMap.inputPlaceholder || ctrlScope.widgetConfiguration.inputPlaceholder;
        // Convert string 'true'/'false' from attributes to boolean.
        ctrlScope.widgetConfiguration.suggestionsOnly = attributesMap.suggestionsOnly === 'true' || ctrlScope.widgetConfiguration.suggestionsOnly;

        // Initialize the current search term for the input field.
        ctrlScope.currentSearchTerm = '';
        // Initialize an array for available suggestions.
        ctrlScope.availableSuggestions = [];

        // Ensure the boundTags model is an array, initialize if not.
        if (!Array.isArray(ctrlScope.boundTags)) {
          ctrlScope.boundTags = [];
        }

        // Watch the current search term for changes to fetch suggestions from the API.
        ctrlScope.$watch('currentSearchTerm', (termValue) => {
          const trimmedTerm = termValue ? termValue.trim() : '';
          // Only fetch if the search term is not empty.
          if (trimmedTerm.length > 0) {
            dataFetcher.get(ctrlScope.widgetConfiguration.fetchEndpoint + encodeURIComponent(trimmedTerm))
              .then(
                function(response) {
                  // Assuming the API returns suggestions in `response.data.payload` or directly in `response.data`.
                  ctrlScope.availableSuggestions = response.data.payload || response.data || [];
                  // console.log('Fetched suggestions:', ctrlScope.availableSuggestions); // Debugging line
                },
                function(errorResponse) {
                  console.error('Error fetching suggestions:', errorResponse);
                  ctrlScope.availableSuggestions = []; // Clear suggestions on error.
                }
              );
          } else {
            ctrlScope.availableSuggestions = []; // Clear suggestions if search term is empty.
          }
        });

        /**
         * Appends a new tag to the collection.
         * @param {any} tagIdentifier - The unique identifier for the tag.
         * @param {string} tagLabel - The display label for the tag.
         */
        ctrlScope.appendTag = (tagIdentifier, tagLabel) => {
          const processedLabel = tagLabel ? tagLabel.trim() : '';

          if (!processedLabel) {
            return; // Don't add empty tags.
          }

          // Optional: Check for duplicate tags before adding.
          const isDuplicate = ctrlScope.boundTags.some(existingTag =>
            existingTag.label.toLowerCase() === processedLabel.toLowerCase()
          );

          if (isDuplicate) {
            console.warn(`Tag "${processedLabel}" already exists.`);
            ctrlScope.currentSearchTerm = ''; // Clear input even if duplicate.
            return;
          }

          ctrlScope.boundTags.push({
            identifier: tagIdentifier,
            label: processedLabel
          });
          ctrlScope.currentSearchTerm = ''; // Clear the input field after adding.
          ctrlScope.$evalAsync(); // Trigger a digest cycle to update the view.
        };

        /**
         * Removes a tag from the collection by its index.
         * @param {number} idx - The index of the tag to remove.
         */
        ctrlScope.removeTagAtIndex = (idx) => {
          if (idx >= 0 && idx < ctrlScope.boundTags.length) {
            ctrlScope.boundTags.splice(idx, 1);
            ctrlScope.$evalAsync(); // Trigger a digest cycle.
          }
        };

        // Event listener for keydown events on the input field.
        hostElement.find('input').on('keydown', (keyboardEvent) => {
          const specialKeys = [8, 13, 32]; // Backspace (8), Enter (13), Space (32)

          // Check if the pressed key is one of our special keys.
          if (specialKeys.includes(keyboardEvent.which)) {
            const currentInputContent = ctrlScope.currentSearchTerm ? ctrlScope.currentSearchTerm.trim() : '';

            if (keyboardEvent.which === 8 /* Backspace */ ) {
              // If input is empty and tags exist, remove the last tag.
              if (currentInputContent.length === 0 && ctrlScope.boundTags.length > 0) {
                ctrlScope.boundTags.pop();
                keyboardEvent.preventDefault(); // Prevent default backspace behavior (e.g., navigating back).
              }
            } else if (keyboardEvent.which === 32 || keyboardEvent.which === 13 /* Space or Enter */ ) {
              // If there's input and custom tags are allowed, add a new tag.
              if (currentInputContent.length > 0 && !ctrlScope.widgetConfiguration.suggestionsOnly) {
                // Add the current input as a new tag. Identifier is null as it's not from API suggestions.
                ctrlScope.appendTag(null, currentInputContent);
                keyboardEvent.preventDefault(); // Prevent form submission or space insertion.
              }
            }
            // Ensure the scope reflects the changes.
            ctrlScope.$evalAsync();
          }
        });
      }]
    };
  });