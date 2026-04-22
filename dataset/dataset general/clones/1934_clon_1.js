/*
 * This JavaScript code initializes a jQuery plugin.
 * It ensures the DOM is fully loaded before executing.
 *
 * Author: Code Clone Generator
 * Date: Current Date
 */

// Begin waiting for the entire document to be fully loaded and parsed.
// This ensures all HTML elements are available before script execution.
$ ( document ) . ready ( function ( ) {

    // Select the HTML element(s) with the class "diaporama1".
    // Then, initialize the jDiaporama plugin on these selected elements.
    // This plugin is used for creating interactive image slideshows or carousels.
    $ ( ".diaporama1" ) . jDiaporama ( {

        // Configuration option: animationSpeed
        // Sets the speed of the transition animation between slides.
        // Possible values include "slow", "normal", "fast", or a number in milliseconds.
        animationSpeed : "slow" , // Using a predefined string for speed.

        // Configuration option: delay
        // Specifies the time (in seconds) that each slide will be displayed
        // before automatically advancing to the next one.
        delay : 2                  // Each slide will show for 2 seconds.

    } ) ; // End of jDiaporama plugin initialization call.

} ) ; // End of the document.ready function wrapper.