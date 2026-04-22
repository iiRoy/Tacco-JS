/*
 * This is a highly customized script designed for dynamic page enhancement.
 * It thoughtfully processes 'div.example' elements,
 * extracting and managing their embedded HTML, JavaScript, and CSS content.
 * The script provides interactive toggles for displaying source code
 * and allows live editing of HTML and JavaScript directly within the page.
 * It also includes utility functions for wrapping textareas and HTML encoding.
 */
$( function( ) { // The document ready function ensures the DOM is fully loaded.

  // Iterate over each 'div.example' element found on the page.
  $( 'div.example' ) . each( function( ) {

    // Identify the target elements within the current example div.
    // These are the elements whose HTML source will be displayed and editable.
    var target = $( '.target, .alt-target', this );

    // Clone the target elements and get their HTML content.
    // Wrap it in a temporary div to ensure proper HTML serialization.
    var htmlSource = $( '<div />' ) . append( target.clone( ) ) . html( );

    // Create a div to hold the escaped HTML source, ready for display.
    // The escapeHTMLEncode function prevents the browser from rendering the raw HTML.
    htmlSource = $( '<div class="html-source">' + escapeHTMLEncode( htmlSource ) + '</div>' );

    // Create a link to toggle the visibility of the HTML source.
    var html = $( '<div class="html-link"><a href="#">html</a></div>' ) . click( function( ) {
      // Check for Internet Explorer to use 'toggle()' for compatibility.
      if ( $.browser.msie ) {
        // IE's 'slideToggle' can be problematic; a simple 'toggle' is safer.
        $( this ) . parent( ) . find( '.html-source' ) . toggle( );
      } else {
        // For modern browsers, 'slideToggle' provides a smoother animation.
        $( this ) . parent( ) . find( '.html-source' ) . slideToggle( );
      }
      return false; // Prevent default link action (e.g., page refresh).
    } );

    // Create a link to toggle the visibility of the JavaScript source.
    var jsLink = $( '<div class="html-link"><a href="#">javascript</a></div>' ) . click( function( ) {
      // Again, handle IE compatibility separately.
      if ( $.browser.msie ) {
        $( this ) . parent( ) . find( '.js' ) . toggle( );
      } else {
        $( this ) . parent( ) . find( '.js' ) . slideToggle( );
      }
      return false; // Stop the browser from navigating.
    } );

    // Look for any inline <style> tags within the example div.
    var cssSource = $( 'style', this );

    // If CSS source is found, prepare it for display and create a toggle link.
    if ( cssSource.length ) {
      cssSource = $( '<div class="css-source">' + cssSource.html( ) + '</div>' );

      // Create the CSS toggle link.
      var css = $( '<div class="css-link"><a href="#">css</a></div>' ) . click( function( ) {
        if ( $.browser.msie ) {
          $( this ) . parent( ) . find( '.css-source' ) . toggle( );
        } else {
          $( this ) . parent( ) . find( '.css-source' ) . slideToggle( );
        }
        return false; // Prevent the default link behavior.
      } );
    }

    // Identify the JavaScript source element within the current example.
    var jsSource = $( '.js', this );

    // Insert the HTML toggle link before the JavaScript source.
    $( jsSource ) . before( html );

    // Insert the escaped HTML source container before the JavaScript source.
    $( jsSource ) . before( htmlSource );

    // Wrap the HTML source content in a textarea for editing.
    textareaWrap( htmlSource );

    // Attach a change handler to the HTML source textarea.
    // This allows live updates to the page's HTML.
    $( 'textarea', htmlSource ) . data( 'target', target[0] ) . change( function( ) {
      var newTarg = $( $( this ).val( ) ) . get( 0 ); // Parse new HTML from textarea.
      $( $( this ).data( 'target' ) ) . replaceWith( newTarg ); // Replace old target with new.
      $( this ) . data( 'target', newTarg ); // Update the stored target reference.
    } );

    // Initially hide the HTML source textarea.
    htmlSource.hide( );

    // If CSS was found, insert its toggle link and source, then hide it.
    if ( typeof css != 'undefined' ) {
      $( jsSource ) . before( css ); // CSS toggle link.
      $( jsSource ) . before( cssSource ); // CSS source container.
      textareaWrap( cssSource ); // Wrap CSS in a textarea.
      cssSource.hide( ); // Hide the CSS source initially.
    }

    // Insert the JavaScript toggle link before the JavaScript source.
    $( jsSource ) . before( jsLink );

    // Execute the JavaScript code found in the source element.
    // This makes the example functional.
    eval( jsSource.html( ) );

    // Wrap the JavaScript source in a textarea for editing, escaping its content.
    textareaWrap( jsSource, true );

    // Attach a change handler to the JavaScript source textarea.
    // This allows live execution of edited JavaScript.
    $( 'textarea', jsSource ) . change( function( ) {
      eval( $( this ).val( ) ); // Execute the new JavaScript code.
    } );

    // Initially hide the JavaScript source textarea.
    jsSource.hide( );
  } ); // End of 'each' example iteration.

  /*
   * Apply BeautyTip (bt) tooltips to all JavaScript and HTML source textareas.
   * These tooltips provide instructions for live editing.
   */
  $( 'div.js textarea, div.html-source textarea' ) . bt( 'This is live code. Feel free to edit and try out new options. Click (or tab) out of the textarea to see the results of your edits. If things go awry, reload the page.', {
    positions: 'right', // Position the tooltip to the right.
    trigger: ['focus', 'blur'], // Show on focus, hide on blur.
    overlap: 8, // Overlap the target element by 8 pixels.
    width: 150, // Set a fixed width for the tooltip.
    cssStyles: { // Apply custom CSS styles to the tooltip.
      fontSize: '11px' // Smaller font size for the tooltip text.
    }
  } );
} ); // End of document ready function.


/**
 * Utility function to wrap an element's HTML content in a <textarea>.
 * It also adjusts the textarea's height to fit its content.
 * @param {jQuery} obj - The jQuery object whose content will be wrapped.
 * @param {boolean} escape - Whether to HTML escape the content before wrapping.
 */
function textareaWrap( obj, escape ) {
  var html = $( obj ) . html( ); // Get the current HTML content.
  if ( escape ) {
    html = escapeHTMLEncode( html ); // Escape if requested.
  }
  // Clear the object and append a new textarea with the content.
  $( obj ) . empty( ) . append( $( '<textarea />' ) . append( html ) );

  var $textarea = $( 'textarea', obj ); // Reference to the newly created textarea.
  $textarea.width( '100%' ); // Ensure the textarea takes full width.

  // Calculate the scroll height to fit content, or default to 50px.
  var scrollHeight = $textarea.get( 0 ) . scrollHeight || 50;

  // Apply the calculated height to the textarea.
  $( 'textarea', obj ) . css( {
    height: scrollHeight
  } );
}

/**
 * Escapes HTML characters in a string to prevent them from being rendered as HTML.
 * This is crucial for displaying raw code snippets safely.
 * @param {string} str - The string to be HTML escaped.
 * @returns {string} The HTML escaped string.
 */
function escapeHTMLEncode( str ) {
  // Create a temporary div element.
  var div = document.createElement( 'div' );

  // Create a text node with the unescaped string.
  var text = document.createTextNode( str );

  // Append the text node to the div. The browser automatically escapes HTML entities.
  div.appendChild( text );

  // Return the innerHTML of the div, which now contains the escaped string.
  return div.innerHTML;
}