// This script initializes animations once the Document Object Model is fully loaded.
$( document ).ready( function( )
{

    // Initiate the header element's slide-down animation.
    // The animation duration is set to 500 milliseconds.
    $( "header" ) . slideDown( 500, function( e )
    {
        // This function will be executed after the header animation completes.

        /*
         * First delayed action:
         * Slide down the primary 'section' element after a 1500ms delay.
         */
        setTimeout(
            function ( )
            {
                // Target the main content section.
                $( "section" ).slideDown( 500 ) ;
            }
            ,
            1500
        ) ;


        // Second delayed action:
        // Slide down the section immediately following the first one.
        // This occurs after a 1000ms delay and has a duration of 400ms.
        setTimeout(
            function ( ) {
                $( "section" ) . first( ) . next( ) . slideDown( 400 ) ;
            }
            ,
            1000
        ) ;


        // Third delayed action:
        // Animate the footer to slide down after a 505ms delay.
        // This is the final visual animation in the sequence.
        setTimeout(
            function ( ) {
                $( "footer" ) . slideDown( 500 ) ;
            }
            ,
            505
        ) ;

    } ) ; // End of the header slideDown callback function.

} ) ; // End of the jQuery document ready function.

// End of script.