/*
 * This script handles the initialization of UI components
 * and manages responsive layout adjustments for a web application.
 * It ensures a dynamic and user-friendly experience across different
 * screen sizes.
 *
 * File: main-script.js
 * Version: 1.0.1
 * Last Modified: 2023-10-27
 */


// --- SECTION 1: SIDEBAR MENU INITIALIZATION ---
// This block of code executes once the Document Object Model (DOM) is fully loaded.
// It is a standard jQuery shorthand for $(document).ready(function(){ ... });
$( function ( ) {

    // Selects the HTML element with the ID 'side-menu' and initializes
    // the 'metisMenu' plugin on it. This plugin is typically used
    // to create a collapsible, multi-level navigation menu.
    $( '#side-menu' ) .metisMenu ( ) ;

} ) ; // End of the first DOM ready function.


// --- SECTION 2: RESPONSIVE LAYOUT MANAGEMENT ---

// This second block also executes upon DOM readiness,
// focusing on adapting the layout to the browser window's dimensions.
$( function ( ) {

    /*
     * Binds an event handler to the 'window' object.
     * This handler will be triggered both when the page finishes loading ('load' event)
     * and whenever the browser window is resized ('resize' event).
     * This ensures that layout adjustments are always current.
     */
    $( window ) .bind ( "load resize" , function ( ) {

        // Retrieve the current width of the browser window.
        var currentWindowWidth = $( this ) .width ( ) ;

        // Conditional check: If the window width is less than 768 pixels,
        // it's typically considered a 'mobile' or 'collapsed' view.
        if ( currentWindowWidth < 768 ) {

            // Selects the element with the class 'sidebar-collapse'
            // and adds the 'collapse' CSS class to it. This action
            // often visually hides or collapses the sidebar navigation.
            $( 'div.sidebar-collapse' ) .addClass ( 'collapse' ) ;

        } else {

            // If the window width is 768 pixels or greater (desktop/tablet view),
            // ensure the 'collapse' class is removed. This makes the sidebar
            // visible or expanded.
            $( 'div.sidebar-collapse' ) .removeClass ( 'collapse' ) ;

        }


        // Calculate and set the minimum height for the main content wrapper.
        // This prevents content from being cut off or obscured by a fixed-position
        // navigation bar (e.g., a top navbar) and ensures the page footer
        // (if any) is always at the bottom of the viewport when content is short.
        $( '#page-wrapper' ) .css (
            'min-height' ,
            $( this ) .height ( ) - $( '.navbar' ) .outerHeight ( )
        ) ;

    } ) ; // End of the 'load resize' event handler.

} ) ; // End of the second DOM ready function.