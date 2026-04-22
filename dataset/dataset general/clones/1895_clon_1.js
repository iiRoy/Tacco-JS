/*
 *  Chart.js - A JavaScript charting library.
 *  ----------------------------------------
 *
 *  Project Home: http://chartjs.org/
 *  Current Version: {{ version }} (placeholder)
 *
 *  Copyright (c) 2015 Nick Downie.
 *  Licensed under the MIT License.
 *  See LICENSE.md for details: https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 *
 *  This file contains the core Chart.js functionality and helper utilities.
 *  It's structured as an Immediately Invoked Function Expression (IIFE)
 *  to encapsulate its scope and avoid polluting the global namespace.
 */


( function ( ) {

    "use strict" ; /* Enforce strict mode for cleaner code and fewer errors. */

    // Declare the root object, which is 'window' in a browser environment
    // or 'global' in a Node.js (server-side) environment.
    var root = this ,
        // Store the previous value of `root.Chart` to allow for `noConflict` later if needed.
        previous = root.Chart ;

    // Define the main Chart constructor function.
    // This will occupy the global 'Chart' variable.
    var Chart = function ( context ) {

        var chart = this ; /* Reference to the current chart instance. */

        this.canvas = context.canvas ; // The HTML5 canvas element itself.

        this.ctx = context ; // The 2D rendering context of the canvas.

        // --- Variables global to this specific chart instance ---
        // Get the width from the canvas element.
        var width = this.width = context.canvas.width ;
        // Get the height from the canvas element.
        var height = this.height = context.canvas.height ;
        // Calculate and store the aspect ratio (width / height).
        this.aspectRatio = this.width / this.height ;

        // Handle high pixel density displays (e.g., Retina screens).
        // This helper scales the canvas to match the device's pixel ratio.
        helpers.retinaScale( this ) ;

        return this ; // Return the newly created chart instance.
    } ;

    // Expose the default options globally so users can easily customize them.
    Chart.defaults = {

        global : {

            // Boolean - Whether to enable animation for chart drawing.
            animation : true ,

            // Number - The total number of animation steps (frames).
            animationSteps : 60 ,

            // String - The easing effect to use for animations (e.g., "easeOutQuart").
            animationEasing : "easeOutQuart" ,

            // Boolean - Determines if the scale (axes and labels) should be displayed.
            showScale : true ,

            // Boolean - If true, a hard-coded scale will be used instead of auto-generated.
            scaleOverride : false ,

            // ** Required if scaleOverride is set to true **
            // Number - The number of steps (intervals) in the hard-coded scale.
            scaleSteps : null ,
            // Number - The value increment for each step in the hard-coded scale.
            scaleStepWidth : null ,
            // Number - The starting value for the hard-coded scale.
            scaleStartValue : null ,

            // String - The color of the scale lines (grid lines and axis lines).
            scaleLineColor : "rgba(0,0,0,.1)" ,

            // Number - The pixel width of the scale lines.
            scaleLineWidth : 1 ,

            // Boolean - Whether to display labels on the scale (e.g., numbers on the y-axis).
            scaleShowLabels : true ,

            // Interpolated JS string - The template for scale labels; can access `value`.
            scaleLabel : "<%=value%>" ,

            // Boolean - If true, scale labels will only show integers, even if space allows floats.
            scaleIntegersOnly : true ,

            // Boolean - If true, the scale will always start at zero.
            // If false, it might start below zero to accommodate negative values.
            scaleBeginAtZero : false ,

            // String - Font family declaration for scale labels.
            scaleFontFamily : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" ,

            // Number - Font size for scale labels in pixels.
            scaleFontSize : 12 ,

            // String - Font weight style for scale labels (e.g., "normal", "bold").
            scaleFontStyle : "normal" ,

            // String - Font color for scale labels.
            scaleFontColor : "#666" ,

            // Boolean - Determines if the chart should be responsive and resize with the browser window.
            responsive : false ,

            // Boolean - If responsive is true, this determines if the chart maintains its aspect ratio.
            // If false, it will fill the entire container.
            maintainAspectRatio : true ,

            // Boolean - Determines whether tooltips should be drawn on the canvas.
            // Attaches events like touchmove & mousemove.
            showTooltips : true ,

            // Boolean - If true, a custom tooltip function will be called instead of drawing the built-in one.
            customTooltips : false ,

            // Array - An array of string names for events that trigger tooltips.
            tooltipEvents : [ "mousemove" , "touchstart" , "touchmove" , "mouseout" ] ,

            // String - Background color for the tooltip box.
            tooltipFillColor : "rgba(0,0,0,0.8)" ,

            // String - Font family declaration for tooltip labels.
            tooltipFontFamily : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" ,

            // Number - Font size for tooltip labels in pixels.
            tooltipFontSize : 14 ,

            // String - Font weight style for tooltip labels.
            tooltipFontStyle : "normal" ,

            // String - Font color for tooltip labels.
            tooltipFontColor : "#fff" ,

            // String - Font family declaration for tooltip title.
            tooltipTitleFontFamily : "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" ,

            // Number - Font size for tooltip title in pixels.
            tooltipTitleFontSize : 14 ,

            // String - Font weight style for tooltip title.
            tooltipTitleFontStyle : "bold" ,

            // String - Font color for tooltip title.
            tooltipTitleFontColor : "#fff" ,

            // Number - Vertical padding around the tooltip text in pixels.
            tooltipYPadding : 6 ,

            // Number - Horizontal padding around the tooltip text in pixels.
            tooltipXPadding : 6 ,

            // Number - Size (length) of the caret (pointer) on the tooltip.
            tooltipCaretSize : 8 ,

            // Number - Pixel radius for the tooltip's rounded corners.
            tooltipCornerRadius : 6 ,

            // Number - Pixel offset from the data point's X coordinate to the tooltip's edge.
            tooltipXOffset : 10 ,

            // String - Template string for a single-value tooltip.
            tooltipTemplate : "<%if (label){%><%=label%>: <%}%><%= value %>" ,

            // String - Template string for a multi-value (e.g., stacked bar) tooltip.
            multiTooltipTemplate : "<%= value %>" ,

            // String - Background color behind the legend color block within a multi-tooltip.
            multiTooltipKeyBackground : '#fff' ,

            // Function - Callback function that fires on each animation progression step.
            onAnimationProgress : function ( ) { } ,

            // Function - Callback function that fires once the animation is complete.
            onAnimationComplete : function ( ) { }

        }
    } ;

    // Create an empty object to store different chart types (e.g., Line, Bar, Pie).
    // This allows for future extension and custom chart type registration.
    Chart.types = { } ;

    // Global Chart helpers object for various utility methods and common classes.
    var helpers = Chart.helpers = { } ;

    // --- Basic JavaScript utility methods ---

    // Iterates over an array or object, applying a callback function to each item.
    var each = helpers.each = function ( loopable , callback , self ) {
            // Capture any additional arguments passed after 'self'.
            var additionalArgs = Array.prototype.slice.call( arguments , 3 ) ;

            // First, check if the loopable object is not null or undefined.
            if ( loopable ) {
                // If it's an array-like object (has a 'length' property that's a non-negative number).
                if ( loopable.length === + loopable.length ) {
                    var i ;
                    for ( i = 0 ; i < loopable.length ; i ++ ) {
                        // Apply the callback with the item, index, and any additional arguments.
                        callback.apply( self , [ loopable[ i ] , i ] .concat( additionalArgs ) ) ;
                    }
                }
                else {
                    // If it's an object, iterate over its properties.
                    for ( var item in loopable ) {
                        // Apply the callback with the property value, key, and any additional arguments.
                        callback.apply( self , [ loopable[ item ] , item ] .concat( additionalArgs ) ) ;
                    }
                }
            }
        } , // End of 'each' helper.

        // Creates a shallow clone of an object.
        clone = helpers.clone = function ( obj ) {
            var objClone = { } ; // Initialize an empty object for the clone.
            each( obj , function ( value , key ) {
                // Only copy own properties to avoid copying prototype chain properties.
                if ( obj.hasOwnProperty( key ) ) objClone[ key ] = value ;
            } ) ;
            return objClone ;
        } , // End of 'clone' helper.

        // Extends a base object with properties from one or more extension objects.
        // Later arguments overwrite earlier ones.
        extend = helpers.extend = function ( base ) {
            // Iterate over all arguments starting from the second one (extension objects).
            each( Array.prototype.slice.call( arguments , 1 ) , function ( extensionObject ) {
                // For each extension object, copy its properties to the base object.
                each( extensionObject , function ( value , key ) {
                    if ( extensionObject.hasOwnProperty( key ) ) base[ key ] = value ;
                } ) ;
            } ) ;
            return base ; // Return the modified base object.
        } , // End of 'extend' helper.

        // Merges properties from multiple objects into a new, shallowly cloned object.
        // Properties in later objects overwrite those in earlier ones.
        merge = helpers.merge = function ( base , master ) {
            // Convert arguments into an array.
            var args = Array.prototype.slice.call( arguments , 0 ) ;
            args.unshift( { } ) ; // Prepend an empty object to serve as the initial target for extension.
            return extend.apply( null , args ) ; // Use 'extend' to merge into the new empty object.
        } , // End of 'merge' helper.

        // Finds the index of an item in an array.
        // Provides a fallback for older browsers that don't support Array.prototype.indexOf.
        indexOf = helpers.indexOf = function ( arrayToSearch , item ) {
            if ( Array.prototype.indexOf ) {
                return arrayToSearch.indexOf( item ) ; // Use native method if available.
            }
            else {
                // Manual iteration for older browsers.
                for ( var i = 0 ; i < arrayToSearch.length ; i ++ ) {
                    if ( arrayToSearch[ i ] === item ) return i ;
                }
                return -1 ; // Item not found.
            }
        } , // End of 'indexOf' helper.

        // Filters a collection (array or object) based on a callback function.
        // Returns a new array containing only the items for which the callback returns true.
        where = helpers.where = function ( collection , filterCallback ) {
            var filtered = [ ] ; // Initialize an empty array to store filtered items.

            helpers.each( collection , function ( item ) {
                if ( filterCallback( item ) ) {
                    filtered.push( item ) ; // Add item to filtered array if it passes the filter.
                }
            } ) ;

            return filtered ; // Return the array of filtered items.
        } , // End of 'where' helper.

        // Finds the next item in an array that satisfies a filter callback, starting from a given index.
        findNextWhere = helpers.findNextWhere = function ( arrayToSearch , filterCallback , startIndex ) {
            // Default `startIndex` to -1 if not provided, so the search starts from index 0.
            if ( ! startIndex ) {
                startIndex = -1 ;
            }
            // Iterate from `startIndex + 1` to the end of the array.
            for ( var i = startIndex + 1 ; i < arrayToSearch.length ; i ++ ) {
                var currentItem = arrayToSearch[ i ] ;
                if ( filterCallback( currentItem ) ) {
                    return currentItem ; // Return the first item that matches.
                }
            }
            // If no item is found, implicitly returns undefined.
        } , // End of 'findNextWhere' helper.

        // Finds the previous item in an array that satisfies a filter callback, starting from a given index.
        findPreviousWhere = helpers.findPreviousWhere = function ( arrayToSearch , filterCallback , startIndex ) {
            // Default `startIndex` to the end of the array if not provided.
            if ( ! startIndex ) {
                startIndex = arrayToSearch.length ;
            }
            // Iterate backwards from `startIndex - 1` to the beginning of the array.
            for ( var i = startIndex - 1 ; i >= 0 ; i -- ) {
                var currentItem = arrayToSearch[ i ] ;
                if ( filterCallback( currentItem ) ) {
                    return currentItem ; // Return the first item that matches (going backwards).
                }
            }
            // If no item is found, implicitly returns undefined.
        } , // End of 'findPreviousWhere' helper.

        // Implements basic JavaScript inheritance, similar to Backbone.js.
        // Allows creating new Chart types that inherit from existing ones.
        inherits = helpers.inherits = function ( extensions ) {
            var parent = this ; // The parent constructor function (e.g., Chart).

            // Define the new constructor function. If `extensions` has a 'constructor' property, use that;
            // otherwise, create a generic constructor that calls the parent constructor.
            var ChartElement = ( extensions && extensions.hasOwnProperty( "constructor" ) )
                               ? extensions.constructor
                               : function ( ) { return parent.apply( this , arguments ) ; } ;

            // Create an intermediate constructor to set up the prototype chain without calling the parent constructor.
            var Surrogate = function ( ) { this.constructor = ChartElement ; } ;
            Surrogate.prototype = parent.prototype ; // Inherit parent's prototype.
            ChartElement.prototype = new Surrogate( ) ; // Set the new constructor's prototype to an instance of the surrogate.

            ChartElement.extend = inherits ; // Make the new constructor extendable as well.

            if ( extensions ) extend( ChartElement.prototype , extensions ) ; // Add custom methods/properties.

            ChartElement.__super__ = parent.prototype ; // Store a reference to the parent's prototype.

            return ChartElement ; // Return the new, inherited constructor.
        } , // End of 'inherits' helper.

        // A no-operation function, useful as a default callback.
        noop = helpers.noop = function ( ) { } ,

        // Generates unique IDs for chart instances.
        uid = helpers.uid = ( function ( ) {
            var id = 0 ; // Private counter for unique IDs.
            return function ( ) {
                return "chart-" + id ++ ; // Increment and return a new ID.
            } ;
        } ) ( ) , // End of 'uid' helper (IIFE).

        // A utility function for logging warnings to the console.
        warn = helpers.warn = function ( str ) {
            // Check if console and console.warn are available.
            if ( window.console && typeof window.console.warn == "function" ) console.warn( str ) ;
        } , // End of 'warn' helper.

        // Checks if AMD (Asynchronous Module Definition) is available.
        amd = helpers.amd = ( typeof define == 'function' && define.amd ) ,

        // --- Math methods ---

        // Checks if a given value is a valid number (not NaN and finite).
        isNumber = helpers.isNumber = function ( n ) {
            return ! isNaN( parseFloat( n ) ) && isFinite( n ) ;
        } , // End of 'isNumber' helper.

        // Returns the maximum value from an array of numbers.
        max = helpers.max = function ( array ) {
            return Math.max.apply( Math , array ) ; // Use Math.max with apply for array arguments.
        } , // End of 'max' helper.

        // Returns the minimum value from an array of numbers.
        min = helpers.min = function ( array ) {
            return Math.min.apply( Math , array ) ; // Use Math.min with apply for array arguments.
        } , // End of 'min' helper.

        // Caps a value within a specified range (minValue to maxValue).
        cap = helpers.cap = function ( valueToCap , maxValue , minValue ) {
            if ( isNumber( maxValue ) ) {
                if ( valueToCap > maxValue ) {
                    return maxValue ;
                }
            }
            else if ( isNumber( minValue ) ) {
                if ( valueToCap < minValue ) {
                    return minValue ;
                }
            }
            return valueToCap ; // If no bounds or within bounds, return original value.
        } , // End of 'cap' helper.

        // Calculates the number of decimal places in a number.
        getDecimalPlaces = helpers.getDecimalPlaces = function ( num ) {
            // If it's a non-integer number, split by '.' and get length of decimal part.
            if ( num % 1 !== 0 && isNumber( num ) ) {
                return num.toString( ) .split( "." ) [ 1 ] .length ;
            }
            else {
                return 0 ; // Integers have 0 decimal places.
            }
        } , // End of 'getDecimalPlaces' helper.

        // Converts degrees to radians.
        toRadians = helpers.radians = function ( degrees ) {
            return degrees * ( Math.PI / 180 ) ;
        } , // End of 'toRadians' helper.

        // Gets the angle from the vertical upright to a point relative to a center point.
        getAngleFromPoint = helpers.getAngleFromPoint = function ( centrePoint , anglePoint ) {
            var distanceFromXCenter = anglePoint.x - centrePoint.x ,
                distanceFromYCenter = anglePoint.y - centrePoint.y ,
                radialDistanceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter ) ;


            var angle = Math.PI * 2 + Math.atan2( distanceFromYCenter , distanceFromXCenter ) ;

            // If the segment is in the top-left quadrant, we need to add another rotation to the angle
            // to ensure it's always positive and within [0, 2*PI).
            if ( distanceFromXCenter < 0 && distanceFromYCenter < 0 ) {
                angle += Math.PI * 2 ;
            }

            return {
                angle : angle ,
                distance : radialDistanceFromCenter
            } ;
        } , // End of 'getAngleFromPoint' helper.

        // Adjusts pixel values for crisp rendering on canvas (e.g., for lines).
        aliasPixel = helpers.aliasPixel = function ( pixelWidth ) {
            return ( pixelWidth % 2 === 0 ) ? 0 : 0.5 ; // Return 0 for even, 0.5 for odd widths.
        } , // End of 'aliasPixel' helper.

        // Calculates control points for a Catmull-Rom spline curve.
        // Props to Rob Spencer at scaled innovation for his post on splining between points:
        // http://scaledinnovation.com/analytics/splines/aboutSplines.html
        splineCurve = helpers.splineCurve = function ( FirstPoint , MiddlePoint , AfterPoint , t ) {
            var d01 = Math.sqrt( Math.pow( MiddlePoint.x - FirstPoint.x , 2 ) + Math.pow( MiddlePoint.y - FirstPoint.y , 2 ) ) ,
                d12 = Math.sqrt( Math.pow( AfterPoint.x - MiddlePoint.x , 2 ) + Math.pow( AfterPoint.y - MiddlePoint.y , 2 ) ) ,
                fa = t * d01 / ( d01 + d12 ) , // Scaling factor for triangle Ta
                fb = t * d12 / ( d01 + d12 ) ; // Scaling factor for triangle Tb (implied)

            return {
                inner : {
                    x : MiddlePoint.x - fa * ( AfterPoint.x - FirstPoint.x ) ,
                    y : MiddlePoint.y - fa * ( AfterPoint.y - FirstPoint.y )
                } ,
                outer : {
                    x : MiddlePoint.x + fb * ( AfterPoint.x - FirstPoint.x ) ,
                    y : MiddlePoint.y + fb * ( AfterPoint.y - FirstPoint.y )
                }
            } ;
        } , // End of 'splineCurve' helper.

        // Calculates the order of magnitude for a given value (e.g., 100 -> 2, 0.01 -> -2).
        calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function ( val ) {
            return Math.floor( Math.log( val ) / Math.LN10 ) ;
        } , // End of 'calculateOrderOfMagnitude' helper.

        // Calculates the optimal scale range (min, max, stepValue, steps) for a given set of data.
        calculateScaleRange = helpers.calculateScaleRange = function ( valuesArray , drawingSize , textSize , startFromZero , integersOnly ) {

            // Set a minimum of two steps: one point at the top and one at the base of the graph.
            var minSteps = 2 ,
                // Calculate the maximum number of steps that can fit visually.
                maxSteps = Math.floor( drawingSize / ( textSize * 1.5 ) ) ,
                // Flag to indicate if fitting should be skipped (e.g., not enough space for minSteps).
                skipFitting = ( minSteps >= maxSteps ) ;

            // Find the maximum and minimum values in the data array.
            var maxValue = max( valuesArray ) ,
                minValue = min( valuesArray ) ;

            // We need some degree of separation here to calculate the scales if all the values are the same.
            // Adding/minusing 0.5 will give us a range of 1.
            if ( maxValue === minValue ) {
                maxValue += 0.5 ;
                // So we don't end up with a graph with a negative start value if we've said always start from zero.
                if ( minValue >= 0.5 && ! startFromZero ) {
                    minValue -= 0.5 ;
                }
                else {
                    // Make up a whole number above the values if minValue is too small or starts at zero.
                    maxValue += 0.5 ;
                }
            }

            var valueRange = Math.abs( maxValue - minValue ) ,
                rangeOrderOfMagnitude = calculateOrderOfMagnitude( valueRange ) ,
                // Calculate an initial graph maximum, rounded up to the nearest order of magnitude.
                graphMax = Math.ceil( maxValue / ( 1 * Math.pow( 10 , rangeOrderOfMagnitude ) ) ) * Math.pow( 10 , rangeOrderOfMagnitude ) ,
                // Calculate an initial graph minimum. If 'startFromZero' is true, it's 0.
                // Otherwise, rounded down to the nearest order of magnitude.
                graphMin = ( startFromZero ) ? 0 : Math.floor( minValue / ( 1 * Math.pow( 10 , rangeOrderOfMagnitude ) ) ) * Math.pow( 10 , rangeOrderOfMagnitude ) ,
                graphRange = graphMax - graphMin ,
                // Initial step value based on the order of magnitude.
                stepValue = Math.pow( 10 , rangeOrderOfMagnitude ) ,
                // Initial number of steps.
                numberOfSteps = Math.round( graphRange / stepValue ) ;

            // If we have more space on the graph, we'll use it to give more definition to the data.
            while ( ( numberOfSteps > maxSteps || ( numberOfSteps * 2 ) < maxSteps ) && ! skipFitting ) {
                if ( numberOfSteps > maxSteps ) {
                    stepValue *= 2 ; // Increase step value to reduce number of steps.
                    numberOfSteps = Math.round( graphRange / stepValue ) ;
                    // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
                    if ( numberOfSteps % 1 !== 0 ) {
                        skipFitting = true ;
                    }
                }
                // We can fit in double the amount of scale points on the scale.
                else {
                    // If user has declared integers only, and the step value isn't a decimal.
                    if ( integersOnly && rangeOrderOfMagnitude >= 0 ) {
                        // If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float.
                        if ( stepValue / 2 % 1 === 0 ) {
                            stepValue /= 2 ; // Decrease step value to increase number of steps.
                            numberOfSteps = Math.round( graphRange / stepValue ) ;
                        }
                        // If it would make it a float, break out of the loop.
                        else {
                            break ;
                        }
                    }
                    // If the scale doesn't have to be an int, make the scale more granular anyway.
                    else {
                        stepValue /= 2 ;
                        numberOfSteps = Math.round( graphRange / stepValue ) ;
                    }
                }
            }

            if ( skipFitting ) {
                numberOfSteps = minSteps ;
                stepValue = graphRange / numberOfSteps ;
            }

            return {
                steps : numberOfSteps ,
                stepValue : stepValue ,
                min : graphMin ,
                max : graphMin + ( numberOfSteps * stepValue )
            } ;

        } , // End of 'calculateScaleRange' helper.

        /* jshint ignore:start */
        // Temporarily ignore JSHint errors for the following block.
        // This is due to the use of 'new Function' which JSHint flags.

        // --- Templating methods ---
        // JavaScript micro-templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
        template = helpers.template = function ( templateString , valuesObject ) {

            // If `templateString` is a function rather than a string-template,
            // call the function directly with the `valuesObject`.
            if ( templateString instanceof Function ) {
                return templateString( valuesObject ) ;
            }

            var cache = { } ; // Cache compiled templates.

            function tmpl ( str , data ) {
                // Figure out if we're getting a template, or if we need to
                // load the template - and be sure to cache the result.
                var fn = ! / \W / .test( str )
                    ? cache[ str ] = cache[ str ]
                    : // Generate a reusable function that will serve as a template
                    // generator (and which will be cached).
                    new Function( "obj" ,
                        "var p=[],print=function(){p.push.apply(p,arguments);};" +

                        // Introduce the data as local variables using with(){}
                        "with(obj){p.push('" +

                        // Convert the template into pure JavaScript
                        str
                            .replace( / [ \r \t \n ] / g , " " )
                            .split( "<%" ) .join( "\t" )
                            .replace( / ( ( ^ | % > ) [ ^ \t ] * ) ' / g , "$1\r" )
                            .replace( / \t = ( .*? ) % > / g , "',$1,'" )
                            .split( "\t" ) .join( "');" )
                            .split( "%>" ) .join( "p.push('" )
                            .split( "\r" ) .join( "\\'" ) +
                        "');}return p.join('');"
                    ) ;

                // Provide some basic currying to the user.
                return data ? fn( data ) : fn ;
            }
            return tmpl( templateString , valuesObject ) ;
        } , // End of 'template' helper.

        /* jshint ignore:end */
        // Re-enable JSHint for subsequent code.

        // Generates an array of labels based on a template string, number of steps, min value, and step value.
        generateLabels = helpers.generateLabels = function ( templateString , numberOfSteps , graphMin , stepValue ) {
            var labelsArray = new Array( numberOfSteps ) ; // Create an array to hold the labels.

            // Ensure a template string is provided before generating labels.
            if ( templateString ) {
                each( labelsArray , function ( val , index ) {
                    // Populate each label using the template and calculated value.
                    labelsArray[ index ] = template( templateString , { value : ( graphMin + ( stepValue * ( index + 1 ) ) ) } ) ;
                } ) ;
            }
            return labelsArray ; // Return the array of generated labels.
        } , // End of 'generateLabels' helper.

        // --- Animation methods ---
        // Easing functions adapted from Robert Penner's easing equations.
        // Source: http://www.robertpenner.com/easing/
        easingEffects = helpers.easingEffects = {
            // Linear easing: constant speed.
            linear : function ( t ) {
                return t ; // Simply returns the time 't' itself.
            } , // End of 'linear' easing.