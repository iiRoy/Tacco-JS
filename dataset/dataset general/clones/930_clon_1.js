/* This is a Type I clone generated for demonstration purposes.
 * It maintains exact logical equivalence but differs in formatting and comments.
 * The original code is for a jQuery plugin to integrate HTML5 QR code scanning.
 */
( function ( $ )
{
  jQuery.fn.extend(
    {
      // The main plugin function definition for QR code scanning
      html5_qrcode: function ( qrcodeSuccess, qrcodeError, videoError )
      {
        // Iterate over each element in the jQuery selection that the plugin is called on
        return this.each( function ()
        {
          // Store a reference to the current DOM element wrapped in jQuery
          var currentElem = $( this );


          // Retrieve the height and width of the container element.
          // These dimensions will be used for the video and canvas elements.
          var height = currentElem.height();
          var width  = currentElem.width();


          // If height is not explicitly set, use a default value of 250 pixels.
          if ( height == null )
          {
            height = 250;
          }


          // If width is not explicitly set, use a default value of 300 pixels.
          if ( width == null )
          {
            width = 300;
          }


          // Create the HTML5 <video> element and append it to the current container.
          // Its dimensions are based on the calculated width and height.
          var vidElem = $( '<video width="' + width + 'px" height="' + height + 'px"></video>' ) . appendTo( currentElem );
          // Create the HTML5 <canvas> element for drawing video frames and QR code decoding.
          // It's initially hidden and slightly smaller than the video.
          var canvasElem = $( '<canvas id="qr-canvas" width="' + ( width - 2 ) + 'px" height="' + ( height - 2 ) + 'px" style="display:none;"></canvas>' ) . appendTo( currentElem );


          // Get the raw DOM video element, canvas element, and 2D rendering context.
          var video          = vidElem[ 0 ];
          var canvas         = canvasElem[ 0 ];
          var context        = canvas.getContext( '2d' );
          var localMediaStream; // This variable will hold the camera's media stream.


          // Define the 'scan' function responsible for periodically capturing video frames
          // and attempting to decode QR codes from them.
          var scan = function ()
          {
            // Proceed only if a media stream from the camera is active.
            if ( localMediaStream )
            {
              // Draw the current frame from the video element onto the canvas.
              // Note: The hardcoded dimensions (307, 250) might be specific to the qrcode.decode library.
              context.drawImage( video, 0, 0, 307, 250 );

              try
              {
                // Attempt to decode a QR code from the canvas content.
                qrcode.decode();
              }
              catch ( e )
              {
                // If an error occurs during decoding, invoke the provided error callback.
                qrcodeError( e );
              }

              // Schedule the next scan attempt after a 500ms delay.
              setTimeout( scan, 500 );

            }
            else
            {
              // If no media stream is available yet, wait and try again.
              setTimeout( scan, 500 );
            }
          }; // End of the 'scan' function.


          // Normalize window.URL and navigator.getUserMedia for broader browser compatibility.
          // These are essential for accessing the user's camera.
          window.URL             = window.URL || window.webkitURL || window.mozURL || window.msURL;
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;


          // Define the success callback function for when the camera stream is successfully acquired.
          var successCallback = function ( stream )
          {
            // Set the video element's source to the acquired media stream.
            // This handles different browser implementations of stream objects.
            video.src        = ( window.URL && window.URL.createObjectURL( stream ) ) || stream;
            localMediaStream = stream; // Store the stream reference for the 'scan' function.

            video.play();             // Start playing the video from the camera.
            setTimeout( scan, 1000 ); // Begin the QR code scanning process after a 1-second delay.
          };


          // Check if the browser supports the getUserMedia API.
          if ( navigator.getUserMedia )
          {
            // Request access to the user's video camera.
            // On success, 'successCallback' is called; on error, 'videoError' is called.
            navigator.getUserMedia( { video: true }, successCallback, videoError );
          }
          else
          {
            // Log a message to the console if getUserMedia is not supported.
            console.log( 'Native web camera streaming (getUserMedia) not supported in this browser.' );
            // In a production environment, a user-friendly message would be displayed here.
          }


          // Assign the provided success callback function to the qrcode library.
          // This function will be invoked when a QR code is successfully decoded.
          qrcode.callback = qrcodeSuccess;

        } ); // End of the 'each' loop callback for the plugin.
      }
    }
  );
} )( jQuery ); // End of the Immediately Invoked Function Expression (IIFE) that wraps the plugin.