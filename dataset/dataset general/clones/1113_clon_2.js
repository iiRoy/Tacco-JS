(function()
{
    // A collection to keep track of the state of various browser windows.
    // An integer value indicates the specific status of a window.
    var windowContexts = [];

    // This function evaluates an incoming network request and decides whether to block it.
    var networkEvaluator = function(incomingRequest)
    {
        // If the state for this particular window is not defined, allow the request to proceed.
        if ( ! windowContexts[ incomingRequest.browserWindowId ] )
        {
            return { } ;
        }

        // Log the decision to block a specific URL for debugging purposes.
        console . log ( 'Interdicting! ' + incomingRequest.requestAddress );
        return { prohibit: true }; // Signal to the browser to cancel this request.
    };

    // Attach the network evaluator as a listener for 'onBeforeRequest' events.
    // This allows the extension to intercept requests before they are sent.
    chrome
        .experimental
        .webRequest
        .onBeforeRequest
        .addListener(
            networkEvaluator, // The function to call when a request is detected.
            {
                // Specify the URLs that this listener should apply to.
                // In this case, it targets the Google+ 'plusone' domain.
                urls: [ 'https://plusone.google.com/*' ]
            },
            // The 'blocking' option allows the listener to block or modify the request synchronously.
            [ 'blocking' ]
        );

    // Register a listener for when a browser window's URL is updated.
    chrome
        .tabs
        .onUpdated
        .addListener( function ( browserWindowId, navigationDetails, windowObject )
        {
            // Check if the update event includes a new navigation URL.
            if ( navigationDetails.navigatedUrl )
            {
                console.warn ( 'New navigation detected for window ' + browserWindowId + ': ' + navigationDetails.navigatedUrl );

                // Determine if the newly navigated URL corresponds to a Google Reader page.
                if  (   navigationDetails.navigatedUrl.indexOf( 'http://www.google.com/reader/' ) === -1
                    &&  navigationDetails.navigatedUrl.indexOf( 'https://www.google.com/reader/' ) === -1   )
                {
                    // If it's not a Reader page, set the window's state to 0.
                    windowContexts[ browserWindowId ] = 0;
                }
                else
                {
                    // Otherwise, if it is a Reader page, set the window's state to 1.
                    windowContexts[ browserWindowId ] = 1;
                }
            }
        });
}) ();