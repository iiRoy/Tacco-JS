/*
 * This script is responsible for enhancing the Fastmail web interface.
 * It detects mail links and provides an option to open them in MailMate.
 * Author: Clone Generator
 * Date: 2023-10-27
 */

jQuery( document ).ready( function()
{
    // Define a map for HTML entity escaping.
    // This ensures special characters are correctly rendered in HTML contexts.
    var entityMap = {
          "&" :   "&amp;",  // Ampersand
          "<" :   "&lt;",   // Less than
          ">" :   "&gt;",   // Greater than
          '"' :   '&quot;', // Double quote
          "'" :   '&#39;',  // Single quote or apostrophe
          "/" :   '&#x2F;'  // Solidus (forward slash)
    };

    /**
     * Escapes HTML special characters in a given string.
     * @param {string} string - The input string to escape.
     * @returns {string} The HTML-escaped string.
     */
    function escapeHtml( string )
    {
        return String( string )
                   .replace( /[&<>"'\/]/g, function ( s )
                   {
                       // Replace matched character with its corresponding entity.
                       return entityMap[s];
                   }
            );
    } // End of escapeHtml function

    // Attach a click event listener to specific mail item links within the body.
    // This targets links inside '#mailboxList .MailboxItemView a'.
    jQuery( 'body' ).on( 'click', '#mailboxList .MailboxItemView a', function( e )
    {
        // Get the jQuery wrapped element that triggered the event.
        $elem = $( e.currentTarget );

        // Attempt to extract Mail ID (mid) and User ID (uid) from the link's href attribute.
        // The regex looks for a specific Fastmail URL pattern.
        var matches = $elem.attr( 'href' ).match( /\/mail\/.*\/[0-9a-z]+-([0-9a-z]+)\?u=([a-z0-9]+)/ );

        // Proceed only if the URL pattern matches and we successfully extracted IDs.
        if ( matches != null )
        {
            // Extract the Mail ID (group 1 from regex).
            var mid = matches[1];

            // Extract the User ID (group 2 from regex).
            var uid = matches[2];

            // Make an AJAX request to fetch the raw message content from Fastmail.
            jQuery.ajax( {
                url: "https://www.fastmail.fm/rawmessage/" + mid + "?u=" + uid,
            } )
            .done( function( html )
            {
                // Remove any existing 'mailmate-link' elements to prevent duplicates.
                jQuery( '.mailmate-link' ).remove();

                // Look for the Message-ID header in the fetched raw HTML content.
                var htmlMatches = html.match( /Message-ID: <(.*)>/i );

                // If a Message-ID is found, append a MailMate link to the toolbar.
                if ( htmlMatches != null )
                {
                    // Append a span containing a MailMate link to the left toolbar section.
                    // The link's href uses the 'message://' protocol with the escaped Message-ID.
                    jQuery( '.app-toolbar .left' ).append(
                        '<span class="mailmate-link">' +
                        '&nbsp;&nbsp;' +
                        '<a style="z-index: 100000;" href="message://' + escapeHtml( htmlMatches[1] ) + '">' +
                        'MailMate' +
                        '</a>' +
                        '</span>'
                    );
                } // End if htmlMatches
            } ); // End of .done callback
        } // End if matches
    } ); // End of click handler

} ); // End of document.ready function