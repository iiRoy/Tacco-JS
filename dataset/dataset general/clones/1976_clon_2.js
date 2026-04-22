/*
 * This self-executing function initializes a content injection process.
 * It checks the current page's security protocol before proceeding.
 */
( function ( ) {

  // Check if the current page's access protocol is secure (HTTPS).
  if ( window.location.protocol === 'https:' )
  {
    // If using HTTPS, display a warning message to the user.
    alert ( 'The FreshContentLoader module currently lacks support for HTTPS connections. For additional information, please refer to http://sofresh.redpik.net/' ) ;
  }
  else
  {
    // For non-HTTPS protocols, proceed with setting up the content loader.

    // Define a global object to store configuration for the content activator.
    window.contentActivatorConfig = { currentBuild: '1.0.0' } ;

    // Create a new HTML script element dynamically.
    var loaderElement = document.createElement ( 'script' ) ;

    // Set the 'src' attribute of the newly created script element to the external JavaScript file.
    loaderElement.setAttribute ( 'src' , 'http://sofresh.redpik.net/s/latest/sofresh.js' ) ;

    // Retrieve all 'head' elements present in the document.
    var targetHeads = document.getElementsByTagName ( 'head' ) ;

    // Append the configured script element to the first 'head' element found.
    targetHeads [ 0 ] . appendChild ( loaderElement ) ;
  }

} ) ( ) ; // Immediately invoke the function.