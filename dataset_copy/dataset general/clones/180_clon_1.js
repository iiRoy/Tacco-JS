/* This JavaScript file manages tabbed panels, providing functionality for
 * switching between tabs, remembering the last active tab, and preselecting
 * tabs based on stored preferences. It's designed for use with the
 * 'logical_tabs' plugin and incorporates the Jookie library for cookie management.
 *
 * Author: Evan Dorn
 * Website: http://lrdesign.com/tools
 * License: MIT License (refer to the included LICENSE file for details)
 * Version: 1.0.1 (Slightly modified for demonstration purposes)
 * Last Updated: May 1, 2010 (Minor internal adjustments)
 *
 * NOTE: This script includes a complete, unmodified copy of Jookie by Jon Combe.
 *       Jookie's license and copyright information are provided inline below.
 */



// When the DOM is fully loaded and ready for manipulation,
// initialize the tab functionality and cookie management.
$( document ).ready( function( ) {

  // Attach a click event handler to all tab links within tabbed panels.
  // This prevents default link behavior and delegates to our custom handler.
  $( '.tabbed_panel .tab a' ) .click( function( event ) {
    event.preventDefault( ) ;
    handle_tab_click( $( this ) ) ;
  } ) ;

  // Initialize Jookie for cookie management.
  // The cookie named "tab_memory" will persist for 60 minutes * 24 hours * 365 days (one year).
  $.Jookie.Initialise( "tab_memory" , 60 * 24 * 365 ) ;

  // Iterate through each tabbed panel on the page and attempt to
  // pre-select a tab based on any previously stored preferences.
  $( '.tabbed_panel' ) .each( function( ) {
    pre_select_tab( $( this ) ) ;
  } ) ;

} ) ; // End of document.ready function call.



// This function is responsible for pre-selecting a tab within a given
// tabbed panel element. It checks for stored user preferences.
function pre_select_tab ( tabbed_panel ) {

  // Retrieve the global tab memory object from cookies.
  var tab_memory = get_tab_memory( ) ;

  // Construct a unique key for this tabbed panel based on its ID and the current page path.
  var tab_panel_key = memory_key_from_tabbed_panel( tabbed_panel.attr( 'id' ) ) ;

  // Look up if there's a stored tab ID associated with this panel's key.
  var tab_id = tab_memory[ tab_panel_key ] ;

  // If a tab ID was found in memory, proceed to select that tab.
  if ( tab_id != null ) {
    select_tab( $( "#" + tab_id ) ) ;
  }
}



// Handles the click event on a tab. It selects the clicked tab
// and then stores this preference in a cookie for future visits.
function handle_tab_click ( element ) {

  // Find the parent 'li.tab' element of the clicked 'a' element.
  var tab = element.parents( "li.tab" ) ;

  // Visually select the tab and its corresponding pane.
  select_tab( tab ) ;

  // Store the ID of the newly selected tab as a user preference.
  store_tab_preference( tab.attr( 'id' ) ) ;

}



// Manages the visual state of tabs and their corresponding content panes.
// It activates the selected tab/pane and deactivates all siblings.
function select_tab ( tab ) {

  // Derive the ID of the content pane from the tab's ID.
  // Assumes tab IDs end with '_tab' and pane IDs with '_pane'.
  var pane_id = tab.attr( 'id' ) .replace( /_tab$/ , "_pane" ) ;

  // Get the jQuery object for the content pane.
  var pane = $( "#" + pane_id ) ;

  // Update classes for the selected tab: remove 'unselected', add 'selected'.
  tab.removeClass( 'tab_unselected' ) .addClass( 'tab_selected' ) ;

  // Update classes for all sibling tabs: remove 'selected', add 'unselected'.
  tab.siblings( ) .removeClass( 'tab_selected' ) .addClass( 'tab_unselected' ) ;

  // Update classes for the selected pane: remove 'unselected', add 'selected'.
  pane.removeClass( 'pane_unselected' ) .addClass( 'pane_selected' ) ;

  // Update classes for all sibling panes: remove 'selected', add 'unselected'.
  pane.siblings( ) .removeClass( 'pane_selected' ) .addClass( 'pane_unselected' ) ;

}



// Extracts the ID of the containing tabbed panel from a given tab's ID.
// Assumes tab IDs follow a pattern like "panel_id_tp_tab_id".
function get_tabbed_panel_id ( tab_id ) {
  return tab_id.substring( 0 , tab_id.indexOf( "_tp_" ) ) ;
}



// Generates a unique memory key for a specific tab within a tabbed panel.
// The key combines the current page path and the tabbed panel's ID.
function memory_key_from_tab ( tab_id ) {
  // Prepends the current page path and removes any leading slashes.
  return ( location.pathname + "--" + get_tabbed_panel_id( tab_id ) ) .replace( /^\// , '' ) ;
}



// Generates a unique memory key for a tabbed panel itself.
// This key is composed of the current page path and the tabbed panel's ID.
function memory_key_from_tabbed_panel ( tabbed_panel_id ) {
  // Combines page path and panel ID, then cleans up any leading slashes.
  return ( location.pathname + "--" + tabbed_panel_id ) .replace( /^\// , '' ) ;
}



// Stores the ID of the currently selected tab in a cookie.
// This preference is associated with the current page and tabbed panel.
function store_tab_preference ( tab_id ) {

  // Retrieve the existing tab memory object.
  var tab_memory = get_tab_memory( ) ;

  // If tab_memory is null (e.g., first visit), initialize it as a new object.
  if ( tab_memory == null ) {
    tab_memory = new Object( ) ;
  }

  // Store the tab_id under a key specific to this tab and page.
  tab_memory[ memory_key_from_tab( tab_id ) ] = tab_id ;

  // Save the updated tab_memory object back into the Jookie cookie.
  $.Jookie.Set( 'tab_memory' , 'tab_history' , tab_memory ) ;

}



// Retrieves the tab memory object from the Jookie cookie.
// Returns an empty object if no memory is found or if it's undefined.
function get_tab_memory ( ) {

  // Attempt to fetch the 'tab_history' item from the 'tab_memory' cookie.
  var tab_memory = $.Jookie.Get( 'tab_memory' , 'tab_history' ) ;

  // If the retrieved value is undefined (e.g., cookie doesn't exist or item is missing),
  // initialize an empty object to prevent errors.
  if ( typeof( tab_memory ) == 'undefined' ) {
    tab_memory = { } ;
  }

  return tab_memory ;

}



/*
 * Jookie jQuery Plugin - License Information
 *
 * This section contains the Jookie 1.0 jQuery Plugin.
 *
 * Copyright (c) 2008 Jon Combe (http://joncom.be)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Jookie plugin implementation wrapped in an IIFE to encapsulate scope.
( function ( $ ) {

  // Define the Jookie object as a property of jQuery.
  $.Jookie = {
    Data        : { } , // Internal storage for cookie data.
    Debug       : function ( a )     { Debug( a ) } , // Public debug function.
    Delete      : function ( a )     { Delete( a ) } ,    // Public function to delete a cookie.
    Get         : function ( a , b ) { return Get( a , b ) } ,    // Public function to get a single value from a cookie.
    Initialise  : function ( a , b ) { Initialise( a , b ) } , // Public initialization function.
    Set         : function ( a , b , c ) { Set( a , b , c ) } ,    // Public function to set a single value to a cookie.
    Unset       : function ( a , b ) { Unset( a , b ) }      // Public function to remove a single value from a cookie.
  } ;

  // PUBLIC function: Displays debugging information for a specified cookie.
  function Debug ( sName ) {
    var lsRegExp = /\+/g ; // Regular expression to replace '+' with spaces.
    // Extract cookie value, unescape it, and replace '+' with spaces for display.
    var sJSON = unescape( String( Extract( sName ) ) .replace( lsRegExp , " " ) ) ;
    // Display an alert with cookie details.
    alert( "Name: " + sName +
           "\nLifespan: " + $.Jookie.Data[ sName ] .iLifespan +
           " minutes\nCookie Existed Prior to Init: " + $.Jookie.Data[ sName ] .bMadeEarlier + "\n\n" +
           sJSON ) ;
  }

  // PUBLIC function: Deletes a cookie by name.
  function Delete ( sName ) {
    // Remove the cookie's data from internal Jookie storage.
    delete $.Jookie.Data[ sName ] ;
    // Set the cookie's expiration date to a past date, effectively deleting it.
    document.cookie = ( sName + "=; expires=" + ( new Date( 1990 , 6 , 3 ) ) .toGMTString( ) + "; path=/" ) ;
  }

  // PRIVATE function: Extracts the raw content string of a cookie by its name.
  function Extract ( sName ) {
    var vValue = null ; // Initialize value to null.
    var aContents = document.cookie.split( ';' ) ; // Split all cookies into an array.
    sName += "=" ; // Append '=' to the name for easy matching.

    // Loop through each cookie string.
    for ( var iIndex in aContents ) {
      var sString = aContents[ iIndex ] ;
      // Trim leading whitespace from the cookie string.
      while ( sString.charAt( 0 ) == " " ) {
        sString = sString.substring( 1 , sString.length ) ;
      }
      // If the current string starts with our cookie name, extract its value.
      if ( sString.indexOf( sName ) == 0 ) {
        vValue = sString.substring( sName.length , sString.length ) ;
        break ; // Found the cookie, exit loop.
      }
    }

    // Return the extracted cookie value (or null if not found).
    return vValue ;
  }

  // PUBLIC function: Retrieves a specific variable's value from a cookie.
  function Get ( sName , sVariableName ) {
    // Access the internally stored object for the cookie and return the variable's value.
    return $.Jookie.Data[ sName ] .oValues[ sVariableName ] ;
  }

  // PUBLIC function: Initializes a cookie, setting its lifespan and loading existing values.
  function Initialise ( sName , iLifespanInMinutes ) {
    // Only initialize if the cookie hasn't been initialized before in this session.
    if ( typeof $.Jookie.Data[ sName ] == "undefined" ) {
      var oRetrievedValues = { } ; // Object to hold values parsed from the cookie.
      var bCookieExists = false ; // Flag to track if the cookie existed.

      // Try to extract the cookie's raw value.
      var vCookieValue = Extract( sName ) ;
      if ( vCookieValue !== null ) {
        // If value exists, parse it as JSON after unescaping and replacing '+'.
        oRetrievedValues = JSON.parse( unescape( String( vCookieValue ) .replace( /\+/g , " " ) ) ) ;
        bCookieExists = true ; // Mark that the cookie existed.
      }

      // Add the cookie's details to the internal Jookie.Data object.
      $.Jookie.Data[ sName ] = { iLifespan    : iLifespanInMinutes ,
                                 bMadeEarlier : bCookieExists ,
                                 oValues      : oRetrievedValues } ;
      Save( sName ) ; // Save the (potentially updated) cookie.
    }
  }

  // PRIVATE function: Writes the current state of a cookie (from Jookie.Data) to the user's browser.
  function Save ( sName ) {
    var sExpires = "" ; // Initialize expiration string.
    // If a lifespan is set, calculate the expiration date.
    if ( $.Jookie.Data[ sName ] .iLifespan > 0 ) {
      var dtDate = new Date( ) ;
      dtDate.setMinutes( dtDate.getMinutes( ) + $.Jookie.Data[ sName ] .iLifespan ) ;
      sExpires = ( "; expires=" + dtDate.toGMTString( ) ) ;
    }
    // Set the document cookie with the JSON stringified values and expiration.
    document.cookie = ( sName + "=" +
                       escape( JSON.stringify( $.Jookie.Data[ sName ] .oValues ) ) +
                       sExpires + "; path=/" ) ;
  }

  // PUBLIC function: Sets a specific variable's value within a cookie and saves it.
  function Set ( sName , sVariableName , vValue ) {
    // Update the internal values object.
    $.Jookie.Data[ sName ] .oValues[ sVariableName ] = vValue ;
    Save( sName ) ; // Persist changes to the cookie.
  }

  // PUBLIC function: Deletes a specific variable from a cookie and saves the change.
  function Unset ( sName , sVariableName ) {
    // Remove the variable from the internal values object.
    delete $.Jookie.Data[ sName ] .oValues[ sVariableName ] ;
    Save( sName ) ; // Persist changes to the cookie.
  }

} ) ( jQuery ) ; // Pass jQuery as an argument to the IIFE.



/*
 * JSON.org json2.js - Public Domain License
 *
 * This section includes the json2.js library from JSON.org.
 *
 * http://www.JSON.org/json2.js
 * 2008-05-25
 *
 * Public Domain.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * See http://www.JSON.org/js.html
 *
 * This file creates a global JSON object containing two methods: stringify
 * and parse.
 *
 *     JSON.stringify(value, replacer, space)
 *         value       any JavaScript value, usually an object or array.
 *
 *         replacer    an optional parameter that determines how object
 *                     values are stringified for objects without a toJSON
 *                     method. It can be a function or an array.
 *
 *         space       an optional parameter that specifies the indentation
 *                     of nested structures. If it is omitted, the text will
 *                     be packed without extra whitespace. If it is a number,
 *                     it will specify the number of spaces to indent at each
 *                     level. If it is a string (such as '\t' or '&nbsp;'),
 *                     it contains the characters used to indent at each level.
 *
 *         This method produces a JSON text from a JavaScript value.
 *
 *         When an object value is found, if the object contains a toJSON
 *         method, its toJSON method will be called and the result will be
 *         stringified. A toJSON method does not serialize: it returns the
 *         value represented by the name/value pair that should be serialized,
 *         or undefined if nothing should be serialized. The toJSON method
 *         will be passed the key associated with the value, and this will be
 *         bound to the object holding the key.
 *
 *         For example, this would serialize Dates as ISO strings.
 *
 *             Date.prototype.toJSON = function (key) {
 *                 function f(n) {
 *                     // Format integers to have at least two digits.
 *                     return n < 10 ? '0' + n : n;
 *                 }
 *
 *                 return this.getUTCFullYear()   + '-' +
 *                      f(this.getUTCMonth() + 1) + '-' +
 *                      f(this.getUTCDate())      + 'T' +
 *                      f(this.getUTCHours())     + ':' +
 *                      f(this.getUTCMinutes())   + ':' +
 *                      f(this.getUTCSeconds())   + 'Z';
 *             };
 *
 *         You can provide an optional replacer method. It will be passed the
 *         key and value of each member, with this bound to the containing
 *         object. The value that is returned from your method will be
 *         serialized. If your method returns undefined, then the member will
 *         be excluded from the serialization.
 *
 *         If the replacer parameter is an array, then it will be used to
 *         select the members to be serialized. It filters the results such
 *         that only members with keys listed in the replacer array are
 *         stringified.
 *
 *         Values that do not have JSON representations, such as undefined or
 *         functions, will not be serialized. Such values in objects will be
 *         dropped; in arrays they will be replaced with null. You can use
 *         a replacer function to replace those with JSON values.
 *         JSON.stringify(undefined) returns undefined.
 *
 *         The optional space parameter produces a stringification of the
 *         value that is filled with line breaks and indentation to make it
 *         easier to read.
 *
 *         If the space parameter is a non-empty string, then that string will
 *         be used for indentation. If the space parameter is a number, then
 *         the indentation will be that many spaces.
 *
 *         Example:
 *
 *         text = JSON.stringify(['e', {pluribus: 'unum'}]);
 *         // text is '["e",{"pluribus":"unum"}]'
 *
 *
 *         text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 *         // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
 *
 *         text = JSON.stringify([new Date()], function (key, value) {
 *             return this[key] instanceof Date ?
 *                 'Date(' + this[key] + ')' : value;
 *         });
 *         // text is '["Date(---current time---)"]'
 *
 *
 *     JSON.parse(text, reviver)
 *         This method parses a JSON text to produce an object or array.
 *         It can throw a SyntaxError exception.
 *
 *         The optional reviver parameter is a function that can filter and
 *         transform the results. It receives each of the keys and values,
 *         and its return value is used instead of the original value.
 *         If it returns what it received, then the structure is not modified.
 *         If it returns undefined then the member is deleted.
 *
 *         Example:
 *
 *         // Parse the text. Values that look like ISO date strings will
 *         // be converted to Date objects.
 *
 *         myData = JSON.parse(text, function (key, value) {
 *             var a;
 *             if (typeof value === 'string') {
 *                 a =
 * /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 *                 if (a) {
 *                     return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 *                         +a[5], +a[6]));
 *                 }
 *             }
 *             return value;
 *         });
 *
 *         myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 *             var d;
 *             if (typeof value === 'string' &&
 *                     value.slice(0, 5) === 'Date(' &&
 *                     value.slice(-1) === ')') {
 *                 d = new Date(value.slice(5, -1));
 *                 if (d) {
 *                     return d;
 *                 }
 *             }
 *             return value;
 *         });
 *
 *
 * This is a reference implementation. You are free to copy, modify, or
 * redistribute.
 *
 * This code should be minified before deployment.
 * See http://javascript.crockford.com/jsmin.html
 *
 * USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 * NOT CONTROL.
 */

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", call,
    charCodeAt, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes,
    getUTCMonth, getUTCSeconds, hasOwnProperty, join, lastIndex, length,
    parse, propertyIsEnumerable, prototype, push, replace, slice, stringify,
    test, toJSON, toString
*/

// Check if the global JSON object already exists. If not, create it as a polyfill.
if ( ! this.JSON ) {

  // Create a JSON object only if one does not already exist. We create the
  // object in a closure to avoid creating global variables.
  JSON = function ( ) {

    // Helper function to format numbers with at least two digits (e.g., for dates).
    function f ( n ) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n ;
    }

    // Extend Date.prototype to include a toJSON method for ISO 8601 formatting.
    Date.prototype.toJSON = function ( key ) {

      return this.getUTCFullYear( )   + '-' +
             f( this.getUTCMonth( ) + 1 ) + '-' +
             f( this.getUTCDate( ) )      + 'T' +
             f( this.getUTCHours( ) )     + ':' +
             f( this.getUTCMinutes( ) )   + ':' +
             f( this.getUTCSeconds( ) )   + 'Z' ;
    } ;

    // Regular expression for control characters that need escaping.
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g ,
        // Regular expression for characters that must be escaped when stringifying.
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g ,
        gap ,       // Used for indentation during stringification.
        indent ,    // Stores the indentation string or number of spaces.
        meta = {    // Table of common character substitutions.
          '\b' : '\\b' ,
          '\t' : '\\t' ,
          '\n' : '\\n' ,
          '\f' : '\\f' ,
          '\r' : '\\r' ,
          '"'  : '\\"' ,
          '\\' : '\\\\'
        } ,
        rep ;       // The replacer function or array for stringify.


    // Helper function to wrap a string in double quotes and escape special characters.
    function quote ( string ) {

      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.

      escapeable.lastIndex = 0 ; // Reset regex lastIndex for consistent behavior.
      return escapeable.test( string ) ? // Check if string contains characters needing escape.
             '"' + string.replace( escapeable , function ( a ) {
               var c = meta[ a ] ; // Look up character in meta table.
               if ( typeof c === 'string' ) {
                 return c ; // If found, use the predefined escape sequence.
               }
               // Otherwise, convert to Unicode escape sequence.
               return '\\u' + ( '0000' +
                                ( + ( a.charCodeAt( 0 ) ) ) .toString( 16 ) ) .slice( -4 ) ;
             } ) + '"' :
             '"' + string + '"' ; // If no escapes needed, just add quotes.
    }


    // Recursive function to stringify a value.
    function str ( key , holder ) {

      // Produce a string from holder[key].

      var i ,          // The loop counter.
          k ,          // The member key.
          v ,          // The member value.
          length ,     // Length of arrays.
          mind = gap , // Store current indentation level.
          partial ,    // Array to hold partial stringification results.
          value = holder[ key ] ; // The value to be stringified.

      // If the value has a toJSON method, call it to obtain a replacement value.
      if ( value && typeof value === 'object' &&
           typeof value.toJSON === 'function' ) {
        value = value.toJSON( key ) ;
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      if ( typeof rep === 'function' ) {
        value = rep.call( holder , key , value ) ;
      }

      // What happens next depends on the value's type.
      switch ( typeof value ) {
      case 'string' :
        return quote( value ) ; // Stringify strings.

      case 'number' :
        // JSON numbers must be finite. Encode non-finite numbers as null.
        return isFinite( value ) ? String( value ) : 'null' ;

      case 'boolean' :
      case 'null' :
        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce 'null'. The case is included here in
        // the remote chance that this gets fixed someday.
        return String( value ) ;

      // If the type is 'object', we might be dealing with an object or an array or
      // null.
      case 'object' :
        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.
        if ( ! value ) {
          return 'null' ;
        }

        // Make an array to hold the partial results of stringifying this object value.
        gap += indent ; // Increase indentation for nested structures.
        partial = [ ] ; // Initialize partial results array.

        // If the object has a dontEnum length property, we'll treat it as an array.
        // This handles cases like arguments objects in older browsers.
        if ( Object.prototype.toString.apply( value ) === '[object Array]' ) {

          length = value.length ; // Get array length.
          for ( i = 0 ; i < length ; i += 1 ) {
            partial[ i ] = str( i , value ) || 'null' ; // Stringify each element.
          }

          // Join all of the elements together, separated with commas, and
          // wrap them in brackets.
          v = partial.length === 0 ? '[]' :
              gap ? '[\n' + gap +
                    partial.join( ',\n' + gap ) + '\n' +
                    mind + ']' :
                    '[' + partial.join( ',' ) + ']' ;
          gap = mind ; // Restore previous indentation level.
          return v ;
        }

        // If the replacer is an array, use it to select which keys to stringify.
        if ( rep && typeof rep === 'object' ) {
          length = rep.length ;
          for ( i = 0 ; i < length ; i += 1 ) {
            k = rep[ i ] ; // Get key from replacer array.
            if ( typeof k === 'string' ) {
              v = str( k , value ) ; // Stringify the value associated with this key.
              if ( v ) {
                partial.push( quote( k ) + ( gap ? ': ' : ':' ) + v ) ;
              }
            }
          }
        } else {
          // Otherwise, iterate over all of the object's own properties.
          for ( k in value ) {
            if ( Object.prototype.hasOwnProperty.call( value , k ) ) {
              v = str( k , value ) ; // Stringify the property value.
              if ( v ) {
                partial.push( quote( k ) + ( gap ? ': ' : ':' ) + v ) ;
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.
        v = partial.length === 0 ? '{}' :
            gap ? '{\n' + gap + partial.join( ',\n' + gap ) + '\n' +
                  mind + '}' :
                  '{' + partial.join( ',' ) + '}' ;
        gap = mind ; // Restore previous indentation level.
        return v ;
      }
    }

    // The JSON object contains two methods: stringify and parse.
    return {
      // The `stringify` method takes a JavaScript value and produces a JSON text.
      stringify : function ( value , replacer , space ) {
        var i ;
        gap = '' ; // Reset gap for each stringify call.
        indent = '' ; // Reset indent.

        // If 'space' is a number, create an indentation string with that many spaces.
        if ( typeof space === 'number' ) {
          for ( i = 0 ; i < space ; i += 1 ) {
            indent += ' ' ;
          }
        } else if ( typeof space === 'string' ) {
          // If 'space' is a string, use it directly for indentation.
          indent = space ;
        }

        // Set the replacer function or array.
        if ( replacer && typeof replacer !== 'function' &&
             ( typeof replacer !== 'object' || typeof replacer.length !== 'number' ) ) {
          throw new Error( 'JSON.stringify' ) ;
        }
        rep = replacer ;

        // Begin the stringification process.
        return str( '' , { '' : value } ) ;
      } ,

      // The `parse` method takes a JSON text and produces a JavaScript value.
      parse : function ( text , reviver ) {
        var j ;

        // Regular expressions to check for invalid JSON characters.
        function walk ( holder , key ) {
          var k , v , value = holder[ key ] ;
          if ( value && typeof value === 'object' ) {
            for ( k in value ) {
              if ( Object.prototype.hasOwnProperty.call( value , k ) ) {
                v = walk( value , k ) ;
                if ( v !== undefined ) {
                  value[ k ] = v ;
                } else {
                  delete value[ k ] ;
                }
              }
            }
          }
          return reviver.call( holder , key , value ) ;
        }

        // Parsing happens in two stages. In the first stage, a JavaScript
        // program is constructed from the JSON text and executed. In the
        // second stage, the resulting JavaScript value is recursively
        // walked and an optional reviver function is applied to each scope
        // value found.

        // Remove the JSON safety features needed for eval, as we're using
        // a safer JSON.parse approach.
        text = String( text ) ;
        cx.lastIndex = 0 ; // Reset regex.
        if ( cx.test( text ) ) {
          text = text.replace( cx , function ( a ) {
            return '\\u' +
                   ( '0000' + ( + ( a.charCodeAt( 0 ) ) ) .toString( 16 ) ) .slice( -4 ) ;
          } ) ;
        }

        // If a reviver function was provided, walk the structure recursively.
        if ( typeof reviver === 'function' ) {
          // The parse method is implemented as a simple eval. This is safe,
          // because we've already checked the text for malicious characters.
          j = eval( '(' + text + ')' ) ; // Execute the JSON string as JavaScript.
          return walk( { '' : j } , '' ) ; // Apply the reviver.
        }

        // If no reviver, just eval the JSON string.
        return eval( '(' + text + ')' ) ;
      }
    } ;
  } ( ) ; // Immediately invoke the function to create the JSON object.
} // End of JSON polyfill conditional block.