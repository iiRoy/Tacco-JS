/***************************************************************************************************
 *  Angular RangeSlider Directive - Type I Clone
 *
 *  Version: 0.0.13 (replicated)
 *
 *  Author: Daniel Crisp, danielcrisp.com (original)
 *
 *  This cloned version retains all original code logic and structure.
 *  Only whitespace and comments have been altered to demonstrate a Type I clone.
 *
 *  The rangeSlider has been styled to match the default styling
 *  of form elements styled using Twitter's Bootstrap (original intent).
 *
 *  Originally forked from https://github.com/leongersen/noUiSlider (original source).
 *
 ***************************************************************************************************
 *  LICENSING INFORMATION (MIT License - as per original)
 ***************************************************************************************************
 *
 *    This code is released under the MIT Licence - http://opensource.org/licenses/MIT
 *
 *    Copyright (c) 2013 Daniel Crisp
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to deal
 *    in the Software without restriction, including without limitation the rights
 *    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is
 *    furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in
 *    all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *    THE SOFTWARE.
 *
 ***************************************************************************************************/

( function ()
{
    'use strict'; // Enforce strict mode for cleaner code.

    // Check for legacy Angular version compatibility (AngularJS 1.0.x).
    var legacySupport = ( angular.version.major === 1 && angular.version.minor === 0 );


    /**
     * RangeSlider directive definition.
     * Provides a user interface component for selecting a range of values.
     * Designed to be touch-friendly.
     *
     * @directive
     */
    angular.module( 'ui-rangeSlider', [] )

        .directive( 'rangeSlider', [ '$document', '$filter', '$log', function ( $document, $filter, $log ) {

            // Define event namespace for easy unbinding later.
            var eventNamespace = '.rangeSlider',

                // Default configuration options for the slider.
                defaults = {
                    disabled: false,
                    orientation: 'horizontal',
                    step: 0,
                    decimalPlaces: 0,
                    showValues: true,
                    preventEqualMinMax: false,
                    attachHandleValues: false
                },

                // Dynamically determine the appropriate events to bind based on browser capabilities.
                // Prioritizes Pointer Events (standard, then MS-prefixed) over Mouse/Touch events.
                actions = window.navigator.pointerEnabled ? {
                    start: 'pointerdown',
                    move: 'pointermove',
                    end: 'pointerup',
                    over: 'pointerdown', // Pointerdown can also act as 'over' for some scenarios.
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

                // Concatenate event names with the namespace for specific binding.
                onEvent = actions.start + eventNamespace,
                moveEvent = actions.move + eventNamespace,
                offEvent = actions.end + eventNamespace,
                overEvent = actions.over + eventNamespace,
                outEvent = actions.out + eventNamespace,


                // Helper function to normalize client X/Y coordinates from various event types.
                client = function ( f ) {
                    try {
                        return [ ( f.clientX || f.originalEvent.clientX || f.originalEvent.touches[0].clientX ),
                                 ( f.clientY || f.originalEvent.clientY || f.originalEvent.touches[0].clientY ) ];
                    }
                    catch ( e ) {
                        // Fallback in case coordinates cannot be retrieved.
                        return [ 'x', 'y' ];
                    }
                },


                // Function to restrict a value within the 0-100 range (percentage).
                restrict = function ( value ) {
                    // Ensure value is not less than 0 or greater than 100.
                    return ( value < 0 ? 0 : ( value > 100 ? 100 : value ) );
                },


                // Utility function to check if a value is a valid number.
                isNumber = function ( n ) {
                    // console.log(n); // Debugging line, commented out.
                    return !isNaN( parseFloat( n ) ) && isFinite( n );
                },

                // Define the scope options for the directive.
                scopeOptions = {
                    disabled: '=?',             // Optional two-way binding for disabled state.
                    min: '=',                   // Required two-way binding for minimum value.
                    max: '=',                   // Required two-way binding for maximum value.
                    modelMin: '=?',             // Optional two-way binding for the selected minimum model value.
                    modelMax: '=?',             // Optional two-way binding for the selected maximum model value.
                    onHandleDown: '&',          // Optional callback function when a handle is grabbed.
                    onHandleUp: '&',            // Optional callback function when a handle is released.
                    orientation: '@',           // One-way binding for slider orientation string.
                    step: '@',                  // One-way binding for the step increment.
                    decimalPlaces: '@',         // One-way binding for number of decimal places.
                    filter: '@',                // One-way binding for a filter function name.
                    filterOptions: '@',         // One-way binding for options to pass to the filter.
                    showValues: '@',            // One-way binding to control visibility of value labels.
                    pinHandle: '@',             // One-way binding to "pin" one of the handles.
                    preventEqualMinMax: '@',    // One-way binding to prevent min and max models from being equal.
                    attachHandleValues: '@'     // One-way binding to attach value labels to handles.
                };


            // Adjust scope options for legacy Angular versions where optional bindings (`=?`)
            // might not be fully supported, making them required (`=`) instead.
            if ( legacySupport )
            {
                scopeOptions.disabled = '=';
                scopeOptions.modelMin = '=';
                scopeOptions.modelMax = '=';
            }


            // The following commented-out block was likely for adding touch/no-touch classes to the HTML element.
            // if (EVENT < 4) {
            //     // some sort of touch has been detected
            //     angular.element('html').addClass('ngrs-touch');
            // } else {
            //     angular.element('html').addClass('ngrs-no-touch');
            // }


            // Return the directive definition object.
            return {
                restrict: 'A', // Restrict to attribute.
                replace: true, // Replace the original element with the template.
                template: [
                    '<div class="ngrs-range-slider">',
                    '    <div class="ngrs-runner">',
                    '        <div class="ngrs-handle ngrs-handle-min"><i></i></div>', // Minimum handle.
                    '        <div class="ngrs-handle ngrs-handle-max"><i></i></div>', // Maximum handle.
                    '        <div class="ngrs-join"></div>',                          // The join between handles.
                    '    </div>',
                    '    <div class="ngrs-value-runner">',
                    '        <div class="ngrs-value ngrs-value-min" ng-show="showValues"><div>{{filteredModelMin}}</div></div>', // Min value display.
                    '        <div class="ngrs-value ngrs-value-max" ng-show="showValues"><div>{{filteredModelMax}}</div></div>', // Max value display.
                    '    </div>',
                    '</div>'
                ].join( '' ), // Join array elements into a single HTML string.
                scope: scopeOptions, // Use the defined scope options.
                link: function ( scope, element, attrs, controller ) {

                    /**
                     *  ELEMENT SELECTION AND INITIALIZATION
                     */

                    var $slider = angular.element( element ), // The main slider element.
                        handles = [ element.find( '.ngrs-handle-min' ), element.find( '.ngrs-handle-max' ) ], // Min and Max handles.
                        values = [ element.find( '.ngrs-value-min' ), element.find( '.ngrs-value-max' ) ],   // Min and Max value displays.
                        join = element.find( '.ngrs-join' ), // The element representing the range between handles.
                        pos = 'left',                        // Default CSS position property for horizontal sliders.
                        posOpp = 'right',                    // Opposite CSS position property.
                        orientation = 0,                     // Numeric representation of orientation (0 for horizontal, 1 for vertical).
                        allowedRange = [ 0, 0 ],             // The [min, max] range as defined by the user.
                        range = 0,                           // The total span of the allowed range (max - min).
                        down = false;                        // Flag to indicate if a handle is currently being dragged.

                    // Initialize filtered model values (for display purposes).
                    scope.filteredModelMin = scope.modelMin;
                    scope.filteredModelMax = scope.modelMax;


                    /**
                     *  FALLBACK TO DEFAULTS FOR UNDEFINED ATTRIBUTES
                     */


                    // Observe changes to the 'disabled' attribute.
                    attrs.$observe( 'disabled', function ( val ) {
                        // If 'disabled' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.disabled = defaults.disabled;
                        }
                        // Watch the scope.disabled property for changes and update the UI.
                        scope.$watch( 'disabled', setDisabledStatus );
                    } );


                    // Observe changes to the 'orientation' attribute.
                    attrs.$observe( 'orientation', function ( val ) {
                        // If 'orientation' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.orientation = defaults.orientation;
                        }

                        var classNames = scope.orientation.split( ' ' ), // Split orientation string into classes.
                            useClass;

                        // Prepend 'ngrs-' to each class name.
                        for ( var i = 0, l = classNames.length; i < l; i++ ) {
                            classNames[i] = 'ngrs-' + classNames[i];
                        }

                        useClass = classNames.join( ' ' ); // Rejoin to form a space-separated class string.

                        // Add the generated class(es) to the slider element.
                        $slider.addClass( useClass );

                        // Update position properties based on vertical orientation.
                        if ( scope.orientation === 'vertical' || scope.orientation === 'vertical left' || scope.orientation === 'vertical right' ) {
                            pos = 'top';    // For vertical sliders, use 'top' for positioning.
                            posOpp = 'bottom'; // And 'bottom' for the opposite.
                            orientation = 1; // Set orientation flag to 1 for vertical.
                        }
                    } );


                    // Observe changes to the 'step' attribute.
                    attrs.$observe( 'step', function ( val ) {
                        // If 'step' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.step = defaults.step;
                        }
                    } );


                    // Observe changes to the 'decimalPlaces' attribute.
                    attrs.$observe( 'decimalPlaces', function ( val ) {
                        // If 'decimalPlaces' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.decimalPlaces = defaults.decimalPlaces;
                        }
                    } );


                    // Observe changes to the 'showValues' attribute.
                    attrs.$observe( 'showValues', function ( val ) {
                        // If 'showValues' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.showValues = defaults.showValues;
                        }
                        else
                        {
                            // Parse boolean from string value.
                            if ( val === 'false' ) {
                                scope.showValues = false;
                            }
                            else {
                                scope.showValues = true;
                            }
                        }
                    } );


                    // Observe changes to the 'pinHandle' attribute.
                    attrs.$observe( 'pinHandle', function ( val ) {
                        // If 'pinHandle' attribute is not defined, set to null.
                        if ( !angular.isDefined( val ) ) {
                            scope.pinHandle = null;
                        }
                        else
                        {
                            // Only allow 'min' or 'max' as valid pin values.
                            if ( val === 'min' || val === 'max' ) {
                                scope.pinHandle = val;
                            }
                            else {
                                scope.pinHandle = null;
                            }
                        }

                        // Watch the scope.pinHandle property and update handle visibility.
                        scope.$watch( 'pinHandle', setPinHandle );
                    } );


                    // Observe changes to the 'preventEqualMinMax' attribute.
                    attrs.$observe( 'preventEqualMinMax', function ( val ) {
                        // If 'preventEqualMinMax' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.preventEqualMinMax = defaults.preventEqualMinMax;
                        }
                        else
                        {
                            // Parse boolean from string value.
                            if ( val === 'false' ) {
                                scope.preventEqualMinMax = false;
                            }
                            else {
                                scope.preventEqualMinMax = true;
                            }
                        }
                    } );


                    // Observe changes to the 'attachHandleValues' attribute.
                    attrs.$observe( 'attachHandleValues', function ( val ) {
                        // If 'attachHandleValues' attribute is not defined, use the default.
                        if ( !angular.isDefined( val ) ) {
                            scope.attachHandleValues = defaults.attachHandleValues;
                        }
                        else
                        {
                            // If attribute is present and true/empty, enable attachment.
                            if ( val === 'true' || val === '' ) {
                                scope.attachHandleValues = true;
                                // Add a class to the value runner to apply specific styling.
                                element.find( '.ngrs-value-runner' ).addClass( 'ngrs-attached-handles' );
                            }
                            else {
                                scope.attachHandleValues = false;
                            }
                        }
                    } );


                    // Listen for changes to the 'min' and 'max' scope properties.
                    scope.$watch( 'min', setMinMax );
                    scope.$watch( 'max', setMinMax );

                    // Listen for changes to the 'modelMin' and 'modelMax' scope properties.
                    scope.$watch( 'modelMin', setModelMinMax );
                    scope.$watch( 'modelMax', setModelMinMax );


                    /**
                     * HANDLE CHANGE FUNCTIONS
                     */


                    // Function to control handle visibility based on the 'pinHandle' setting.
                    function setPinHandle ( status ) {
                        if ( status === "min" ) {
                            // If 'min' is pinned, hide the min handle and show the max handle.
                            angular.element( handles[0] ).css( 'display', 'none' );
                            angular.element( handles[1] ).css( 'display', 'block' );
                        }
                        else if ( status === "max" ) {
                            // If 'max' is pinned, show the min handle and hide the max handle.
                            angular.element( handles[0] ).css( 'display', 'block' );
                            angular.element( handles[1] ).css( 'display', 'none' );
                        }
                        else
                        {
                            // If no handle is pinned, show both handles.
                            angular.element( handles[0] ).css( 'display', 'block' );
                            angular.element( handles[1] ).css( 'display', 'block' );
                        }
                    }


                    // Function to update the slider's disabled status.
                    function setDisabledStatus ( status ) {
                        if ( status ) {
                            // Add 'ngrs-disabled' class if disabled.
                            $slider.addClass( 'ngrs-disabled' );
                        }
                        else
                        {
                            // Remove 'ngrs-disabled' class if enabled.
                            $slider.removeClass( 'ngrs-disabled' );
                        }
                    }


                    // Function to set the overall min/max range of the slider.
                    function setMinMax () {

                        // Validate that min is not greater than max.
                        if ( scope.min > scope.max ) {
                            throwError( 'min must be less than or equal to max' );
                        }

                        // Proceed only when both min and max are defined.
                        if ( angular.isDefined( scope.min ) && angular.isDefined( scope.max ) ) {

                            // Validate that min is a number.
                            if ( !isNumber( scope.min ) ) {
                                throwError( 'min must be a number' );
                            }

                            // Validate that max is a number.
                            if ( !isNumber( scope.max ) ) {
                                throwError( 'max must be a number' );
                            }

                            range = scope.max - scope.min;     // Calculate the total range span.
                            allowedRange = [ scope.min, scope.max ]; // Store the allowed range.

                            // Update model values as well, ensuring they fit within the new range.
                            setModelMinMax();

                        }
                    }


                    // Function to set and update the model's min and max values, and position handles.
                    function setModelMinMax () {

                        // Validate that modelMin is not greater than modelMax.
                        if ( scope.modelMin > scope.modelMax ) {
                            throwWarning( 'modelMin must be less than or equal to modelMax' );
                            // If invalid, correct by setting modelMin to modelMax.
                            scope.modelMin = scope.modelMax;
                        }

                        // Proceed only when modelMin or pinHandle is defined, AND modelMax or pinHandle is defined.
                        if (
                                ( angular.isDefined( scope.modelMin ) || scope.pinHandle === 'min' ) &&
                                ( angular.isDefined( scope.modelMax ) || scope.pinHandle === 'max' )
                           )
                        {
                            // Ensure modelMin is a number, or default to scope.min if not and not pinned.
                            if ( !isNumber( scope.modelMin ) ) {
                                if ( scope.pinHandle !== 'min' ) {
                                    throwWarning( 'modelMin must be a number' );
                                }
                                scope.modelMin = scope.min;
                            }

                            // Ensure modelMax is a number, or default to scope.max if not and not pinned.
                            if ( !isNumber( scope.modelMax ) ) {
                                if ( scope.pinHandle !== 'max' ) {
                                    throwWarning( 'modelMax must be a number' );
                                }
                                scope.modelMax = scope.max;
                            }

                            // Calculate handle positions as percentages of the total range.
                            var handle1pos = restrict( ( ( scope.modelMin - scope.min ) / range ) * 100 ),
                                handle2pos = restrict( ( ( scope.modelMax - scope.min ) / range ) * 100 ),
                                value1pos, // Position for the min value label.
                                value2pos; // Position for the max value label.

                            // If values are attached to handles, their positions are the same.
                            if ( scope.attachHandleValues ) {
                                value1pos = handle1pos;
                                value2pos = handle2pos;
                            }

                            // Ensure model values are within the allowed overall range.
                            scope.modelMin = Math.max( scope.min, scope.modelMin );
                            scope.modelMax = Math.min( scope.max, scope.modelMax );


                            // Apply filtering if a filter function is specified.
                            if ( scope.filter && scope.filterOptions ) {
                                scope.filteredModelMin = $filter( scope.filter )( scope.modelMin, scope.filterOptions );
                                scope.filteredModelMax = $filter( scope.filter )( scope.modelMax, scope.filterOptions );
                            }
                            else if ( scope.filter )
                            {
                                // Handle filters with colon-separated arguments.
                                var filterTokens = scope.filter.split( ':' ),
                                    filterName = scope.filter.split( ':' )[0],
                                    filterOptions = filterTokens.slice().slice( 1 ), // Get options after the filter name.
                                    modelMinOptions,
                                    modelMaxOptions;

                                // Parse string and number arguments for the filter.
                                filterOptions = filterOptions.map( function ( arg ) {
                                    if ( isNumber( arg ) ) {
                                        return +arg; // Convert to number.
                                    }
                                    else if ( ( arg[0] == "\"" && arg[arg.length - 1] == "\"" ) || ( arg[0] == "\'" && arg[arg.length - 1] == "\'" ) ) {
                                        return arg.slice( 1, -1 ); // Remove quotes for string literals.
                                    }
                                    return arg; // Return as is if not a number or quoted string.
                                } );

                                modelMinOptions = filterOptions.slice(); // Copy options for min model.
                                modelMaxOptions = filterOptions.slice(); // Copy options for max model.
                                modelMinOptions.unshift( scope.modelMin ); // Prepend modelMin to options.
                                modelMaxOptions.unshift( scope.modelMax ); // Prepend modelMax to options.

                                // Apply the filter using `apply` to pass arguments as an array.
                                scope.filteredModelMin = $filter( filterName ).apply( null, modelMinOptions );
                                scope.filteredModelMax = $filter( filterName ).apply( null, modelMaxOptions );
                            }
                            else
                            {
                                // If no filter, display raw model values.
                                scope.filteredModelMin = scope.modelMin;
                                scope.filteredModelMax = scope.modelMax;
                            }


                            // Special handling for when min and max are equal (no range).
                            if ( scope.min === scope.max && scope.modelMin == scope.modelMax ) {

                                // Position handles at the start and end (0% and 100%).
                                angular.element( handles[0] ).css( pos, '0%' );
                                angular.element( handles[1] ).css( pos, '100%' );

                                if ( scope.attachHandleValues ) {
                                    // Position value labels similarly.
                                    angular.element( values[0] ).css( pos, '0%' );
                                    angular.element( values[1] ).css( pos, '100%' );
                                }

                                // Position the join element to cover the full width.
                                angular.element( join ).css( pos, '0%' ).css( posOpp, '0%' );

                            }
                            else
                            {
                                // Reposition handles based on calculated percentages.
                                angular.element( handles[0] ).css( pos, handle1pos + '%' );
                                angular.element( handles[1] ).css( pos, handle2pos + '%' );

                                if ( scope.attachHandleValues ) {
                                    // Reposition value labels.
                                    angular.element( values[0] ).css( pos, value1pos + '%' );
                                    angular.element( values[1] ).css( pos, value2pos + '%' );
                                    angular.element( values[1] ).css( posOpp, 'auto' ); // Reset opposite position for max value.
                                }

                                // Reposition the join element to span between handles.
                                angular.element( join ).css( pos, handle1pos + '%' ).css( posOpp, ( 100 - handle2pos ) + '%' );

                                // Adjust z-index of the min handle if it overlaps significantly with the max handle.
                                if ( handle1pos > 95 ) {
                                    angular.element( handles[0] ).css( 'z-index', 3 );
                                }
                            }

                        }

                    }


                    // Function executed when a handle is moved (mouse/touch down).
                    function handleMove ( index ) {

                        var $handle = handles[index]; // The specific handle being moved.

                        // Bind the 'start' event (mousedown/touchstart) to the handle.
                        $handle.bind( onEvent + 'X', function ( event ) {

                            // Determine the CSS class for the currently active handle.
                            var handleDownClass = ( index === 0 ? 'ngrs-handle-min' : 'ngrs-handle-max' ) + '-down',
                                // unbind = $handle.add($document).add('body'), // Original commented-out line.
                                modelValue = ( index === 0 ? scope.modelMin : scope.modelMax ) - scope.min, // Current model value relative to min.
                                originalPosition = ( modelValue / range ) * 100, // Handle's original position percentage.
                                originalClick = client( event ),                 // Coordinates of the initial click/touch.
                                previousClick = originalClick,                   // Store previous click coordinates.
                                previousProposal = false;                        // Flag for previous proposed position.

                            // Call the optional onHandleDown callback if provided.
                            if ( angular.isFunction( scope.onHandleDown ) ) {
                                scope.onHandleDown();
                            }

                            // Prevent text selection during drag operations.
                            angular.element( 'body' ).bind( 'selectstart' + eventNamespace, function () {
                                return false;
                            } );

                            // Only proceed if the slider is not disabled.
                            if ( !scope.disabled ) {

                                down = true; // Set the 'down' flag.

                                $handle.addClass( 'ngrs-down' ); // Add 'ngrs-down' class to the active handle.

                                $slider.addClass( 'ngrs-focus ' + handleDownClass ); // Add focus and specific handle-down classes to the slider.

                                // Add 'touch' class for specific MS styling, if applicable.
                                // This comment is from the original, but the code for adding 'touch' class isn't present here.
                            }
                        } );
                    }
                }
            };
        } ] );
} )();