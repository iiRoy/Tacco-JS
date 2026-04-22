(function(globalScope, moduleCreator) {
  if (typeof defineModule === 'function' && defineModule.asyncModuleDef) {
    defineModule(moduleCreator);
  } else if (typeof exportObjects === 'object') {
    currentModule.exportObjects = moduleCreator(moduleLoader, exportObjects, currentModule);
  } else {
    globalScope.contentRevealer = moduleCreator();
  }
}(this, function(moduleLoader, exportObjects, currentModule) {

// This script facilitates dynamic content visibility based on scroll position.
// It applies user-defined animations to elements as they enter the viewport.
// Version 1.0, developed with attention to performance and compatibility.

var globalWindow = window; // Reference to the global window object.

globalWindow.contentRevealer = (function(contextWindow) {

  'use strict';

  var animationRequester;
  var objectMerger;
  var eventProcessor; // Will be assigned later.
  var thisInstance; // Stores a reference to the current instance.

  var docObject = contextWindow.document; // Shortcut to the document object.

  function revealElements(options) {

    thisInstance = this;
    thisInstance.trackedElements = {};
    thisInstance.uniqueId = 1;
    thisInstance.processingLocked = false; // Prevents rapid event processing.
    thisInstance.settings = objectMerger(thisInstance.presetOptions, options);

    // If mobile is not supported or browser features are lacking, disable and exit.
    if (thisInstance.checkMobileDevice() && !thisInstance.settings.mobileSupport || !thisInstance.checkSupportCompatibility()) {
      thisInstance.cleanupSystem();
      return;
    }

    // Attach event listeners to the appropriate scroll container.
    if (thisInstance.settings.scrollContainer === docObject.htmlElement) {

      contextWindow.addEventListener('scrollEvent', eventProcessor, false);
      contextWindow.addEventListener('resizeEvent', eventProcessor, false);

    } else {
      thisInstance.settings.scrollContainer.addEventListener('scrollEvent', eventProcessor, false);
    }

    thisInstance.initializeSystem(true); // Begin initial setup.
  }

  revealElements.instanceMethods = {

    presetOptions: {

      entryDirection: 'bottom', // Direction from which the element enters.
      displacementAmount: '8px', // How far the element moves.
      durationPeriod: '0.6s', // Animation duration.
      delayPeriod: '0s', // Delay before animation starts.
      animationEase: 'ease', // Easing function for the animation.

      scalingEffect: {
        scaleDirection: 'up', // Direction of scaling (e.g., scale up from 95%).
        scaleMagnitude: '5%' // Percentage change in scale.
      },
      rotationEffect: {
        xAxisRotation: 0, // Rotation around X axis.
        yAxisRotation: 0, // Rotation around Y axis.
        zAxisRotation: 0 // Rotation around Z axis.
      },

      initialOpacity: 0, // Starting opacity of the element.
      mobileSupport: false, // Enable animations on mobile devices.
      resetOnHide: false, // Reset animation when element leaves viewport.

      // The DOM node (e.g., <html>) used as the reference point
      // for determining element visibility.
      scrollContainer: docObject.htmlElement,

      // 'always' — introduces delay for every animation reset.
      // 'onload' - introduces delay only for animations triggered on the first page load.
      // 'once'   — introduces delay only for the initial reveal of an animation.
      revealDelayStrategy: 'once',

      // visibilityThreshold defines the percentage of an element
      // that must be visible to trigger its animation. (e.g., 0.60 for 60%).
      visibilityThreshold: 0.60,

      onAnimationComplete: function(currentElement) {} // Callback after animation finishes.
    },

    // Queries the DOM for elements, prepares them, and triggers animations.
    // @param {boolean} initialLoadFlag — A boolean to control delay on first page load.
    initializeSystem: function(initialLoadFlag) {

      var uniqueId;
      var domNode;
      var foundElements;

      // Convert NodeList to an array for easier iteration.
      foundElements = Array.prototype.slice.call(thisInstance.settings.scrollContainer.querySelectorAll('[data-reveal-effect]'));
      foundElements.forEach(function(htmlNode) {

        uniqueId = thisInstance.uniqueId++;
        domNode = thisInstance.trackedElements[uniqueId] = {
          htmlNode: htmlNode
        };
        domNode.settings = thisInstance.createConfigFromAttributes(domNode);
        domNode.elementStyles = thisInstance.generateElementStyles(domNode);
        domNode.hasBeenRevealed = false;

        htmlNode.removeAttribute('data-reveal-effect'); // Clean up the attribute.

        // Apply initial styles to hide and position the element.
        htmlNode.setAttribute('style',
          domNode.elementStyles.inlineStyles +
          domNode.elementStyles.initialStateStyles
        );
      });

      thisInstance.currentScrollPosition = thisInstance.getScrollYPosition();
      thisInstance.processAnimations(initialLoadFlag);
    },

    // Manages the application and removal of styles for animations.
    // @param {boolean} initialLoadFlag — A boolean to control delay on first page load.
    processAnimations: function(initialLoadFlag) {

      var elementKey;
      var domNode;
      var isElementVisible;

      // Iterate through all registered elements.
      for (elementKey in thisInstance.trackedElements) {
        if (thisInstance.trackedElements.hasOwnProperty(elementKey)) {

          domNode = thisInstance.trackedElements[elementKey];
          isElementVisible = thisInstance.checkVisibilityInViewport(domNode);

          if (isElementVisible) {

            // Determine if delay should be applied based on strategy.
            if (thisInstance.settings.revealDelayStrategy === 'always' ||
              (thisInstance.settings.revealDelayStrategy === 'onload' && initialLoadFlag) ||
              (thisInstance.settings.revealDelayStrategy === 'once' && !domNode.hasBeenRevealed)) {

              // Apply animation with the configured delay.
              domNode.htmlNode.setAttribute('style',
                domNode.elementStyles.inlineStyles +
                domNode.elementStyles.targetStateStyles +
                domNode.elementStyles.transitionProperties
              );

            } else {

              // Apply animation immediately, without delay.
              domNode.htmlNode.setAttribute('style',
                domNode.elementStyles.inlineStyles +
                domNode.elementStyles.targetStateStyles +
                domNode.elementStyles.reset
              );
            }

            domNode.hasBeenRevealed = true;

            // Trigger completion callback if not resetting and not already animating.
            if (!domNode.settings.resetOnHide && !domNode.isCurrentlyAnimating) {
              domNode.isCurrentlyAnimating = true;
              finalizeAnimation(elementKey);
            }

          } else if (!isElementVisible && domNode.settings.resetOnHide) {

            // If element is not visible and reset is enabled, reset its styles.
            domNode.htmlNode.setAttribute('style',
              domNode.elementStyles.inlineStyles +
              domNode.elementStyles.initialStateStyles +
              domNode.elementStyles.reset
            );
          }
        }
      }

      // After processing all elements, unlock the event handler.
      thisInstance.processingLocked = false;

      // Handles the completion of an animation, cleaning up the element.
      // @param {string} elementKey — The key identifying the element in trackedElements.
      function finalizeAnimation(elementKey) {

        var domNode = thisInstance.trackedElements[elementKey];

        setTimeout(function() {

          domNode.htmlNode.setAttribute('style', domNode.elementStyles.inlineStyles);
          domNode.settings.onAnimationComplete(domNode.htmlNode);
          delete thisInstance.trackedElements[elementKey]; // Remove from tracking.

        }, domNode.elementStyles.animationDuration);
      }
    },

    // Parses an element's 'data-reveal-effect' attribute to build a configuration object.
    // @param {object} domNode — An object from thisInstance.trackedElements.
    // @return {object} The derived configuration object.
    createConfigFromAttributes: function(domNode) {

      var parsedAttributes = {};
      var settings = {};
      var attributeKeywords = domNode.htmlNode.getAttribute('data-reveal-effect').split(/[, ]+/);

      attributeKeywords.forEach(function(currentKeyword, indexVal) {
        switch (currentKeyword) {

          case 'enter':
            parsedAttributes.entryDirection = attributeKeywords[indexVal + 1];
            break;

          case 'wait':
            parsedAttributes.delayPeriod = attributeKeywords[indexVal + 1];
            break;

          case 'move':
            parsedAttributes.displacementAmount = attributeKeywords[indexVal + 1];
            break;

          case 'ease':
            parsedAttributes.displacementAmount = attributeKeywords[indexVal + 1];
            parsedAttributes.animationEase = 'ease';
            break;

          case 'ease-in':
            if (attributeKeywords[indexVal + 1] == 'up' || attributeKeywords[indexVal + 1] == 'down') {
              parsedAttributes.scalingEffect.scaleDirection = attributeKeywords[indexVal + 1];
              parsedAttributes.scalingEffect.scaleMagnitude = attributeKeywords[indexVal + 2];
              parsedAttributes.animationEase = 'ease-in';
              break;
            }
            parsedAttributes.displacementAmount = attributeKeywords[indexVal + 1];
            parsedAttributes.animationEase = 'ease-in';
            break;

          case 'ease-in-out':
            if (attributeKeywords[indexVal + 1] == 'up' || attributeKeywords[indexVal + 1] == 'down') {
              parsedAttributes.scalingEffect.scaleDirection = attributeKeywords[indexVal + 1];
              parsedAttributes.scalingEffect.scaleMagnitude = attributeKeywords[indexVal + 2];
              parsedAttributes.animationEase = 'ease-in-out';
              break;
            }
            parsedAttributes.displacementAmount = attributeKeywords[indexVal + 1];
            parsedAttributes.animationEase = 'ease-in-out';
            break;

          case 'ease-out':
            if (attributeKeywords[indexVal + 1] == 'up' || attributeKeywords[indexVal + 1] == 'down') {
              parsedAttributes.scalingEffect.scaleDirection = attributeKeywords[indexVal + 1];
              parsedAttributes.scalingEffect.scaleMagnitude = attributeKeywords[indexVal + 2];
              parsedAttributes.animationEase = 'ease-out';
              break;
            }
            parsedAttributes.displacementAmount = attributeKeywords[indexVal + 1];
            parsedAttributes.animationEase = 'ease-out';
            break;

          case 'hustle':
            if (attributeKeywords[indexVal + 1] == 'up' || attributeKeywords[indexVal + 1] == 'down') {
              parsedAttributes.scalingEffect.scaleDirection = attributeKeywords[indexVal + 1];
              parsedAttributes.scalingEffect.scaleMagnitude = attributeKeywords[indexVal + 2];
              parsedAttributes.animationEase = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
              break;
            }
            parsedAttributes.displacementAmount = attributeKeywords[indexVal + 1];
            parsedAttributes.animationEase = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
            break;

          case 'over':
            parsedAttributes.durationPeriod = attributeKeywords[indexVal + 1];
            break;

          case 'flip':
          case 'pitch':
            parsedAttributes.rotationEffect = parsedAttributes.rotationEffect || {};
            parsedAttributes.rotationEffect.xAxisRotation = attributeKeywords[indexVal + 1];
            break;

          case 'spin':
          case 'yaw':
            parsedAttributes.rotationEffect = parsedAttributes.rotationEffect || {};
            parsedAttributes.rotationEffect.yAxisRotation = attributeKeywords[indexVal + 1];
            break;

          case 'roll':
            parsedAttributes.rotationEffect = parsedAttributes.rotationEffect || {};
            parsedAttributes.rotationEffect.zAxisRotation = attributeKeywords[indexVal + 1];
            break;

          case 'reset':
            if (attributeKeywords[indexVal - 1] == 'no') {
              parsedAttributes.resetOnHide = false;
            } else {
              parsedAttributes.resetOnHide = true;
            }
            break;

          case 'scale':
            parsedAttributes.scalingEffect = {}; // Ensure scale object exists.
            if (attributeKeywords[indexVal + 1] == 'up' || attributeKeywords[indexVal + 1] == 'down') {
              parsedAttributes.scalingEffect.scaleDirection = attributeKeywords[indexVal + 1];
              parsedAttributes.scalingEffect.scaleMagnitude = attributeKeywords[indexVal + 2];
              break;
            }
            parsedAttributes.scalingEffect.scaleMagnitude = attributeKeywords[indexVal + 1];
            break;

          default:
            return;
        }
      });

      // Merge default settings with parsed attributes.
      settings = objectMerger(settings, thisInstance.settings);
      settings = objectMerger(settings, parsedAttributes);

      // Determine the axis of movement based on entry direction.
      if (settings.entryDirection === 'top' || settings.entryDirection === 'bottom') {
        settings.movementAxis = 'Y';
      } else if (settings.entryDirection === 'left' || settings.entryDirection === 'right') {
        settings.movementAxis = 'X';
      }

      // Map 'hustle' to its cubic-bezier equivalent.
      if (settings.animationEase === 'hustle') {
        settings.animationEase = 'cubic-bezier( 0.6, 0.2, 0.1, 1 )';
      }

      // Adjust displacement amount to be negative for 'top' and 'left' entries.
      if (settings.entryDirection === 'top' || settings.entryDirection === 'left') {
        settings.displacementAmount = '-' + settings.displacementAmount;
      }

      return settings;
    },

    // Generates CSS style strings based on an element's configuration.
    // @param {object} domNode — An object from thisInstance.trackedElements.
    // @return {object} An object containing various style strings.
    generateElementStyles: function(domNode) {

      var inlineStyles;
      var initialStateStyles;
      var resetStyles;
      var targetStateStyles;
      var transitionProperties;

      var currentConfig = domNode.settings;
      // Calculate total animation duration including delay.
      var animationDuration = (parseFloat(currentConfig.durationPeriod) + parseFloat(currentConfig.delayPeriod)) * 1000;

      // Optional: uncomment to disable delay on mobile if mobile support is enabled.
      // if ( thisInstance.checkMobileDevice() && thisInstance.settings.mobileSupport ) currentConfig.delayPeriod = 0;

      // Preserve existing inline styles and ensure visibility.
      if (domNode.htmlNode.getAttribute('style')) {
        inlineStyles = domNode.htmlNode.getAttribute('style') + '; visibility: visible; ';
      } else {
        inlineStyles = 'visibility: visible; ';
      }

      // CSS for transitions to the target state.
      transitionProperties = '-webkit-transition: -webkit-transform ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' ' + currentConfig.delayPeriod + ', opacity ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' ' + currentConfig.delayPeriod + '; ' +
        'transition: transform ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' ' + currentConfig.delayPeriod + ', opacity ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' ' + currentConfig.delayPeriod + '; ' +
        '-webkit-perspective: 1000;' +
        '-webkit-backface-visibility: hidden;';

      // CSS for resetting animations quickly.
      resetStyles = '-webkit-transition: -webkit-transform ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' 0s, opacity ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' 0s; ' +
        'transition: transform ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' 0s, opacity ' + currentConfig.durationPeriod + ' ' + currentConfig.animationEase + ' 0s; ' +
        '-webkit-perspective: 1000; ' +
        '-webkit-backface-visibility: hidden; ';

      initialStateStyles = 'transform:';
      targetStateStyles = 'transform:';
      constructTransformStyles();

      // Duplicate for Webkit prefix.
      initialStateStyles += '-webkit-transform:';
      targetStateStyles += '-webkit-transform:';
      constructTransformStyles();

      return {
        transitionProperties: transitionProperties,
        initialStateStyles: initialStateStyles,
        targetStateStyles: targetStateStyles,
        reset: resetStyles,
        inlineStyles: inlineStyles,
        animationDuration: animationDuration
      };

      // Helper function to build initial and target transform styles.
      function constructTransformStyles() {

        // Apply translation if displacement is not zero.
        if (parseInt(currentConfig.displacementAmount) !== 0) {
          initialStateStyles += ' translate' + currentConfig.movementAxis + '(' + currentConfig.displacementAmount + ')';
          targetStateStyles += ' translate' + currentConfig.movementAxis + '(0)';
        }

        // Apply scaling if scale magnitude is not zero.
        if (parseInt(currentConfig.scalingEffect.scaleMagnitude) !== 0) {

          if (currentConfig.scalingEffect.scaleDirection === 'up') {
            currentConfig.scalingEffect.scaleValue = 1 - (parseFloat(currentConfig.scalingEffect.scaleMagnitude) * 0.01);
          } else if (currentConfig.scalingEffect.scaleDirection === 'down') {
            currentConfig.scalingEffect.scaleValue = 1 + (parseFloat(currentConfig.scalingEffect.scaleMagnitude) * 0.01);
          }

          initialStateStyles += ' scale(' + currentConfig.scalingEffect.scaleValue + ')';
          targetStateStyles += ' scale(1)';
        }

        // Apply rotations if specified.
        if (currentConfig.rotationEffect.xAxisRotation) {
          initialStateStyles += ' rotateX(' + currentConfig.rotationEffect.xAxisRotation + ')';
          targetStateStyles += ' rotateX(0)';
        }

        if (currentConfig.rotationEffect.yAxisRotation) {
          initialStateStyles += ' rotateY(' + currentConfig.rotationEffect.yAxisRotation + ')';
          targetStateStyles += ' rotateY(0)';
        }

        if (currentConfig.rotationEffect.zAxisRotation) {
          initialStateStyles += ' rotateZ(' + currentConfig.rotationEffect.zAxisRotation + ')';
          targetStateStyles += ' rotateZ(0)';
        }

        // Apply initial and target opacity.
        initialStateStyles += '; opacity: ' + currentConfig.initialOpacity + '; ';
        targetStateStyles += '; opacity: 1; ';
      }
    },

    // Retrieves the height of the viewport or scroll container.
    getVisibleAreaHeight: function() {

      var clientDimension = thisInstance.settings.scrollContainer['clientHeight'];
      var innerDimension = contextWindow['innerHeight'];

      if (thisInstance.settings.scrollContainer === docObject.htmlElement) {
        return (clientDimension < innerDimension) ? innerDimension : clientDimension;
      }

      return clientDimension;
    },

    // Gets the current vertical scroll position.
    getScrollYPosition: function() {
      if (thisInstance.settings.scrollContainer === docObject.htmlElement) {
        return contextWindow.pageYOffset;
      } else {
        return thisInstance.settings.scrollContainer.scrollTop + thisInstance.settings.scrollContainer.offsetTop;
      }
    },

    // Calculates the total offset (top and left) of an element relative to the document.
    getElementOffset: function(currentElement) {

      var topOffsetVal = 0;
      var leftOffsetVal = 0;

      do {
        if (!isNaN(currentElement.offsetTop)) {
          topOffsetVal += currentElement.offsetTop;
        }
        if (!isNaN(currentElement.offsetLeft)) {
          leftOffsetVal += currentElement.offsetLeft;
        }
      } while (currentElement = currentElement.offsetParent);

      return {
        topCoordinate: topOffsetVal,
        leftCoordinate: leftOffsetVal
      };
    },

    // Determines if an element is currently within the visible viewport.
    checkVisibilityInViewport: function(domNode) {

      var elementHeight = domNode.htmlNode.offsetHeight;
      var elementTopPosition = thisInstance.getElementOffset(domNode.htmlNode).topCoordinate;
      var elementBottomPosition = elementTopPosition + elementHeight;
      var visibilityRatio = domNode.settings.visibilityThreshold || 0;
      var viewportHeight = thisInstance.getVisibleAreaHeight();
      var currentScroll = thisInstance.getScrollYPosition();

      // Check if the element's bottom is below the scroll top + a fraction of viewport height.
      var topCondition = elementBottomPosition > currentScroll + (viewportHeight * visibilityRatio);
      // Check if the element's top is above the scroll top + (viewport height - a fraction of viewport height).
      var bottomCondition = elementTopPosition < currentScroll + (viewportHeight - (viewportHeight * visibilityRatio));

      return topCondition && bottomCondition;
    },

    // Detects if the user agent indicates a mobile device.
    checkMobileDevice: function() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    },

    // Verifies browser support for CSS transitions.
    checkSupportCompatibility: function() {
      var htmlElement = docObject.documentElement;
      var bodyElement = docObject.body;

      return ('WebkitTransition' in htmlElement.style ||
        'MozTransition' in htmlElement.style ||
        'OTransition' in htmlElement.style ||
        'transition' in htmlElement.style);
    },

    // Removes all attached event listeners and resets internal state.
    cleanupSystem: function() {
      if (thisInstance.settings.scrollContainer === docObject.htmlElement) {
        contextWindow.removeEventListener('scrollEvent', eventProcessor);
        contextWindow.removeEventListener('resizeEvent', eventProcessor);
      } else {
        thisInstance.settings.scrollContainer.removeEventListener('scrollEvent', eventProcessor);
      }
    },

    // The primary event handler, throttles animation processing.
    eventProcessor: function() {
      if (!thisInstance.processingLocked) {
        thisInstance.processingLocked = true;
        animationRequester(function() {
          thisInstance.processAnimations();
        });
      }
    }
  };

  // Polyfill for requestAnimationFrame for smoother animations.
  animationRequester = contextWindow.requestAnimationFrame ||
    contextWindow.webkitRequestAnimationFrame ||
    contextWindow.mozRequestAnimationFrame ||
    function(callback) {
      contextWindow.setTimeout(callback, 1000 / 60); // Fallback to setTimeout.
    };

  // Utility to deep merge properties from source objects into a target object.
  objectMerger = function(targetObj, sourceObj) {
    targetObj = targetObj || {};
    for (var prop in sourceObj) {
      if (typeof sourceObj[prop] === 'object' && sourceObj[prop] !== null && !Array.isArray(sourceObj[prop])) { // Ensure it's a plain object.
        targetObj[prop] = objectMerger(targetObj[prop], sourceObj[prop]);
      } else {
        targetObj[prop] = sourceObj[prop];
      }
    }
    return targetObj;
  };

  // Assign the event processor variable to the prototype method.
  // This assignment occurs after the prototype is fully defined.
  eventProcessor = revealElements.instanceMethods.eventProcessor;

  // Expose the main function globally.
  contextWindow.revealElements = revealElements;
  return revealElements;

})(globalWindow);
}));