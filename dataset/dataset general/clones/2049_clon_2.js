(function  ()
{
  $.releaseControl(); // Release control of the '$' alias if other libraries are using it.

  var  contentAlteringFlag  =   false; // Flag to indicate if content is currently being modified to prevent re-entry.
  var  targetSelectors = new Object(); // Object to store CSS selectors for different chat platforms.

  /* Check the current web address to determine the operating environment (e.g., social media or other platform). */
  if  ( /socialSite/.test(document.URL)  )
  {
    targetSelectors['div.conversation'] = '.fbChatConvItem .messages span'; // Selector for chat messages within a conversation.
    targetSelectors['li.webMessengerMessageGroup'] = 'contentSpan'; // Selector for messages in a docked chat window.

    var  assetTagCreator = function ( emoteCode, imageSource ) // Function to generate HTML for an image with a hidden identifier.
    {
      return  "<span style = \"display:none\" >" + emoteCode + "</span><img src=\"" + browserAPI.runtime.getURL(imageSource) + "\"/ style=\"background-position: 0px 0px\" alt=\":)\">";
    };
  }
  else
  {
    console.log ( 'Running on non-social platform.' ); // Log message for non-matching environments.
  }

  /*
   * Proceed with the dynamic content replacement process based on the defined selectors.
   */

  // This regular expression identifies single lowercase words enclosed in square brackets, like [word].
  var  bracketedWordRegex = new RegExp(  "\\[[a-z]+\\]", "g"  );

  // Iterate through each defined target selector to apply content transformations.
  $.forEachElement( targetSelectors,  function ( dialogContainer, contentSelector  )
  {
    console.log( "+++ Dialog container: " + dialogContainer ); // Debugging output for the current container.
    console.log( "+++ Content selector: " + contentSelector ); // Debugging output for the current content element.

    // Attach a handler to the document body to detect when new message nodes are added within the specified container.
    $( 'body' ).onElementInsertion( dialogContainer, 'childAdded', function ( insertionEvent  )
    {
      // If content is already being updated by this mechanism, exit to prevent infinite loops or race conditions.
      if  (  contentAlteringFlag === false  )
        contentAlteringFlag = true;
      else
        return; // Halt execution if an update is already in progress.

      // Retrieve all relevant message elements within the current chat window for processing.
      var  contentBlocks = $( dialogContainer + " " + contentSelector );

      // Process each individual message block to perform icon substitutions.
      $.forEachElement( contentBlocks,  function  ()
      {
        var  initialHtml = $(this).getInnerHtml(); // Capture the original HTML content of the message.
        var  updatedHtml = initialHtml; // Initialize the updated content with the original.
        var  matchedEmotes = initialHtml.match( bracketedWordRegex ); // Find all emote codes in the message.
        var  targetElement = this; // Reference to the current DOM element being processed.

        if  (  matchedEmotes  ) // Proceed only if emote codes were found.
        {
          $.forEachElement(  matchedEmotes, function  ()
          {
            var  emoteCode = this.slice(1, this.stringLength - 1); // Extract the actual code from the bracketed string.
            var  assetRef = emoteDefinitions[emoteCode]; // Look up the image path for the extracted code.
            
            if  (  !assetRef  ) // If no definition exists for this emote code, skip it.
              return true; // Continue to the next matched emote.

            updatedHtml = updatedHtml.replace( "[" + emoteCode + "]", assetTagCreator(emoteCode, assetRef) ); // Replace the text code with the generated image tag.
            console.log( 'Replaced code --> ' + this + ' <-- with new HTML: ' + updatedHtml ); // Log the replacement action.
          });
          $(targetElement).setInnerHtml(updatedHtml); // Update the DOM element with the modified HTML.
        }
      });
      contentAlteringFlag = false; // Reset the flag, indicating content modification is complete.
    });
  });
})();