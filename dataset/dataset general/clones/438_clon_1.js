/*
 * SYLECTRA: A micro-library for DOM element selection.
 * This function provides basic selector capabilities similar to jQuery.
 * It supports ID selectors (#), class selectors (.), and element tag selectors.
 *
 * @param {string} selector - The CSS-like selector string to query the DOM.
 * @returns {HTMLElement|NodeList|Array} - The matched element(s) or an empty array if none found.
 */
var SYLECTRA = function( selector )
{
  // Declare all necessary variables at the top.
  var i, len, curr_col, element, par, ret_arr = [ ], fns;


  // Handle ID selectors. If an ID is found anywhere, only the last one is considered.
  if( selector.indexOf( '#' ) > 0 )
  {
    // Split by '#' and take the last part.
    selector = selector.split( '#' );
    selector = '#' + selector[ selector.length - 1 ];
  }

  // Split the selector into individual components based on spaces.
  selector = selector.split( ' ' );


  // Define internal helper functions for DOM manipulation.
  fns = {

    /*
     * Retrieves an element by its ID.
     * @param {string} sel - The ID of the element to retrieve.
     * @returns {HTMLElement|null} - The element with the given ID, or null if not found.
     */
    id : function( sel )
    {
      return document.getElementById( sel );
    },

    /*
     * Generic getter for elements by class name or tag name.
     * @param {string} c_or_e - Specifies 'class' or 'elements' for the retrieval method.
     * @param {string} sel - The class name or tag name to search for.
     * @param {Node|NodeList} par - The parent element(s) to search within. Defaults to `document` implicitly if not passed.
     * @returns {HTMLElement|NodeList|Array} - The matched element(s).
     */
    get : function( c_or_e, sel, par )
    {
      var i = 0,
          len,
          arr = [ ],
          // Determine the appropriate DOM method based on 'c_or_e'.
          get_what = ( c_or_e === 'class' ) ? 'getElementsByClassName' : 'getElementsByTagName' ;

      // If the parent is a NodeList (has a length property)
      if( par.length )
      {
        // Iterate through each parent element and collect matches.
        while( par[ i ] )
        {
          Array.prototype.push.apply( arr, Array.prototype.slice.call( par[ i++ ][ get_what ]( sel ) ) );
        }
      }
      else
      {
        // If it's a single Node, directly call the method.
        arr = par[ get_what ]( sel );
      }

      // Return a single element if only one is found, otherwise return the collection.
      return( arr.length === 1 ) ? arr[ 0 ] : arr;
    }
  };


  // Initialize length of selectors and the current collection context.
  len = selector.length;
  curr_col = document;


  // Loop through each part of the selector string.
  for( i = 0; i < len; i++ )
  {
    element = selector[ i ];
    par = curr_col; // Set the current collection as the parent for the next selection.

    // Check for ID selector.
    if( element.indexOf( '#' ) === 0 )
    {
      curr_col = fns.id( element.split( '#' )[ 1 ] );
    }
    // Check for class selector.
    else if( element.indexOf( '.' ) > -1 )
    {
      element = element.split( '.' );

      // If there's an element tag prefixed on the class name (e.g., 'div.myClass').
      if( element[ 0 ] )
      {
        par = fns.get( 'elements', element[ 0 ], par ); // Get elements by tag name first.

        // If multiple parent elements were found for the tag.
        if( par.length )
        {
          // Iterate through these parent elements to find matching class names.
          for( i = 0; par[ i ]; i++ )
          {
            if( par[ i ].className.indexOf( element[ 1 ] ) > -1 )
            {
              ret_arr.push( par[ i ] );
            }
          }
          curr_col = ret_arr; // Update current collection with the filtered results.
        }
        else
        {
          // Single parent element case: check its class name directly.
          curr_col = ( par.className.indexOf( element[ 1 ] ) > -1 ) ? par : [ ];
        }
      }
      else
      {
        // Pure class selector (e.g., '.myClass').
        curr_col = fns.get( 'class', element[ 1 ], par );
      }
    }
    // Default to regular element tag selector.
    else
    {
      curr_col = fns.get( 'elements', element, par );
    }
  }

  // Return the final collection of selected elements.
  return curr_col;
};