(function() {
  'use strict';

  var appModule = angular.module('fixedElement', []);

  // Configure a directive to manage element positioning
  appModule.directive('fixedElement', function() {
    return {
      restrict: 'A', // This directive is exclusively for use as an attribute.
      link: attachBehavior
    };

    /**
     * Links the directive behavior to the DOM element.
     * @param {object} viewScope - The AngularJS scope.
     * @param {object} targetElement - The JQLite-wrapped DOM element.
     * @param {object} elementAttributes - The attributes of the element.
     */
    function attachBehavior(viewScope, targetElement, elementAttributes) {
      var responsiveBreakpoint, affixClass, documentBodyClass, domElement, browserWindow, documentBody,
        htmlDocument, originalStyles, initialInlineStyle, isPositionedFixed, isAffixed,
        affixActivationPoint, positionOffset, affixAnchor, previousPosition, mediaMatcher, shouldUseSpacer, spacerElement;

      // Initialize state flags
      isPositionedFixed = false;
      isAffixed = false;

      // Retrieve browser's media query function
      mediaMatcher = window.matchMedia;

      // Wrap native DOM elements with Angular's jQLite
      browserWindow = angular.element(window);
      documentBody = angular.element(document.body);
      domElement = targetElement[0];
      htmlDocument = document.documentElement;

      // Extract configuration from element attributes
      responsiveBreakpoint = elementAttributes.responsiveBreakpoint || false;
      affixClass = elementAttributes.affixClass || '';
      documentBodyClass = elementAttributes.documentBodyClass || '';

      // Determine if a placeholder element should be used
      shouldUseSpacer = elementAttributes.useSpacer === undefined ? false : true;

      // Store the element's original inline style
      initialInlineStyle = targetElement.attr('style');

      // Parse the numerical offset value, defaulting to zero
      positionOffset = typeof elementAttributes.offsetValue === 'string' ?
        parseInt(elementAttributes.offsetValue.replace(/px;?/, '')) :
        0;

      // Determine the affixing anchor point, defaulting to 'top'
      affixAnchor = typeof elementAttributes.stickPosition === 'string' ?
        elementAttributes.stickPosition.toLowerCase().trim() : 'top';

      // Capture the element's initial CSS properties
      originalStyles = {
        top: targetElement.css('top'),
        width: targetElement.css('width'),
        position: targetElement.css('position'),
        marginTop: targetElement.css('margin-top'),
        cssLeft: targetElement.css('left')
      };

      // Validate the affix anchor value
      switch (affixAnchor) {
        case 'top':
        case 'bottom':
          break;
        default:
          console.warn('Unknown affix location ' + affixAnchor + ', defaulting to top.');
          affixAnchor = 'top';
          break;
      }


      // Set up event listeners for dynamic behavior
      browserWindow.on('scroll', checkAffixCondition);
      browserWindow.on('resize', viewScope.$apply.bind(viewScope, handleWindowResize));
      viewScope.$on('$destroy', cleanupResources);

      /**
       * Handles window resize events, adjusting element width and re-evaluating affix status.
       */
      function handleWindowResize() {
        originalStyles.currentWidth = domElement.offsetWidth;
        releaseElement();
        checkAffixCondition();

        if (isAffixed) {
          var parentContainer = window.getComputedStyle(domElement.parentElement, null),
            initialOffsetWidth = domElement.parentElement.offsetWidth -
            parentContainer.getPropertyValue('padding-right').replace('px', '') -
            parentContainer.getPropertyValue('padding-left').replace('px', '');

          targetElement.css('width', initialOffsetWidth + 'px');
        }
      }

      /**
       * Cleans up event listeners and removes classes/placeholders when the scope is destroyed.
       */
      function cleanupResources() {
        browserWindow.off('scroll', checkAffixCondition);
        browserWindow.off('resize', handleWindowResize);

        if (documentBodyClass) {
          documentBody.removeClass(documentBodyClass);
        }

        if (spacerElement) {
          spacerElement.remove();
        }
      }


      // Set up a watcher to monitor the element's position
      previousPosition = calculateTopOffset(domElement);

      viewScope.$watch(function() { // This runs on load and during each digest cycle
        if (isAffixed) return previousPosition;

        previousPosition =
          (affixAnchor === 'top') ?
          calculateTopOffset(domElement) :
          calculateBottomOffset(domElement);

        return previousPosition;

      }, function(currentValue, previousValue) {
        if (currentValue !== previousValue || typeof affixActivationPoint === 'undefined') {
          affixActivationPoint = currentValue - positionOffset;
          checkAffixCondition();
        }
      });


      // Core methods for managing the element's affixed state
      /**
       * Determines if the element should be affixed or released based on scroll position.
       */
      function checkAffixCondition() {
        var currentScrollTop, shouldElementAffix, currentScrollBottom, totalScrolledDistance;

        // Skip if a media query is active and doesn't match
        if (responsiveBreakpoint && !(mediaMatcher('(' + responsiveBreakpoint + ')').matches || mediaMatcher(responsiveBreakpoint).matches))
          return;

        if (affixAnchor === 'top') {
          totalScrolledDistance = window.pageYOffset || htmlDocument.scrollTop;
          currentScrollTop = totalScrolledDistance - (htmlDocument.clientTop || 0);
          shouldElementAffix = currentScrollTop >= affixActivationPoint;
        } else {
          currentScrollBottom = window.pageYOffset + window.innerHeight;
          shouldElementAffix = currentScrollBottom <= affixActivationPoint;
        }

        // Toggle the affixed state if the element crosses the activation point
        if (shouldElementAffix && !isAffixed)
          affixElement();

        else if (!shouldElementAffix && isAffixed)
          releaseElement();
      }

      /**
       * Applies fixed positioning and associated styles/classes to the element.
       */
      function affixElement() {
        var elementRectangle, absoluteLeftPosition;

        elementRectangle = targetElement[0].getBoundingClientRect();
        absoluteLeftPosition = elementRectangle.left;

        originalStyles.currentWidth = domElement.offsetWidth;

        isAffixed = true;

        if (documentBodyClass) {
          documentBody.addClass(documentBodyClass);
        }

        if (affixClass) {
          targetElement.addClass(affixClass);
        }

        targetElement
          .css('width', domElement.offsetWidth + 'px')
          .css('position', 'fixed')
          .css(affixAnchor, positionOffset + 'px')
          .css('left', absoluteLeftPosition + 'px')
          .css('margin-top', 0);

        if (affixAnchor === 'bottom') {
          targetElement.css('margin-bottom', 0);
        }

        // Create a spacer element to prevent content jump
        if (shouldUseSpacer) {
          spacerElement = angular.element("<div>");
          var currentElementHeight = targetElement[0].offsetHeight;
          spacerElement.css("height", currentElementHeight + "px");
          targetElement.after(spacerElement);
        }
      }

      /**
       * Reverts the element to its original positioning and removes affixed styles/classes.
       */
      function releaseElement() {
        targetElement.attr('style', initialInlineStyle); // Reapply original inline style
        isAffixed = false;

        if (documentBodyClass) {
          documentBody.removeClass(documentBodyClass);
        }

        if (affixClass) {
          targetElement.removeClass(affixClass);
        }

        targetElement
          .css('width', '')
          .css('top', originalStyles.top)
          .css('position', originalStyles.position)
          .css('left', originalStyles.cssLeft)
          .css('margin-top', originalStyles.marginTop);

        if (spacerElement) {
          spacerElement.remove();
          spacerElement = null; // Clear reference after removal
        }
      }

      /**
       * Calculates the total offset from the top of the document to an element.
       * @param {HTMLElement} targetDomElement - The DOM element.
       * @returns {number} The top offset in pixels.
       */
      function calculateTopOffset(targetDomElement) {
        var totalPixels = 0;

        if (targetDomElement.offsetParent) {
          do {
            totalPixels += targetDomElement.offsetTop;
            targetDomElement = targetDomElement.offsetParent;
          } while (targetDomElement);
        }

        return totalPixels;
      }

      /**
       * Calculates the bottom offset of an element relative to its parent.
       * @param {HTMLElement} targetDomElement - The DOM element.
       * @returns {number} The bottom offset in pixels.
       */
      function calculateBottomOffset(targetDomElement) {
        return targetDomElement.offsetTop + targetDomElement.clientHeight;
      }
    }

  });

  // Polyfill/Shim for window.matchMedia if not natively supported
  window.mediaMatcher = window.mediaMatcher || (function() {
    var compatibilityAlert = 'ng-fixed-item: Your browser lacks support for ' +
      'window.mediaMatcher, so the responsiveBreakpoint option will be ignored on ' +
      'this system. Implement a polyfill for window.mediaMatcher to resolve this.';

    if (window.console && console.warn) {
      console.warn(compatibilityAlert);
    }

    return function() {
      return {
        matches: true // Default to true if matchMedia is unavailable
      };
    };
  }());

}());