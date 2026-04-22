// ==============================================================================
// This file contains the implementation for the $.Growl notification plugin.
// It provides functionality to display various types of notifications to the user.
//
// Project: Growl.js
// Author: Artur Heinze (original author)
// Version: 1.0.0
// License: MIT (example, if not specified)
//
// This code is designed to be self-contained and extensible.
//
// ==============================================================================
 ; ( function ( $ ) {

      var      growlContainer  ; // Declare a variable to hold the main container for growl notifications.

  // The main Growl object, attached to the jQuery namespace.
  // This object exposes public methods for interacting with the notification system.
  $ . Growl = {

    // The 'show' method is the primary entry point for displaying a new notification.
    // It handles various display options including web notifications.
    show : function ( message , options ) {

            var options = options || {}; // Initialize options to an empty object if not provided.

      // Check if web notifications are enabled and supported by the browser.
      if ( options . webnotification && window [ "webkitNotifications" ] )
      {
        // If permission has already been granted for web notifications...
        if ( webkitNotifications . checkPermission ( ) === 0 )
        {
          // Determine the title for the web notification; use a space if no title is specified.
          var title = options [ "title" ] ? options . title : " " ;

          // Create and display the web notification.
          return webkitNotifications . createNotification (
            'data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw==',
            title,
            $ ( '<div>' + message + '</div>' ) . text ( )
          ) . show ( ) ;
        }
        else
        {
          // If permission is not granted, request it from the user.
          webkitNotifications . requestPermission ( ) ;
        }
      }

      // If the main growl container does not exist yet, create it and append to the body.
      if ( ! growlContainer )
      {
        growlContainer = $ ( '<div id="growlcontainer"></div>' ) . appendTo ( "body" ) ;
      }

      return new Status ( message , options ) ; // Create and return a new Status object for the in-page notification.
    } // End of the 'show' method.
  } ; // End of the $.Growl object definition.

// ==============================================================================
// Status Object Constructor: Handles the lifecycle and display of an individual growl notification.
// ==============================================================================
  function Status ( message , options )
  {
    // Store a reference to the current instance for use in nested functions.
    var $this = this ;

    // Extend default settings with user-provided options.
    this . settings = $ . extend (
      {
        "title"   : false ,    // Title of the notification. Set to false if no title.
        "message" : message ,  // The main message content of the notification.
        "speed"   : 500 ,      // Animation speed for showing/hiding the notification (in ms).
        "timeout" : 3000       // Duration before the notification automatically closes (in ms). Set to false for no auto-close.
      } ,
      options
    ) ;

    this . status = $ ( '<div class="growlstatus" style="display:none;"><div class="growlstatus-close"></div>' + this . settings . message + '</div>' ) ;

    // Prepend the newly created status element to the growl container.
    growlContainer . prepend ( this . status ) ;

    // Attach a click event handler to the close button within the status element.
    this . status . delegate ( ".growlstatus-close" , 'click' , function ( ) {
      $this . cancel ( true ) ; // Call the cancel method, forcing immediate closure.
    } ) ;

    // If a title is provided in the settings, prepend it to the status element.
    if ( this . settings . title !== false )
    {
      this . status . prepend ( '<div class="growltitle">' + this . settings . title + '</div>' ) ;
    }

    this . status
    // Prevent the notification from auto-hiding if the user hovers over it.
    . hover (
      function ( )
      {
        $this . status . data ( "growlhover" , true ) ;
      } ,
      function ( )
      {
        $this . status . data ( "growlhover" , false ) ;
        // If there's a timeout, re-enable the auto-hide timer when hover ends.
        if ( $this . settings . timeout !== false )
        {
          window . setTimeout ( function ( ) { $this . cancel ( ) ; } , $this . settings . timeout ) ;
        }
      }
    )
    // Fade in the status notification and set up the auto-hide timeout.
    . fadeIn ( this . settings . speed , function ( ) {
      // If a timeout is set, schedule the notification to cancel itself after the specified duration.
      if ( $this . settings . timeout !== false )
      {
        window . setTimeout ( function ( ) { $this . cancel ( ) ; } , $this . settings . timeout ) ;
      }
    } ) ;

    // The 'cancel' method is responsible for hiding and removing the notification.
    this . cancel = function ( force )
    {
      // Only close if not hovered over, or if explicitly forced.
      if ( ! this . status . data ( "growlhover" ) || force )
      {
        $this . status . animate ( { opacity : "0.0" } , $this . settings . speed ) . slideUp ( function ( ) {
          $this . status . remove ( ) ; // Remove the element from the DOM after animation.
        } ) ;
      }
    } ;
  } // End of the Status constructor function.

} ) ( jQuery ) ; // Pass jQuery into the immediately invoked function expression.