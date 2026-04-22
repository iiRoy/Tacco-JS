/*
 * This JavaScript file contains client-side logic for a Chrome extension.
 * It initializes communication with the extension's background script
 * and handles user interactions on specific web page elements.
 *
 * The primary purpose is to allow users to copy Pivotal Tracker story IDs
 * or full story links based on modifier keys pressed during a click event.
 */

// Immediately send a request to the Chrome extension's background process.
// This signal might indicate that the content script has loaded
// and the current page is ready for extension-specific operations.
chrome.extension.sendRequest(
    {
        'action': 'pageStart'
    }
)
; // Semicolon at the end of the statement.


// Wait for the entire DOM (Document Object Model) to be fully loaded
// before attaching any event handlers or manipulating elements.
// This ensures all HTML elements are available when the script runs.
$(
    document
).ready(
    function(
    ) {

        // Attach a 'live' click event handler to all elements with the CSS class 'item'.
        // The .live() method is a jQuery feature that attaches handlers to existing
        // and future matching elements, ideal for dynamically loaded content.
        // Note: .live() is deprecated in newer jQuery versions, but kept for Type I clone accuracy.
        $('.item').live(
            'click',
            function( e )
            { // 'e' is the event object, containing details about the click.

                // Check for specific key combinations pressed along with the click.
                // Condition 1: Alt key is pressed.
                // OR
                // Condition 2: Both Shift key AND Ctrl key are pressed simultaneously.
                if ( ( e.altKey ) || ( e.shiftKey && e.ctrlKey ) )
                {
                    // If the condition is met, extract the numerical story ID from the clicked element's 'id' attribute.
                    // The regex /.*?(\d+).*/,"$1" captures the first sequence of digits found in the ID string.
                    var storyId   = $( this ).attr( 'id' ) . replace( /.*?(\d+).*/, "$1" ) ;

                    // Construct the complete URL for the Pivotal Tracker story using the extracted ID.
                    var storyLink = 'https://www.pivotaltracker.com/story/show/' + storyId ;

                    // Define the text message to be displayed to the user, indicating what was copied.
                    var text      = "Copied link: " + storyLink ;

                    /*
                     * This block handles the visual feedback to the user on the web page.
                     * It creates a temporary message, styles it, and displays it.
                     */
                    $( '<div id="copy-msg">' ) // Create a new div element with a specific ID.
                        .css( { color: 'black' } ) // Apply inline CSS to set the text color to black.
                        .html( text ) // Set the HTML content of the new div to our prepared 'text' message.
                        .prependTo( '#status' ) // Insert this new div as the first child of the element with ID 'status'.
                    ; // End of jQuery chain for message creation.

                    // Chain of animations for the status message.
                    $( '#status' )
                        .fadeIn( 10 ) // Quickly fade in the '#status' element (10 milliseconds).
                        .delay( 1000 ) // Pause for 1000 milliseconds (1 second).
                        .fadeOut( 500, // Fade out the '#status' element over 500 milliseconds.
                            function(
                            ) { // This callback function executes once fadeOut is complete.
                                $( '#copy-msg' ).remove( ) ; // Remove the temporary message div from the DOM.
                            }
                        )
                    ; // End of jQuery chain for animations.

                    // Send a request to the Chrome extension's background script
                    // to copy the constructed story link to the user's clipboard.
                    chrome.extension.sendRequest( { 'text' : storyLink } ) ;
                }
                // If the previous condition (Alt or Shift+Ctrl) was false, check if only the Shift key is pressed.
                else if ( e.shiftKey )
                {
                    // Similar to the above, extract the numerical story ID from the clicked element's 'id'.
                    var storyId = $( this ).attr( 'id' ) . replace( /.*?(\d+).*/, "$1" ) ;

                    // Define the text message indicating that only the story ID was copied.
                    var text    = "Copied: " + storyId ;

                    /*
                     * Visual feedback block, identical in functionality to the one above,
                     * but displaying the story ID instead of the full link.
                     */
                    $( '<div id="copy-msg">' )
                        .css( { color: 'black' } )
                        .html( text )
                        .prependTo( '#status' )
                    ;

                    $( '#status' )
                        .fadeIn( 10 )
                        .delay( 1000 )
                        .fadeOut(
                            500,
                            function ( ) {
                                $( '#copy-msg' ).remove( ) ;
                            }
                        )
                    ;

                    // Send a request to the background script to copy the story ID to the clipboard.
                    chrome.extension.sendRequest( { 'text' : storyId } ) ;
                }

                // Prevent the default action associated with the click event.
                // For example, if the '.item' was an anchor tag, this prevents navigation.
                return false ;
            }
        )
    }
)
; // Final semicolon for the jQuery ready function call.