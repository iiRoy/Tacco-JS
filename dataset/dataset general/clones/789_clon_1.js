/*
 * This script initializes functionality for a Chrome extension, likely related to video playback.
 * It listens for page load and DOM activation events to enable its features.
 */
window . addEventListener ( "load" , tryToEnableChromePlay , false ) ; // Attach listener for page load
window . addEventListener ( "DOMActivate" , tryToEnableChromePlay , false ) ; /* And for DOM activation */


/*
 * This function attempts to find an HTML5 video URL on the current page.
 * It checks for <video> tags directly, and then looks inside <noscript> tags
 * for video content that might be rendered dynamically.
 */
function checkForHtml5VideoUrl ( ) {

    // First, check for <video> tags directly in the document body.
    if (document.getElementsByTagName('video').length > 0 ) {

        var src = document.getElementsByTagName('video')[0].src; // Get the source of the first video element found.

        // If the direct src is empty, try to find a <source> tag within the video.
        if ( ! src ) {
            src = document . getElementsByTagName ( 'source' ) ? document.getElementsByTagName('source')[0].src : null ;
        }

        return src ; // Return the found source URL.
    }

    // If no direct <video> tags are found, check within <noscript> tags.
    else {

        var noscripts = document.getElementsByTagName('noscript') ; // Get all <noscript> elements.

        // Iterate through each <noscript> element.
        for ( var i = 0 ; i < noscripts.length ; i ++ ) {

            var el = document.createElement("div") ; // Create a temporary div to parse the <noscript> content.
            el . innerHTML = noscripts[i].innerHTML ; // Populate the div with the <noscript>'s inner HTML.

            // This line seems to be trying to get the text content of the first child node,
            // which might be an attempt to parse JSON or a single string.
            // However, it immediately overwrites it if video elements are found later.
            el . innerHTML = el.childNodes[0].nodeValue ;


            // Now, check if the parsed <noscript> content contains any <video> tags.
            if ( el.getElementsByTagName('video').length > 0 ) {

                var src = el.getElementsByTagName('video')[0].src ; // Get the source from the video found inside <noscript>.

                // If the source is still empty, look for a <source> tag within that video.
                if ( ! src ) {
                    src = el.getElementsByTagName('source').length > 0 ? el.getElementsByTagName('source')[0].src : null ;
                }

                return src ; // Return the found source URL.
            }
        }
    }
    // If no video URL is found after all checks, the function implicitly returns undefined.
}


/*
 * Sets up a message listener for the Chrome runtime.
 * This allows other parts of the extension (e.g., background script)
 * to request information from the content script.
 */
chrome . runtime . onMessage . addListener (
  function ( request , sender , sendResponse ) {

    // Check if the received message is a request for an HTML5 video URL.
    if ( request.action == "Html5VideoUrl" ) {

        console.log ( 'Request message getHtml5VideoUrl received' ) ; // Log the reception of the message.

        // Send back a response containing the HTML5 video URL, if found.
        sendResponse ( { Html5VideoUrl : checkForHtml5VideoUrl ( ) } ) ;

        return true ; // Indicates that sendResponse will be called asynchronously.
    }
  }
) ;


/*
 * This function attempts to enable ChromePlay functionality on the page.
 * It uses a timer to repeatedly check for the readiness of the JavaScript environment.
 * It handles YouTube, generic HTML5 videos, and Vimeo-specific adjustments.
 */
function tryToEnableChromePlay ( evt ) {

    // Set up an interval timer to periodically check if the page's JS is ready.
    var jsInitChecktimer = setInterval ( checkForJS_Finish , 111 ) ; // Check every 111 milliseconds.


    /*
     * Inner function to check for the completion of JavaScript initialization.
     * It clears the timer once conditions are met and then enables ChromePlay.
     */
    function checkForJS_Finish ( ) {

        // The condition for "JS_Finish" is either not on vimeo.com OR a specific 'target' class is present.
        if ( ! /vimeo.com/ . test ( document.URL ) || document.getElementsByClassName ( 'target' ) . length > 0 ) {

            clearInterval ( jsInitChecktimer ) ; // Stop the timer as conditions are met.

            enableChromePlay ( ) ; // Proceed to enable the ChromePlay features.
        }

        /*
         * Inner function to actually enable the ChromePlay features based on the current URL
         * or the presence of HTML5 video.
         */
        function enableChromePlay ( ) {

            // Check if the current URL matches a YouTube video page.
            if ( /^https?:\/\/(?:www\.)?youtube.com\/watch\?(?=[^?]*v=\w+)(?:[^\s?]+)?$/ . test ( document.URL ) ) {

                // Send a request to the extension to show its icon in the omnibox for YouTube.
                chrome . extension . sendRequest ( { } , function ( response ) { } ) ;

            }

            // If not YouTube, check if an HTML5 video URL can be found on the page.
            else if ( checkForHtml5VideoUrl ( ) ) { // We're having HTML5 video here, so enable icon.

                // Send a request to the extension to show its icon in the omnibox for generic HTML5 video.
                chrome . extension . sendRequest ( { } , function ( response ) { } ) ;

           	}

            // If not YouTube and no generic HTML5 video, check if it's a Vimeo page.
            else if ( /vimeo.com/ . test ( document.URL ) ) {

                // Some magic to enable right-clicking on Vimeo videos, by manipulating z-index.

                // Get elements with class 'target' and push them to the background.
                var elements = document . getElementsByClassName ( 'target' ) ;
                for ( var i = 0 ; i < elements.length ; i ++ ) {
                    elements[i] . style . zIndex = "-1" ; // Set z-index to -1 to hide them or put them behind.
                }

                // Get elements with class 'video' and bring them to the foreground.
                elements = document . getElementsByClassName ( 'video' ) ;
                for ( var i = 0 ; i < elements.length ; i ++ ) {
                    elements[i] . style . zIndex = "1000" ; // Set a high z-index.
                    elements[i] . className = 'video_unlocked_by_chromeplay' ; // Change class to indicate unlock.
                }

                // Get elements with class 'video cover' and also change their class.
                elements = document . getElementsByClassName ( 'video cover' ) ;
                for ( var i = 0 ; i < elements.length ; i ++ ) {
                    elements[i] . className = 'video_unlocked_by_chromeplay cover' ; // Update class for covers.
                }
            }

            // If none of the above conditions are met.
            else {
                /* No match was found for known video platforms or HTML5 videos. */
            }
        }
    }
}