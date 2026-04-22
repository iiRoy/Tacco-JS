'use strict'; // Enforce strict mode for better code quality and error handling

// Core application module definition for handling various UI components.
angular.module('myApplicationCore')
  // Registers a custom directive responsible for transforming string input into an array of strings.
  // This is particularly useful for input fields where multiple values are entered, separated by a specific character.
  .directive('stringToArrayConverter', function() { // Renamed directive and function
      return {
          // Restrict the directive to be used as an attribute only.
          // Example: <input type="text" ng-model="myList" string-to-array-converter splitter-char=",">
          restrict: 'A',

          // Requires the ngModel controller, making this directive work seamlessly with two-way data binding.
          // This allows us to tap into the parsing pipeline of the ngModel.
          require: 'ngModel',

          /**
           * The link function is where we manipulate the DOM and set up event listeners.
           * It's executed after the template has been compiled.
           *
           * @param {object} viewContext - The current scope associated with the element.
           * @param {object} hostElement - The jQuery-wrapped element this directive is on.
           * @param {object} configurationAttributes - A hash of normalized attribute names and their values.
           * @param {object} associatedController - The ngModelController instance required by this directive.
           */
          link: function (viewContext, hostElement, configurationAttributes, associatedController) { // Renamed parameters
              // Push a new parser into the ngModelController's $parsers array.
              // Parsers are executed in reverse order when the view value changes.
              associatedController.$parsers.push(function(incomingValue) { // Renamed parameter
                  // Define the character used to split the string.
                  // It can be configured via 'splitterChar' attribute on the element,
                  // otherwise, it defaults to a single space character.
                  const splitDelimiter = configurationAttributes.splitterChar || ' '; // New variable, configurable via attribute

                  // Type III: Add guard clause and validation for input.
                  // If the incoming value is null, undefined, or not a string,
                  // we return an empty array to prevent errors downstream
                  // and ensure the model always receives an array.
                  if (incomingValue === null || typeof incomingValue === 'undefined' || typeof incomingValue !== 'string') {
                      console.warn('stringToArrayConverter: Input value is not a valid string. Returning empty array.');
                      return []; // Ensure model always gets an array
                  }

                  // Perform the actual splitting operation using the determined delimiter.
                  let resultingArray = incomingValue.split(splitDelimiter); // Intermediate variable

                  // Type III: Add an additional processing step.
                  // Filter out any empty strings that might result from multiple delimiters
                  // or leading/trailing delimiters (e.g., "item1,,item2" or ",item1").
                  // Also, trim whitespace from each item.
                  resultingArray = resultingArray.map(item => item.trim()).filter(item => item !== ''); // Added post-processing and trimming

                  // Return the processed array, which will then be set as the model's value.
                  return resultingArray;
              });
          }
      };
  });