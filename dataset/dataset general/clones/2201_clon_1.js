/* jshint -W054 */
// This comment is for JSHint, disabling a specific warning.
jQuery( document ) . ready( function ( $ ) {

  // This section provides a polyfill for Array.prototype.indexOf
  // It's a compatibility workaround specifically for older browsers, namely Internet Explorer 7 and 8.
  if ( ! Array . prototype . indexOf ) {
    Array . prototype . indexOf = function ( elt /*, from */ ) { // The 'from' parameter is optional.

      var len = this . length; // Get the length of the array.

      var from = Number( arguments[1] ) || 0; // Determine the starting index for the search. Default to 0.
      from = ( from < 0 ) ? Math . ceil( from ) : Math . floor( from ); // Ensure 'from' is an integer.

      if ( from < 0 ) { // If 'from' is negative, calculate it relative to the end of the array.
        from += len;
      }

      // Iterate through the array from the calculated 'from' index.
      for ( ; from < len; from ++ ) {
        // Check if the current index exists and if the element at this index matches 'elt'.
        if ( from in this && this[ from ] === elt ) {
          return from; // Return the index if a match is found.
        }
      }
      return -1; // Return -1 if the element is not found in the array.
    };
  }

  // Event handler for clicks on elements with the class 'eo-eb-filter'.
  $( '.eo-eb-filter' ) . click( function ( e ) {

    e . preventDefault(); // Prevent the default action of the click event (e.g., following a link).

    var type = $( this ) . data( 'filter-type' ); // Get the filter type from the data attribute.
    var value = $( this ) . data( type ); // Get the filter value based on the type.
    var filter = 'eo-eb-' + type + '-' + value; // Construct the full filter string.
    var filterOn = $( this ) . data( 'filter-on' ); // Check if the filter is currently active.
    var activeFilters = $( '#event-board-filters' ) . data( 'filters' ) . split( ',' ); // Retrieve current active filters.

    // If there's only one filter and it's an empty string, clear the array.
    if ( activeFilters . length === 1 && activeFilters[0] === "" ) {
      activeFilters = [];
    }

    // Check if the filter is currently NOT active (i.e., we are about to apply it).
    if ( ! filterOn ) {
      /* This block handles adding a new filter. */
      activeFilters . push( filter ); // Add the new filter to the list of active filters.

      // Hide and mark events matching the new filter as hidden.
      $( '#event-board .' + filter )
        . css( { 'visibility': 'hidden', 'display': 'none' } ) // Apply CSS to hide the elements.
        . removeClass( "eo-eb-event-box masonry-brick masonry-brick" ) // Remove core styling classes.
        . addClass( 'eo-eb-event-box-hidden' ); // Add a class indicating it's hidden.

    } else {
      // This block handles removing an existing filter.
      var index = activeFilters . indexOf( filter ); // Find the index of the filter to be removed.
      if ( index > -1 ) { // If the filter is found...
        activeFilters . splice( index, 1 ); // Remove it from the active filters array.
        // The $.grep call here seems to be a no-op as it's not assigned back.
        // It might be intended to remove falsy values, but 'n' will always be a string here.
        $. grep( activeFilters, function ( n ) { return ( n ); } );
      }

      // After removing the filter, check if there are still active filters.
      if ( activeFilters . length > 0 ) {

        // Remove filter: Show events that match the *removed* filter,
        // but *only* if they don't match any *remaining* active filters.
        $( '#event-board .' + filter )
          . not( '.' + activeFilters . join( ', .' ) ) // Select items that match 'filter' but not any other active filters.
          . css( { 'visibility': 'visible', 'display': 'block' } ) // Make them visible.
          . addClass( "eo-eb-event-box masonry-brick masonry-brick" ) // Re-add core styling classes.
          . removeClass( 'eo-eb-event-box-hidden' ); // Remove the hidden class.

      } else {
        // If no active filters remain, show all events that matched the removed filter.
        $( '#event-board .' + filter )
          . css( { 'visibility': 'visible', 'display': 'block' } ) // Make them visible.
          . addClass( "eo-eb-event-box masonry-brick masonry-brick" ) // Re-add core styling classes.
          . removeClass( 'eo-eb-event-box-hidden' ); // Remove the hidden class.
      }

    } // End of if/else for filterOn.

    // Update the data attribute on the filter container with the new list of active filters.
    $( '#event-board-filters' ) . data( 'filters', activeFilters . join( ',' ) );
    // Toggle the 'filter-on' data attribute for the clicked filter element.
    $( this ) . data( 'filter-on', ! filterOn );
    // Toggle a visual class to indicate the filter's active state.
    $( this ) . toggleClass( 'eo-eb-filter-on', ! filterOn );

    // Reload the Masonry layout to reflect the changes in element visibility.
    $( '#event-board-items' ) . masonry( 'reload' );
  } );



  /*
   * This section implements a JavaScript micro-templating function.
   * It is designed to be similar to John Resig's original implementation.
   * This specific code is adapted from Underscore.js's templating utility,
   * which is known for handling arbitrary delimiters, preserving whitespace,
   * and correctly escaping quotes within interpolated code segments.
   */
  function eo_event_board_template_handler( text, data ) {

    // Regular expression to escape special characters in template strings.
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    // Default settings for template delimiters.
    var settings = {
      evaluate    : /<%([\s\S]+?)%>/g,   // <% ... %> for evaluating JavaScript code.
      interpolate : /<%=([\s\S]+?)%>/g,  // <%= ... %> for interpolating variables (unescaped).
      escape      : /<%-([\s\S]+?)%>/g   // <%- ... %> for interpolating variables (HTML escaped).
    };
    // Map of special characters to their escaped versions for string literal generation.
    var escapes = {
      "'":      "'",
      '\\':     '\\',
      '\r':     'r',
      '\n':     'n',
      '\t':     't',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };

    var render; // Variable to hold the compiled render function.

    // Combine all delimiter regular expressions into a single matcher using alternation.
    // The '|$' at the end ensures that the last part of the string is also processed.
    var matcher = new RegExp( [
      ( settings . escape ) . source,
      ( settings . interpolate ) . source,
      ( settings . evaluate ) . source
    ] . join( '|' ) + '|$', 'g' );

    // Compile the template source into a JavaScript function string.
    var index = 0;
    var source = "__p+='"; // Initialize the output string for the compiled function.
    text . replace( matcher, function ( match, escape, interpolate, evaluate, offset ) {
      // Append the text between the last match and the current one, escaping string literals.
      source += text . slice( index, offset ) . replace( escaper, function ( match ) { return '\\' + escapes[ match ]; } );

      if ( escape ) {
        // Handle escaped interpolation (<%- ... %>).
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if ( interpolate ) {
        // Handle unescaped interpolation (<%= ... %>).
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if ( evaluate ) {
        // Handle evaluation of raw JavaScript code (<% ... %>).
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match . length; // Move the index past the current match.
      return match; // Return the match (not used, but required by replace).
    } );
    source += "';\n"; // Close the last string literal.

    // If a variable name for the data object is not specified in settings,
    // wrap the generated source in a 'with' statement for easier access to data properties.
    if ( ! settings . variable ) {
      source = 'with(obj||{}){\n' + source + '}\n';
    }

    // Prepend and append necessary boilerplate for the rendering function.
    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      // Attempt to create the rendering function using the generated source.
      render = new Function( settings . variable || 'obj', '_', source );
    } catch ( e ) {
      // If there's an error in compilation, attach the source for debugging.
      e . source = source;
      throw e;
    }

    // If data is provided immediately, render and return the result.
    if ( data ) {
      return render( data );
    }

    // Otherwise, return a template function that can be called later with data.
    var template = function ( data ) {
      return render . call( this, data );
    };

    return template; // The compiled template function.
  }


  // Initialize Masonry container and related variables.
  var $container = $( '#event-board-items' );
  var width = $container . parent() . width(); // Get the width of the parent element.

  $( '#event-board-more' ) . text( eventorganiser_posterboard . loading ); // Set initial loading text.
  var page = 1; // Initialize page counter for pagination.

  var template = eventorganiser_posterboard . template; // Get the raw template string.
  var event_board_template = eo_event_board_template_handler( template ); // Compile the template.

  // Initial AJAX call to fetch events for the first page.
  $. ajax( {
    url: eventorganiser_posterboard . url, // API endpoint URL.
    dataType: 'json', // Expected data type.
    data: { // Data to be sent with the request.
      action: 'eventorganiser-posterboard',
      page: page, // Current page number.
      query: eventorganiser_posterboard . query // Additional query parameters.
    }
  } ) . done( function ( events ) { // Callback for successful AJAX request.

    var html = ''; // Accumulator for generated HTML.
    for ( var i = 0; i < events . length; i ++ ) { // Loop through received events.
      var event = events[i]; // Current event object.
      html = event_board_template( event ); // Render event data using the template.
      $container . append( html ); // Append the rendered HTML to the container.
    }

    // If fewer events than expected are returned, hide the 'Load More' button.
    if ( events . length < eventorganiser_posterboard . query . posts_per_page ) {
      $( '#event-board-more' ) . hide();
    }

    // Once images are loaded within the container, initialize Masonry.
    $container . imagesLoaded( function () {
      $container . masonry( {
        isFitWidth: true, // Center the Masonry layout if there's extra horizontal space.
        itemSelector : '.eo-eb-event-box', // Selector for Masonry items.
        isAnimatedFromBottom: true, // Animation setting.
        isAnimated: true, // Animation setting.
        singleMode: true, // Deprecated in newer Masonry versions, but kept for compatibility.
        layoutPriorities: {
          shelfOrder: 0 // Custom layout priority.
        }
      } );
    } );

    // Update the 'Load More' button text and attach its click handler.
    $( '#event-board-more' ) . text( eventorganiser_posterboard . load_more );
    $( '#event-board-more' ) . click( eventorganiser_fetch_events ); // Assign the fetch function.
  } );

  // Function to fetch additional events when the 'Load More' button is clicked.
  function eventorganiser_fetch_events() {
    page ++; // Increment the page number.
    $. ajax( {
      url: eventorganiser_posterboard . url,
      dataType: 'json',
      data: {
        action: 'eventorganiser-posterboard',
        page: page,
        query: eventorganiser_posterboard . query
      }
    } ) . done( function ( events ) {
      $( '#event-board-more' ) . text( 'Load more' ); // Reset button text.
      var html = ''; // Accumulator for new event HTML.
      for ( var i = 0; i < events . length; i ++ ) {
        var event = events[i];
        html += event_board_template( event ); // Append rendered event HTML.
      }
      if ( events . length < eventorganiser_posterboard . query . posts_per_page ) {
        $( '#event-board-more' ) . hide(); // Hide if no more events expected.
      }

      var $box = $( html ); // Create jQuery object from new HTML.
      var activeFilters = $( '#event-board-filters' ) . data( 'filters' ) . split( ',' ); // Get current filters.

      if ( activeFilters . length == 1 && activeFilters[0] === "" ) {
        activeFilters = []; // Clear if only an empty string filter.
      }

      // Append new items to container and inform Masonry to append them.
      $container . append( $box ) . masonry( 'appended', $box, true );

      // If there are active filters, hide the newly appended items that match them.
      if ( activeFilters . length > 0 ) {
        var select = '#event-board .' + activeFilters . join( ', #event-board .' );
        $( select )
          . css( { 'visibility': 'hidden', 'display': 'none' } )
          . removeClass( "eo-eb-event-box masonry-brick masonry-brick" )
          . addClass( 'eo-eb-event-box-hidden' );
      }

      // After new images are loaded, reload the Masonry layout to arrange them.
      $container . imagesLoaded( function () {
        $container . masonry( 'reload' );
      } );

    } ); // End of AJAX done callback.
  } // End of eventorganiser_fetch_events function.

} ); // End of jQuery ready function.