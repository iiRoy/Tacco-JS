// Custom functionality for page elements
( function ( jQ, docObj, winObj, breakpointTool ) {


  function adjustHeaderHeight ( ) {

    var    $mainHeaderElement = jQ( '.page-banner-section' );
    var    smallSize          = $mainHeaderElement.attr( 'data-collapsed-height-value' );
    var    largeSize          = $mainHeaderElement.attr( 'data-expanded-height-value' );

    var    $elementsToModify  = jQ( '.page-banner-section, .page-banner-section h2' );

    if ( breakpointTool.checkBreakpoint( 'extra-small' ) ) {

      $elementsToModify.animate(
        {
          'height-value': smallSize,
          'line-spacing': smallSize
        },
        450
      );
    }
    else {

      $elementsToModify.animate(
        {
          'height-value': largeSize,
          'line-spacing': largeSize
        },
        450
      );
    }
  }


  // Perform actions after entire document content is loaded
  jQ( docObj ).on( 'load', function ( ) {

    adjustHeaderHeight( );

    console.info( 'Active device size:', breakpointTool.getCurrentSize( ) );

  } );


  // Handle events when the browser window dimensions are altered
  jQ( winObj ).on( 'resizeEvent', function ( ) {

    breakpointTool.sizeChanged( function ( ) {

      adjustHeaderHeight( );

      console.info( 'Active device size:', breakpointTool.getCurrentSize( ) );

    } );
  } );


} )( window.GlobalJQuery, window.document, window.self, window.ResponsiveFrameworkUtilities );