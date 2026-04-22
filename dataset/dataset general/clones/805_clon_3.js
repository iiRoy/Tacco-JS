/*
 *  Enhanced Range Selector Component for AngularJS
 *
 *  Revision: 1.0.0
 *
 *  Author: A.N. Other, example.com
 *
 *  This component provides a flexible range selection interface, compatible with
 *  modern UI frameworks. It extends the core functionality of a basic slider
 *  to allow dynamic range definition and user interaction.
 *
 *  Derived from earlier works, adapting concepts from various open-source projects.
 *
 *  License: MIT - http://opensource.org/licenses/MIT
 *
 *  Copyright (c) 2023 A.N. Other
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 */

(function() {
    'use strict';

    // Check if Angular 1.0.x compatibility is needed
    const oldAngularVersion = (angular.version.major === 1 && angular.version.minor === 0);

    /**
     * RangeSelector, enables users to select a value range via a slider.
     * Supports touch input.
     * @component
     */
    angular.module('ng-range-selector', [])
        .directive('rangeSelector', ['$document', '$filter', '$log', function($document, $filter, $log) {

            // Unique namespace for event bindings to prevent conflicts
            const evtNs = '.rangeSelectorWidget';

            // Default configuration values for the slider
            const configDefaults = {
                isDisabled: false,
                displayLayout: 'horizontal',
                stepSize: 0,
                precisionDigits: 0,
                showValueLabels: true,
                preventRangeCollapse: false,
                linkValueToHandle: false
            };

            // Determine the appropriate input event types based on browser capabilities
            const inputEvents = window.navigator.pointerEnabled ? {
                start: 'pointerdown',
                move: 'pointermove',
                end: 'pointerup',
                enter: 'pointerdown',
                leave: 'mouseout'
            } : window.navigator.msPointerEnabled ? {
                start: 'MSPointerDown',
                move: 'MSPointerMove',
                end: 'MSPointerUp',
                enter: 'MSPointerDown',
                leave: 'mouseout'
            } : {
                start: 'mousedown touchstart',
                move: 'mousemove touchmove',
                end: 'mouseup touchend',
                enter: 'mouseover touchstart',
                leave: 'mouseout'
            };

            // Combined event strings for easier binding
            const startEvt = inputEvents.start + evtNs,
                dragEvt = inputEvents.move + evtNs,
                endEvt = inputEvents.end + evtNs;

            /**
             * Extracts standardized clientX and clientY coordinates from an event object.
             * @param {Event} event - The DOM event.
             * @returns {Array<number|string>} An array [x, y] or ['x', 'y'] if coordinates are not found.
             */
            function getCoord(event) {
                try {
                    const originalEvent = event.originalEvent || event;
                    const clientX = originalEvent.clientX || (originalEvent.touches && originalEvent.touches[0] ? originalEvent.touches[0].clientX : undefined);
                    const clientY = originalEvent.clientY || (originalEvent.touches && originalEvent.touches[0] ? originalEvent.touches[0].clientY : undefined);
                    return [clientX, clientY];
                } catch (e) {
                    $log.error('Failed to get client coordinates:', e);
                    return ['x', 'y']; // Fallback for unexpected errors
                }
            }

            /**
             * Clamps a value between 0 and 100 (inclusive).
             * @param {number} value - The value to clamp.
             * @returns {number} The clamped value.
             */
            const clampPercentage = (value) => Math.max(0, Math.min(100, value));

            /**
             * Checks if a value is a valid number.
             * @param {*} num - The value to check.
             * @returns {boolean} True if the value is a number, false otherwise.
             */
            const isValidNum = (num) => !isNaN(parseFloat(num)) && isFinite(num);

            /**
             * Helper for logging errors and warnings.
             * @param {string} message - The message to log.
             * @param {boolean} isWarning - True for warning, false for error.
             */
            function logMessage(message, isWarning = false) {
                if (isWarning) {
                    $log.warn('RangeSelector Warning:', message);
                } else {
                    $log.error('RangeSelector Error:', message);
                    throw new Error('RangeSelector: ' + message);
                }
            }

            // Scope options for the directive
            const directiveScope = {
                isDisabled: '=?',
                minValue: '=',
                maxValue: '=',
                modelLower: '=?',
                modelUpper: '=?',
                onHandleEngage: '&',
                onHandleRelease: '&',
                displayLayout: '@',
                stepSize: '@',
                precisionDigits: '@',
                valueFilter: '@',
                filterOptions: '@',
                showValueLabels: '@',
                fixedHandle: '@',
                preventRangeCollapse: '@',
                linkValueToHandle: '@'
            };

            // Adjust scope properties for legacy Angular versions (1.0.x)
            if (oldAngularVersion) {
                directiveScope.isDisabled = '=';
                directiveScope.modelLower = '=';
                directiveScope.modelUpper = '=';
            }

            return {
                restrict: 'A',
                replace: true,
                template: [
                    '<div class="rsl-container">',
                    '  <div class="rsl-track">',
                    '    <div class="rsl-handle rsl-handle-lower"><i></i></div>',
                    '    <div class="rsl-handle rsl-handle-upper"><i></i></div>',
                    '    <div class="rsl-connection-bar"></div>',
                    '  </div>',
                    '  <div class="rsl-value-track">',
                    '    <div class="rsl-label rsl-label-lower" ng-show="showValueLabels"><span>{{displayValMin}}</span></div>',
                    '    <div class="rsl-label rsl-label-upper" ng-show="showValueLabels"><span>{{displayValMax}}</span></div>',
                    '  </div>',
                    '</div>'
                ].join(''),
                scope: directiveScope,
                link: function(scope, element, attrs) {

                    /**
                     *  ELEMENT REFERENCES
                     */
                    const $controlElement = angular.element(element);
                    const sliderHandles = [
                        element.find('.rsl-handle-lower'),
                        element.find('.rsl-handle-upper')
                    ];
                    const displayValues = [
                        element.find('.rsl-label-lower'),
                        element.find('.rsl-label-upper')
                    ];
                    const rangeConnector = element.find('.rsl-connection-bar');
                    const valueTrack = element.find('.rsl-value-track');

                    let mainAxisProp = 'left'; // CSS property for position (left/top)
                    let crossAxisProp = 'right'; // Opposite CSS property (right/bottom)
                    let layoutDirection = 0; // 0 for horizontal, 1 for vertical
                    let permittedInterval = [0, 0]; // [min, max] of the slider's value range
                    let valueSpan = 0; // (max - min)
                    let isDragging = false; // Flag to indicate if a handle is currently being dragged

                    // Initialize filtered values for display
                    scope.displayValMin = scope.modelLower;
                    scope.displayValMax = scope.modelUpper;

                    /**
                     *  INITIAL ATTRIBUTE PROCESSING AND FALLBACKS
                     */

                    // Process 'isDisabled' attribute
                    scope.isDisabled = angular.isDefined(attrs.isDisabled) ? JSON.parse(attrs.isDisabled) : configDefaults.isDisabled;
                    scope.$watch('isDisabled', toggleControlState);

                    // Process 'displayLayout' attribute
                    scope.displayLayout = attrs.displayLayout || configDefaults.displayLayout;
                    const layoutClasses = scope.displayLayout.split(' ').map(cls => `rsl-${cls}`);
                    $controlElement.addClass(layoutClasses.join(' '));
                    if (['vertical', 'vertical-left', 'vertical-right'].includes(scope.displayLayout)) {
                        mainAxisProp = 'top';
                        crossAxisProp = 'bottom';
                        layoutDirection = 1;
                    }

                    // Process 'stepSize' attribute
                    scope.stepSize = isValidNum(attrs.stepSize) ? parseFloat(attrs.stepSize) : configDefaults.stepSize;
                    if (scope.stepSize < 0) {
                        logMessage('stepSize cannot be negative. Resetting to 0.', true);
                        scope.stepSize = 0;
                    }

                    // Process 'precisionDigits' attribute
                    scope.precisionDigits = isValidNum(attrs.precisionDigits) ? parseInt(attrs.precisionDigits, 10) : configDefaults.precisionDigits;
                    if (scope.precisionDigits < 0) {
                        logMessage('precisionDigits cannot be negative. Resetting to 0.', true);
                        scope.precisionDigits = 0;
                    }

                    // Process 'showValueLabels' attribute
                    scope.showValueLabels = angular.isDefined(attrs.showValueLabels) ? JSON.parse(attrs.showValueLabels) : configDefaults.showValueLabels;

                    // Process 'fixedHandle' attribute
                    scope.fixedHandle = ['lower', 'upper'].includes(attrs.fixedHandle) ? attrs.fixedHandle : null;
                    scope.$watch('fixedHandle', updateHandleVisibility);

                    // Process 'preventRangeCollapse' attribute
                    scope.preventRangeCollapse = angular.isDefined(attrs.preventRangeCollapse) ? JSON.parse(attrs.preventRangeCollapse) : configDefaults.preventRangeCollapse;

                    // Process 'linkValueToHandle' attribute
                    scope.linkValueToHandle = angular.isDefined(attrs.linkValueToHandle) ? JSON.parse(attrs.linkValueToHandle) : configDefaults.linkValueToHandle;
                    if (scope.linkValueToHandle) {
                        valueTrack.addClass('rsl-linked-labels');
                    }

                    // Watch for changes to the base min/max values
                    scope.$watchGroup(['minValue', 'maxValue'], updateMinMaxBounds);

                    // Watch for changes to the model values
                    scope.$watchGroup(['modelLower', 'modelUpper'], syncModelValues);

                    /**
                     * HANDLER FUNCTIONS FOR SCOPE CHANGES
                     */

                    /**
                     * Adjusts the visibility of slider handles based on the `fixedHandle` setting.
                     * @param {string|null} currentFixedHandle - 'lower', 'upper', or null.
                     */
                    function updateHandleVisibility(currentFixedHandle) {
                        sliderHandles[0].css('display', currentFixedHandle === 'lower' ? 'none' : 'block');
                        sliderHandles[1].css('display', currentFixedHandle === 'upper' ? 'none' : 'block');
                    }

                    /**
                     * Adds or removes a CSS class to indicate the slider's disabled state.
                     * @param {boolean} status - True if disabled, false otherwise.
                     */
                    function toggleControlState(status) {
                        $controlElement.toggleClass('rsl-disabled', status);
                    }

                    /**
                     * Updates the internal min/max range of the slider.
                     * Validates `minValue` and `maxValue`.
                     */
                    function updateMinMaxBounds() {
                        if (!isValidNum(scope.minValue) || !isValidNum(scope.maxValue)) {
                            logMessage('minValue and maxValue must be valid numbers.', false);
                            return;
                        }

                        if (scope.minValue > scope.maxValue) {
                            logMessage('minValue must be less than or equal to maxValue.', false);
                            return; // Prevent further execution with invalid range
                        }

                        permittedInterval = [parseFloat(scope.minValue), parseFloat(scope.maxValue)];
                        valueSpan = permittedInterval[1] - permittedInterval[0];

                        // Ensure model values are also updated/clamped
                        syncModelValues();
                    }

                    /**
                     * Applies filtering to a value using the specified filter and options.
                     * @param {number} value - The value to filter.
                     * @returns {string|number} The filtered value.
                     */
                    function applyValueFilter(value) {
                        if (!scope.valueFilter) {
                            return value;
                        }

                        const filterTokens = scope.valueFilter.split(':');
                        const filterName = filterTokens[0];
                        let filterArgs = filterTokens.slice(1);

                        // Parse filter arguments to their correct types
                        filterArgs = filterArgs.map(arg => {
                            if (isValidNum(arg)) {
                                return +arg;
                            }
                            // Remove quotes for string arguments
                            if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
                                return arg.slice(1, -1);
                            }
                            return arg; // Return as is if not number or quoted string
                        });

                        // Prepend the value to the arguments array for the filter function
                        filterArgs.unshift(value);

                        try {
                            return $filter(filterName).apply(null, filterArgs);
                        } catch (e) {
                            logMessage(`Error applying filter '${filterName}': ${e.message}`, true);
                            return value; // Fallback to original value on filter error
                        }
                    }

                    /**
                     * Synchronizes and clamps the model values (modelLower, modelUpper)
                     * with the slider's visual representation.
                     */
                    function syncModelValues() {
                        // Guard clause: ensure base min/max are defined and range is valid
                        if (!angular.isDefined(scope.minValue) || !angular.isDefined(scope.maxValue) || valueSpan <= 0) {
                            return;
                        }

                        let currentModelLower = scope.modelLower;
                        let currentModelUpper = scope.modelUpper;

                        // Apply defaults if model values are not defined, especially for fixed handles
                        if (!isValidNum(currentModelLower)) {
                            currentModelLower = (scope.fixedHandle === 'lower') ? permittedInterval[0] : permittedInterval[0]; // Default to min
                            logMessage('modelLower not a number, defaulting to minValue.', true);
                        }
                        if (!isValidNum(currentModelUpper)) {
                            currentModelUpper = (scope.fixedHandle === 'upper') ? permittedInterval[1] : permittedInterval[1]; // Default to max
                            logMessage('modelUpper not a number, defaulting to maxValue.', true);
                        }

                        // Ensure model values are within the permitted interval
                        currentModelLower = Math.max(permittedInterval[0], currentModelLower);
                        currentModelUpper = Math.min(permittedInterval[1], currentModelUpper);

                        // Handle model values crossing over or collapsing
                        if (currentModelLower > currentModelUpper) {
                            logMessage('modelLower cannot be greater than modelUpper. Adjusting modelLower.', true);
                            currentModelLower = currentModelUpper;
                        }

                        // Update scope models if they changed
                        if (scope.modelLower !== currentModelLower) {
                            scope.modelLower = currentModelLower;
                        }
                        if (scope.modelUpper !== currentModelUpper) {
                            scope.modelUpper = currentModelUpper;
                        }

                        // Calculate handle positions as percentages
                        const lowerHandlePct = clampPercentage(((scope.modelLower - permittedInterval[0]) / valueSpan) * 100);
                        const upperHandlePct = clampPercentage(((scope.modelUpper - permittedInterval[0]) / valueSpan) * 100);

                        // Apply filtering for display
                        scope.displayValMin = applyValueFilter(scope.modelLower);
                        scope.displayValMax = applyValueFilter(scope.modelUpper);

                        // Update the visual layout of handles and the connection bar
                        updateSliderLayout(lowerHandlePct, upperHandlePct);
                    }

                    /**
                     * Updates the CSS positions of slider handles and the connecting bar.
                     * @param {number} lowerPct - Percentage position for the lower handle.
                     * @param {number} upperPct - Percentage position for the upper handle.
                     */
                    function updateSliderLayout(lowerPct, upperPct) {
                        // Position handles
                        sliderHandles[0].css(mainAxisProp, lowerPct + '%');
                        sliderHandles[1].css(mainAxisProp, upperPct + '%');

                        // Position value labels if linked to handles
                        if (scope.linkValueToHandle) {
                            displayValues[0].css(mainAxisProp, lowerPct + '%');
                            displayValues[1].css(mainAxisProp, upperPct + '%');
                            // Ensure the upper label doesn't push the lower label when close
                            if (upperPct - lowerPct < 10) { // arbitrary threshold
                                displayValues[0].css('z-index', 3);
                                displayValues[1].css('z-index', 2);
                            } else {
                                displayValues[0].css('z-index', 'auto');
                                displayValues[1].css('z-index', 'auto');
                            }
                        }

                        // Position the connection bar between handles
                        rangeConnector.css(mainAxisProp, lowerPct + '%').css(crossAxisProp, (100 - upperPct) + '%');

                        // Ensure lower handle is always visible on top if overlapping
                        if (lowerPct > 95 && sliderHandles[0].css('display') !== 'none') { // Check if not hidden by fixedHandle
                            sliderHandles[0].css('z-index', 3);
                        } else {
                            sliderHandles[0].css('z-index', 'auto');
                        }
                    }

                    /**
                     * Initiates the drag operation for a slider handle.
                     * @param {number} handleIndex - 0 for lower, 1 for upper.
                     */
                    function initiateDrag(handleIndex) {
                        const $currentHandle = sliderHandles[handleIndex];

                        // Bind the start event
                        $currentHandle.on(startEvt + 'X', function(event) {
                            // Guard clause: do not drag if disabled
                            if (scope.isDisabled) {
                                return;
                            }

                            const activeHandleClass = (handleIndex === 0 ? 'rsl-handle-lower' : 'rsl-handle-upper') + '-active';
                            const initialClickPoint = getCoord(event);
                            const initialValue = (handleIndex === 0 ? scope.modelLower : scope.modelUpper);
                            const initialHandlePositionPct = clampPercentage(((initialValue - permittedInterval[0]) / valueSpan) * 100);

                            let lastClickPoint = initialClickPoint;
                            let proposedHandlePositionPct = initialHandlePositionPct;

                            // Call optional callback function
                            if (angular.isFunction(scope.onHandleEngage)) {
                                scope.onHandleEngage();
                            }

                            // Prevent text selection during drag
                            angular.element('body').on('selectstart' + evtNs, () => false);

                            isDragging = true;
                            $currentHandle.addClass('rsl-active');
                            $controlElement.addClass('rsl-focused ' + activeHandleClass);

                            // Add class for MS styling if applicable
                            if (window.navigator.msPointerEnabled) {
                                $controlElement.addClass('rsl-ms-touch');
                            }

                            // Bind move and end events globally
                            $document.on(dragEvt, function(moveEvent) {
                                moveEvent.preventDefault(); // Prevent default touch/mouse behavior
                                const currentClickPoint = getCoord(moveEvent);

                                if (currentClickPoint[0] === 'x' || currentClickPoint[1] === 'y') {
                                    // Invalid coordinates, skip this move event
                                    return;
                                }

                                // Calculate delta based on orientation
                                const delta = layoutDirection === 0 ?
                                    currentClickPoint[0] - lastClickPoint[0] :
                                    currentClickPoint[1] - lastClickPoint[1];

                                // Get slider dimensions
                                const sliderDim = layoutDirection === 0 ?
                                    $controlElement[0].offsetWidth :
                                    $controlElement[0].offsetHeight;

                                // Calculate new percentage position
                                const deltaPct = (delta / sliderDim) * 100;
                                proposedHandlePositionPct = clampPercentage(initialHandlePositionPct + deltaPct);

                                // Convert percentage back to value
                                let proposedValue = permittedInterval[0] + (proposedHandlePositionPct / 100) * valueSpan;

                                // Apply stepping
                                if (scope.stepSize > 0) {
                                    const steppedValue = Math.round(proposedValue / scope.stepSize) * scope.stepSize;
                                    proposedValue = parseFloat(steppedValue.toFixed(scope.precisionDigits));
                                } else {
                                    proposedValue = parseFloat(proposedValue.toFixed(scope.precisionDigits));
                                }

                                // Prevent handles from crossing or collapsing
                                let otherHandleValue = handleIndex === 0 ? scope.modelUpper : scope.modelLower;
                                if (scope.preventRangeCollapse) {
                                    if (handleIndex === 0) { // Lower handle
                                        if (proposedValue > otherHandleValue) {
                                            proposedValue = otherHandleValue;
                                        }
                                    } else { // Upper handle
                                        if (proposedValue < otherHandleValue) {
                                            proposedValue = otherHandleValue;
                                        }
                                    }
                                }

                                // Update the model value in a digest cycle
                                scope.$apply(function() {
                                    if (handleIndex === 0) {
                                        scope.modelLower = proposedValue;
                                    } else {
                                        scope.modelUpper = proposedValue;
                                    }
                                });

                                // Update last click point for next delta calculation
                                lastClickPoint = currentClickPoint;
                            });

                            $document.on(endEvt, function() {
                                $document.off(dragEvt);
                                $document.off(endEvt);
                                angular.element('body').off('selectstart' + evtNs);

                                isDragging = false;
                                $currentHandle.removeClass('rsl-active');
                                $controlElement.removeClass('rsl-focused ' + activeHandleClass);

                                // Call optional callback function
                                if (angular.isFunction(scope.onHandleRelease)) {
                                    scope.onHandleRelease();
                                }
                            });
                        });
                    }

                    // Initialize drag for both handles
                    initiateDrag(0); // Lower handle
                    initiateDrag(1); // Upper handle
                }
            };
        }]);
})();