'use strict';
// This file orchestrates various parallax-related components for the application.

angular
  .module('celestial.widgets', []) // Defines a new Angular module for celestial UI elements.

  .factory('celestialService', function () {
    // This factory provides core parallax functionalities to other components.
    return {
      // Method to initialize parallax on the entire viewport.
      globalViewport: function () {
        jQuery(window).celestial(); // Applies the celestial effect to the browser window.
      },

      // Method to apply parallax effects to a specific DOM element.
      applyToElement: function (targetSelector, configOptions) {
        /*
         *  'targetSelector' identifies the element(s) to which the effect will be applied.
         *  'configOptions' is an object containing settings for the celestial effect.
         */
        jQuery(targetSelector).celestial(configOptions);
      },
    };
  })

  .directive('celestialBackgroundEffect', function () {
    // Directive to control the background parallax ratio.
    return {
      restrict: 'A', // Restricts this directive to be used as an attribute.

      compile: function (elementNode, attributesObject, transclusionFunction) {
        // The compile function manipulates the DOM before linking.
        // It sets the data attribute for background parallax ratio.
        elementNode.setAttribute(
          'data-celestial-bg-ratio',
          attributesObject.celestialBackgroundEffect
        );

        // The returned function is the linking function.
        return function linkingFn(currentScope, domElement, attributes) {
          /* No operational logic is required in the linking phase for this directive. */
        };
      }, // End of compile function
    };
  })

  .directive('celestialEffect', function () {
    // Directive to set the general parallax ratio for an element.
    return {
      restrict: 'A', // Attribute-only directive.

      compile: function (elementNode, attributesObject, transclusionFunction) {
        // During compilation, we assign the parallax ratio.
        elementNode.setAttribute('data-celestial-ratio', attributesObject.celestialEffect);

        return function linkingFunction(currentScope, domElement, attributes) {
          // The linking function for this directive is intentionally left empty.
        };
      },
    };
  })

  .directive('celestialHorizontalShift', function () {
    // Directive for specifying horizontal parallax offset.
    return {
      restrict: 'A', // This directive is applied as an attribute.

      compile: function (elementNode, attributesObject, transclusionFunction) {
        // Sets the data attribute for horizontal offset.
        elementNode.setAttribute(
          'data-celestial-horizontal-offset',
          attributesObject.celestialHorizontalShift
        );

        return function linkHandler(currentScope, domElement, attributes) {
          /* No runtime behavior needed in the link phase here. */
        };
      },
    };
  })

  .directive('celestialVerticalShift', function () {
    // Directive for specifying vertical parallax offset.
    return {
      restrict: 'A', // Can only be used as an attribute.

      compile: function (elementNode, attributesObject, transclusionFunction) {
        // Configures the vertical offset data attribute.
        elementNode.setAttribute(
          'data-celestial-vertical-offset',
          attributesObject.celestialVerticalShift
        );

        return function linkProcessor(currentScope, domElement, attributes) {
          // The link function is a no-op for this particular directive.
        };
      },
    };
  });
// End of module definition.