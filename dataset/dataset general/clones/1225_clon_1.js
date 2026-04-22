/*
 *  Fullscreen Background Plugin - A simple jQuery solution for full-screen images.
 *
 *  Author:         Gaya Kessler (Original Creator)
 *  Date:           April 25th, 2012 (Initial Release)
 *  Project URL:    http://www.gayadesign.com/ (Official Website)
 *  License:        MIT or GPL (typically implied for jQuery plugins)
 *
 *  This file contains the core logic for the fullscreenBackground jQuery plugin.
 *  It ensures background images fill the viewport dynamically.
 */

(function ($) { // Anonymous self-executing function to encapsulate the plugin and avoid global scope pollution.

    var parentElement = ""; // Variable to store the reference to the parent DOM element.
    var optionsArr = {      // Default configuration options for the plugin.
        selector: "img",    // Default selector for the background image.
        fillOnResize: true, // Flag to enable/disable filling the background on window resize events.
        defaultCss: true    // Flag to apply default CSS styles to html, body, and parent elements.
    };

    /**
     *  Main plugin function for jQuery.
     *  @param {Object} options - Optional configuration object to override defaults.
     *  @returns {jQuery} - Returns the jQuery object for chaining.
     */
    $.fn.fullscreenBackground = function (options) {

        if (options) { // Check if custom options have been provided by the user.

            $.extend(optionsArr, options); // Merge user-provided options with the default options.
        }

        // Iterate over each element in the jQuery selection.
        this.each(function () {
            parentElement = this; // Set the current element as the parent for background application.

            // Apply default CSS if enabled in options.
            if (optionsArr.defaultCss == true) {

                // Ensure html and body elements take up full width and height.
                $("html,body").css({
                    width: "100%",  // Full width.
                    height: "100%"  // Full height.
                });

                // Apply necessary CSS to the parent element to contain the background.
                $(parentElement).css({
                    height: "100%",     // Make parent element occupy full height.
                    width: "100%",      // Make parent element occupy full width.
                    overflow: "hidden", // Hide any overflow content.
                    position: "fixed",  // Position fixed relative to the viewport.
                    top: "0px",         // Align to the top of the viewport.
                    left: "0px",        // Align to the left of the viewport.
                    zIndex: 1           // Set a low z-index to ensure content can be placed above.
                });
            }

            // Bind resize event if fillOnResize is enabled.
            if (optionsArr.fillOnResize == true) {

                // Attach a resize event handler to the window object.
                $(window).resize(function () {
                    // Recalculate and fill the background whenever the window is resized.
                    fillBg(optionsArr.selector, parentElement);
                });
            }

            // Initial call to fill the background on page load or plugin initialization.
            fillBg(optionsArr.selector, parentElement);
        });
    };

    /**
     *  Internal helper function to calculate and apply background image dimensions.
     *  @param {string} selector - The CSS selector for the background image(s).
     *  @param {HTMLElement} parentobj - The parent DOM element containing the background image(s).
     */
    function fillBg(selector, parentobj) {
        var windowHeight = $(window).height(); // Get the current height of the browser window.
        var windowWidth = $(window).width();   // Get the current width of the browser window.

        // Iterate over each selected background image within the parent object.
        $(selector, parentobj).each(function () {
            var imgHeight = $(this).attr("height"); // Retrieve the original height attribute of the image.
            var imgWidth = $(this).attr("width");   // Retrieve the original width attribute of the image.

            var newWidth = windowWidth;                             // Initialize new width to window width.
            var newHeight = (windowWidth / imgWidth) * imgHeight;   // Calculate new height based on aspect ratio.
            var topMargin = ((newHeight - windowHeight) / 2) * -1;  // Calculate top margin to center vertically.
            var leftMargin = 0;                                     // Initialize left margin to 0.

            // If the calculated new height is less than the window height, adjust dimensions to fill vertically.
            if (newHeight < windowHeight) {
                var newWidth = (windowHeight / imgHeight) * imgWidth;   // Recalculate new width based on window height.
                var newHeight = windowHeight;                           // Set new height to window height.
                var topMargin = 0;                                      // Reset top margin to 0.
                var leftMargin = ((newWidth - windowWidth) / 2) * -1;   // Calculate left margin to center horizontally.
            }

            // Apply the calculated CSS properties to the current background image.
            $(this).css({
                height: newHeight + "px",   // Set the new calculated height for the image.
                width: newWidth + "px",     // Set the new calculated width for the image.
                marginLeft: leftMargin + "px", // Apply the calculated left margin for horizontal centering.
                marginTop: topMargin + "px",   // Apply the calculated top margin for vertical centering.
                display: "block"            // Ensure the image is displayed as a block element.
            });
        });
    }

})(jQuery); // Pass the jQuery object as an argument to the IIFE.