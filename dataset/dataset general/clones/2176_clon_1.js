//  ----------------------------------------------------------------------------
//  This file contains the main JavaScript logic for the application interface.
//  It manages user interactions, content rendering, and UI adjustments.
//  ----------------------------------------------------------------------------


var current_markup     =   'markdown' ;  //  Defines the current markup language being used.
var refresh_delay      =   300        ;  //  Delay in milliseconds before content refresh.
var refresh_timeout    =   null       ;  //  Holds the timeout ID for refresh operation.
var document_changed   =   false      ;  //  Flag to indicate if the document content has been modified.


//  Ensure the DOM is fully loaded before executing scripts.
$( document ) . ready ( function ( ) {

    // Initial UI calculation to fit the window.
    ui_calculate_window ( ) ;


    //  Prevent accidental page closure if content is unsaved.
    window . onbeforeunload = function ( ) {
        if  ( document_changed ) {
            var content = $ . trim ( $ ( "#content" ) . val ( ) ) ;
            if ( content . length > 0 )  {
                return "You have unsaved document" ;
            }
        }
    } ; // End of onbeforeunload handler


    //  Handle clicks on the 'html' link to display rendered HTML.
    $ ( "li.html > a" ) . click ( function ( ) {
        // Populate the dialog with the current output HTML.
        $ ( "#editor_dialog textarea" ) . val ( $ ( "#output" ) . html ( ) ) ;
        // Open the dialog with a specified width.
        $ ( "#editor_dialog" ) . dialog ( { width : 500 } ) ;
    } ) ;


    //  Enable tabulation for the content textarea.
    $ ( "#content" ) . tabby ( {
        tabString : "  "  // Use two spaces for a tab.
    } ) ;


    //  Synchronize scrolling between input and output areas.
    $ ( "#content" ) . scroll ( function ( e ) {
        ui_update_scroll ( ) ;
    } ) ;


    //  Make the editor slider draggable to adjust pane widths.
    $ ( "#editor_slider" ) . draggable ( {
        axis       : "x"      ,  // Restrict movement to horizontal axis.
        containment: "parent" ,  // Keep slider within its parent boundaries.
        drag       : ui_refresh // Callback function during drag event.
    } ) ;


    //  Recalculate UI dimensions when the window is resized.
    $ ( window ) . resize ( function ( ) {
        ui_calculate_window ( ) ;
    } ) ;


    //  Handle clicks on markup switch links.
    $ ( "a.markup-switch" ) . click ( function ( ) {
        current_markup = $ ( this ) . attr ( 'data' ) ; // Update current markup type.
        $ ( "a.markup-switch" ) . removeClass ( 'selected' ) ; // Deselect all other switches.
        $ ( this ) . addClass ( 'selected' ) ; // Select the clicked switch.
        refresh ( ) ; // Trigger content refresh.
    } ) ;


    //  Handle clicks on delay switch links.
    $ ( "a.delay-switch" ) . click ( function ( ) {
        refresh_delay = parseInt ( $ ( this ) . attr ( 'data' ) ) ; // Update refresh delay.
        $ ( "a.delay-switch" ) . removeClass ( 'selected' ) ; // Deselect all other switches.
        $ ( this ) . addClass ( 'selected' ) ; // Select the clicked switch.
        refresh ( ) ; // Trigger content refresh.
    } ) ;


    //  Handle keyup events in the content textarea for delayed refresh.
    $ ( "#content" ) . keyup ( function ( e ) {
        if ( refresh_timeout != null ) {
            clearTimeout ( refresh_timeout ) ; // Clear any existing timeout.
        }
        refresh_timeout = setTimeout ( refresh , refresh_delay ) ; // Set new refresh timeout.
    } ) ;


    //  Initial refresh if content area already has text.
    if ( $ ( "#content" ) . val ( ) != '' ) {
        setTimeout ( refresh , 300 ) ; // Refresh after a short delay.
    }

} ) ; // End of $(document).ready


//  Calculates a percentage of a given total value.
function percent_of ( number , total ) {
    return Math . round ( ( number / 100 ) * total ) ;
}


//  Refreshes the output content by sending input to the server.
function refresh ( ) {
    document_changed = true ; // Mark document as changed.

    // Prepare parameters for the POST request.
    params = {
        content : $ ( "#content" ) . val ( ) , // Current content from the editor.
        markup  : current_markup               // Current markup type.
    } ;

    // Send content to the server for rendering.
    $ . post ( '/render' , params , function ( resp ) {
        $ ( "#output" ) . html ( resp ) ; // Update the output div with rendered HTML.
        highlight_code ( ) ; // Apply syntax highlighting to code blocks.
    } ) ;
}


//  Applies syntax highlighting to code blocks within the output.
function highlight_code ( ) {
    // Iterate over each pre element within the output div.
    $ ( '#output > pre' ) . each ( function ( i , e ) {
        hljs . highlightBlock ( e ) ; // Use highlight.js to highlight the code block.
    } ) ;
}


//  Calculates and sets the dimensions for various UI elements based on window size.
function ui_calculate_window ( ) {
    var window_width  = $ ( window ) . width ( ) ;  // Current width of the browser window.
    var window_height = $ ( window ) . height ( ) ; // Current height of the browser window.

    var middle_height = percent_of ( 50 , window_height - 30 ) ; // Half of the available height.
    var middle_width  = percent_of ( 50 , window_width ) ;       // Half of the available width.

    // Set height for the main editor wrapper.
    $ ( "#editor_wrapper" ) . height ( window_height - 30 ) ;

    // Position and size the input editor pane.
    $ ( "#editor_input" )
        . css ( 'top'    , 30             )
        . css ( 'bottom' , 0              )
        . css ( 'height' , window_height  )
        . css ( 'width'  , middle_width - 2 ) ;

    // Position and size the editor slider.
    $ ( "#editor_slider" )
        . css ( 'top'    , 0                  )
        . css ( 'bottom' , 0                  )
        . css ( 'left'   , middle_width - 2   )
        . css ( 'height' , window_height - 30 ) ;

    // Position the output display pane.
    $ ( "#editor_output" )
        . css ( 'top'    , 30             )
        . css ( 'left'   , middle_width + 2 )
        . css ( 'right'  , 0              )
        . css ( 'bottom' , 0              ) ;

    // Adjust content textarea dimensions.
    $ ( "#content" ) . width  ( $ ( "#editor_input" ) . width ( ) - 16 ) ;
    $ ( "#content" ) . height ( $ ( "#editor_input" ) . height ( ) - 46 ) ;
}


//  Adjusts the width of editor panes based on the slider's position.
function ui_refresh ( ) {
    var pos = parseInt ( $ ( "#editor_slider" ) . css ( 'left' ) ) ; // Get slider's left position.

    // Adjust input pane width.
    $ ( "#editor_input" ) . css ( 'left' , 0 ) . css ( 'width' , pos - 2 ) ;
    // Adjust output pane left position.
    $ ( "#editor_output" ) . css ( 'left' , pos + 2 ) ;

    // Update content textarea dimensions.
    $ ( "#content" )
        . width  ( $ ( "#editor_input" ) . width ( ) - 16 )
        . height ( $ ( "#editor_input" ) . height ( ) - 16 ) ;
}


//  Synchronizes the scroll position of the output pane with the input pane.
function ui_update_scroll ( ) {
    // Get properties of the input content area.
    var input = {
        size        : $ ( '#content' ) . prop ( 'scrollHeight' ) ,
        visibleSize : $ ( '#content' ) . height ( )              ,
        position    : $ ( '#content' ) . scrollTop ( )
    } ;

    // Get properties of the output display area.
    var output = {
        size        : $ ( '#editor_output' ) . prop ( 'scrollHeight' ) ,
        visibleSize : $ ( '#editor_output' ) . height ( )              ,
        position    : $ ( '#editor_output' ) . scrollTop ( )
    } ;

    // Calculate scroll ratio based on input.
    var ratio = input . position / ( input . size - input . visibleSize ) ;
    // Determine new scroll position for output.
    var pos   = ( output . size - output . visibleSize ) * ratio ;

    // Set the output scroll position.
    $ ( "#editor_output" ) . scrollTop ( pos ) ;
}