/*
 * --------------------------------------------------------------------------------------------------------------------
 * Single Page Navigation Plugin - Core JavaScript File
 *
 * This file contains the primary logic for the Single Page Navigation jQuery plugin.
 * It enables smooth scrolling to sections within a single page application and manages
 * active link states based on scroll position.
 *
 * Copyright (c) 2014 Chris Wojcik <hello@chriswojcik.net> - All rights reserved.
 *
 * This software is dual-licensed under the MIT and GPL licenses.
 * Please refer to the respective license files for full details.
 *
 * Author: Chris Wojcik
 * Version: 1.2.0 - Stable Release
 * --------------------------------------------------------------------------------------------------------------------
 */


// Ensure Object.create compatibility for older browsers if it doesn't exist.
// This is a common polyfill pattern.
if ( typeof Object.create !== 'function' ) {


    Object.create = function (obj) {

        function F () {} // Temporary constructor function.

        F.prototype = obj; // Set its prototype to the desired object.

        return new F(); // Return a new instance.
    };

}


// Immediately Invoked Function Expression (IIFE) to encapsulate the plugin.
// This protects variables from the global scope and ensures jQuery is passed correctly.
(function ($, window, document, undefined) {

    // Enforce strict parsing and execution rules for better code quality and error handling.
    "use strict";

    // Define the main SinglePageNav object, serving as the prototype for plugin instances.
    var SinglePageNav = {

        /**
         * Initializes the single page navigation plugin.
         * Sets up options, DOM elements, and event listeners.
         *
         * @param {object} options - User-defined configuration options.
         * @param {HTMLElement} container - The DOM element containing the navigation links.
         */
        init: function (options, container) {


            // Merge default options with user-provided options.
            // This ensures all settings are defined.
            this.options = $.extend({}, $.fn.singlePageNav.defaults, options);


            // Store the raw container element.
            this.container = container;

            // Cache the jQuery-wrapped container for efficient DOM manipulation.
            this.$container = $(container);

            // Find all 'a' (anchor) elements within the container.
            this.$links = this.$container.find('a');


            // Apply a filter to the links if one is specified in the options.
            // This allows targeting specific navigation items.
            if (this.options.filter !== '') {

                this.$links = this.$links.filter(this.options.filter);

            }


            // Cache jQuery-wrapped window and html/body elements for performance.
            this.$window = $(window);
            this.$htmlbody = $('html, body');


            // Attach a click event handler to the navigation links.
            // The `$.proxy` ensures 'this' context remains correct within handleClick.
            this.$links.on('click.singlePageNav', $.proxy(this.handleClick, this));


            // Initialize scroll state flag.
            this.didScroll = false;

            // Perform an initial check of the scroll position to set the active link.
            this.checkPosition();

            // Start the scroll timer for continuous position checking.
            this.setTimer();

        },


        /**
         * Handles the click event on a navigation link.
         * Prevents default link behavior and initiates smooth scrolling.
         *
         * @param {Event} e - The DOM event object.
         */
        handleClick: function (e) {
            var self = this, // Cache 'this' for use in callbacks.
                link = e.currentTarget, // The actual DOM element that was clicked.
                $elem = $(link.hash); // jQuery object for the target element (from the link's hash).


            e.preventDefault(); // Prevent the browser's default jump-to-anchor behavior.


            // Proceed only if the target element actually exists in the DOM.
            if ($elem.length) {


                // Clear the scroll timer to prevent active link updates during the scroll animation.
                self.clearTimer();


                // Execute the 'beforeStart' callback if it's a function.
                // This allows custom actions before the scroll begins.
                if (typeof self.options.beforeStart === 'function') {

                    self.options.beforeStart();

                }


                // Set the clicked link as active immediately.
                self.setActiveLink(link.hash);


                // Perform the smooth scroll animation.
                // A callback is provided to execute after the animation completes.
                self.scrollTo($elem, function () {


                    // If updateHash is enabled and pushState is supported, update the URL hash.
                    // This changes the URL without a full page reload.
                    if (self.options.updateHash && history.pushState) {
                        history.pushState(null, null, link.hash);
                    }


                    // Restart the scroll timer after the animation finishes.
                    self.setTimer();


                    // Execute the 'onComplete' callback if it's a function.
                    // This allows custom actions after the scroll ends.
                    if (typeof self.options.onComplete === 'function') {

                        self.options.onComplete();

                    }

                });

            }

        },


        /**
         * Smoothly scrolls the window to the specified element.
         *
         * @param {jQuery} $elem - The target jQuery element to scroll to.
         * @param {function} callback - Function to execute after the scroll animation completes.
         */
        scrollTo: function ($elem, callback) {
            var self = this; // Maintain context.
            var target = self.getCoords($elem).top; // Calculate the target scroll position.
            var called = false; // Flag to ensure callback is called only once.


            // Stop any current animations on html/body and start a new one.
            self.$htmlbody.stop().animate(
                {
                    scrollTop: target // Animate the scrollTop property.
                },
                {
                    duration: self.options.speed, // Animation duration from options.
                    easing: self.options.easing, // Easing function from options.
                    complete: function () { // Callback function when animation finishes.
                        if (typeof callback === 'function' && !called) {
                            callback(); // Execute the provided callback.
                        }
                        called = true; // Set flag to prevent multiple calls.
                    }
                }
            );
        },


        /**
         * Sets up a timer to periodically check the scroll position.
         * This is optimized to only check when an actual scroll event has occurred.
         */
        setTimer: function () {
            var self = this; // Context for inner functions.


            // Attach a scroll event listener to the window.
            // This just sets a flag, actual position check happens in the interval.
            self.$window.on('scroll.singlePageNav', function () {
                self.didScroll = true; // Mark that a scroll has happened.
            });


            // Set an interval to periodically check the 'didScroll' flag.
            self.timer = setInterval(function () {
                if (self.didScroll) { // If a scroll occurred since last check...
                    self.didScroll = false; // Reset the flag.
                    self.checkPosition(); // Perform the position check.
                }
            }, 250); // Check every 250 milliseconds.
        },


        /**
         * Clears the scroll timer and removes the scroll event listener.
         * Used to temporarily halt active link updates.
         */
        clearTimer: function () {
            clearInterval(this.timer); // Stop the periodic timer.
            this.$window.off('scroll.singlePageNav'); // Remove the scroll event handler.
            this.didScroll = false; // Reset the scroll flag.
        },


        /**
         * Checks the current scroll position and updates the active navigation link accordingly.
         */
        checkPosition: function () {
            var scrollPos = this.$window.scrollTop(); // Get the current vertical scroll position.
            var currentSection = this.getCurrentSection(scrollPos); // Determine which section is currently active.

            if (currentSection !== null) { // If an active section is found...
                this.setActiveLink(currentSection); // Update the active navigation link.
            }
        },


        /**
         * Calculates the coordinates (specifically, the top offset) of a given element.
         *
         * @param {jQuery} $elem - The jQuery element to get coordinates for.
         * @returns {object} An object containing the 'top' coordinate.
         */
        getCoords: function ($elem) {
            return {
                top: Math.round($elem.offset().top) - this.options.offset // Calculate and adjust by offset.
            };
        },


        /**
         * Sets the 'current' class on the navigation link corresponding to the given hash.
         * Removes the class from previously active links.
         *
         * @param {string} href - The hash of the section (e.g., '#sectionID') to mark as active.
         */
        setActiveLink: function (href) {
            // Find the anchor link whose href ends with the given hash.
            var $activeLink = this.$container.find("a[href$='" + href + "']");


            // Only update if the found link doesn't already have the active class.
            if (!$activeLink.hasClass(this.options.currentClass)) {
                this.$links.removeClass(this.options.currentClass); // Remove class from all links.
                $activeLink.addClass(this.options.currentClass); // Add class to the new active link.
            }
        },


        /**
         * Determines the currently active section based on the scroll position.
         *
         * @param {number} scrollPos - The current vertical scroll position of the window.
         * @returns {string|null} The hash of the active section, or the first link's hash if no other is active, or null.
         */
        getCurrentSection: function (scrollPos) {
            var i, hash, coords, section; // Declare local variables.


            // Iterate through all navigation links.
            for (i = 0; i < this.$links.length; i++) {
                hash = this.$links[i].hash; // Get the hash from the current link.


                // Ensure the target element associated with the hash exists.
                if ($(hash).length) {
                    coords = this.getCoords($(hash)); // Get the coordinates of the target section.


                    // If the scroll position is past the section's top (minus threshold), it's the current section.
                    if (scrollPos >= coords.top - this.options.threshold) {
                        section = hash; // Store this hash as the potential current section.
                    }
                }
            }


            // Return the last found section, or the first link's hash if no section is active,
            // or null if there are no links at all.
            return section || ((this.$links.length === 0) ? (null) : (this.$links[0].hash));
        }
    };


    // Register the plugin with jQuery.
    // This allows calling it like `$(selector).singlePageNav(options)`.
    $.fn.singlePageNav = function (options) {
        return this.each(function () {
            // Create a new instance of SinglePageNav for each selected element.
            var singlePageNav = Object.create(SinglePageNav);
            singlePageNav.init(options, this); // Initialize the instance.
        });
    };


    // Define default options for the plugin.
    // These can be overridden by user-provided options during initialization.
    $.fn.singlePageNav.defaults = {
        offset: 0, // Pixels to offset the scroll position by (e.g., for fixed headers).
        threshold: 120, // Pixels before a section's top to consider it active.
        speed: 400, // Duration of the scroll animation in milliseconds.
        currentClass: 'current', // CSS class added to the active navigation link.
        easing: 'swing', // Easing function for the scroll animation (e.g., 'linear', 'swing').
        updateHash: false, // Whether to update the URL hash after scrolling.
        filter: '', // A jQuery selector to filter the navigation links.
        onComplete: false, // Callback function executed after scroll animation completes.
        beforeStart: false // Callback function executed before scroll animation starts.
    };


})(jQuery, window, document); // Pass jQuery, window, and document objects into the IIFE.