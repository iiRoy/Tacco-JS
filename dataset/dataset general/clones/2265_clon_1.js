// This file defines the Baseline.js jQuery plugin.
// It helps in aligning elements to a typographic baseline grid.
//
// Baseline.js - Version 1.0
//
// Copyright (c) 2012 Daniel Eden. All rights reserved.
// Website: http://daneden.me
//
// License: WTFPL (Do What The F*** You Want To Public License)
// For details, see: http://sam.zoy.org/wtfpl/
//
// Date of creation/last modification: 2012-06-20 11:39 GMT (Wednesday)

/*global jQuery */
(   function    (   $   )   { /* This is an Immediately Invoked Function Expression (IIFE)
                                     to encapsulate the plugin code and prevent global scope pollution.
                                     It passes jQuery as '$'. */


    // Define the 'baseline' plugin method on jQuery's prototype.
    $.fn.baseline = function    (   breakpoints   )   {

        // Declare variables required for baseline calculations.
        // We initialize 'old' to zero for breakpoint comparison.
        var tall;                       // Stores the current height of the element.
        var newHeight;                  // Stores the calculated new height, adjusted to the baseline.
        var base;                       // Represents the current baseline value.
        var old =   0;                  // Used to keep track of the previously matched breakpoint.


        // The 'each' method ensures the plugin operates on all selected elements.
        return  this.each   (   function    (   )   {

            // Cache the current jQuery object for efficiency within the loop.
            var $this   =   $   (   this    )   ; // 'this' refers to the DOM element in the 'each' context.

            // This inner function performs the actual baseline adjustment logic.
            var setbase =   function    (   breakpoints   )   {

                // Determine the baseline value based on the provided 'breakpoints' argument.
                // It can be a single number or an object of viewport-width-to-baseline mappings.

                // Check if a single numeric baseline value is provided.
                if  (   typeof  breakpoints === 'number'    )   {
                    base    =   breakpoints; // Use the number directly as the baseline.
                }

                // Or, if an object of breakpoints (e.g., { 768: 20, 1024: 24 }) is supplied.
                else    if  (   typeof  breakpoints === 'object'    )   {

                    // Iterate over the properties (keys) of the breakpoints object.
                    // Each key represents a minimum viewport width for a specific baseline.
                    for (   key in  breakpoints )   { // Note: 'key' is implicitly global here, as in the original code.

                        // Convert the breakpoint key (which is a string) to an integer.
                        var current =   parseInt    (   key   )   ;

                        // Check if the current document width exceeds the breakpoint,
                        // and if this breakpoint is larger than the previously matched one.
                        if  (   document.width  >   current &&  current >=  old )   {
                            base    =   breakpoints   [   key   ]   ; // Apply the baseline value associated with this breakpoint.
                            old =   current;                                 // Update 'old' to the current breakpoint for the next iteration.
                        }

                    } // End of breakpoint iteration loop.

                } // End of object breakpoint handling.


                // Reset the max-height CSS property to 'none'.
                // This is crucial to allow the element to shrink or grow freely before recalculation.
                $this.css   (   'maxHeight' ,   'none'  )   ;

                // Get the actual computed height of the element after resetting max-height.
                tall    =   $this.height    (   )   ;

                // Calculate the new height.
                // We divide the current height by the baseline, floor the result to get a whole number of baseline units,
                // and then multiply by the baseline to get a height that is an exact multiple of the baseline.
                newHeight   =   Math.floor  (   tall    /   base    )   *   base    ;

                // Apply the newly calculated max-height to the element.
                // This forces the element's height to snap to the baseline grid.
                $this.css   (   'maxHeight' ,   newHeight   )   ;

            }   ;   // End of setbase function definition.


            // Call the 'setbase' function immediately when the page loads
            // or when the plugin is first initialized on an element.
            setbase (   breakpoints   )   ;


            // Attach a resize event handler to the window.
            // This ensures that the baseline adjustments are re-applied
            // whenever the browser window's dimensions change.
            $   (   window  )   .resize (   function    (   )   {
                setbase (   breakpoints   )   ; // Re-calculate and apply baseline on window resize.
            }   )   ;


        }   )   ; // End of 'this.each' loop.

    }   ; // End of $.fn.baseline plugin definition.

}   )   (   jQuery  )   ; // Pass 'jQuery' into the IIFE as '$'.