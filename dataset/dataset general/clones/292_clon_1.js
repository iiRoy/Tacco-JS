/*
 * Sive: A responsive stylesheet management system for dynamic loading
 * based on viewport width. This script initializes the Sive object,
 * manages breakpoints, and applies the correct CSS file.
 */
var Sive  =   {

  // Reference to the main stylesheet link element in the DOM.
  element : document.getElementById( "Sive" )
  ,

  // Configuration settings for Sive, including breakpoints, fallback, and path.
  settings : {

    // Breakpoints define viewport widths and their corresponding stylesheet files.
    breakpoints : {
      1150 : "1150.css"
      ,
      1550 : "1550.css"
      ,
      830  : "830.css"
    }
    , // End of breakpoints object.

    // Default stylesheet to use if no breakpoint matches the current width.
    fallback : "default.css"
    ,

    // Base path for all Sive-managed stylesheets.
    path     : "/css/Sive/"

  }
  , // End of settings object.

  // Stores the current viewport width, updated by SiveRun.
  width : null

}; // End of Sive global object definition.


// Sort the defined breakpoints to ensure they are processed in ascending order.
Sive.settings.breakpoints = sortBreakpoints( Sive.settings.breakpoints );


// If the Sive link element does not exist in the DOM, create it dynamically.
if ( !Sive.element )
{
  Sive.element = document.createElement( "link" ); // Create a new <link> element.
  Sive.element.setAttribute( "id", "Sive" );       // Assign the ID "Sive" to it.
  Sive.element.setAttribute( "rel", "stylesheet" ); // Set its relationship type.

  // Append the newly created link element to the document's head section.
  document.getElementsByTagName( 'head' )[0].appendChild( Sive.element );
}


/**
 * The core function of Sive. It determines the current viewport width,
 * matches it against defined breakpoints, and applies the appropriate
 * stylesheet to the document.
 */
function SiveRun()
{

  var last        = 0
    , stylesheet  = null
    , width       = null
  ; // Declare local variables: 'last' for breakpoint comparison,
    // 'stylesheet' to store the chosen CSS file, 'width' for viewport width.


  // Cross-browser method to obtain the current viewport width.
  if ( typeof window.innerWidth != 'undefined' )
  {
    width = window.innerWidth; // Preferred method for modern browsers.
  }
  else if ( typeof document.documentElement != 'undefined'
           && typeof document.documentElement.clientWidth != 'undefined'
           && document.documentElement.clientWidth != 0 )
  {
    width = document.documentElement.clientWidth; // Fallback for IE (quirks mode) and similar.
  }
  else
  {
    width = document.getElementsByTagName( 'body' )[0].clientWidth; // Last resort for older browsers.
  }


  // Update the global Sive object with the newly calculated width.
  Sive.width = width;


  // Iterate through the sorted breakpoints to find the best match for the current width.
  for ( var k in Sive.settings.breakpoints )
  {
    if ( Sive.settings.breakpoints.hasOwnProperty( k ) )
    {

      // Check if the current viewport width falls within the range of this breakpoint.
      if ( Sive.width >= last && Sive.width <= k )
      {
        stylesheet = Sive.settings.breakpoints[k]; // Assign the stylesheet for this breakpoint.
      }

      last = k; // Update the 'last' breakpoint for the next comparison.

    }
  }


  // If no specific breakpoint was matched, use the configured fallback stylesheet.
  if ( !stylesheet )
  {
    stylesheet = Sive.settings.fallback;
  }


  // Update the 'href' attribute of the Sive link element only if it's different
  // from the currently applied stylesheet, preventing unnecessary DOM manipulations.
  if ( Sive.element.getAttribute( "href" ) != ( Sive.settings.path + stylesheet ) )
  {
    Sive.element.setAttribute( "href", Sive.settings.path + stylesheet ); // Apply the new stylesheet.
  }

}


/**
 * A utility function to sort the properties of an object by their keys.
 * This is essential for ensuring breakpoints are processed in a consistent,
 * ascending order based on their numeric keys.
 *
 * @param {Object} o - The object whose properties need to be sorted.
 * @returns {Object} A new object with properties ordered by their keys.
 */
function sortBreakpoints( o )
{
  var sorted = {}
    , key
    , a = []
  ; // Initialize an empty object for sorted results,
    // a variable for current key, and an array to hold keys.

  // Extract all own enumerable property keys from the input object 'o'.
  for ( key in o )
  {
    if ( o.hasOwnProperty( key ) )
    {
      a.push( key ); // Add the key string to the temporary array.
    }
  }


  a.sort(); // Sort the array of keys numerically (JavaScript's default sort for strings works here).


  key = a.length; // Set 'key' to the total number of keys in the sorted array.


  // Iterate backwards through the sorted keys to populate the 'sorted' object.
  while ( key-- )
  {
    sorted[ a[ key ] ] = o[ a[ key ] ]; // Assign the original value using the sorted key.
  }

  return sorted; // Return the newly created object with sorted properties.
}


// Perform an initial run of SiveRun to set the correct stylesheet on page load.
SiveRun();


// Attach SiveRun to the window's 'onresize' event, ensuring stylesheets adjust
// dynamically when the browser window's size changes.
window.onresize = SiveRun;