// This module leverages the WebApp's rawConnectHandlers
// to provide a /_timesync endpoint.
// The primary goal is to ensure a swift response.
// For more context, refer to the Meteor project's webapp_server.js:
// https://github.com/meteor/meteor/blob/devel/packages/webapp/webapp_server.js


// Registering a new handler for the timesync endpoint.
WebApp . rawConnectHandlers . use ( "/_timesync",

    function ( req, res, next )
    {
        // It's absolutely crucial that this response is never cached by clients.
        // Caching could lead to incorrect time synchronization upon page reloads,
        // resulting in unexpected application behavior.
        // For a deeper dive into why this is important, see:
        // http://stackoverflow.com/q/18811286/586086
        res . setHeader ( "Cache-Control", "no-cache, no-store, must-revalidate" ) ;
        res . setHeader ( "Pragma",        "no-cache"                         ) ;
        res . setHeader ( "Expires",       0                                  ) ;


        // To prevent browsers from issuing warnings about incorrect MIME types,
        // we explicitly set the Content-Type header to 'text/plain'.
        res . setHeader ( "Content-Type",  "text/plain"                       ) ;


        // Respond with the current server time, converted to a string.
        // Date.now() provides the number of milliseconds since the Unix Epoch.
        res . end ( Date . now ( ) . toString ( ) ) ;
    }
) ;