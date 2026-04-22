/*
 * This is a self-executing anonymous function that encapsulates the
 * truncation logic, leveraging the jQuery library.
 */
( function ( $ ) {

  /*
   * Regular expression to match trailing non-space characters or
   * a single space at the end of a string.
   * Used for chopping off partial words.
   */
  var chop = /(\s*\S+|\s)$/;


  // Public method for truncating HTML strings directly.
  // It effectively wraps the input HTML in a div, truncates it, and returns the modified HTML.
  $.truncate = function ( html , options ) {
    return $( '<div></div>' ).append( html ).truncate( options ).html();
  } ;


  /*
   * jQuery plugin to truncate the content of selected elements in place.
   * This function modifies the DOM directly.
   */
  $.fn.truncate = function ( options ) {
    // If options is just a number, interpret it as the desired length.
    if ( $.isNumeric( options ) ) {
      options = { length : options } ;
    }

    // Merge default options with user-provided options.
    var o = $.extend( { } , $.truncate.defaults , options ) ;

    // Iterate over each matched element to apply truncation.
    return this.each( function ( ) {
      var self = $( this ) ; // Cache the jQuery object for the current element.

      // If 'noBreaks' option is true, replace <br> tags with spaces.
      if ( o.noBreaks ) {
        self.find( 'br' ).replaceWith( ' ' ) ;
      }

      var text = self.text( ) ; // Get the plain text content of the element.
      var excess = text.length - o.length ; // Calculate how much text needs to be removed.

      // If 'stripTags' is true, replace the element's content with its plain text.
      if ( o.stripTags ) {
        self.text( text ) ;
      }

      // Handle word-based truncation: Adjust 'excess' to chop off complete words.
      if ( o.words && excess > 0 ) {
        excess = text.length - text.slice( 0 , o.length ).replace( chop , '' ).length - 1 ;
      }

      // If no excess, or already truncated (and not forced to re-truncate), do nothing.
      if ( excess < 0 || ( !excess && !o.truncated ) ) {
        return ;
      }

      // Loop through child nodes in reverse order to remove excess text.
      $.each( self.contents( ).get( ).reverse( ) , function ( i , el ) {
        var $el = $( el ) ; // Current child element/node.
        var text = $el.text( ) ; // Text content of the current node.
        var length = text.length ; // Length of the current node's text.

        // If the current node's text length is less than or equal to the remaining excess,
        // remove the entire node.
        if ( length <= excess ) {
          o.truncated = true ; // Mark as truncated.
          excess -= length ; // Reduce excess by the removed length.
          $el.remove( ) ; // Remove the node from the DOM.
          return ; // Continue to the next node.
        }

        // If it's a text node (nodeType 3), split it and insert the ellipsis.
        if ( el.nodeType === 3 ) {
          $( el.splitText( length - excess - 1 ) ).replaceWith( o.ellipsis ) ;
          return false ; // Stop iteration.
        }

        // For other element types, recursively truncate their children.
        $el.truncate( $.extend( o , { length : length - excess } ) ) ;
        return false ; // Stop iteration after recursive call.
      } ) ;
    } ) ;
  } ;


  /*
   * Default options for the truncation functionality.
   * These can be overridden by passing an options object to $.truncate or $.fn.truncate.
   */
  $.truncate.defaults = {

    // stripTags: When true, all HTML tags are removed, leaving only plain text.
    stripTags : false ,

    // words: When true, truncation will only occur at word boundaries to avoid cutting words in half.
    words : false ,

    // noBreaks: When true, <br> tags are replaced with spaces before truncation,
    // effectively treating line breaks as spaces.
    noBreaks : false ,

    // length: The maximum desired length of the truncated content.
    // Defaults to Infinity, meaning no truncation by length unless specified.
    length : Infinity ,

    // ellipsis: The character sequence to append when content is truncated.
    // Unicode ellipsis character is used by default.
    // The commented out option shows an alternative with a word joiner,
    // which had display issues in older browser versions.
    ellipsis : '\u2026' /* '\u2060\u2026' */

  } ;

} ) ( jQuery ) ;