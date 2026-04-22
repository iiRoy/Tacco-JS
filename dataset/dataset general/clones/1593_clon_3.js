$( function() { // Utilize jQuery's DOM ready shorthand for better readability and scope management

  // Define a map for HTML entity replacements to ensure safe rendering in URLs
  const charReplacementTable = {
    "&": "&amp;", // Ampersand
    "<": "&lt;",  // Less than sign
    ">": "&gt;",  // Greater than sign
    '"': '&quot;', // Double quote
    "'": '&#39;', // Single quote (apostrophe)
    "/": '&#x2F;' // Solidus (slash)
  };

  /**
   * Sanitizes an input string by replacing specific HTML characters with their entity equivalents.
   * This is crucial for preventing XSS vulnerabilities when embedding user-controlled data in HTML attributes or URLs.
   * @param {string} inputStr - The string to be sanitized.
   * @returns {string} The sanitized string, or an empty string if input is not valid.
   */
  const encodeForDisplay = ( inputStr ) => {
    // Ensure the input is treated as a string; non-strings are converted or result in empty output
    if ( typeof inputStr !== 'string' ) {
      console.warn("encodeForDisplay received non-string input, converting to empty string.");
      return '';
    }
    // Perform a global replacement using a regular expression that matches all keys in charReplacementTable
    return inputStr.replace( /[&<>"'\/]/g, function ( matchedChar ) {
      return charReplacementTable[ matchedChar ];
    });
  };

  /**
   * Extracts message ID and user ID from a FastMail message URL.
   * @param {string} urlString - The URL string to parse.
   * @returns {object|null} An object containing `msgId` and `userId` or `null` if no match.
   */
  const extractMailIdentifiers = ( urlString ) => {
    // Regex to capture the message ID (group 1) and user ID (group 2) from the URL structure
    // Example: /mail/folder/some-messageId?u=userId
    const idExtractorRegex = /\/mail\/.*\/[0-9a-z]+-([0-9a-z]+)\?u=([a-z0-9]+)/;
    const urlMatches = urlString.match( idExtractorRegex );

    if ( urlMatches && urlMatches.length >= 3 ) {
      return {
        msgId: urlMatches[1],
        userId: urlMatches[2]
      };
    }
    return null;
  };

  /**
   * Extracts the raw Message-ID header value from an email's HTML source.
   * @param {string} emailHtmlContent - The full HTML content of the raw email.
   * @returns {string|null} The Message-ID string (without angle brackets) or `null` if not found.
   */
  const retrieveMessageIdHeader = ( emailHtmlContent ) => {
    // Regex to find 'Message-ID: <...>' case-insensitively and capture the content within brackets
    const messageIdRegex = /Message-ID: <([^>]+)>/i;
    const headerMatches = emailHtmlContent.match( messageIdRegex );

    if ( headerMatches && headerMatches.length >= 2 ) {
      return headerMatches[1]; // Return the captured group (the ID itself)
    }
    return null;
  };

  // Define constants for selectors and URLs to improve maintainability and clarity
  const MAIN_CONTENT_AREA_SELECTOR = 'body';
  const MAILBOX_LINK_SELECTOR = '#mailboxList .MailboxItemView a';
  const EXISTING_LINK_CLASS = 'external-msg-viewer-action';
  const TOOLBAR_LEFT_SECTION_SELECTOR = '.app-toolbar .left';
  const FASTMAIL_RAW_MESSAGE_ENDPOINT = "https://www.fastmail.fm/rawmessage/";

  // Attach a delegated click event handler to the document body
  // This ensures that the handler works for dynamically loaded elements as well.
  $( MAIN_CONTENT_AREA_SELECTOR ).on( 'click', MAILBOX_LINK_SELECTOR, function( clickEvt ) {
    // Prevent default anchor behavior (navigating to the FastMail message page)
    clickEvt.preventDefault();

    const clickedAnchorElement = $( clickEvt.currentTarget );
    const anchorHref = clickedAnchorElement.attr( 'href' );

    // Basic validation: ensure href exists and is a string
    if ( !anchorHref || typeof anchorHref !== 'string' ) {
      console.warn( "Clicked element has no valid href attribute.", clickEvt.currentTarget );
      return; // Exit if no valid href
    }

    // Attempt to extract the message and user IDs from the clicked link's href
    const mailIdentifiers = extractMailIdentifiers( anchorHref );

    // Only proceed if both IDs were successfully extracted
    if ( mailIdentifiers ) {
      const { msgId, userId } = mailIdentifiers;

      // Construct the URL for fetching the raw message content
      const requestUrl = `${FASTMAIL_RAW_MESSAGE_ENDPOINT}${msgId}?u=${userId}`;

      // Initiate an AJAX request to fetch the raw email HTML content
      $.ajax({
        url: requestUrl,
        method: 'GET', // Explicitly define the HTTP method
        dataType: 'html', // Expect HTML content in response
        beforeSend: function() {
          // Optional: Add a visual indicator that an action is in progress
          console.log( "Fetching raw message content for:", msgId );
          clickedAnchorElement.addClass('loading-indicator');
        }
      })
      .done( function( responseContent ) {
        // Remove any previously added external viewer links to prevent duplicates
        $( '.' + EXISTING_LINK_CLASS ).remove();

        // Extract the actual Message-ID header from the raw email content
        const fullMessageId = retrieveMessageIdHeader( responseContent );

        if ( fullMessageId ) {
          // Sanitize the Message-ID for safe inclusion in a URL scheme
          const safeMessageId = encodeForDisplay( fullMessageId );
          const mailmateUri = `message://${safeMessageId}`;

          // Construct the new anchor element for MailMate
          const mailmateLinkHtml = `
            <span class="${EXISTING_LINK_CLASS} action-separator">
              &nbsp;&nbsp;
              <a href="${mailmateUri}"
                 title="Open this message in MailMate"
                 style="color: #007bff; text-decoration: none; font-weight: bold; padding: 2px 5px; border-radius: 3px; background-color: rgba(0, 123, 255, 0.1);"
                 target="_blank" rel="noopener noreferrer">
                MailMate
              </a>
            </span>
          `;
          // Append the new link to the designated toolbar section
          $( TOOLBAR_LEFT_SECTION_SELECTOR ).append( mailmateLinkHtml );
          console.log( "MailMate link added for Message-ID:", fullMessageId );
        } else {
          console.warn( "Could not find Message-ID in the raw email content." );
        }
      })
      .fail( function( jqXHR, textStatus, errorThrown ) {
        // Handle AJAX request errors gracefully
        console.error( `AJAX request failed: ${textStatus}, ${errorThrown}`, jqXHR );
        // Optionally, display an error message to the user
        alert( "Failed to retrieve raw message content. Please try again later." );
      })
      .always( function() {
        // Always remove the loading indicator, regardless of success or failure
        clickedAnchorElement.removeClass('loading-indicator');
      });

    } else {
      console.info( "No valid message/user IDs found in the clicked link's href:", anchorHref );
    }
  }); // End of delegated click event handler

}); // End of jQuery document ready function