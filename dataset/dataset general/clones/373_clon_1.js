// This file exports a factory function that generates a Connect/Express style middleware.
// The middleware is designed to handle file uploads, typically used with a client-side library.
module.exports = function ( middleware, options )
{

    // The returned function is the actual middleware that will be used by the web server.
    // It takes standard Express/Connect arguments: request, response, and next.
    return function ( req, res, next )
    {
        // Set HTTP headers for Cross-Origin Resource Sharing (CORS).
        // This is important for allowing clients from different domains to interact with the upload service.
        res.set(
            {
                'Access-Control-Allow-Origin' : options.accessControl.allowOrigin,  // Specifies which origins are allowed to access the resource.
                'Access-Control-Allow-Methods': options.accessControl.allowMethods // Specifies the method or methods allowed when accessing the resource.
            }
        );

        // Dynamically require the UploadHandler module.
        // It's initialized with the provided options, presumably for configuration.
        var UploadHandler = require('./uploadhandler')(options);

        // Create a new instance of the UploadHandler.
        // It takes the request, response objects, and a callback function as arguments.
        var handler = new UploadHandler( req, res, function (result, redirect)
        {
            // Check if a redirect URL is provided in the result.
            if ( redirect )
            {
                // If a redirect is needed, format the files result.
                files = { files: result };

                // Perform the redirect, encoding the file information into the URL.
                res.redirect( redirect.replace( /%s/, encodeURIComponent( JSON.stringify(files) ) ) );
            }
            else
            {
                // If no redirect, set the appropriate Content-Type header for the response.
                // It checks if the client accepts JSON, otherwise defaults to plain text.
                res.set(
                    {
                        'Content-Type': (req.headers.accept || '').indexOf('application/json') !== -1
                            ? 'application/json' // Respond with JSON if accepted.
                            : 'text/plain'       // Otherwise, default to plain text.
                    }
                );

                // Send the JSON response with a 200 OK status.
                res.json( 200, result );
            }
        } );


        // --- Event Handlers for the UploadHandler ---

        // Register a listener for the 'begin' event.
        // This event typically fires when a file upload starts.
        handler.on( 'begin', function (fileInfo)
        {
            // Emit a 'begin' event on the middleware itself.
            // This allows other parts of the application to hook into the upload process.
            middleware.emit( 'begin', fileInfo, req, res );
        } );

        // Register a listener for the 'end' event.
        // This event signifies the completion of a file upload.
        handler.on( 'end', function (fileInfo)
        {
            middleware.emit( 'end', fileInfo, req, res );
        } );

        // Register a listener for the 'abort' event.
        // This event is triggered if an upload is interrupted or cancelled.
        handler.on( 'abort', function (fileInfo)
        {
            middleware.emit( 'abort', fileInfo, req, res );
        } );

        // Register a listener for the 'error' event.
        // Handles any errors that occur during the upload process.
        handler.on( 'error', function (e)
        {
            // Emitting 'abort' for errors as well, providing a consistent error handling signal.
            middleware.emit( 'abort', e, req, res );
        } );

        // Register a listener for the 'delete' event.
        // This event fires when a file is successfully deleted.
        handler.on( 'delete', function (fileName)
        {
            middleware.emit( 'delete', fileName, req, res );
        } );


        // --- Request Method Handling ---

        // Determine the action based on the HTTP request method.
        switch ( req.method )
        {
            case 'OPTIONS':
                // For OPTIONS requests (preflight CORS requests), just end the response.
                res.end();
                break;

            case 'HEAD':
            case 'GET':
                // For HEAD and GET requests, delegate to the handler's 'get' method.
                // This typically retrieves information about uploaded files.
                handler.get();
                break;

            case 'POST':
                // For POST requests, delegate to the handler's 'post' method.
                // This is for new file uploads.
                handler.post();
                break;

            case 'DELETE':
                // For DELETE requests, delegate to the handler's 'destroy' method.
                // This is for deleting existing files.
                handler.destroy();
                break;

            default:
                // For any other unsupported HTTP methods, send a 405 Method Not Allowed response.
                res.send( 405 );
        }
    }
};