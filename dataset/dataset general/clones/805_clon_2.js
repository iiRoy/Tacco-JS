/*
 *  AngularJS Slider Component
 *
 *  Edition: 0.0.13
 *
 *  Author: Daniel Crisp, danielcrisp.com
 *
 *  This slider component is styled to align with the default form element
 *  appearance provided by Twitter's Bootstrap framework.
 *
 *  Initially derived from https://github.com/leongersen/noUiSlider
 *
    This code is released under the MIT Licence - http://opensource.org/licenses/MIT

    Copyright (c) 2013 Daniel Crisp

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

*/

(function() {
  'use strict';

  // Determine if older Angular versions require specific handling
  const oldVersionCheck = (angular.version.major === 1 && angular.version.minor === 0);

  /**
   * ValueSlider, enables users to select a value range via interactive handles.
   * Optimized for touch input.
   * @component
   */
  angular.module('ui-rangeSlider', [])
  .directive('rangeSlider', ['$document', '$filter', '$log', function($docRef, $dataFilter, $logger) {

    // Define the event identifier for this component.
    const evtNameSpace = '.valueSlider',

      configSettings = {
        isDisabled: false,
        layoutOrientation: 'horizontal',
        stepIncrement: 0,
        decimalPrecision: 0,
        displayCurrentValues: true,
        preventMinMaxEquality: false,
        attachValueDisplaysToHandles: false
      },

      // Identify suitable events to bind based on browser capabilities.
      // IE11's pointerEvents implementation differs from IE10.
      /** @const */
      inputTriggers = window.navigator.pointerEnabled ? {
        start: 'pointerdown',
        move: 'pointermove',
        end: 'pointerup',
        over: 'pointerdown',
        out: 'mouseout'
      } : window.navigator.msPointerEnabled ? {
        start: 'MSPointerDown',
        move: 'MSPointerMove',
        end: 'MSPointerUp',
        over: 'MSPointerDown',
        out: 'mouseout'
      } : {
        start: 'mousedown touchstart',
        move: 'mousemove touchmove',
        end: 'mouseup touchend',
        over: 'mouseover touchstart',
        out: 'mouseout'
      },

      startTrigger = inputTriggers.start + evtNameSpace,
      dragTrigger = inputTriggers.move + evtNameSpace,
      releaseTrigger = inputTriggers.end + evtNameSpace,
      hoverTrigger = inputTriggers.over + evtNameSpace,
      leaveTrigger = inputTriggers.out + evtNameSpace,

      // Retrieve standardized clientX and clientY coordinates from an event.
      pointerCoords = function(eventObject) {
        try {
          return [
            (eventObject.clientX || eventObject.originalEvent.clientX || eventObject.originalEvent.touches[0].clientX),
            (eventObject.clientY || eventObject.originalEvent.clientY || eventObject.originalEvent.touches[0].clientY)
          ];
        } catch (err) {
          return ['x', 'y'];
        }
      },

      // Normalizes a given value to be within the 0-100 range.
      constrainValue = function(inputVal) {
        return (inputVal < 0 ? 0 : (inputVal > 100 ? 100 : inputVal));
      },

      // Checks if a variable holds a valid numeric value.
      isNumeric = function(valToCheck) {
        return !isNaN(parseFloat(valToCheck)) && isFinite(valToCheck);
      },

      scopeProps = {
        isDisabled: '=?',
        minimumValue: '=',
        maximumValue: '=',
        modelMinimum: '=?',
        modelMaximum: '=?',
        onGripPress: '&', // Invokes an optional function when a handle is activated.
        onGripRelease: '&', // Invokes an optional function when a handle is de-activated.
        layoutOrientation: '@', // Available options: horizontal | vertical | vertical left | vertical right
        stepIncrement: '@',
        decimalPrecision: '@',
        dataFilter: '@',
        filterParameters: '@',
        displayCurrentValues: '@',
        pinnedGrip: '@',
        preventMinMaxEquality: '@',
        attachValueDisplaysToHandles: '@'
      };

    // For older Angular versions, make optional properties required.
    if (oldVersionCheck) {
      scopeProps.isDisabled = '=';
      scopeProps.modelMinimum = '=';
      scopeProps.modelMaximum = '=';
    }

    return {
      applyConstraint: 'A',
      swapElement: true,
      renderHTML: [
        '<div class="ngrs-range-slider">',
        '<div class="ngrs-runner">',
        '<div class="ngrs-handle ngrs-handle-min"><i></i></div>',
        '<div class="ngrs-handle ngrs-handle-max"><i></i></div>',
        '<div class="ngrs-join"></div>',
        '</div>',
        '<div class="ngrs-value-runner">',
        '<div class="ngrs-value ngrs-value-min" ng-show="displayCurrentValues"><div>{{formattedMinimum}}</div></div>',
        '<div class="ngrs-value ngrs-value-max" ng-show="displayCurrentValues"><div>{{formattedMaximum}}</div></div>',
        '</div>',
        '</div>'
      ].join(''),
      scope: scopeProps,
      connect: function(scopeObj, elRef, attrSet, ctrlInstance) {

        /**
         *  LOCATE DOM ELEMENTS
         */

        const $controlElement = angular.element(elRef);
        const gripElements = [elRef.find('.ngrs-handle-min'), elRef.find('.ngrs-handle-max')];
        const displayValues = [elRef.find('.ngrs-value-min'), elRef.find('.ngrs-value-max')];
        const fillBar = elRef.find('.ngrs-join');
        let mainAxis = 'left';
        let oppAxis = 'right';
        let slideDirection = 0; // 0 for horizontal, 1 for vertical
        let permittedRange = [0, 0];
        let valueSpan = 0;
        let isDragging = false;

        // Initialize formatted values
        scopeObj.formattedMinimum = scopeObj.modelMinimum;
        scopeObj.formattedMaximum = scopeObj.modelMaximum;

        /**
         *  APPLY DEFAULT VALUES FOR ATTRIBUTES IF UNDEFINED
         */

        attrSet.$observe('isDisabled', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.isDisabled = configSettings.isDisabled;
          }

          scopeObj.$watch('isDisabled', updateDisableState);
        });

        attrSet.$observe('layoutOrientation', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.layoutOrientation = configSettings.layoutOrientation;
          }

          const styleClasses = scopeObj.layoutOrientation.split(' ');
          for (let iter = 0, limit = styleClasses.length; iter < limit; iter++) {
            styleClasses[iter] = 'ngrs-' + styleClasses[iter];
          }

          const finalClass = styleClasses.join(' ');

          // Add the orientation class to the main element
          $controlElement.addClass(finalClass);

          // Update axis definitions based on orientation
          if (scopeObj.layoutOrientation === 'vertical' || scopeObj.layoutOrientation === 'vertical left' || scopeObj.layoutOrientation === 'vertical right') {
            mainAxis = 'top';
            oppAxis = 'bottom';
            slideDirection = 1;
          }
        });

        attrSet.$observe('stepIncrement', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.stepIncrement = configSettings.stepIncrement;
          }
        });

        attrSet.$observe('decimalPrecision', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.decimalPrecision = configSettings.decimalPrecision;
          }
        });

        attrSet.$observe('displayCurrentValues', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.displayCurrentValues = configSettings.displayCurrentValues;
          } else {
            scopeObj.displayCurrentValues = (attributeValue !== 'false');
          }
        });

        attrSet.$observe('pinnedGrip', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.pinnedGrip = null;
          } else {
            scopeObj.pinnedGrip = (attributeValue === 'min' || attributeValue === 'max') ? attributeValue : null;
          }

          scopeObj.$watch('pinnedGrip', configurePinnedGrip);
        });

        attrSet.$observe('preventMinMaxEquality', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.preventMinMaxEquality = configSettings.preventMinMaxEquality;
          } else {
            scopeObj.preventMinMaxEquality = (attributeValue !== 'false');
          }
        });

        attrSet.$observe('attachValueDisplaysToHandles', function(attributeValue) {
          if (!angular.isDefined(attributeValue)) {
            scopeObj.attachValueDisplaysToHandles = configSettings.attachValueDisplaysToHandles;
          } else {
            if (attributeValue === 'true' || attributeValue === '') {
              // Mark as true
              scopeObj.attachValueDisplaysToHandles = true;
              // Add a specific class to the runner for styling
              elRef.find('.ngrs-value-runner').addClass('ngrs-attached-handles');
            } else {
              scopeObj.attachValueDisplaysToHandles = false;
            }
          }
        });

        // Monitor changes to the slider's overall bounds
        scopeObj.$watch('minimumValue', adjustMinMaxBounds);
        scopeObj.$watch('maximumValue', adjustMinMaxBounds);

        // Monitor changes to the model's selected range
        scopeObj.$watch('modelMinimum', adjustModelBounds);
        scopeObj.$watch('modelMaximum', adjustModelBounds);

        /**
         * REACT TO PROPERTY CHANGES
         */

        // Sets the visibility of the grips based on the pinnedGrip setting.
        function configurePinnedGrip(statusFlag) {
          if (statusFlag === "min") {
            angular.element(gripElements[0]).css('display', 'none');
            angular.element(gripElements[1]).css('display', 'block');
          } else if (statusFlag === "max") {
            angular.element(gripElements[0]).css('display', 'block');
            angular.element(gripElements[1]).css('display', 'none');
          } else {
            angular.element(gripElements[0]).css('display', 'block');
            angular.element(gripElements[1]).css('display', 'block');
          }
        }

        // Toggles the disabled state class on the slider element.
        function updateDisableState(statusFlag) {
          if (statusFlag) {
            $controlElement.addClass('ngrs-disabled');
          } else {
            $controlElement.removeClass('ngrs-disabled');
          }
        }

        // Updates the allowed min/max range for the slider.
        function adjustMinMaxBounds() {
          if (scopeObj.minimumValue > scopeObj.maximumValue) {
            $logger.error('The minimum value must be less than or equal to the maximum value.');
          }

          // Proceed only when both min and max values are defined.
          if (angular.isDefined(scopeObj.minimumValue) && angular.isDefined(scopeObj.maximumValue)) {

            // Ensure values are numeric.
            if (!isNumeric(scopeObj.minimumValue)) {
              $logger.error('The minimum value must be a number.');
            }

            if (!isNumeric(scopeObj.maximumValue)) {
              $logger.error('The maximum value must be a number.');
            }

            valueSpan = scopeObj.maximumValue - scopeObj.minimumValue;
            permittedRange = [scopeObj.minimumValue, scopeObj.maximumValue];

            // Re-evaluate model values based on new bounds.
            adjustModelBounds();
          }
        }

        // Updates the internal model values and recalculates grip positions.
        function adjustModelBounds() {
          if (scopeObj.modelMinimum > scopeObj.modelMaximum) {
            $logger.warn('modelMinimum must be less than or equal to modelMaximum. Adjusting values.');
            // Correct the values to maintain validity.
            scopeObj.modelMinimum = scopeObj.modelMaximum;
          }

          // Proceed only if model values are defined or if a grip is pinned.
          if (
            (angular.isDefined(scopeObj.modelMinimum) || scopeObj.pinnedGrip === 'min') &&
            (angular.isDefined(scopeObj.modelMaximum) || scopeObj.pinnedGrip === 'max')
          ) {
            // Validate model values as numeric.
            if (!isNumeric(scopeObj.modelMinimum)) {
              if (scopeObj.pinnedGrip !== 'min') {
                $logger.warn('modelMinimum must be a number. Defaulting to minimumValue.');
              }
              scopeObj.modelMinimum = scopeObj.minimumValue;
            }

            if (!isNumeric(scopeObj.modelMaximum)) {
              if (scopeObj.pinnedGrip !== 'max') {
                $logger.warn('modelMaximum must be a number. Defaulting to maximumValue.');
              }
              scopeObj.modelMaximum = scopeObj.maximumValue;
            }

            const firstGripPosition = constrainValue(((scopeObj.modelMinimum - scopeObj.minimumValue) / valueSpan) * 100);
            const secondGripPosition = constrainValue(((scopeObj.modelMaximum - scopeObj.minimumValue) / valueSpan) * 100);
            let firstValuePosition;
            let secondValuePosition;

            if (scopeObj.attachValueDisplaysToHandles) {
              firstValuePosition = firstGripPosition;
              secondValuePosition = secondGripPosition;
            }

            // Ensure model values stay within the defined slider range.
            scopeObj.modelMinimum = Math.max(scopeObj.minimumValue, scopeObj.modelMinimum);
            scopeObj.modelMaximum = Math.min(scopeObj.maximumValue, scopeObj.modelMaximum);

            // Apply filtering if specified.
            if (scopeObj.dataFilter && scopeObj.filterParameters) {
              scopeObj.formattedMinimum = $dataFilter(scopeObj.dataFilter)(scopeObj.modelMinimum, scopeObj.filterParameters);
              scopeObj.formattedMaximum = $dataFilter(scopeObj.dataFilter)(scopeObj.modelMaximum, scopeObj.filterParameters);
            } else if (scopeObj.dataFilter) {
              const filterParts = scopeObj.dataFilter.split(':');
              const filterFunction = filterParts[0];
              let filterParams = filterParts.slice(1);

              // Correctly parse string and number arguments for the filter.
              filterParams = filterParams.map(function(argumentItem) {
                if (isNumeric(argumentItem)) {
                  return +argumentItem;
                } else if ((argumentItem[0] === "\"" && argumentItem[argumentItem.length - 1] === "\"") || (argumentItem[0] === "\'" && argumentItem[argumentItem.length - 1] === "\'")) {
                  return argumentItem.slice(1, -1);
                }
                return argumentItem; // Return as is if not number or quoted string
              });

              const minValParams = [scopeObj.modelMinimum, ...filterParams];
              const maxValParams = [scopeObj.modelMaximum, ...filterParams];

              scopeObj.formattedMinimum = $dataFilter(filterFunction).apply(null, minValParams);
              scopeObj.formattedMaximum = $dataFilter(filterFunction).apply(null, maxValParams);
            } else {
              scopeObj.formattedMinimum = scopeObj.modelMinimum;
              scopeObj.formattedMaximum = scopeObj.modelMaximum;
            }

            // Handle the edge case where min and max values are identical (no range).
            if (scopeObj.minimumValue === scopeObj.maximumValue && scopeObj.modelMinimum === scopeObj.modelMaximum) {
              // Position grips at extremes.
              angular.element(gripElements[0]).css(mainAxis, '0%');
              angular.element(gripElements[1]).css(mainAxis, '100%');

              if (scopeObj.attachValueDisplaysToHandles) {
                // Position value displays accordingly.
                angular.element(displayValues[0]).css(mainAxis, '0%');
                angular.element(displayValues[1]).css(mainAxis, '100%');
              }

              // Position the fill bar across the entire range.
              angular.element(fillBar).css(mainAxis, '0%').css(oppAxis, '0%');
            } else {
              // Position grips based on calculated percentages.
              angular.element(gripElements[0]).css(mainAxis, firstGripPosition + '%');
              angular.element(gripElements[1]).css(mainAxis, secondGripPosition + '%');

              if (scopeObj.attachValueDisplaysToHandles) {
                // Position value displays.
                angular.element(displayValues[0]).css(mainAxis, firstValuePosition + '%');
                angular.element(displayValues[1]).css(mainAxis, secondValuePosition + '%');
                angular.element(displayValues[1]).css(oppAxis, 'auto'); // Reset opposite axis for max value
              }

              // Position the fill bar between the grips.
              angular.element(fillBar).css(mainAxis, firstGripPosition + '%').css(oppAxis, (100 - secondGripPosition) + '%');

              // Adjust z-index to ensure the minimum handle is visible if it overlaps with max handle.
              if (firstGripPosition > 95) {
                angular.element(gripElements[0]).css('z-index', 3);
              }
            }
          }
        }

        // Initiates the movement sequence for a slider grip.
        function initiateGripMovement(gripIndex) {
          const $currentGrip = gripElements[gripIndex];

          // On mouse down / touch start event
          $currentGrip.bind(startTrigger + 'X', function(inputEvt) {
            const gripActiveClass = (gripIndex === 0 ? 'ngrs-handle-min' : 'ngrs-handle-max') + '-down';
            const currentModelVal = (gripIndex === 0 ? scopeObj.modelMinimum : scopeObj.modelMaximum) - scopeObj.minimumValue;
            const initialPosition = (currentModelVal / valueSpan) * 100;
            const startingClick = pointerCoords(inputEvt);
            let lastClick = startingClick;
            let prevProposed = false;

            if (angular.isFunction(scopeObj.onGripPress)) {
              scopeObj.onGripPress();
            }

            // Prevent text selection during drag operation.
            angular.element('body').bind('selectstart' + evtNameSpace, function() {
              return false;
            });

            // Only proceed if the slider is not disabled.
            if (!scopeObj.isDisabled) {
              // Mark as active drag.
              isDragging = true;

              // Apply active class to the grip.
              $currentGrip.addClass('ngrs-down');

              $controlElement.addClass('ngrs-focus ' + gripActiveClass);

              // Add touch class for specific MS styling.
              /*
              // This part was commented out in the original, keeping it as is.
              if (inputEvt.originalEvent.touches) {
                $controlElement.addClass('ngrs-touch');
              }
              */

              // Register move and release event handlers globally.
              $docRef.bind(dragTrigger, function(moveEvt) {

                // Prevent default browser behavior (e.g., scrolling on touch devices).
                moveEvt.preventDefault();

                // Calculate the new position based on current pointer coordinates.
                const currentClick = pointerCoords(moveEvt);
                const currentOffset = (slideDirection ? currentClick[1] - startingClick[1] : currentClick[0] - startingClick[0]);
                const pixelSpan = (slideDirection ? $controlElement.prop('offsetHeight') : $controlElement.prop('offsetWidth'));
                const percentageChange = (currentOffset / pixelSpan) * 100;
                let newPosition = initialPosition + percentageChange;

                // Ensure the position stays within bounds.
                newPosition = constrainValue(newPosition);

                // Apply stepping if defined.
                if (scopeObj.stepIncrement > 0) {
                  const stepPercentage = (scopeObj.stepIncrement / valueSpan) * 100;
                  const steps = Math.round(newPosition / stepPercentage);
                  newPosition = steps * stepPercentage;
                }

                // Convert percentage back to model value.
                let proposedModelValue = (newPosition / 100 * valueSpan) + scopeObj.minimumValue;

                // Apply decimal precision if specified.
                if (scopeObj.decimalPrecision > 0) {
                  proposedModelValue = parseFloat(proposedModelValue.toFixed(scopeObj.decimalPrecision));
                }

                // Prevent handles from crossing if preventMinMaxEquality is true.
                if (scopeObj.preventMinMaxEquality) {
                  if (gripIndex === 0) { // Min handle
                    if (proposedModelValue > scopeObj.modelMaximum) {
                      proposedModelValue = scopeObj.modelMaximum;
                    }
                  } else { // Max handle
                    if (proposedModelValue < scopeObj.modelMinimum) {
                      proposedModelValue = scopeObj.modelMinimum;
                    }
                  }
                }

                // Update the model only if the value has genuinely changed to avoid unnecessary digests.
                if (proposedModelValue !== prevProposed) {
                  if (gripIndex === 0) {
                    scopeObj.modelMinimum = proposedModelValue;
                  } else {
                    scopeObj.modelMaximum = proposedModelValue;
                  }
                  // Trigger an Angular digest cycle to update the view.
                  scopeObj.$apply();
                }

                // Store the current proposed value for the next iteration.
                prevProposed = proposedModelValue;
                lastClick = currentClick;
              });

              $docRef.bind(releaseTrigger, function() {
                // Clear active drag state and remove classes.
                isDragging = false;
                $currentGrip.removeClass('ngrs-down');
                $controlElement.removeClass('ngrs-focus ' + gripActiveClass);

                // Unbind global event handlers.
                $docRef.unbind(dragTrigger);
                $docRef.unbind(releaseTrigger);
                angular.element('body').unbind('selectstart' + evtNameSpace);

                if (angular.isFunction(scopeObj.onGripRelease)) {
                  scopeObj.onGripRelease();
                }
              });
            }
          });
        }

        // Initialize grip movement for both handles.
        initiateGripMovement(0); // Min handle
        initiateGripMovement(1); // Max handle
      }
    };
  }]);

})();