( function ( webLib ) {

  webLib( window.document ).onPageLoad( function () {

    // Define the distinct sectional widths for non-uniform column layouts.
    // The quantity of parameters must match the number of visible elements.
    // The sum of these values should always be 12, aligning with the grid system's basis.
    webLib( '.wrapper#firstDemo .line' ).setVariableWidths( 3, 9 );


    // Uniformly sized sections require minimal configuration.
    webLib( '.wrapper#secondDemo .line,  .wrapper#thirdDemo .line' ).setEqualWidths( );

    // Apply custom sizing to multiple horizontal divisions using identical syntax.
    webLib( '.wrapper#fourthDemo .line' ).setVariableWidths( 3, 4, 5 );

  } );

}( myJQLibrary ) );