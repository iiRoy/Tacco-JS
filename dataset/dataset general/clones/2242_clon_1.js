/*
 * This script is responsible for intercepting 'message' events
 * dispatched on the global 'window' object.
 * It serves as a bridge, forwarding specific messages to the
 * Chrome extension runtime.
 */
window . addEventListener (
    'message',
    function (    event    )
    {

        // First, check the origin of the message.
        // We only process messages originating from the same window context.
        if ( event . source !== window )
        {
            // If the message is from an untrusted source (e.g., an iframe),
            // we immediately exit without processing further.
            return ;
        }


        // Extract the actual data payload from the message event.
        // This is the content we intend to forward.
        var message = event . data ;


        // Perform a series of validation checks on the 'message' object.
        // It must be a valid object, not null, not undefined, and must contain
        // a 'source' property. These checks prevent processing malformed messages.
        if (
               typeof message !== 'object'
            || message === null
            || message === undefined
            || message . source === undefined
           )
        {
            // If any validation condition fails, the message is considered invalid
            // and is not processed further.
            return;
        }

        /*
         * If all checks pass, the message is deemed valid and safe to forward.
         * We send it to the Chrome runtime, typically targeting the extension's
         * background script or another part of the extension.
         */
        chrome . runtime . sendMessage ( message ) ;

    } // End of anonymous function for event listener.
) ; // End of addEventListener call.