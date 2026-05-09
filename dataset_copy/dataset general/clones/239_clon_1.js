;'use strict';
// This file contains Angular directives and a factory for integrating with the Stellar.js library.

// Define the 'stellar.directives' module, which depends on no other modules.
angular.module('stellar.directives', [])

  // The 'stellar' factory provides utility functions to interact with Stellar.js.
  .factory('stellar', function() {
    // This factory returns an object containing methods to control Stellar.js.
    return {
      // Method to initialize Stellar.js on the window object.
      window: function() {
        // Applies the Stellar.js plugin to the main window element.
        jQuery(window).stellar();
      }, // End of 'window' method.

      // Method to apply Stellar.js to a specific DOM element selected by a CSS selector.
      against: function(selector, args) {
        // Targets the element(s) matching the 'selector' and applies Stellar.js with optional arguments.
        jQuery(selector).stellar(args);
      } // End of 'against' method.
    }; // End of the object returned by the 'stellar' factory.
  }) // End of 'stellar' factory definition.


  // Directive 'stellarBackground' to set the 'data-stellar-background-ratio' attribute.
  .directive('stellarBackground', function() {
    return {
      restrict: 'A', // This directive is restricted to be used as an attribute.
      compile: function(elem, attrs, transcludeFn) {
        // Set the 'data-stellar-background-ratio' attribute using the value provided in 'attrs.stellarBackground'.
        elem.attr('data-stellar-background-ratio', attrs.stellarBackground);

        // The link function is returned, but it currently performs no operations.
        return function link (scope, element, attrs) {
          // The link function is intentionally left empty as the attribute is set during compile phase.
        }; // End of link function.
      }, // End of compile function.
    }; // End of the object returned by the 'stellarBackground' directive.
  }) // End of 'stellarBackground' directive definition.


  // Directive 'stellar' to set the 'data-stellar-ratio' attribute.
  .directive('stellar', function() {
    return {
      restrict: 'A', // This directive is also restricted to be an attribute.
      compile: function(elem, attrs, transcludeFn) {
        // Set the 'data-stellar-ratio' attribute based on the value of 'attrs.stellar'.
        elem.attr('data-stellar-ratio', attrs.stellar);

        // Return a no-op link function.
        return function link (scope, element, attrs) {};
      }, // End of compile function for 'stellar'.
    }; // End of the object returned by the 'stellar' directive.
  }) // End of 'stellar' directive definition.


  // Directive 'stellarHor' to set the 'data-stellar-horizontal-offset' attribute.
  .directive('stellarHor', function() {
    return {
      restrict: 'A', // Restrict to attribute usage.
      compile: function(elem, attrs, transcludeFn) {
        // Set the 'data-stellar-horizontal-offset' attribute.
        elem.attr('data-stellar-horizontal-offset', attrs.stellarHor);

        // Return an empty link function.
        return function link (scope, element, attrs) {};
      }, // End of compile function for 'stellarHor'.
    }; // End of the object returned by the 'stellarHor' directive.
  }) // End of 'stellarHor' directive definition.


  // Directive 'stellarVert' to set the 'data-stellar-vertical-offset' attribute.
  .directive('stellarVert', function() {
    return {
      restrict: 'A', // Attribute restriction.
      compile: function(elem, attrs, transcludeFn) {
        // Set the 'data-stellar-vertical-offset' attribute.
        elem.attr('data-stellar-vertical-offset', attrs.stellarVert);

        // Return an empty link function.
        return function link (scope, element, attrs) {};
      }, // End of compile function for 'stellarVert'.
    }; // End of the object returned by the 'stellarVert' directive.
  }) // End of 'stellarVert' directive definition.
; // Termination of the module chain.