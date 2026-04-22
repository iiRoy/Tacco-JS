( function () {


  // This self-executing anonymous function encapsulates our script.
  jQuery.noConflict(); // Release jQuery's control over the '$' variable.

  var changing = false; // Flag to prevent infinite loops from DOM modifications.

  var nodes = {}; // Object to store CSS selectors for different chat platforms.

  /*
   * The following block determines the current social media platform
   * (e.g., Facebook, Gmail) and configures selectors accordingly.
   * This allows the script to adapt to different DOM structures.
   */
  if ( /facebook/.test( window.location.href ) )
  {
    // These selectors target chat messages within Facebook's interface.
    nodes[ 'div.conversation' ]      = '.fbChatConvItem .messages span'; // For the main inbox view.
    nodes[ 'li.webMessengerMessageGroup' ] = 'span';                     // For the docked chat window.

    // imgNode is a factory function that creates an HTML string for an image.
    var imgNode = ( function ( key, img )
      {
        // The image source is dynamically generated using a Chrome extension URL.
        return "<span style=\"display:none\">" + key + "</span><img src=\"" + chrome.extension.getURL( img ) + "\"/ style=\"background-position: 0px 0px\" alt=\":)\">";
      } );
  }
  else
  {
    // If not on Facebook, log a debug message. This might be expanded for other platforms later.
    console.debug( 'not facebook - functionality might be limited or disabled' );
  }


  /*******************************************************************************
   * Core Logic: This section handles the actual replacement of text with images.
   * It iterates through defined nodes and sets up event listeners.
   *******************************************************************************/


  // The regular expression to find patterns like '[foo]' (single lowercase word in brackets).
  // It uses the 'g' flag for global matching.
  var re = new RegExp( "\[[a-z]+\]", "g" );

  // Iterate over each platform-specific node configuration.
  jQuery.each( nodes, function ( chatNode, messageNode )
  {
    console.debug( "### Processing chatNode: " + chatNode );
    console.debug( "### Corresponding messageNode: " + messageNode );

    // Delegate a 'DOMNodeInserted' event listener to the 'body'.
    // This efficiently catches new chat messages being added to the DOM.
    jQuery( 'body' ).delegate( chatNode, 'DOMNodeInserted', function ( event )
    {
      // Prevent recursive calls if this modification was triggered by our own script.
      if ( changing === false )
      {
        changing = true; // Set flag to indicate an ongoing change.
      }
      else
      {
        return; // If already changing, exit to prevent loops.
      }

      // Select all relevant message elements within the current chat node.
      var messages = jQuery( chatNode + " " + messageNode );

      // Loop through each message to perform text-to-icon replacement.
      jQuery.each( messages, function ()
      {
        var oldText = jQuery( this ).html(); // Get the original HTML content.
        var newText = oldText;                 // Initialize newText with the old content.
        var matches = oldText.match( re );     // Find all matches of our regex pattern.
        var message = this;                    // Reference to the current message DOM element.

        // If any patterns were found in the message text.
        if ( matches )
        {
          // For each matched pattern (e.g., "[foo]").
          jQuery.each( matches, function ()
          {
            var key = this.substring( 1, this.length - 1 ); // Extract the word inside brackets (e.g., "foo").
            var img = rages[ key ];                         // Look up the corresponding image URL in the 'rages' object.

            // If no image is defined for this key, skip to the next match.
            if ( !img )
            {
              return true; // Equivalent to 'continue' in a standard loop.
            }

            // Replace the text pattern with the generated image HTML.
            newText = newText.replace( "[" + key + "]", imgNode( key, img ) );
            console.debug( 'Replaced pattern -->' + this + '<-- with new content.' );
          } );

          // Update the message's HTML with the new content (including images).
          jQuery( message ).html( newText );
        }
      } );

      changing = false; // Reset the flag after all replacements are done.
    } );
  } );

} )(); // End of the self-executing anonymous function.