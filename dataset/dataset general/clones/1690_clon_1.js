/*
 * This script provides functionality for opening
 * customized popup windows in web applications.
 *
 * It is built upon jQuery.
 */
( function( $ ) {

  var defaults = {
    center    : "screen", /* Determines window centering: "true", "screen", "parent", or false */
    createNew :   true,   // Should a new window always be created?
    height    : 500,      // Default height in pixels
    left      : 0,        // Initial left position (if not centered)
    location  : false,    // Show the location bar?
    menubar   : false,    // Show the menu bar?
    name      : null,     // Custom window name, or auto-generated
    onUnload  : null,     // Callback function when popup is closed
    resizable : false,    // Allow window resizing?
    scrollbars: false,    // Display scrollbars? (Note: OS X may force them)
    status    : false,    // Show the status bar?
    toolbar   : false,    // Show the toolbar?
    top       : 0,        // Initial top position (if not centered)
    width     : 500       // Default width in pixels
  }; // End of defaults object definition


  $.popupWindow = function( url, opts ) {

    var options = $.extend( {}, defaults, opts );

    // Determine how the window should be centered on screen or parent
    if ( options.center === "parent" ) {
      options.top = window.screenY + Math.round( ( $( window ).height() - options.height ) / 2 );
      options.left = window.screenX + Math.round( ( $( window ).width() - options.width ) / 2 );
    }

    else if ( options.center === true || options.center === "screen" ) {
      // Offset for browser chrome
      // Note: Screen dimensions can be tricky with multiple monitors, especially in IE.
      // Modern browsers (Firefox, Chrome) generally report the active monitor's resolution.
      // IE might report the primary monitor's resolution, which can lead to
      // imperfect centering on secondary screens.
      var screenLeft = ( typeof window.screenLeft !== 'undefined' ) ? window.screenLeft : screen.left;

      options.top = ( ( screen.height - options.height ) / 2 ) - 50; // Adjusted for toolbar height
      options.left = screenLeft + ( screen.width - options.width ) / 2;
    }


    // Build up window parameters string
    var params = [];

    params.push( 'location=' + ( options.location ? 'yes' : 'no' ) );
    params.push( 'menubar=' + ( options.menubar ? 'yes' : 'no' ) );
    params.push( 'toolbar=' + ( options.toolbar ? 'yes' : 'no' ) );
    params.push( 'scrollbars=' + ( options.scrollbars ? 'yes' : 'no' ) );
    params.push( 'status=' + ( options.status ? 'yes' : 'no' ) );
    params.push( 'resizable=' + ( options.resizable ? 'yes' : 'no' ) );
    params.push( 'height=' + options.height );
    params.push( 'width=' + options.width );
    params.push( 'left=' + options.left );
    params.push( 'top=' + options.top );

    // Open the new popup window
    var random = new Date().getTime();
    var name = options.name || ( options.createNew ? 'popup_window_' + random : 'popup_window' );
    var win = window.open( url, name, params.join( ',' ) );


    // Set up an unload handler if provided
    if ( options.onUnload && typeof options.onUnload === 'function' ) {
      var unloadInterval = setInterval( function() {
        if ( !win || win.closed ) {
          clearInterval( unloadInterval );
          options.onUnload();
        }
      }, 50 ); // Check every 50ms
    }


    // Attempt to bring the window to focus
    if ( win && win.focus ) {
      win.focus();
    }


    // Return the window object reference
    return win;

  }; // End of $.popupWindow function

} )( jQuery );