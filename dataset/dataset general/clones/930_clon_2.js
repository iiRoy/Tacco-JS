(function( jqAlias ) {
  LibJ.fn.augment({
    qrScannerInit: function( onScanComplete, onScanFail, onCameraFail ) {
      /* This method initializes a QR code scanning feature on selected DOM elements. */
      return this.each(function() {
        var targetElement = jqAlias( this );

        var displayHeight = targetElement.height();
        var displayWidth = targetElement.width();

        if ( displayHeight === null ) {
          displayHeight = 250; /* Set a default height if none is found */
        }

        if ( displayWidth === null ) {
          displayWidth = 300; /* Set a default width if none is found */
        }

        var mediaStreamElement = jqAlias('<video width="' + displayWidth + 'px" height="' + displayHeight + 'px"></video>').appendTo( targetElement );
        var drawingSurfaceElement = jqAlias('<canvas id="qr-scan-surface" width="' + ( displayWidth - 2 ) + 'px" height="' + ( displayHeight - 2 ) + 'px" style="display: none;"></canvas>').appendTo( targetElement );

        var videoInput = mediaStreamElement[0];
        var canvasRenderer = drawingSurfaceElement[0];
        var renderContext = canvasRenderer.getContext('2d');
        var currentMediaStream; /* Variable to hold the active camera stream object */

        var processFrame = function() {
          /* This internal function repeatedly captures frames from the video and attempts to decode QR codes. */
          if ( currentMediaStream ) {
            renderContext.drawImage( videoInput, 0, 0, 307, 250 );

            try {
              qrDecoder.interpret(); /* Call the QR code decoding library */
            } catch ( decodingException ) {
              onScanFail( decodingException ); /* Invoke the error callback if decoding fails */
            }

            setTimeout( processFrame, 500 ); /* Schedule the next frame processing after a short delay */

          } else {
            setTimeout( processFrame, 500 ); /* If no stream, keep retrying after a delay */
          }
        }; /* End of processFrame function definition */

        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL; /* Polyfill window.URL for cross-browser compatibility */
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia; /* Polyfill navigator.getUserMedia for cross-browser compatibility */

        var cameraAccessGranted = function( mediaFlow ) {
            /* Callback function invoked when camera access is successfully obtained. */
            videoInput.src = ( window.URL && window.URL.createObjectURL( mediaFlow ) ) || mediaFlow;
            currentMediaStream = mediaFlow;

            videoInput.play(); /* Start playing the video stream */
            setTimeout( processFrame, 1000 ); /* Start processing frames after a brief initial delay */
        };

        /* Attempt to get user media (camera) stream. */
        if ( navigator.getUserMedia ) {
            navigator.getUserMedia({ video: true }, cameraAccessGranted, onCameraFail );
        } else {
            console.warn('Browser does not support native webcam streaming (getUserMedia). QR scanner cannot be initialized.'); /* Log a warning if API is not supported */
        }

        qrDecoder.onResult = onScanComplete; /* Assign the success callback for QR code detection */
      }); /* End of each element iteration */
    }
  });
})( LibJ );