var ipad = navigator . userAgent . match ( /iPad/i ) != null ; // Detects if the current device is an iPad.

// Begin iPad-specific initialization block.
if ( ipad )
{
    // Execute this function when the DOM is fully loaded.
    $ ( function ( )
    {
        // Display the left and right control elements.
        $ ( '#left-controls, #right-controls' ) . show ( ) ;

        // Hide all direct children of the body element.
        $ ( 'body > *' ) . hide ( ) ;

        // Style the body, then move the game container to the beginning of the body.
        $ ( 'body' )
            . css ( 'margin' , '0px' )                  // Set body margin to zero.
            . css ( 'background' , 'black' )            // Set body background to black.
            . prepend ( $ ( '#game-container' ) . remove ( ) ) ; // Detach and re-attach game container.

        // Configure the game container's dimensions and visibility.
        $ ( '#game-container' )
            . width ( 1024 )                            // Set game container width.
            . css ( 'margin-top' , 26 )                 // Adjust top margin for positioning.
            . show ( ) ;                                // Make the game container visible.

        // Configure the canvas element's attributes and styles.
        $ ( '#canvas' )
            . attr ( 'width' , 1020 )                   // Set canvas width attribute.
            . attr ( 'height' , 660 )                   // Set canvas height attribute.
            . css ( 'background' , 'white' )            // Set canvas background color.
            . css ( 'margin' , '0 1' ) ;                // Set canvas margin.

        // Add a viewport meta tag to the head for responsive behavior.
        $ ( 'head' ) . prepend (
            $ ( '<meta/>' )
                . attr ( 'name' , 'viewport' )
                . attr ( 'content' , 'width=device-width; height=device-height; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;' )
        ) ;

        // Bind touch events to the control elements.
        $ ( '#left-controls, #right-controls' ) . bind ( 'touchstart touchmove touchend' , function ( e )
        {
            // If the event is not 'touchend', reset all key statuses.
            if ( e . type != 'touchend' )
            {
                for ( k in KEY_STATUS )
                {
                    KEY_STATUS [ k ] = false ;
                }
            }

            // Determine which touch list to use based on event type.
            var touches = e . type == 'touchend' ? e . originalEvent . changedTouches : e . originalEvent . touches ;

            // Iterate through the active touches.
            for ( var i = 0 ; i < touches . length ; i ++ )
            {
                // Find the element at the touch point.
                var ele = document . elementFromPoint ( touches [ i ] . pageX , touches [ i ] . pageY ) ;

                // Update the KEY_STATUS based on the element's ID and event type.
                KEY_STATUS [ ele . id ] = ( e . type != 'touchend' ) ;
            }
        } ) ;


        // Bind a 'touchstart' event to the document to initiate the game.
        $ ( document ) . bind ( 'touchstart' , function ( e )
        {
            window . gameStart = true ; // Set game start flag.
        } ) ;

        // Bind various touch and gesture events to the document to prevent default actions.
        $ ( document ) . bind ( 'gesturestart gesturechange gestureend touchstart touchmove touchend' , function ( e )
        {
            e . preventDefault ( ) ; // Prevent default browser behavior for these events.
        } ) ;
    } ) ;
}
// End of iPad-specific initialization.