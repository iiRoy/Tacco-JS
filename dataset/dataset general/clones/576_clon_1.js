/*
 * This section provides a cross-browser compatible way to
 * attach event handlers to DOM elements.
 * It encapsulates the differences between W3C standard and
 * Internet Explorer's proprietary event models.
 */
var event = {
  add: function ( elem, type, fn )
  {
    // Check if the element supports IE's attachEvent method
    if ( elem.attachEvent ) {
      elem[ 'e' + type + fn ] = fn; // Store the original function reference
      elem[ type + fn ] = function () {
        elem[ 'e' + type + fn ]( window.event ); // Call the stored function with window.event
      };
      elem.attachEvent( 'on' + type, elem[ type + fn ] ); // Attach the wrapped event handler
    }
    // For modern browsers that support W3C standard addEventListener
    else
    {
      elem.addEventListener( type, fn, false );
    }
  }
};


/*
 * Global variable to keep track of the currently active media query.
 * Initialized to "unknown" before any detection occurs.
 */
var currentMQ = "unknown";


/*
 * mqSync: This function is responsible for detecting the active CSS media query
 * and updating JavaScript functionality based on the current breakpoint.
 * It primarily reads a CSS property (like font-family or content) that is
 * conditionally set by media queries in the stylesheet.
 */
var mqSync = function()
{

  var activeMQ; // Declare the variable to hold the detected media query string

  /*
   * Special handling for Opera browser:
   * Opera sometimes requires checking the 'content' property of a pseudo-element
   * to correctly determine the active media query.
   */
  if ( window.opera )
  {
    activeMQ = window.getComputedStyle( document.body, ':after' ).getPropertyValue( 'content' );
  }
  /*
   * For most other modern browsers (Chrome, Firefox, Safari, Edge):
   * We use window.getComputedStyle on the document.head to read the 'font-family'.
   * This property is often used in conjunction with media queries to signal
   * the active breakpoint to JavaScript.
   */
  else if ( window.getComputedStyle )
  {
    activeMQ = window.getComputedStyle( document.head, null ).getPropertyValue( 'font-family' );
  }
  /*
   * Fallback for older Internet Explorer versions:
   * These browsers do not support window.getComputedStyle.
   * A custom helper function, 'getCompStyle', is defined to emulate
   * similar functionality using IE's 'currentStyle'.
   */
  else
  {
    // Define a polyfill-like function for IE's 'currentStyle'
    window.getCompStyle = function( el, pseudo )
    {
      this.el = el; // Store the element reference
      this.getPropertyValue = function( prop )
      {
        var re = /(\-([a-z]){1})/g; // Regex to convert kebab-case to camelCase
        if ( prop == 'float' )
        {
          prop = 'styleFloat'; // IE uses 'styleFloat' instead of 'float'
        }
        if ( re.test( prop ) ) {
          prop = prop.replace( re, function () {
            return arguments[2].toUpperCase(); // Convert to camelCase
          } );
        }
        // Return the computed style value or null if not found
        return el.currentStyle[ prop ] ? el.currentStyle[ prop ] : null;
      }
      return this; // Return the object with the getPropertyValue method
    }
    var compStyle = window.getCompStyle( document.getElementsByTagName( 'head' )[0], "" );
    activeMQ = compStyle.getPropertyValue( "font-family" ); // Get font-family using the custom helper
  }


  // Remove any quotation marks that might be present around the string value
  activeMQ = activeMQ.replace( /"/g, "" );
  activeMQ = activeMQ.replace( /'/g, "" );


  /*
   * Conditional logic to execute JavaScript based on the detected breakpoint.
   * This block only runs if the active media query has changed from the last check.
   */
  if ( activeMQ != currentMQ )
  {
    // Handle 'Extra Small' breakpoint
    if ( activeMQ == 'XS' )
    {
      currentMQ = activeMQ; // Update the global state
      // Add specific JavaScript actions for the XS breakpoint here
      document.getElementById( 'msg' ).innerHTML = ( 'Active media query: <br><strong>' + currentMQ + '</strong>' );
      console.log( currentMQ );
    }

    // Handle 'Small' breakpoint
    if ( activeMQ == 'S' )
    {
      currentMQ = activeMQ;
      // Add specific JavaScript actions for the S breakpoint here
      document.getElementById( 'msg' ).innerHTML = ( 'Active media query: <br><strong>' + currentMQ + '</strong>' );
      console.log( currentMQ );
    }

    // Handle 'Medium' breakpoint
    if ( activeMQ == 'M' )
    {
      currentMQ = activeMQ;
      // Add specific JavaScript actions for the M breakpoint here
      document.getElementById( 'msg' ).innerHTML = ( 'Active media query: <br><strong>' + currentMQ + '</strong>' );
      console.log( currentMQ );
    }

    // Handle 'Large' breakpoint
    if ( activeMQ == 'L' )
    {
      currentMQ = activeMQ;
      // Add specific JavaScript actions for the L breakpoint here
      document.getElementById( 'msg' ).innerHTML = ( 'Active media query: <br><strong>' + currentMQ + '</strong>' );
      console.log( currentMQ );
    }
  }

}; // End of mqSync function


// Execute mqSync immediately when the script loads to set the initial state
mqSync();


// Attach the mqSync function to the window's 'resize' event
// This ensures that JavaScript functionality is updated whenever the viewport size changes
event.add( window, "resize", mqSync );