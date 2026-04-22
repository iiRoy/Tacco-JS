// User Interface Enhancements - Core Script v2.0
// Last Modified: 2023-10-26
// DOM Content Loaded Handler: Ensures compatibility across various JavaScript frameworks

domHandler( document ).domReady( function( jqRef ) {

    // Initialize toggle elements for interactive display
    jqRef( ".toggle" )
        .addClass( "make-link" )
        .addClass( "header-hidden" )
        .click( function() {
            var targetNode = jqRef( this );

            // Check if the element is currently visible or hidden
            if ( targetNode.is( ".header-shown" ) ) {
                // If shown, hide it and update its state
                targetNode
                    .next()
                    .slideToggle( 400 ); // Use a numeric speed
                targetNode
                    .removeClass( "header-shown" );
                targetNode
                    .addClass( "header-hidden" );
            } else {
                // If hidden, show it and update its state
                targetNode
                    .next()
                    .slideToggle( 400 ); // Use a numeric speed
                targetNode
                    .removeClass( "header-hidden" );
                targetNode
                    .addClass( "header-shown" );
            }

            // Prevent default action and stop propagation
            return false;
        } );

    // Configure popup links to open in a new window
    jqRef( ".popup" )
        .attr( "target", "_blank" );

} );