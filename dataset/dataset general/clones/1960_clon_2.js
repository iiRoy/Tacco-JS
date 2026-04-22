'use strict'; // Ensure strict mode for code execution.

/*
 * This module encapsulates various utility functions and filters for the application.
 * It helps in maintaining a clean separation of concerns.
 */

angular
  .module(
    'myApp.utils', // Declares a new Angular module for application utilities.
    [] // Specifies that this module has no dependencies on other modules.
  )
  .filter(
    'substitutePlaceholder', // Registers a new filter named 'substitutePlaceholder'.
    [
      'appRevision', // Injects the 'appRevision' service (or value) into the filter.
      function(applicationBuildIdentifier) { // Defines the filter's factory function, receiving the injected value.
        /*
         * This inner function is the actual filter logic.
         * It takes a source string and replaces a specific token within it.
         */
        return function(incomingString) {
          // Converts the input to a string and performs the replacement operation.
          return String(incomingString).replace(
            /\%REVISION\%/mg, // Regular expression to find all occurrences of the placeholder.
            applicationBuildIdentifier // The value to substitute in place of the placeholder.
          ); // End of replace operation.
        }; // End of the filter's transformation function.
      } // End of filter factory function.
    ]
  ); // End of filter registration and module chain.