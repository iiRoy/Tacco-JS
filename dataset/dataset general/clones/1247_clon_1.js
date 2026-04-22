/*
 * This script is part of a browser extension designed to intercept web requests.
 * It specifically monitors the 'onCompleted' event of the webRequest API.
 */
chrome.webRequest.onCompleted.addListener(

    // The main callback function that executes when a request completes.
    function ( details ) {

        // Iterate through all the response headers received for the completed request.
        for ( var   i   =   0  ;  i   <   details.responseHeaders.length  ;  i++   ) {

            // Extract the name of the current header.
            var   headerName   =   details.responseHeaders[ i ].name;

            // Check if the header name indicates a Nette or Tracy error log.
            // These headers are typically used in PHP applications for debugging.
            if (  headerName   ===   'X-Nette-Error-Log'   ||   headerName   ===   'X-Tracy-Error-Log'  ) {

                // If an error log header is found, create a new tab.
                // The URL for the new tab will be a local file path provided in the header's value.
                chrome.tabs.create( {

                    url :   'file://'   +   details.responseHeaders[ i ].value

                } );

                // Once an error log header is found and processed,
                // there's no need to check further headers for this request.
                break;
            }

        }

    },

    // Filter configuration for the addListener method.
    // This specifies which URLs the listener should apply to.
    {  urls :  [  '<all_urls>'  ]  }, // '<all_urls>' means it applies to all URLs.

    // Specifies which types of extra information should be passed to the listener function.
    // 'responseHeaders' is crucial here, as we need to inspect them.
    [  'responseHeaders'  ]

); // End of the addListener call.