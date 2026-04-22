/*
 * MagnifyLens.js - jQuery plugin for image magnification
 * Project Home: http://magnifylens.com (hypothetical new URL)
 *
 * Copyright (c) 2023 Advanced Imaging Solutions (hypothetical new entity)
 * Licensed under the Apache 2.0 License (hypothetical new license)
 *
 * Built upon the jQuery library
 * http://jquery.com
 *
 * Refactored and enhanced by AI Development Team.
 * Logic streamlined and performance optimized for modern browsers.
 */

(function($) {

  'use strict';

  // @namespace zoomStateRegistry - Stores configuration and runtime data for each magnifier instance.
  var zoomStateRegistry = {
    instanceCounter: 0, // Tracks the number of active magnifier instances.
    lastPointerPosition: null // Stores the last known pointer coordinates.
  };

  /**
   * @function $.fn.magnifyImage - jQuery plugin for interactive image magnification.
   * @param {string} activationEvent - The DOM event that triggers magnification (e.g., 'click', 'mouseover').
   * @param {object} configSettings - Configuration object to customize magnifier behavior.
   */
  $.fn.magnifyImage = function(activationEvent, configSettings) {

    // Default configuration values, overridden by user-provided settings.
    var baseOptions = {
      lensDiameter: 200, // Size of the circular/square magnification lens.
      circularLens: true, // If true, the lens is circular; otherwise, it's square.
      applyHighlight: true, // Adds a reflective glare effect to the lens.
      activateOnClick: false, // If true, magnification is toggled by clicking instead of hovering.
      imageSourceAttribute: 'href', // HTML attribute on the target element containing the high-res image URL.
      lensBorderStyling: '5px solid #999', // CSS border style for the magnifier lens.
      onLensInitialize: null, // Callback function executed when the lens is first set up.
      onMagnifyStart: null, // Callback function executed when magnification begins.
      onMagnifyEnd: null, // Callback function executed when magnification ends.
      fixedLensPosition: false, // If true, the lens stays at a fixed position on the screen.
      fixedOffsetX: 0, // X-coordinate for fixed lens position.
      fixedOffsetY: 0 // Y-coordinate for fixed lens position.
    };

    // Detect touch device capabilities.
    var isTouchDevice = (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch));

    // Detect CSS transform support for smoother animations.
    var supportsTransforms = (function() {
      var bodyStyle = document.body || document.documentElement,
        styleProperty = bodyStyle.style,
        transformProp = 'transform',
        vendorPrefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];

      if (typeof styleProperty[transformProp] === 'string') {
        return true;
      }

      // Check for vendor-prefixed properties.
      transformProp = transformProp.charAt(0).toUpperCase() + transformProp.substr(1);
      for (var k = 0; k < vendorPrefixes.length; k++) {
        if (typeof styleProperty[vendorPrefixes[k] + transformProp] === 'string') {
          return true;
        }
      }
      return false;
    })();

    // Determine the primary event for activation based on device type.
    var primaryActivationEvent = (isTouchDevice) ? 'touchstart' : 'click';

    /*
     * @namespace helperFunctions - A collection of utility methods for calculations and styling.
     */
    var helperFunctions = {
      coordinateCalculations: {
        /**
         * @method boundaryLimit - Calculates a boundary stop point for collision detection.
         * @param {number} currentPosition - Thumbnail image's position.
         * @param {number} lensSize - Size of the magnifier element.
         * @param {number} borderOffset - Size of the border to offset.
         * @param {number} initialStop - Initial stop position.
         * @returns {number} The calculated boundary limit.
         */
        boundaryLimit: function(currentPosition, lensSize, borderOffset, initialStop) {
          return (currentPosition - lensSize - borderOffset) + initialStop;
        },
        /**
         * @method relativePointerPosition - Calculates the pointer's position relative to an element.
         * @param {number} pageCoordinate - Page X or Y coordinate of the pointer.
         * @param {number} elementOffset - Offset of the target element from the page.
         * @param {number} halfLensSize - Half the size of the magnification lens.
         * @returns {number} The relative coordinate.
         */
        relativePointerPosition: function(pageCoordinate, elementOffset, halfLensSize) {
          return pageCoordinate - elementOffset - halfLensSize;
        },
        /**
         * @method magnifierOffset - Calculates the background position offset for the magnified image.
         * @param {number} pageCoordinate - Page X or Y coordinate of the pointer.
         * @param {number} elementOffset - Offset of the target element from the page.
         * @param {number} magnificationRatio - Ratio of magnification.
         * @param {number} halfLensSize - Half the size of the magnification lens.
         * @param {number} borderSize - Size of the lens border.
         * @returns {number} The background offset.
         */
        magnifierOffset: function(pageCoordinate, elementOffset, magnificationRatio, halfLensSize, borderSize) {
          return ((pageCoordinate - elementOffset) / magnificationRatio) - halfLensSize + borderSize;
        }
      },
      /**
       * @method generateStyleObject - Compiles a CSS object for lens positioning and background.
       * @param {number[]} positionData - Array containing [backgroundX, backgroundY, lensX, lensY].
       * @param {object} currentConfig - The current configuration settings including fixed position.
       * @param {boolean} useTransforms - Flag indicating if CSS transforms should be used.
       * @returns {object} A CSS properties object.
       */
      generateStyleObject: function(positionData, currentConfig, useTransforms) {
        if (!positionData || positionData.length === 0) {
          return {};
        }

        let bgX = positionData[0];
        let bgY = positionData[1];
        let lensX = positionData[2];
        let lensY = positionData[3];

        // Apply fixed position offsets if enabled.
        if (currentConfig.fixedLensPosition) {
          lensX = currentConfig.fixedOffsetX;
          lensY = currentConfig.fixedOffsetY;
        }

        let transformValue = `translate3d(${lensX}px, ${lensY}px, 0)`;
        let movementStyles = useTransforms ? {
          '-webkit-transform': transformValue,
          '-moz-transform': transformValue,
          '-ms-transform': transformValue,
          '-o-transform': transformValue,
          'transform': transformValue
        } : {
          'top': lensY + 'px',
          'left': lensX + 'px'
        };

        return $.extend({
          'backgroundPosition': `-${bgX}px -${bgY}px`
        }, movementStyles);
      },
      /**
       * @method aspectRatio - Calculates the aspect ratio.
       * @param {number} dimension1 - First dimension.
       * @param {number} dimension2 - Second dimension.
       * @returns {number} The aspect ratio.
       */
      aspectRatio: function(dimension1, dimension2) {
        return dimension1 / dimension2;
      },
      /**
       * @method initializeLensParameters - Sets up various size and stop parameters for a magnifier instance.
       * @param {jQuery} magnifierElement - The jQuery object for the magnifier lens.
       * @param {object} instanceData - The data object for the current magnifier instance.
       * @param {object} currentConfig - The current configuration settings.
       */
      initializeLensParameters: function(magnifierElement, instanceData, currentConfig) {
        let instanceId = magnifierElement.attr('data-magnify-id');
        let dataRef = zoomStateRegistry[instanceId];

        // Ensure dataRef and its properties are initialized.
        dataRef.dimensions = dataRef.dimensions || {};
        dataRef.boundaries = dataRef.boundaries || {};

        dataRef.dimensions.fullLens = currentConfig.lensDiameter + (dataRef.lensInfo.borderThickness * 2);
        dataRef.dimensions.halfLens = dataRef.dimensions.fullLens / 2;
        dataRef.dimensions.ratioX = helperFunctions.aspectRatio(dataRef.baseImage.width, dataRef.lensInfo.magnifiedWidth);
        dataRef.dimensions.ratioY = helperFunctions.aspectRatio(dataRef.baseImage.height, dataRef.lensInfo.magnifiedHeight);
        dataRef.dimensions.lensMaxX = dataRef.lensInfo.magnifiedWidth - dataRef.dimensions.fullLens;
        dataRef.dimensions.lensMaxY = dataRef.lensInfo.magnifiedHeight - dataRef.dimensions.fullLens;

        let initialBoundary = dataRef.dimensions.halfLens - (dataRef.dimensions.halfLens * dataRef.dimensions.ratioX) - (dataRef.lensInfo.borderThickness * dataRef.dimensions.ratioX) + dataRef.lensInfo.borderThickness;
        dataRef.boundaries.main = initialBoundary;
        dataRef.boundaries.right = helperFunctions.coordinateCalculations.boundaryLimit(dataRef.baseImage.width, dataRef.dimensions.fullLens, dataRef.lensInfo.borderThickness, initialBoundary);
        dataRef.boundaries.bottom = helperFunctions.coordinateCalculations.boundaryLimit(dataRef.baseImage.height, dataRef.dimensions.fullLens, dataRef.lensInfo.borderThickness, initialBoundary);
      }
    };

    /*
     * @namespace interactionHandlers - Manages user interactions and lens behavior.
     */
    var interactionHandlers = {
      /**
       * @method detectBoundsOverlap - Determines which boundary region the pointer is currently in.
       * @param {number} pointerX - Relative X position of the pointer.
       * @param {number} pointerY - Relative Y position of the pointer.
       * @param {object} instanceData - The data object for the current magnifier instance.
       * @returns {number} An index representing the collision region (0-8).
       */
      detectBoundsOverlap: function(pointerX, pointerY, instanceData) {
        let mainStop = instanceData.boundaries.main;
        let rightStop = instanceData.boundaries.right;
        let bottomStop = instanceData.boundaries.bottom;

        // Simplified boolean checks for boundaries
        let isLeft = pointerX < -mainStop;
        let isRight = pointerX >= rightStop;
        let isTop = pointerY < -mainStop;
        let isBottom = pointerY >= bottomStop;

        if (!isLeft && !isRight && !isTop && !isBottom) return 0; // Center
        if (isLeft && !isTop && !isBottom) return 1; // Left Side
        if (isLeft && isTop) return 2; // Top Left Corner
        if (isLeft && isBottom) return 3; // Bottom Left Corner
        if (!isLeft && !isRight && isTop) return 4; // Top Side
        if (isRight && isTop) return 5; // Top Right Corner
        if (isRight && !isTop && !isBottom) return 6; // Right Side
        if (isRight && isBottom) return 7; // Bottom Right Corner
        if (!isLeft && !isRight && isBottom) return 8; // Bottom Side

        // Fallback or unexpected scenario, though theoretically covered by above.
        return -1;
      },

      /**
       * @method resolveBoundaryMovement - Provides the correct background and lens positions based on collision index.
       * @param {number} collisionIndex - The index returned by detectBoundsOverlap.
       * @param {object} instanceData - The data object for the current magnifier instance.
       * @param {number} currentLensX - The calculated lens X position without collision adjustment.
       * @param {number} currentLensY - The calculated lens Y position without collision adjustment.
       * @param {number} currentPointerX - The calculated pointer X position without collision adjustment.
       * @param {number} currentPointerY - The calculated pointer Y position without collision adjustment.
       * @returns {number[]} An array [backgroundX, backgroundY, lensX, lensY].
       */
      resolveBoundaryMovement: function(collisionIndex, instanceData, currentLensX, currentLensY, currentPointerX, currentPointerY) {
        let maxLensX = instanceData.dimensions.lensMaxX;
        let maxLensY = instanceData.dimensions.lensMaxY;
        let mainBoundary = instanceData.boundaries.main;
        let rightBoundary = instanceData.boundaries.right;
        let bottomBoundary = instanceData.boundaries.bottom;

        // Use a switch statement for clearer mapping than an object literal.
        switch (collisionIndex) {
          case 0:
            return [currentLensX, currentLensY, currentPointerX, currentPointerY]; // Center
          case 1:
            return [0, currentLensY, -mainBoundary, currentPointerY]; // Left Side
          case 2:
            return [0, 0, -mainBoundary, -mainBoundary]; // Top Left
          case 3:
            return [0, maxLensY, -mainBoundary, bottomBoundary]; // Bottom Left
          case 4:
            return [currentLensX, 0, currentPointerX, -mainBoundary]; // Top Side
          case 5:
            return [maxLensX, 0, rightBoundary, -mainBoundary]; // Top Right
          case 6:
            return [maxLensX, currentLensY, rightBoundary, currentPointerY]; // Right Side
          case 7:
            return [maxLensX, maxLensY, rightBoundary, bottomBoundary]; // Bottom Right
          case 8:
            return [currentLensX, maxLensY, currentPointerX, bottomBoundary]; // Bottom Side
          default:
            return [currentLensX, currentLensY, currentPointerX, currentPointerY]; // Fallback to center or current
        }
      },

      /**
       * @method updateLensPosition - Calculates and applies the new position for the magnifier lens.
       * @param {jQuery} targetElement - The main element (e.g., anchor tag wrapping img).
       * @param {jQuery} magnifierElement - The magnifier lens element.
       * @param {object} eventObject - The mousemove or touchmove event object.
       */
      updateLensPosition: function(targetElement, magnifierElement, eventObject) {
        let instanceId = magnifierElement.attr('data-magnify-id');
        let instanceData = zoomStateRegistry[instanceId];

        if (!instanceData || !instanceData.dimensions || !instanceData.baseImage) {
          // Guard clause: essential data not available.
          console.warn('MagnifyLens: Magnifier data missing for instance:', instanceId);
          return;
        }

        let elementOffset = targetElement.offset();
        let touchAdjustY = (isTouchDevice) ? -70 : 0; // Vertical offset for touch events.

        // Get actual event coordinates, considering touch events.
        let pageX = eventObject.pageX;
        let pageY = eventObject.pageY;

        if (eventObject.originalEvent && eventObject.originalEvent.touches && eventObject.originalEvent.touches[0]) {
            pageX = eventObject.originalEvent.touches[0].pageX;
            pageY = eventObject.originalEvent.touches[0].pageY;
        }

        // Calculate raw pointer and lens positions.
        let rawPointerX = helperFunctions.coordinateCalculations.relativePointerPosition(pageX, elementOffset.left, instanceData.dimensions.halfLens);
        let rawPointerY = helperFunctions.coordinateCalculations.relativePointerPosition(pageY + touchAdjustY, elementOffset.top, instanceData.dimensions.halfLens);
        let rawLensX = helperFunctions.coordinateCalculations.magnifierOffset(pageX, elementOffset.left, instanceData.dimensions.ratioX, instanceData.dimensions.halfLens, instanceData.lensInfo.borderThickness);
        let rawLensY = helperFunctions.coordinateCalculations.magnifierOffset(pageY + touchAdjustY, elementOffset.top, instanceData.dimensions.ratioY, instanceData.dimensions.halfLens, instanceData.lensInfo.borderThickness);

        // Detect collision region.
        let collisionRegionIndex = interactionHandlers.detectBoundsOverlap(rawPointerX, rawPointerY, instanceData);

        // Resolve positions based on collision.
        let finalPositions = interactionHandlers.resolveBoundaryMovement(collisionRegionIndex, instanceData, rawLensX, rawLensY, rawPointerX, rawPointerY);

        // Compile and apply CSS.
        let computedStyles = helperFunctions.generateStyleObject(finalPositions, instanceData.config, supportsTransforms);
        magnifierElement.css(computedStyles);
      },

      /**
       * @method toggleDisplayClasses - Adds or removes a class on the target element based on magnifier state.
       * @param {jQuery} targetElement - The main element (e.g., anchor tag wrapping img).
       */
      toggleDisplayClasses: function(targetElement) {
        let instanceId = targetElement.find('.magnify-lens').attr('data-magnify-id');
        let instanceData = zoomStateRegistry[instanceId];

        if (instanceData.currentState === 0 || instanceData.currentState === null) {
          targetElement.removeClass('magnify-inactive');
        } else {
          targetElement.addClass('magnify-inactive');
        }
      },

      /**
       * @method activateMagnifier - Initiates the magnification process.
       * @param {jQuery} targetElement - The main element.
       * @param {jQuery} magnifierElement - The magnifier lens.
       */
      activateMagnifier: function(targetElement, magnifierElement) {
        let instanceId = magnifierElement.attr('data-magnify-id');
        let instanceData = zoomStateRegistry[instanceId];
        instanceData.currentState = 1; // Set state to active.
        magnifierElement.css('visibility', 'visible');
        interactionHandlers.toggleDisplayClasses(targetElement);
        interactionHandlers.executeCustomCallback(instanceData.config.onMagnifyStart, instanceData);
      },

      /**
       * @method deactivateMagnifier - Halts the magnification process.
       * @param {jQuery} targetElement - The main element.
       * @param {jQuery} magnifierElement - The magnifier lens.
       * @param {boolean} permanentStop - If true, resets the state completely.
       */
      deactivateMagnifier: function(targetElement, magnifierElement, permanentStop) {
        let instanceId = magnifierElement.attr('data-magnify-id');
        let instanceData = zoomStateRegistry[instanceId];
        if (permanentStop) {
          instanceData.currentState = null; // Reset state.
        } else {
          instanceData.currentState = 0; // Set state to inactive but ready.
        }
        magnifierElement.css('visibility', 'hidden');
        interactionHandlers.toggleDisplayClasses(targetElement);
        interactionHandlers.executeCustomCallback(instanceData.config.onMagnifyEnd, instanceData);
      },

      /**
       * @method executeCustomCallback - Executes a user-defined callback function.
       * @param {Function} callbackFn - The actual callback function to execute.
       * @param {object} instanceData - The data object for the magnifier instance.
       */
      executeCustomCallback: function(callbackFn, instanceData) {
        if (typeof callbackFn === 'function') {
          // Pass a cloned and extended version of the instance data to avoid direct modification.
          let callbackData = $.extend(true, {}, instanceData, {
            currentPointerPosition: zoomStateRegistry.lastPointerPosition
          });
          callbackFn(callbackData);
        }
      }
    };

    /*
     * @namespace visualStyling - Handles all CSS-related aspects of the magnifier.
     */
    var visualStyling = {
      /**
       * @method computeBorderRadius - Determines the border-radius for the lens.
       * @param {boolean} isGlaring - Indicates if glare is applied.
       * @returns {string} CSS border-radius value.
       */
      computeBorderRadius: function(isGlaring) {
        return (!configSettings.circularLens) ? '0' : (isGlaring === undefined) ? '50%' : configSettings.lensDiameter / 2 + 'px ' + configSettings.lensDiameter / 2 + 'px 0px 0px';
      },

      /**
       * @method applyGlareEffect - Styles the glare element within the magnifier lens.
       * @param {jQuery} magnifierElement - The magnifier lens element.
       * @param {object} currentConfig - The current configuration settings.
       */
      applyGlareEffect: function(magnifierElement, currentConfig) {
        magnifierElement
          .children('span.magnify-glare')
          .css({
            height: currentConfig.lensDiameter / 2,
            width: currentConfig.lensDiameter - 10,
            margin: '5px auto',
            'border-radius': visualStyling.computeBorderRadius(true)
          });
      },

      /**
       * @method parseBorderString - Parses the border CSS string to extract thickness.
       * @param {string} borderStyleString - The CSS border string (e.g., "5px solid #999").
       * @returns {object} An object containing the full border string and its thickness.
       */
      parseBorderString: function(borderStyleString) {
        let cleanedString = $.trim(borderStyleString);
        let parts = cleanedString.split(' ');
        let thickness = 0;

        // Attempt to parse the first part as a number (e.g., "5px").
        if (parts.length > 0) {
          let numericalValue = parseFloat(parts[0]);
          if (!isNaN(numericalValue) && numericalValue > 0) {
            thickness = numericalValue;
          }
        }
        return {
          fullStyle: cleanedString,
          thickness: thickness
        };
      },

      /**
       * @method applyInitialStyles - Applies initial CSS properties to the target and magnifier elements.
       * @param {jQuery} targetElement - The main element (e.g., anchor tag wrapping img).
       * @param {jQuery} magnifierElement - The magnifier lens element.
       * @param {object} instanceData - The data object for the current magnifier instance.
       * @param {object} currentConfig - The current configuration settings.
       */
      applyInitialStyles: function(targetElement, magnifierElement, instanceData, currentConfig) {
        let baseImage = targetElement.children('img');

        let parsedBorder = visualStyling.parseBorderString(currentConfig.lensBorderStyling);

        // Collect margin and float styles from the base image.
        let inheritedStyles = {
          'marginTop': baseImage.css('margin-top'),
          'marginRight': baseImage.css('margin-right'),
          'marginBottom': baseImage.css('margin-bottom'),
          'marginLeft': baseImage.css('margin-left'),
          'float': baseImage.css('float')
        };

        // If no explicit float, check parent for text-align: center.
        if (inheritedStyles['float'] === 'none') {
          let parentAlign = targetElement.parent('*:first').css('text-align');
          if (parentAlign === 'center') {
            inheritedStyles.marginRight = 'auto';
            inheritedStyles.marginLeft = 'auto';
          }
        }

        // Essential styles for the target wrapper.
        let wrapperBaseStyles = {
          'display': 'block',
          'height': baseImage.height(),
          'width': baseImage.width(),
          'position': 'relative'
        };

        // Store combined styles in instance data for later use.
        instanceData.baseImage.wrapperStyles = $.extend({}, inheritedStyles, wrapperBaseStyles);

        // Apply styles to the magnifier lens itself.
        magnifierElement.css({
          height: currentConfig.lensDiameter,
          width: currentConfig.lensDiameter,
          top: 0,
          left: 0,
          'border-radius': visualStyling.computeBorderRadius(false),
          border: parsedBorder.fullStyle
        });

        // Specific style adjustments if glare is not applied.
        if (!currentConfig.applyHighlight) {
          let innerLensSize = currentConfig.lensDiameter - 10;
          magnifierElement.children('span.magnify-glare').css({
            height: innerLensSize,
            width: innerLensSize
          });
        }

        // Reset margin on the original image to prevent double-margin issues.
        baseImage.css('margin', '0px');

        // Apply wrapper styles after image dimensions are known.
        // Use a more robust image load detection.
        baseImage.one("load.magnify", function() {
          targetElement.css(instanceData.baseImage.wrapperStyles);
          // If a wrapper div was created, apply styles to it too.
          if (targetElement.parent('.magnify-wrapper').length) {
            targetElement.parent('.magnify-wrapper').css(instanceData.baseImage.wrapperStyles);
          }
        }).each(function() {
          if (this.complete) {
            $(this).trigger("load.magnify");
          }
        });

        // Store border thickness in instance data.
        instanceData.lensInfo.borderThickness = parsedBorder.thickness;
      }
    };

    /*
     * @namespace domConstruction - Manages the creation and manipulation of DOM elements.
     */
    var domConstruction = {
      /**
       * @method preloadMagnifiedImage - Loads the high-resolution image and sets up the magnifier's background.
       * @param {string} imageUrl - The URL of the high-resolution image.
       * @param {jQuery} magnifierElement - The magnifier lens element.
       * @param {Function} completionCallback - Callback to execute once the image is loaded and processed.
       */
      preloadMagnifiedImage: function(imageUrl, magnifierElement, completionCallback) {
        let instanceId = magnifierElement.attr('data-magnify-id');
        let instanceData = zoomStateRegistry[instanceId];

        // Hide magnifier temporarily while loading to prevent visual glitches.
        magnifierElement.show().css({
          top: '-9999px',
          left: '-9999px'
        });

        // Check if the image source is already set to avoid unnecessary reloads.
        // If not, or if it's different, load the new image.
        if (magnifierElement.css('background-image').indexOf(imageUrl) === -1) {
          let tempImage = new Image();
          $(tempImage).one('load', function() {
            // Store magnified image dimensions.
            instanceData.lensInfo.magnifiedWidth = tempImage.width;
            instanceData.lensInfo.magnifiedHeight = tempImage.height;

            // Append glare span if configured, and remove any placeholder img.
            if (instanceData.config.applyHighlight) {
              magnifierElement.append('<span class="magnify-glare"/>');
            }
            magnifierElement
              .css({
                'background-image': `url('${imageUrl}')`,
                top: '0px',
                left: '0px',
                visibility: 'hidden'
              })
              .find('img')
              .remove(); // Remove any temporary image element.

            // Apply glare styling.
            visualStyling.applyGlareEffect(magnifierElement, instanceData.config);

            // Initialize lens parameters based on loaded image dimensions.
            helperFunctions.initializeLensParameters(magnifierElement, instanceData, instanceData.config);

            // Execute callback.
            if (typeof completionCallback === 'function') {
              completionCallback();
            }
          }).attr('src', imageUrl); // Set src to start loading.
        } else {
          // If image is already loaded and set, just proceed.
          magnifierElement.css({
            top: '0px',
            left: '0px',
            visibility: 'hidden'
          });
          helperFunctions.initializeLensParameters(magnifierElement, instanceData, instanceData.config);
          if (typeof completionCallback === 'function') {
            completionCallback();
          }
        }
      },

      /**
       * @method createMagnifierElement - Creates and appends the magnifier lens element to the DOM.
       * @param {jQuery} targetElement - The jQuery object of the element to magnify.
       * @param {number} instanceId - A unique identifier for this magnifier instance.
       * @param {object} currentConfig - The configuration settings for this instance.
       * @returns {jQuery} The created magnifier lens element.
       */
      createMagnifierElement: function(targetElement, instanceId, currentConfig) {
        // Initialize instance data in the registry.
        let instanceData = {
          currentState: null, // Initial state: null (uninitialized/off)
          instanceIndex: instanceId,
          config: currentConfig, // Store the specific config for this instance.
          baseImage: {
            width: targetElement.children('img').width(),
            height: targetElement.children('img').height(),
            wrapperStyles: {}
          },
          lensInfo: {
            borderThickness: 0,
            magnifiedWidth: 0,
            magnifiedHeight: 0
          },
          dimensions: {},
          boundaries: {}
        };
        zoomStateRegistry[instanceId] = instanceData;
        zoomStateRegistry.instanceCounter++; // Increment global counter.

        // Determine the high-resolution image URL.
        let highResImageUrl = targetElement.attr(currentConfig.imageSourceAttribute) || targetElement.attr('href');

        if (!highResImageUrl) {
            console.error('MagnifyLens: High-resolution image URL not found. Check imageSourceAttribute or href attribute.');
            return null;
        }

        // Create the magnifier lens element.
        let magnifier = $('<div/>', {
          'class': 'magnify-lens',
          'data-magnify-id': instanceId
        });

        // Append to the target element (which is typically an anchor wrapping the image).
        targetElement.append(magnifier);

        // Preload the image and apply styles.
        domConstruction.preloadMagnifiedImage(highResImageUrl, magnifier, function() {
          visualStyling.applyInitialStyles(targetElement, magnifier, instanceData, currentConfig);
          interactionHandlers.executeCustomCallback(currentConfig.onLensInitialize, instanceData);
        });

        return magnifier;
      }
    };

    // Main plugin execution loop for each selected element.
    return this.each(function() {
      let currentTarget = $(this);
      let instanceId = 'magnify_' + zoomStateRegistry.instanceCounter;

      // Merge defaults with instance-specific options.
      let currentInstanceConfig = $.extend({}, baseOptions, configSettings);

      // Create the magnifier lens and initialize its data.
      let magnifierLens = domConstruction.createMagnifierElement(currentTarget, instanceId, currentInstanceConfig);

      if (!magnifierLens) {
        return; // Skip if magnifier creation failed (e.g., no image URL).
      }

      // Helper function to bind events with correct context.
      const bindMagnifierEvents = function() {
        if (currentInstanceConfig.activateOnClick) {
          currentTarget.on(primaryActivationEvent + '.magnify', function(e) {
            e.preventDefault(); // Prevent default link behavior.
            let instanceData = zoomStateRegistry[instanceId];
            if (instanceData.currentState === 1) { // If active, deactivate.
              interactionHandlers.deactivateMagnifier(currentTarget, magnifierLens, false);
            } else { // If inactive, activate.
              interactionHandlers.activateMagnifier(currentTarget, magnifierLens);
              interactionHandlers.updateLensPosition(currentTarget, magnifierLens, e);
            }
          });
        } else { // Hover/touch behavior.
          currentTarget.on('mouseenter.magnify touchstart.magnify', function(e) {
            e.preventDefault();
            interactionHandlers.activateMagnifier(currentTarget, magnifierLens);
          });
          currentTarget.on('mousemove.magnify touchmove.magnify', function(e) {
            e.preventDefault();
            zoomStateRegistry.lastPointerPosition = {
              x: e.pageX,
              y: e.pageY
            }; // Store last position.
            interactionHandlers.updateLensPosition(currentTarget, magnifierLens, e);
          });
          currentTarget.on('mouseleave.magnify touchend.magnify', function(e) {
            e.preventDefault();
            interactionHandlers.deactivateMagnifier(currentTarget, magnifierLens, false);
          });
        }

        // Global click handler to deactivate if clickable and clicked outside.
        if (currentInstanceConfig.activateOnClick) {
            $(document).on('click.magnify-global', function(e) {
                if (!$(e.target).closest(currentTarget).length && zoomStateRegistry[instanceId].currentState === 1) {
                    interactionHandlers.deactivateMagnifier(currentTarget, magnifierLens, false);
                }
            });
        }
      };

      bindMagnifierEvents();

      // Ensure the original image is hidden, and the wrapper is displayed block.
      currentTarget.children('img').css('opacity', 0);
      currentTarget.css('display', 'block');
    });
  };

})(jQuery);