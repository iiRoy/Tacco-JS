/*
 * JIC JavaScript Library Version 1.1
 * Project Homepage: https://github.com/brunobar79/J-I-C/
 *
 * Copyright (c) 2012, Bruno Barbieri
 * Licensed under the MIT or GPL Version 2 licenses.
 *
 * This file was last updated on 2012-03-24 at 15:11:03 -0200
 *
 * This is a Type I clone generated for demonstration purposes.
 * All functional code remains identical to the original.
 */


/*
 * This is the main JIC object.
 * It contains methods for image compression and uploading.
 * @constructor
 */
var jic =
{
    /**
     * Compresses an Image object (either JPG or PNG) and returns a new compressed Image object.
     *
     * @param {Image} source_img_obj    The original Image object to be compressed.
     * @param {Integer} quality         The desired output quality (0-100) for the compressed image.
     * @param {String} output_format    The desired output format ('jpg' or 'png').
     * @returns {Image}                 A new Image object representing the compressed image.
     */
    compress: function ( source_img_obj, quality, output_format )
    {
        // Determine the MIME type based on the specified output format.
        // Default to JPEG if no specific PNG format is requested.
        var mime_type = "image/jpeg";
        if ( typeof output_format !== "undefined" && output_format == "png" )
        {
            mime_type = "image/png"; // Set MIME type for PNG.
        }

        // Create a new HTML5 canvas element for drawing the image.
        var cvs = document.createElement( 'canvas' );

        // Set the canvas dimensions to match the source image's natural dimensions.
        cvs.width = source_img_obj.naturalWidth;
        cvs.height = source_img_obj.naturalHeight;

        // Get the 2D rendering context of the canvas and draw the source image onto it.
        // This effectively copies the image data to the canvas.
        var ctx = cvs.getContext( "2d" ).drawImage( source_img_obj, 0, 0 );

        // Convert the canvas content to a data URL, applying the specified quality and MIME type.
        // Quality is converted from 0-100 scale to 0-1.
        var newImageData = cvs.toDataURL( mime_type, quality / 100 );

        // Create a new Image object to hold the compressed image data.
        var result_image_obj = new Image();

        // Set the source of the new image object to the generated data URL.
        result_image_obj.src = newImageData;

        // Return the newly created compressed image object.
        return result_image_obj;
    },

    /**
     * Uploads a compressed Image object to a server using an AJAX POST request.
     *
     * @param {Image} compressed_img_obj    The compressed Image object to be uploaded.
     * @param {String} upload_url           The server-side URL endpoint for the POST request.
     * @param {String} file_input_name      The name of the form field that the server will use to receive the file.
     * @param {String} filename             The desired filename for the uploaded image on the server.
     * @param {function} successCallback    A callback function to be executed upon successful upload.
     * @param {function} [errorCallback]    (OPTIONAL) A callback function to be executed if the upload fails.
     * @param {function} [duringCallback]   (OPTIONAL) A callback function for tracking upload progress.
     * @param {Object} [customHeaders]      (OPTIONAL) An object containing key-value pairs for custom HTTP headers.
     */
    upload: function ( compressed_img_obj, upload_url, file_input_name, filename, successCallback, errorCallback, duringCallback, customHeaders )
    {
        // Create a temporary canvas to extract image data.
        var cvs = document.createElement( 'canvas' );

        // Set canvas dimensions to match the compressed image.
        cvs.width = compressed_img_obj.naturalWidth;
        cvs.height = compressed_img_obj.naturalHeight;

        // Draw the compressed image onto the canvas.
        var ctx = cvs.getContext( "2d" ).drawImage( compressed_img_obj, 0, 0 );

        // Provide sendAsBinary compatibility for older browsers that might not support it natively.
        // This polyfill allows sending binary data directly.
        if ( XMLHttpRequest.prototype.sendAsBinary === undefined )
        {
            XMLHttpRequest.prototype.sendAsBinary = function ( string )
            {
                var bytes = Array.prototype.map.call( string, function ( c )
                {
                    return c.charCodeAt( 0 ) & 0xff;
                } );
                this.send( new Uint8Array( bytes ).buffer );
            };
        }

        // Determine the image type (JPEG or PNG) based on the filename extension.
        var type = "image/jpeg"; // Default to JPEG.
        if ( filename.substr( -4 ) == ".png" )
        {
            type = "image/png"; // Change to PNG if filename ends with .png.
        }

        // Convert canvas content to a base64 data URL.
        var data = cvs.toDataURL( type );

        // Remove the 'data:image/type;base64,' prefix from the data URL.
        data = data.replace( 'data:' + type + ';base64,', '' );

        // Initialize a new XMLHttpRequest object for the AJAX request.
        var xhr = new XMLHttpRequest();

        // Configure the request: POST method, target URL, asynchronous.
        xhr.open( 'POST', upload_url, true );

        // Define a boundary string for the multipart/form-data.
        var boundary = 'someboundary';

        // Set the Content-Type header for multipart form data.
        xhr.setRequestHeader( 'Content-Type', 'multipart/form-data; boundary=' + boundary );

        // Check for and apply any custom headers provided by the user.
        if ( customHeaders && typeof customHeaders === "object" )
        {
            for ( var headerKey in customHeaders )
            {
                xhr.setRequestHeader( headerKey, customHeaders[ headerKey ] );
            }
        }

        // Set up the progress event handler if a duringCallback function is supplied.
        if ( duringCallback && duringCallback instanceof Function )
        {
            xhr.onprogress = function ( evt )
            {
                // Calculate and return the upload progress percentage.
                if ( evt.lengthComputable )
                {
                    return ( evt.loaded / evt.total ) * 100;
                }
            };
        }

        // Send the binary data as multipart/form-data.
        // The data is base64 decoded using atob() before sending.
        xhr.sendAsBinary( [
            '--' + boundary,
            'Content-Disposition: form-data; name="' + file_input_name + '"; filename="' + filename + '"',
            'Content-Type: ' + type,
            '',
            atob( data ),
            '--' + boundary + '--'
        ].join( '\r\n' ) );

        // Define the callback for when the request's readyState changes.
        xhr.onreadystatechange = function ()
        {
            // If the request is complete (readyState 4).
            if ( this.readyState == 4 )
            {
                // If the HTTP status is OK (200).
                if ( this.status == 200 )
                {
                    successCallback( this.responseText ); // Call the success callback.
                }
                // If the HTTP status indicates an error (4xx or 5xx).
                else if ( this.status >= 400 )
                {
                    // If an error callback is provided, call it.
                    if ( errorCallback && errorCallback instanceof Function )
                    {
                        errorCallback( this.responseText );
                    }
                }
            }
        };


    } // End of upload method
}; // End of jic object definition