JSONFormatter = (  function(  )  {
  // This is the core initialization function for the JSON formatter.
  var init = function( json, options ) {

    // Default configuration settings for the formatter.
    var settings = $.extend( {
      'appendTo' : 'body',  // Element to which the formatted JSON will be appended.
      'list_id'  : 'json',  // ID for the root UL element containing the JSON.
      'collapse' : false    // Flag to determine if the tree should be collapsible.
    }, options ); // Merge any user-provided options.

    // A counter used to generate unique IDs for nested list elements.
    var loopCount = 0;

    /*
     * This helper function is responsible for iterating through objects that
     * contain other objects or arrays as their direct children.
     * It builds the list structure for such nested data.
     */
    loopObjectOfObjects = function( json2, ulId ) {
      $.each( json2, function( k3, v3 ) { // Loop through the properties of the current object.
        // Check if the current value is an object (indicating further nesting).
        if( typeof v3 == 'object' ) {
          // Append a list item with an opening brace and a nested unordered list.
          $( '#' + settings.list_id + ' #' + ulId ).append( '<li><span>{</span> <ul id="' + ulId + '-' + k3 + '"></ul></li>' );
          $.each( v3, function( k4, v4 ) { // Iterate over the properties of the nested object.
            // If this nested property is also an object (and not null), recurse.
            if( typeof v4 == 'object' && v4 != null ) {
              // Add a list item for the key, an opening brace, and another nested UL.
              $( '#' + settings.list_id + ' #' + ulId + '-' + k3 ).append( '<li>' + k4 + ' <span>{</span> <ul id="' + k4 + '-' + loopCount + '"></ul></li>' );
              // Call loopAgain for the next level of nesting.
              loopAgain( v4, k4, k4 + '-' + loopCount );
            }
            else {
              // If it's a simple key-value pair, append it directly as a list item.
              $( '#' + settings.list_id + ' #' + ulId + '-' + k3 ).append( '<li>' + k4 + ': ' + v4 + '</li>' );
            }
          } ); // End of inner $.each loop.
        }
        else {
          // If it's a simple value (e.g., in an array of primitives), just append it.
          $( '#' + settings.list_id + ' #' + ulId ).append( '<li>' + v3 + '</li>' )
        }
      } ); // End of outer $.each loop.
    }, // Comma indicates this is part of a larger `var` declaration.

    /*
     * This function is a general recursive handler for processing nested JSON structures.
     * It distinguishes between arrays, objects, and simple values.
     */
    loopAgain = function( v, k, ulId ) {
      loopCount++; // Increment the counter to ensure unique IDs for new lists.
      $.each( v, function( nextKey, nextVal ) {
        var nextListId = nextKey + '-' + loopCount; // Construct a unique ID for the next nested list.
        var newList = '<ul id="' + nextListId + '"></ul>'; // Create the HTML for the new UL.
        if( nextVal != null && typeof nextVal == 'object' ) { // Check if the value is an object (or array).
          if( nextVal.length == 0 ) {
            // Case: an empty array or object. Represent it as '[]'.
            $( '#' + settings.list_id + ' #' + ulId ).append( '<li><i>' + nextKey + ':</i> []</li>' );
          }
          else if( nextVal.length >= 1 ) {
            // Case: an array with one or more elements.
            // Append a list item with key, an opening bracket, and the new UL.
            $( '#' + settings.list_id + ' #' + ulId ).append( '<li><b>' + nextKey + ':</b> <span>[</span> ' + newList + '</li>' );
            // Recursively process the array using loopObjectOfObjects.
            loopObjectOfObjects( nextVal, nextListId );
          }
          else if( nextVal.length == undefined ) {
            // Case: a plain JavaScript object (no 'length' property).
            // Append a list item with key, an opening brace, and the new UL.
            $( '#' + settings.list_id + ' #' + ulId ).append( '<li><b>' + nextKey + ':</b> <span>{</span> ' + newList + '</li>' );
            // Recursively process the object using loopAgain.
            loopAgain( nextVal, nextKey, nextListId );
          }
        }
        else {
          // Case: a simple value (string, number, boolean, null, etc.).
          // Append a list item showing the key and its value.
          $( '#' + settings.list_id + ' #' + ulId ).append( '<li><i>' + nextKey + ':</i> ' + nextVal + '</li>' );
        }
      } ); // End of $.each for current level.
    }, // Another comma for the `var` declaration.

    /*
     * This function iterates through the generated HTML and adds the appropriate
     * closing braces '}' or brackets ']' after each nested list.
     */
    addClosingBraces = function( ) {
      $( '#' + settings.list_id + ' span' ).each( function( ) { // Find all 'span' elements within the main list.
        var closingBrace = '<span>}</span>'; // Default to a closing brace.
        if( $( this ).text( ) == "[" ) { // If the opening span was a bracket.
          closingBrace = '<span>]</span>'; // Use a closing bracket instead.
        }
        // Insert the determined closing element after the first child UL of the current span's parent.
        $( this ).parent( ).find( 'ul' ).eq( 0 ).after( closingBrace );
      } );
    }; // Semicolon, as this is the final function in this `var` declaration block.

    // Create the main unordered list element where the JSON will be rendered.
    var jsonList = $( '<ul id="' + settings.list_id + '" />' );

    // Append the newly created main list to the target element specified in settings.
    $( settings.appendTo ).append( jsonList );

    // Begin processing the top-level JSON object.
    $.each( json, function( key, val ) {

      if( val != null && typeof val == 'object' ) { // If the value is an object (or array).
        var goObj = false; // Flag to determine if it's a plain object.
        var goArray = false; // Flag to determine if it's an array.
        var nk = ''; // Variable to hold a key for ID generation.

        // Inner loop to inspect the structure of the current value to determine its type.
        $.each( val, function( nextKey, nextVal ) {

          if( nextVal != null && typeof nextVal == 'object' ) {
            if( nextVal.length == undefined ) { // If it's an object (lacks 'length').
              goObj = true; // Mark as a plain object.
              nk = nextKey; // Store the key for later use in ID.
            }
            else { // If it has 'length', it's likely an array of objects/arrays.
              goObj = false; // Not a plain object in this context.
            }
          }
          else { // If the nested value is a primitive, it suggests the current 'val' is an array of primitives.
            goArray = true; // Mark as an array.
          }
        } ); // End of inner `$.each` loop.

        if( goObj ) { // If the current value was determined to be a plain object.
          // Append a list item with the key, an opening bracket, and a new UL.
          $( '#' + settings.list_id ).append( '<li><b>' + key + ':</b> <span>[</span><ul id="' + nk + '-' + loopCount + '"></ul></li>' );
          // Process the object using loopObjectOfObjects.
          loopObjectOfObjects( val, nk + '-' + loopCount );
        }
        else if( goArray ) { // If the current value was determined to be an array.
          // Append a list item with the key, an opening bracket, and a new UL.
          $( '#' + settings.list_id ).append( '<li><b>' + key + ':</b> <span>[</span><ul id="' + nk + '-' + loopCount + '"></ul></li>' );
          // Process the array using loopAgain.
          loopAgain( val, nk, nk + '-' + loopCount );
        }
        else { // Fallback: if not explicitly identified as array or plain object, assume it's a generic object.
          // Append a list item with the key, an opening brace, and a new UL.
          $( '#' + settings.list_id ).append( '<li><b>' + key + ':</b> <span>{</span><ul id="' + key + '-' + loopCount + '"></ul></li>' );
          // Process the object using loopAgain.
          loopAgain( val, key, key + '-' + loopCount );
        }

      }
      else {
        // If the value is a simple primitive type.
        $( '#' + settings.list_id ).append( '<li><i>' + key + ':</i> ' + val + '</li>' );
      }
    } ); // End of main `$.each` loop for top-level JSON properties.

    // After building the entire structure, add the closing braces/brackets.
    addClosingBraces( );

    // If the 'collapse' option is true, enable the collapse/expand functionality.
    if( settings.collapse ) {
      addToggles( settings.list_id );
    }

  }, // End of 'init' function.

  /*
   * This function adds interactive toggle elements to the formatted JSON tree,
   * allowing users to collapse and expand nested lists.
   */
  addToggles = function( listId ) {
    // Find all 'ul' elements that are direct children of 'li' elements within the main list.
    $( '#' + listId + " > li" ).find( 'ul' ).each( function( ) {
      // Insert a toggle span after the first span element in the parent list item.
      $( this ).parent( ).find( 'span' ).eq( 0 ).after( '<span class="toggle fake-link"> - </span>' );
    } );

    // Set up initial state and click event handlers for the toggles.
    $( '.toggle' ).next( ).slideUp( ).end( ).text( ' + ' ).on( 'click', function( ) {
      if( $( this ).next( ).is( ":visible" ) ) { // Check if the next sibling (the UL) is visible.
        // If visible, hide it and change the toggle text to '+'.
        $( this ).next( ).slideUp( ).end( ).text( ' + ' );
      }
      else {
        // If hidden, show it and change the toggle text to '-'.
        $( this ).next( ).slideDown( ).end( ).text( ' - ' );
      }
    } );
  }; // End of 'addToggles' function.

  // The public API for the JSONFormatter module.
  return {

    // The main public method to initiate JSON formatting.
    format: function( json, options ) {
      init( json, options ); // Call the internal initialization function.
    }

  } // End of the returned object.

} )( ); // Immediately Invoked Function Expression (IIFE) to create a private scope.