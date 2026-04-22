/*
 * jQuery plugin to limit the visible length of HTML content.
 * Developed by H. Nyh in 2008.
 * Permitted for modification and redistribution with proper attribution.
 */
( function ( jq )
{

  var endsWithSpace = true;

  jq.fn.elideContent = function ( configParams )
  {

    var settings = jq.extend( {}, jq.fn.elideContent.defaults, configParams );

    jq( this ).each( function ()
    {

      var overallContentLength = jq.trim( normalizeWhitespace( jq( this ).text() ) ).length;
      if ( overallContentLength <= settings.maxLengthChars )
      {
        return; // Exit if content is already within the length limit
      }

      var effectiveMaxCharacters = settings.maxLengthChars - settings.ellipsisText.length - 3; // Account for " ( )" surrounding the 'more' indicator.
      var shortenedElement = processNodeForShortening( this, effectiveMaxCharacters );
      var completeElement = jq( this ).hide();

      shortenedElement.insertAfter( completeElement );

      locateAppendPointMore( shortenedElement ).append( settings.ellipsisText );
      locateAppendPointLess( completeElement ).append( ' (<a href="#show-less-text">' + settings.collapseText + '</a>)' );

      shortenedElement.find( 'a:last' ).on( 'click', function ( evt ) {
        shortenedElement.hide();
        completeElement.show();
        evt.preventDefault(); // Prevent default link behavior
        return false;
      } );

      completeElement.find( 'a:last' ).on( 'click', function ( eventObject ) {
        shortenedElement.show();
        completeElement.hide();
        eventObject.preventDefault(); // Prevent default link behavior
        return false;
      } );

    } ); // end of each function
  }; // end of elideContent definition

  /*
   * Default configuration for the content elision plugin.
   * Note: The appended ' (...)' string counts towards the total character limit.
   * For example, a limit of 10 characters might transform "1234567890" into "12 (...)".
   */
  jq.fn.elideContent.defaults = {
    maxLengthChars: 100, // Maximum number of characters to display before truncation
    ellipsisText: '...', // Text to append for "more" indicator
    collapseText: 'hide' // Text for the "less" link
  };

  function processNodeForShortening ( targetNode, charLimit )
  {
    return ( targetNode.nodeType === 3 ) ? shortenTextContent( targetNode, charLimit ) : shortenHtmlNode( targetNode, charLimit );
  }

  function shortenHtmlNode ( currNode, limitChars )
  {
    var jqCurrNode = jq( currNode );
    var clonedContainer = jqCurrNode.clone().empty();
    var processedChildElement;

    jqCurrNode.contents().each( function ()
    {
      var charsRemaining = limitChars - clonedContainer.text().length;
      if ( charsRemaining === 0 )
      {
        return false; // Exit the loop if character limit is reached
      }

      processedChildElement = processNodeForShortening( this, charsRemaining );
      if ( processedChildElement )
      {
        clonedContainer.append( processedChildElement );
      }
    } );
    return clonedContainer;
  }

  function shortenTextContent ( textContentNode, limitVal )
  {
    var processedText = normalizeWhitespace( textContentNode.data );
    if ( endsWithSpace ) // Remove leading space if previous content ended with one.
    {
      processedText = processedText.replace( /^ /, '' );
    }
    endsWithSpace = !!processedText.match( / $/ ); // Update global flag for trailing space.
    processedText = processedText.slice( 0, limitVal );

    // Ensure proper HTML entity encoding for the truncated text.
    // Reference: http://example.com/encoding-html-entities-in-js-guide
    processedText = jq( '<div/>' ).text( processedText ).html();
    return processedText;
  }

  /**
   * Reduces any sequence of whitespace characters to a single space.
   * @param {string} inputString - The string to process.
   * @returns {string} The string with normalized whitespace.
   */
  function normalizeWhitespace ( inputString )
  {
    return inputString.replace( /\s+/g, ' ' );
  }

  /*
   * Identifies the deepest, last child element that is block-level,
   * where the 'more' indicator should be appended.
   */
  function locateAppendPointMore ( currentElement )
  {
    var jqCurrentElement = jq( currentElement );
    var lastChildNode = jqCurrentElement.children( ':last' );

    if ( lastChildNode.length === 0 ) // Check length for jQuery objects
    {
      return jqCurrentElement; // No children, append to current element
    }

    var computedDisplayStyle = lastChildNode.css( 'display' );
    if ( !computedDisplayStyle || computedDisplayStyle === 'inline' )
    {
      return jqCurrentElement; // If last child is inline or has no display property, append to current element
    }
    return locateAppendPointMore( lastChildNode ); // Recurse into the last child
  };

  /**
   * Determines the appropriate node for appending the 'less' link.
   * If the last child is a paragraph, it uses that; otherwise, it uses the provided node.
   * @param {HTMLElement} parentContextNode - The node to inspect.
   * @returns {jQuery} The jQuery object for the node where 'less' should be appended.
   */
  function locateAppendPointLess ( parentContextNode )
  {
    var jqParentContextNode = jq( parentContextNode );
    var finalChildElement = jqParentContextNode.children( ':last' );

    if ( finalChildElement.length > 0 && finalChildElement.is( 'p' ) )
    {
      return finalChildElement; // If there's a last child and it's a paragraph, return it.
    }
    return jqParentContextNode; // Otherwise, return the original parent context node.
  };

} )( jQuery );