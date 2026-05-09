/*******************************************************************************
 * This comment block serves to suppress JSLint warnings for commonly used
 * global variables that are typically defined elsewhere or by the browser
 * environment.
 *
 * It explicitly declares their existence to prevent linting errors.
 ******************************************************************************/
/* global alert: false, confirm: false, console: false, Debug: false, head: false, $: false, jQuery: false, window: false */


// This statement enforces the use of ECMAScript 5 strict mode.
// Developers should fully understand its implications before inclusion.
// It helps in writing "secure" JavaScript by eliminating common pitfalls.
"use strict";

// The 'define' function is used here for module definition,
// typical in AMD (Asynchronous Module Definition) environments like RequireJS.
define(

    // This array specifies the module's dependencies.
    // In this case, it depends on the 'jquery' library.
    ["jquery"],

    // The callback function receives the resolved dependencies as arguments.
    // Here, '$' will be the jQuery object.
    function ($) {

        // Cache references to frequently used DOM elements or objects for performance.
        var theContainer = $(".main-container"),        // Main content wrapper
            windowRef = $(window);                      // jQuery-wrapped window object


        // ---------------------------------------------------------------------
        // Helper Function: findTarget
        // ---------------------------------------------------------------------

        /**
         * Identifies a target content element within the DOM based on the `href`
         * attribute of a clicked anchor link.
         *
         * @param   {Object}    node    A direct reference to the HTML anchor
         *                                element that was clicked (not a jQuery object).
         * @returns {Object}            A jQuery object representing the found
         *                                target content element, identified by its ID.
         */
        function findTarget(node) {
            // Extract the full href attribute from the node.
            var theHref = node.href;

            // Find the position of the hash symbol ('#') and add one to get
            // the start of the actual ID string.
            var hashLoc = theHref.indexOf("#") + 1;

            // Extract the hash (the ID) from the href string.
            var theHash = theHref.substr(hashLoc, theHref.length);

            // Construct a jQuery selector using the extracted hash and return
            // the corresponding element.
            return $("#" + theHash);
        }


        // ---------------------------------------------------------------------
        // Main Function: doScroll
        // ---------------------------------------------------------------------

        /**
         * Initiates a smooth scrolling animation to a specific target element.
         * The target is determined by the `href` attribute of the provided
         * anchor link.
         *
         * @param   {Object}    node    A reference to the clicked anchor element
         *                                (plain JavaScript DOM object).
         * @returns {Undefined}         This function does not return any value.
         */
        function doScroll(node) {
            // Find the target element using the helper function.
            var theElem = findTarget(node);

            // Get the current offset (position) of the target element.
            var elemOffset = theElem.offset();

            // Calculate the desired scroll-to position, adjusted slightly
            // (e.g., to leave some padding at the top).
            var elemTopOffset = elemOffset.top - 20;

            // Animate the scroll position of the html and body elements.
            $("html, body").animate(
                {
                    // Target scroll position.
                    scrollTop: elemTopOffset + "px"
                },
                // Animation duration in milliseconds.
                1000,
                // Easing function for the animation.
                "easeInOutSine"
            );
        }


        // ---------------------------------------------------------------------
        // Event Handling: Side Navigation Click
        // ---------------------------------------------------------------------

        // Delegate click events for navigation links and "jumper" elements
        // within the main container.
        theContainer.delegate("nav a:not(.top-level), .jumper", "click", function (e) {
            // Perform the scroll animation to the target element.
            doScroll(this);

            // Prevent the default link behavior (e.g., jumping directly to the anchor).
            return false;
        });


        // ---------------------------------------------------------------------
        // Layout Function: fixNav
        // ---------------------------------------------------------------------

        /**
         * Adjusts the navigation's class based on its height relative to the
         * window height. This is typically used to prevent a fixed navigation
         * from overflowing the viewport.
         */
        function fixNav() {
            // Retrieve the current height of the browser window.
            var windowHeight = windowRef.height();

            // Find the primary navigation unordered list within the container.
            var nav = theContainer.find("nav > ul");

            // Get the current height of the navigation element.
            var navHeight = nav.height();

            // Check if the navigation's height exceeds the window's height.
            if (navHeight > windowHeight) {
                // If it's too tall, add a class to indicate it's not fixed.
                nav.addClass("not-fixed");
            } else {
                // Otherwise, remove the class, allowing it to potentially be fixed.
                nav.removeClass("not-fixed");
            }
        }

        // Initialize the navigation fix upon script load.
        fixNav();

        // Bind the 'fixNav' function to the window's 'resize' event,
        // ensuring the navigation adjusts when the window dimensions change.
        windowRef.bind("resize", fixNav);

    }
);