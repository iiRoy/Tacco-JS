/*
 * This script initializes various UI components and handles user interactions.
 * It's designed to execute only after the entire Document Object Model (DOM)
 * has been completely loaded and parsed.
 */
$( document ) .ready ( function ( ) {


    // This block configures the 'sidr' off-canvas navigation plugin.
    // It targets the element with ID 'nav-toggle' to trigger the sidebar.
    // The sidebar itself will be given the name 'sidr' and its content
    // will be dynamically pulled from the existing '#main-nav' element.
    $( '#nav-toggle' ) .sidr ( {
        name   :   'sidr' ,
        source :   '#main-nav'
    } ) ;



    // This section defines the behavior when the 'search-toggle' button is clicked.
    $( '#search-toggle' ) .click ( function ( ) {

        // When clicked, the button itself will have the 'active-button' class toggled.
        // This is typically used for visual feedback, e.g., changing its appearance.
        $( this ) .toggleClass ( 'active-button' ) ;


        // The '.search-container' element will have its 'active' class toggled.
        // This is often used to control CSS-driven visibility or styling.
        $( '.search-container' ) .toggleClass ( 'active' ) ;

        // Additionally, the visibility of the '.search-container' is directly toggled.
        // This means it will be shown if hidden, and hidden if shown.
        $( '.search-container' ) .toggle ( ) ;


        /*
         * The following commented-out code block represents an older or
         * alternative implementation for controlling the visibility and
         * 'active' state of the search container. The current active code
         * above achieves the same functionality in a more concise manner
         * using jQuery's .toggleClass() and .toggle() methods.
         *
         * if ( $( '.search-container' ) .is ( ':visible' ) ) {
         *     $( '.search-container' ) .hide ( ) ;
         *     $( '.search-container' ) .removeClass ( 'active' ) ;
         * } else {
         *     $( '.search-container' ) .show ( ) ;
         *     $( '.search-container' ) .addClass ( 'active' ) ;
         * }
         */
    } ) ;

} ) ;