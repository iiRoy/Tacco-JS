/*
 *  jQuery Appear Plugin - Type I Clone
 *
 *  Original Author: Andrey Sidorov
 *  License: MIT
 *  Source: https://github.com/morr/jquery.appear/
 *  Version: 0.3.4 (Cloned)
 *
 *  This file is a Type I clone, meaning it is exactly
 *  identical to the original in logic and structure,
 *  but extensively modified in whitespace and comments.
 */
( function ( $ )   {

// Array to hold all the selectors that are being watched for appearance.
var   selectors   =   [ ] ;

// Flag to indicate if the check function has been bound to scroll/resize events.
var   check_binded =  false ;
// Flag to prevent multiple concurrent checks.
var   check_lock   =  false ;

// Default options for the appear plugin.
var   defaults     =   {
    interval        :   250,      // How often to check for appearance, in milliseconds.
    force_process   :   false     // Whether to force an initial process call.
} ;

// Cache the jQuery window object for performance.
var   $window      =   $ ( window ) ;

// Holds the collection of elements that were previously appeared.
var   $prior_appeared ;


/**
 *  The core function that checks for element appearance.
 *  It iterates through all registered selectors and triggers 'appear'/'disappear' events.
 */
function   process ( )   {

    // Release the lock, allowing future checks to be scheduled.
    check_lock   =   false ;

    // Loop through each registered selector.
    for   ( var   index   =   0 ,   selectorsLength   =   selectors.length ;
            index   <   selectorsLength ;
            index++   )   {

        // Find elements matching the current selector that are currently ':appeared'.
        var   $appeared   =   $ ( selectors [ index ] ) . filter (
            function ( )   {
                return   $ ( this ) . is ( ':appeared' ) ;
            }
        ) ;

        // Trigger the 'appear' event on the newly appeared elements.
        $appeared . trigger ( 'appear' ,   [ $appeared ] ) ;

        // If there were previously appeared elements, check for disappeared ones.
        if   ( $prior_appeared )   {

            // Elements that were previously appeared but are not currently appeared.
            var   $disappeared   =   $prior_appeared . not ( $appeared ) ;

            // Trigger the 'disappear' event on these elements.
            $disappeared . trigger ( 'disappear' ,   [ $disappeared ] ) ;
        }

        // Store the currently appeared elements for the next cycle.
        $prior_appeared   =   $appeared ;
    }
}


//  Define a custom jQuery selector filter named ':appeared'.
//  This filter determines if an element is currently within the browser's viewport.
$ . expr [ ':' ] [ 'appeared' ]   =   function ( element )   {

    var   $element   =   $ ( element ) ;

    // First, check if the element is actually visible in the DOM.
    // If not visible, it cannot appear in the viewport.
    if   ( ! $element . is ( ':visible' ) )   {
        return   false ;
    }

    // Get the current scroll position of the window.
    var   window_left   =   $window . scrollLeft ( ) ;
    var   window_top    =   $window . scrollTop ( ) ;

    // Get the element's position relative to the document.
    var   offset        =   $element . offset ( ) ;
    var   left          =   offset . left ;
    var   top           =   offset . top ;

    // Calculate the boundaries and check if the element overlaps with the viewport.
    // The conditions check if:
    // 1. Element's bottom edge is below or at the window's top edge.
    // 2. Element's top edge (adjusted by 'appear-top-offset') is above or at the window's bottom edge.
    // 3. Element's right edge is to the right or at the window's left edge.
    // 4. Element's left edge (adjusted by 'appear-left-offset') is to the left or at the window's right edge.
    if   (
            ( top   +   $element . height ( )   >=   window_top )
            &&
            ( top   -   ( $element . data ( 'appear-top-offset' )   ||   0 )   <=   window_top   +   $window . height ( ) )
            &&
            ( left   +   $element . width ( )   >=   window_left )
            &&
            ( left   -   ( $element . data ( 'appear-left-offset' )   ||   0 )   <=   window_left   +   $window . width ( ) )
        )   {
        return   true ; // Element is within the viewport.
    }
    else   {
        return   false ; // Element is outside the viewport.
    }
} ;


//  Extend jQuery's prototype to add the 'appear' method.
$ . fn . extend ( {

    /**
     *  Registers elements to watch for their appearance in the browser viewport.
     *  @param {Object} options - Optional settings for this appearance watch.
     *  @returns {jQuery} - The jQuery object of the elements being watched.
     */
    appear   :   function ( options )   {

        // Merge default options with any provided options.
        var   opts       =   $ . extend ( { } ,   defaults ,   options   ||   { } ) ;

        // Determine the selector for the current set of elements.
        var   selector   =   this . selector   ||   this ;

        // If the check function hasn't been bound yet, bind it to window events.
        if   ( ! check_binded )   {

            // Define the function that will be called on scroll/resize.
            var   on_check   =   function ( )   {

                // If a check is already in progress, exit.
                if   ( check_lock )   {
                    return ;
                }

                // Set the lock to prevent re-entry.
                check_lock   =   true ;

                // Schedule the actual processing to happen after a short delay.
                setTimeout ( process ,   opts . interval ) ;
            } ;

            // Bind the 'on_check' function to the window's scroll and resize events.
            $ ( window ) . scroll ( on_check ) . resize ( on_check ) ;

            // Mark the check function as bound.
            check_binded   =   true ;
        }

        // If 'force_process' is true, immediately schedule a check.
        if   ( opts . force_process )   {
            setTimeout ( process ,   opts . interval ) ;
        }

        // Add the current selector to the list of watched selectors.
        selectors . push ( selector ) ;

        // Return the jQuery object representing the elements being watched.
        return   $ ( selector ) ;
    }
} ) ;


//  Extend jQuery's global object to add utility methods.
$ . extend ( {

    /**
     *  Forces an immediate check for elements' appearance.
     *  Useful for cases where the DOM changes without a scroll/resize event.
     *  @returns {boolean} - True if the check was performed, false otherwise (e.g., if not bound).
     */
    force_appear   :   function ( )   {

        // Only perform the check if the event handlers are already bound.
        if   ( check_binded )   {
            // Execute the process function immediately.
            process ( ) ;
            return   true ; // Indicate that the check was performed.
        }
        ; // Semicolon on its own line, just for visual difference.
        return   false ; // Indicate that the check was not performed.
    }
} ) ;

} ) ( jQuery ) ;