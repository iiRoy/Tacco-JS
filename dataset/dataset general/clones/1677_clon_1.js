/*******************************************************************************
 * This file is a Type I clone of responsive-mq.js.
 *
 * Original project: ResponsiveMQ - Bringing media queries to Javascript
 * Author:           Keith Jackson (tiefling)
 * Company:          The Ministry of Technology (ministryotech)
 * License:          MIT / http://bit.ly/mit-license
 * Website:          http://www.ministryotech.co.uk
 * Version:          v1.2.4
 *
 * Changes made:
 * - Extensive modifications to whitespace (indentation, spacing, blank lines).
 * - Addition, modification, and removal of comments.
 * - No changes to identifiers, variable names, function names, operators, or expressions.
 ******************************************************************************/

// Define the main function for ResponsiveMQ, accepting jQuery as an argument.
var respMqFunc = function ($) {

    // Initialize the core ResponsiveMQ object.
    var responsiveMq = {};

    // Array to store all registered breakpoints.
    responsiveMq.registeredBreakpoints = [];

    // Stores the name of the last breakpoint that was active.
    responsiveMq.lastActiveBreakpointName = '';


    /**
     * Registers a new breakpoint with ResponsiveMQ.
     *
     * @param {string}   name              A unique name for the breakpoint (e.g., 'mobile', 'tablet').
     * @param {string}   mediaQueryCssName The CSS media query string (e.g., '@media (min-width: 768px)').
     * @param {function} matchedFunc       Function to execute when this breakpoint becomes active.
     * @param {function} notMatchedFunc    Function to execute when this breakpoint becomes inactive.
     */
    responsiveMq.registerBreakpoint = function (name, mediaQueryCssName, matchedFunc, notMatchedFunc) {
        // Add the breakpoint configuration to the internal array.
        responsiveMq.registeredBreakpoints.push({
            'name': name,
            'mediaQueryCssName': mediaQueryCssName,
            'matchedFunc': matchedFunc,
            'notMatchedFunc': notMatchedFunc
        });
    };


    // The main activation function for ResponsiveMQ.
    // This sets up the necessary DOM elements, styles, and event listeners.
    responsiveMq.activate = function () {

        /**
         * Helper function to render a span element in the document body.
         * This span is used by CSS media queries to determine the active breakpoint.
         * @param {string} className The class name to assign to the span, which corresponds to the breakpoint name.
         */
        var renderMarkup = function (className) {
            // Append a hidden span with the breakpoint's class name to the body.
            $(document.body).append('<span class="' + className + '"></span>');
        };

        /**
         * Helper function to inject dynamic CSS styles for a specific breakpoint.
         * This ensures that only the span corresponding to the active media query is visible.
         * @param {string} className       The name of the breakpoint (used as a CSS class).
         * @param {string} mediaQueryCssName The CSS media query string for this breakpoint.
         */
        var renderStyle = function (className, mediaQueryCssName) {
            var styleString = '\n'; // Start with a newline for formatting.

            // Check if a specific media query is provided for this breakpoint.
            if (mediaQueryCssName !== '') {
                // If a media query exists, wrap the styles within it.
                styleString += mediaQueryCssName + '{\n';

                // Iterate through all registered breakpoints.
                for (var bpi = 0; bpi < responsiveMq.registeredBreakpoints.length; bpi++) {
                    // If the current breakpoint in the loop is NOT the one we're styling, hide its indicator span.
                    if (responsiveMq.registeredBreakpoints[bpi].name !== className) {
                        styleString += '   .' + responsiveMq.registeredBreakpoints[bpi].name + ' { display: none; }\n';
                    } else {
                        // If it IS the breakpoint we're styling, make its indicator span visible.
                        styleString += '   .' + className + ' { display: inline; }\n';
                    }
                }
                styleString += '}\n'; // Close the media query block.
            } else {
                // If no specific media query is provided (e.g., for a default or fallback breakpoint).
                // In this case, these styles apply universally unless overridden by a media query.
                for (var bpx = 0; bpx < responsiveMq.registeredBreakpoints.length; bpx++) {
                    // Hide other breakpoint indicators.
                    if (responsiveMq.registeredBreakpoints[bpx].name !== className) {
                        styleString += '.' + responsiveMq.registeredBreakpoints[bpx].name + ' { display: none; }\n';
                    } else {
                        // Show this breakpoint's indicator.
                        styleString += '.' + className + ' { display: inline; }\n';
                    }
                }
            }
            // Append the generated style block to the document head.
            $(document.head).append('<style>' + styleString + '</style>');
        };


        /**
         * Applies JavaScript functions associated with active breakpoints.
         * This function is triggered on window resize and document ready.
         */
        var applyResponsiveJs = function () {
            // Loop through each registered breakpoint.
            for (var rjsi = 0; rjsi < responsiveMq.registeredBreakpoints.length; rjsi++) {
                var bp = responsiveMq.registeredBreakpoints[rjsi]; // Get the current breakpoint object.

                // Check if the indicator span for this breakpoint is currently visible ('inline').
                if ($('.' + bp.name).css('display') == 'inline') {
                    // If this breakpoint is active AND it's different from the last active one.
                    if (bp.name !== responsiveMq.lastActiveBreakpointName) {
                        responsiveMq.lastActiveBreakpointName = bp.name; // Update the last active breakpoint.
                        var matchedFunc = bp.matchedFunc; // Get the 'matched' callback.

                        // Execute the matched function if it exists.
                        if (matchedFunc !== undefined && matchedFunc !== null) {
                            matchedFunc();
                        }
                    }
                } else {
                    // If this breakpoint is NOT active, execute its 'not matched' callback if it exists.
                    var notMatchedFunc = bp.notMatchedFunc;
                    if (notMatchedFunc !== undefined && notMatchedFunc !== null) {
                        notMatchedFunc();
                    }
                }
            }
        };


        // --- Initialization Loop ---
        // For each registered breakpoint, create its corresponding DOM element and inject its styles.
        for (var i = 0; i < responsiveMq.registeredBreakpoints.length; i++) {
            renderMarkup(responsiveMq.registeredBreakpoints[i].name); // Create the hidden span.
            renderStyle(responsiveMq.registeredBreakpoints[i].name, responsiveMq.registeredBreakpoints[i].mediaQueryCssName); // Inject the CSS.
        }

        // --- Event Listeners ---
        // Bind the applyResponsiveJs function to the window's 'resize' event.
        $(window).on('resize', applyResponsiveJs);

        // Bind the applyResponsiveJs function to the document's 'ready' event
        // to ensure initial breakpoint detection on page load.
        $(document).ready(applyResponsiveJs);
    };

    // Return the responsiveMq object, exposing its public methods.
    return responsiveMq;
};


// --- Module Export / Global Assignment ---
// Check for AMD (Asynchronous Module Definition) support (e.g., RequireJS).
if (typeof define === 'function' && define.amd) {
    // If AMD is available, define the module with jQuery as a dependency.
    define(['jquery'], respMqFunc);
} else {
    // Otherwise, attach ResponsiveMQ to the global jQuery object.
    // This assumes jQuery (or a compatible '$' object) is already available globally.
    $.responsiveMQ = respMqFunc(jQuery);
}