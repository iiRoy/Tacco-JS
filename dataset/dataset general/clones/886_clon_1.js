// This file contains the implementation for the Notify Bar jQuery plugin.
// It was originally developed by Dmitri Smirnov between 2009 and 2015.

// The software is distributed under the terms of the MIT license.
// For more details, please refer to:
// http://www.opensource.org/licenses/mit-license.php

// The official project home page can be found at:
// http://www.whoop.ee/posts/2013/04/05/the-resurrection-of-jquery-notify-bar.html


( function ( $ ) {

  "use strict" ; // Enforce strict mode for cleaner code and fewer errors.

  // The main function to initialize and display a notify bar.
  $.notifyBar = function ( options ) {

    // Generate a random number to ensure unique IDs for multiple notify bars.
    var rand = parseInt( Math.random( ) * 100000000 , 0 ) ,

      text_wrapper , // Variable to hold the jQuery object for the text content.
      asTime , // Variable to store the animation speed in milliseconds.

      bar = { } , // The main jQuery object representing the notify bar.
      settings = { } ; // Object to hold merged default and user-provided settings.


    // Extend default settings with any options provided by the user.
    settings = $.extend( {
      html           : 'Your message here' , // Default HTML content for the bar.
      delay          : 3000 , // Default display duration in milliseconds.
      animationSpeed : 200 , // Default animation speed for slideDown/Up.
      cssClass       : '' , // Additional CSS class(es) to apply to the bar.
      jqObject       : '' , // Optional existing jQuery object to use as the bar.
      close          : false , // Whether to show a close button.
      closeText      : '&times;' , // Text for the close button.
      closeOnClick   : true , // Close the bar when clicked.
      closeOnOver    : false , // Close the bar when mouse hovers over it.
      onBeforeShow   : null , // Callback function before the bar is shown.
      onShow         : null , // Callback function after the bar is shown.
      onBeforeHide   : null , // Callback function before the bar is hidden.
      onHide         : null , // Callback function after the bar is hidden.
      position       : 'top' // Position of the bar ('top' or 'bottom').
    } , options ) ;


    // Define methods directly on `this.fn` for private use within the plugin.

    // Function to show the notification bar with a slide-down animation.
    this.fn.showNB = function ( ) {

      // Check if an 'onBeforeShow' callback function is defined.
      if ( typeof settings.onBeforeShow === 'function' ) {
        settings.onBeforeShow.call( ) ; // Execute the callback.
      }

      // Stop any current animations and then slide down the bar.
      $( this ) . stop ( ) . slideDown ( asTime , function ( ) {

        // After the slide-down animation completes, check for 'onShow' callback.
        if ( typeof settings.onShow === 'function' ) {
          settings.onShow.call( ) ; // Execute the callback.
        }
      } ) ;
    } ;


    // Function to hide the notification bar with a slide-up animation.
    this.fn.hideNB = function ( ) {

      // Check for and execute the 'onBeforeHide' callback.
      if ( typeof settings.onBeforeHide === 'function' ) {
        settings.onBeforeHide.call( ) ;
      }

      // Stop any current animations and slide up the bar.
      $( this ) . stop ( ) . slideUp ( asTime , function ( ) {

        // Check if the bar has the unique ID assigned by this plugin instance.
        if ( bar.attr( "id" ) === "__notifyBar" + rand ) {

          // If it's a plugin-created bar, slide it up and then remove it from the DOM.
          $( this ) . slideUp ( asTime , function ( ) {
            $( this ) . remove ( ) ; // Remove the bar element.

            // Execute the 'onHide' callback after removal.
            if ( typeof settings.onHide === 'function' ) {
              settings.onHide.call( ) ;
            }
          } ) ;

        } else {

          // If it's not a plugin-created bar (e.g., an existing element), just slide it up.
          $( this ) . slideUp ( asTime , function ( ) {

            // Execute the 'onHide' callback.
            if ( typeof settings.onHide === 'function' ) {
              settings.onHide.call( ) ;
            }
          } ) ;
        }
      } ) ;
    } ;


    // Determine whether to use an existing jQuery object or create a new one.
    if ( settings.jqObject ) {

      bar = settings.jqObject ; // Use the provided jQuery object.
      settings.html = bar.html( ) ; // Get its current HTML content.

    } else {

      // Create a new div element for the notify bar.
      bar = $( "<div></div>" )
        . addClass( "jquery-notify-bar" ) // Add the base class.
        . addClass( settings.cssClass ) // Add any custom CSS class.
        . attr( "id" , "__notifyBar" + rand ) ; // Assign a unique ID.
    }


    // Create a wrapper for the text content.
    text_wrapper = $( "<span></span>" )
      . addClass( "notify-bar-text-wrapper" ) // Add a specific class for styling.
      . html( settings.html ) ; // Set the HTML content.


    // Set the content of the bar and initially hide it.
    bar.html( text_wrapper ) . hide( ) ;


    var id = bar.attr( "id" ) ; // Retrieve the ID of the bar (not used later, could be removed).

    // Determine the animation speed based on predefined keywords or a custom value.
    switch ( settings.animationSpeed ) {
      case "slow" :
        asTime = 600 ; // Set animation time for 'slow'.
        break ;

      case "default" :
      case "normal" :
        asTime = 400 ; // Set animation time for 'default' or 'normal'.
        break ;

      case "fast" :
        asTime = 200 ; // Set animation time for 'fast'.
        break ;

      default :
        asTime = settings.animationSpeed ; // Use the provided numeric value.
    }

    // Prepend the notify bar to the body of the document.
    $( "body" ) . prepend ( bar ) ;


    // Handle the close button functionality if enabled.
    if ( settings.close ) {

      // If a close button is enabled, effectively disable auto-hiding by setting a very long delay.
      // This ensures the bar only closes when the button is clicked.
      settings.delay = Math.pow( 10 , 9 ) ; // A billion milliseconds (approx 31 years).

      // Append the close button to the bar.
      bar.append( $( "<a href='#' class='notify-bar-close'>" + settings.closeText + "</a>" ) ) ;

      // Attach a click event handler to the close button.
      $( ".notify-bar-close" ) . click ( function ( event ) {
        event.preventDefault( ) ; // Prevent default anchor link behavior.
        bar.hideNB( ) ; // Hide the notify bar.
      } ) ;
    }


    // Check for any currently visible notify bars and hide them before showing the new one.
    if ( $( '.jquery-notify-bar:visible' ) . length > 0 ) {

      // Stop any ongoing animations on visible bars and slide them up.
      $( '.jquery-notify-bar:visible' ) . stop ( ) . slideUp ( asTime , function ( ) {
        bar.showNB( ) ; // After hiding others, show the new bar.
      } ) ;

    } else {

      bar.showNB( ) ; // If no other bars are visible, just show the new one immediately.
    }


    // Implement 'close on click' functionality.
    if ( settings.closeOnClick ) {
      bar.click( function ( ) {
        bar.hideNB( ) ; // Hide the bar when it's clicked.
      } ) ;
    }


    // Implement 'close on mouseover' functionality.
    if ( settings.closeOnOver ) {
      bar.mouseover( function ( ) {
        bar.hideNB( ) ; // Hide the bar when the mouse hovers over it.
      } ) ;
    }


    // Set a timeout to automatically hide the bar after the specified delay.
    setTimeout( function ( ) {
      bar.hideNB( settings.delay ) ; // Call the hide function.
    } , settings.delay + asTime ) ; // Delay includes animation time for a smoother transition.


    // Apply positioning classes ('top' or 'bottom').
    if ( settings.position === 'bottom' ) {
      bar.addClass( 'bottom' ) ;
    } else if ( settings.position === 'top' ) {
      bar.addClass( 'top' ) ;
    }
  } ; // End of $.notifyBar function.

} ) ( jQuery ) ; // Pass jQuery object to the immediately invoked function expression.