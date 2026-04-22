/*
 *  HTML Truncator for jQuery
 *  A plugin to intelligently truncate HTML content while preserving its structure.
 *  Authored by Henrik Nyh <http://henrik.nyh.se> on 2008-02-28.
 *
 *  This code is provided under a liberal license; feel free to modify,
 *  distribute, and adapt it for your projects, with appropriate credit.
 */


( function ( $ ) {

  // Global flag to track if the last processed text node ended with whitespace.
  // This helps in handling leading whitespace for subsequent nodes correctly.
  var trailing_whitespace = true;


  /**
   *  Extends jQuery's prototype to add a 'truncate' method.
   *  This method processes the selected elements, truncating their content
   *  based on the provided options.
   *
   *  @param {Object} options - Configuration options for truncation.
   */
  $.fn.truncate = function ( options ) {

    // Merge default options with user-provided options.
    var opts = $.extend( { } , $.fn.truncate.defaults , options );
    
    // Iterate over each selected element.
    $( this ).each( function ( ) {

      // Calculate the effective content length after trimming and squeezing whitespace.
      var content_length = $.trim( squeeze( $( this ).text( ) ) ).length;

      // If content is already shorter than or equal to the maximum allowed length,
      // there's no need to truncate. Exit early for this element.
      if ( content_length <= opts.max_length ) { return ; } // Optimization: skip if not overlong.

      // Calculate the actual maximum length for the content itself,
      // accounting for the 'more' indicator and its surrounding characters.
      var actual_max_length = opts.max_length - opts.more.length - 3; // 3 characters for " ()"

      // Perform the recursive truncation on a clone of the current element.
      var truncated_node = recursivelyTruncate( this , actual_max_length );
      // Hide the original full content element.
      var full_node = $( this ).hide( ) ;

      // Insert the newly truncated content node right after the original full content.
      truncated_node.insertAfter( full_node ) ;
      
      // Append the 'more' indicator to the appropriate location within the truncated content.
      findNodeForMore( truncated_node ).append( opts.more ) ;

      // Append the 'less' link to the appropriate location within the full content.
      // This link allows the user to switch back to the truncated view.
      findNodeForLess( full_node ).append( ' (<a href="#show less content">' + opts.less + '</a>)' ) ;
      
      // Attach a click event handler to the 'more' link in the truncated content.
      // Clicking it hides the truncated view and shows the full content.
      truncated_node.find( 'a:last' ).click( function ( ) {
        truncated_node.hide( ) ; // Hide the truncated version.
        full_node.show( ) ;      // Display the complete content.
        return false ;           // Prevent default link behavior.
      } ) ;

      // Attach a click event handler to the 'less' link in the full content.
      // Clicking it hides the full content and shows the truncated view.
      full_node.find( 'a:last' ).click( function ( ) {
        truncated_node.show( ) ; // Display the truncated version.
        full_node.hide( ) ;      // Hide the complete content.
        return false ;           // Prevent default link behavior.
      } ) ;

    } ) ; // End of each element iteration.
  } ; // End of $.fn.truncate definition.


  /*
   *  Default options for the truncate plugin.
   *  Note: The " (…more)" part is included in the max_length calculation.
   *  For example, a max_length of 10 applied to "1234567890" would result in "12 (…more)".
   */
  $.fn.truncate.defaults = {
    max_length: 100, // The maximum number of characters allowed before truncation occurs.
    more: '…',       // The string to append when content is truncated (e.g., an ellipsis).
    less: 'less'     // The text for the link to show less content.
  };

  /**
   *  Recursively truncates a DOM node.
   *  It distinguishes between text nodes and element nodes to apply appropriate truncation logic.
   *
   *  @param {Node} node - The DOM node to truncate.
   *  @param {number} max_length - The maximum character length allowed for this node's content.
   *  @returns {Node|string|null} The truncated node or text, or null if nothing remains.
   */
  function recursivelyTruncate ( node , max_length ) {
    // If it's a text node (nodeType 3), call truncateText. Otherwise, call truncateNode.
    return ( node.nodeType == 3 ) ? truncateText( node , max_length ) : truncateNode( node , max_length ) ;
  }

  /**
   *  Truncates an element node by recursively processing its children.
   *  It clones the node and appends truncated children until max_length is reached.
   *
   *  @param {Node} node - The element node to truncate.
   *  @param {number} max_length - The remaining character length allowed.
   *  @returns {jQuery} A new jQuery object containing the truncated element.
   */
  function truncateNode ( node , max_length ) {
    var node_jq = $( node ); // Wrap the node in a jQuery object.
    var new_node = node_jq.clone( ).empty( ) ; // Create a clean clone to populate.
    var truncatedChild ; // To hold the result of child truncation.

    // Iterate over each direct child of the original node.
    node_jq.contents( ).each( function ( ) {
      // Calculate how many characters are still available for truncation.
      var remaining_length = max_length - new_node.text( ).length ;

      // If no length remains, stop processing further children.
      if ( remaining_length == 0 ) {
        return ; // This breaks the jQuery .each() loop.
      }
      
      // Recursively truncate the current child.
      truncatedChild = recursivelyTruncate( this , remaining_length ) ;

      // If the child truncation yielded content, append it to the new node.
      if ( truncatedChild ) {
        new_node.append( truncatedChild ) ;
      }
    } ) ;

    return new_node ; // Return the newly constructed truncated element.
  }

  /**
   *  Truncates a text node to a specified maximum length.
   *  Handles leading/trailing whitespace and HTML entity encoding.
   *
   *  @param {Node} node - The text node to truncate.
   *  @param {number} max_length - The maximum character length for the text.
   *  @returns {string} The truncated and HTML-encoded text.
   */
  function truncateText ( node , max_length ) {
    var text = squeeze( node.data ) ; // Get text data and collapse whitespace.

    // If the previous text node had trailing whitespace, remove leading whitespace
    // from this text node to prevent double spacing.
    if ( trailing_whitespace ) {
      text = text.replace( /^ / , '' ) ;
    }

    // Update the trailing_whitespace flag based on the current text node.
    trailing_whitespace = !! text.match( / $/ ) ;

    // Slice the text to the desired maximum length.
    var sliced_text = text.slice( 0 , max_length ) ;

    // Ensure that any HTML entities within the text are properly encoded
    // to prevent malformed HTML when inserting back into the DOM.
    // Reference: http://debuggable.com/posts/encode-html-entities-with-jquery:480f4dd6-13cc-4ce9-8071-4710cbdd56cb
    sliced_text = $( '<div/>' ).text( sliced_text ).html( ) ;

    return sliced_text ; // Return the processed text.
  }

  /**
   *  Collapses multiple whitespace characters into a single space.
   *  Similar to Ruby's String#squeeze method for whitespace.
   *
   *  @param {string} string - The input string.
   *  @returns {string} The string with squashed whitespace.
   */
  function squeeze ( string ) {
    return string.replace( /\s+/g , ' ' ) ;
  }
  
  /**
   *  Finds the deepest, last child element that is block-level.
   *  This is where the 'more' indicator should be appended.
   *
   *  @param {jQuery} node - The jQuery object of the element to search within.
   *  @returns {jQuery} The jQuery object of the suitable node for appending 'more'.
   */
  function findNodeForMore ( node ) {
    var $node = $( node ) ; // Ensure it's a jQuery object.
    var last_child = $node.children( ":last" ) ; // Get the last direct child.

    // If there's no last child, the current node is the deepest.
    if ( ! last_child || last_child.length === 0 ) {
      return $node ;
    }

    // Check the display property of the last child.
    var display = last_child.css( 'display' ) ;

    // If it's not block-level (or display couldn't be determined), use the current node.
    if ( ! display || display === 'inline' || display === 'inline-block' ) {
      return $node ;
    }

    // Otherwise, recurse into the last child.
    return findNodeForMore( last_child ) ;
  } ;

  /**
   *  Finds the appropriate node for appending the 'less' link.
   *  If the last child is a paragraph (<p>), it uses that; otherwise, it uses the parent node.
   *
   *  @param {jQuery} node - The jQuery object of the element to search within.
   *  @returns {jQuery} The jQuery object of the suitable node for appending 'less'.
   */
  function findNodeForLess ( node ) {
    var $node = $( node ) ; // Ensure it's a jQuery object.
    var last_child = $node.children( ":last" ) ; // Get the last direct child.

    // If there's a last child and it's a paragraph element, use it.
    if ( last_child && last_child.is( 'p' ) ) {
      return last_child ;
    }

    // Otherwise, the current node itself is the target.
    return $node ;
  } ;

} ) ( jQuery ) ; // Pass jQuery into the immediately invoked function expression.
/* End of HTML Truncator plugin */