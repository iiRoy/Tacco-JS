(function(jq) {
  // This self-executing anonymous function encapsulates the QR scanner plugin logic.
  // It receives the jQuery object, aliased as 'jq', to avoid conflicts and improve readability.

  /**
   * Extends jQuery's prototype to add a new method for integrating a camera-based QR code scanner.
   * This plugin initializes a video stream, captures frames, and attempts to decode QR codes from them.
   *
   * @param {function(string)} decodeSuccessHandler - Callback invoked upon successful QR code decoding.
   * @param {function(Error)} decodeErrorHandler - Callback invoked if QR code decoding fails for a frame.
   * @param {function(Error)} mediaStreamErrorHandler - Callback invoked if there's an error accessing the camera.
   * @returns {jQuery} The jQuery object for method chaining.
   */
  jq.fn.enhanceWithQrScanner = function(decodeSuccessHandler, decodeErrorHandler, mediaStreamErrorHandler) {
    // Crucial validation: Ensure the 'qrcode.js' library is loaded globally.
    // Without it, the decoding functionality cannot proceed.
    if (typeof window.qrcode === 'undefined' || typeof window.qrcode.decode !== 'function') {
      const missingLibError = new Error("QR code decoding library (window.qrcode) is not found or malformed. Please ensure 'qrcode.js' is loaded correctly.");
      console.error(missingLibError.message);
      if (typeof mediaStreamErrorHandler === 'function') {
        mediaStreamErrorHandler(missingLibError);
      }
      return this; // Return original jQuery object to maintain chainability.
    }

    // Process each selected DOM element to attach a QR scanner instance.
    return this.each(function() {
      const hostElementWrapper = jq(this); // jQuery wrapper for the current host DOM element.

      // Configuration constants for scanner behavior and dimensions.
      const DEFAULT_SCANNER_HEIGHT = 280; // Default height for video and canvas.
      const DEFAULT_SCANNER_WIDTH = 340;  // Default width for video and canvas.
      const FRAME_CAPTURE_DELAY_MS = 600; // Interval between successive frame captures and decoding attempts.
      const STREAM_INIT_GRACE_PERIOD_MS = 1200; // Delay before starting the first scan after stream acquisition.
      const CANVAS_DIMENSION_ADJUSTMENT = 3; // Small pixel offset for canvas dimensions to account for potential borders/margins.

      // Determine the actual dimensions for the video and canvas elements.
      // Prioritize explicit dimensions of the host element, otherwise use defaults.
      let effectiveHeight = hostElementWrapper.height();
      if (!effectiveHeight || effectiveHeight < 50) { // Ensure a minimum sensible height.
        effectiveHeight = DEFAULT_SCANNER_HEIGHT;
      }

      let effectiveWidth = hostElementWrapper.width();
      if (!effectiveWidth || effectiveWidth < 100) { // Ensure a minimum sensible width.
        effectiveWidth = DEFAULT_SCANNER_WIDTH;
      }

      // Create the <video> element programmatically for camera stream display.
      const cameraFeedVideo = document.createElement('video');
      cameraFeedVideo.setAttribute('width', `${effectiveWidth}px`);
      cameraFeedVideo.setAttribute('height', `${effectiveHeight}px`);
      cameraFeedVideo.setAttribute('autoplay', 'true'); // Start playback as soon as stream is available.
      cameraFeedVideo.setAttribute('playsinline', 'true'); // Important for iOS to play video inline.
      cameraFeedVideo.setAttribute('muted', 'true'); // Mute audio to prevent feedback or unwanted sound.
      hostElementWrapper.append(cameraFeedVideo); // Attach the video element to the host.

      // Create the <canvas> element programmatically for frame processing.
      // This canvas remains hidden from the user.
      const decodingCanvas = document.createElement('canvas');
      decodingCanvas.id = 'qr-processing-surface'; // Assign a unique ID.
      decodingCanvas.style.display = 'none'; // Keep the canvas invisible.
      decodingCanvas.setAttribute('width', `${effectiveWidth - CANVAS_DIMENSION_ADJUSTMENT}px`);
      decodingCanvas.setAttribute('height', `${effectiveHeight - CANVAS_DIMENSION_ADJUSTMENT}px`);
      hostElementWrapper.append(decodingCanvas); // Attach the canvas to the host.

      // Obtain the 2D rendering context for the canvas, essential for drawing video frames.
      const canvas2dContext = decodingCanvas.getContext('2d');
      let currentCameraStream = null; // Stores the MediaStream object from the camera.
      let frameProcessingTimer = null; // Holds the ID of the timeout for the recurring frame processing.

      /**
       * Cleans up and stops the active camera stream, releasing hardware resources.
       * This is a critical step for proper resource management.
       */
      const releaseCameraResources = () => {
        if (currentCameraStream) {
          // Iterate through all tracks (video, audio) and stop them.
          currentCameraStream.getTracks().forEach(track => track.stop());
          currentCameraStream = null; // Nullify the stream reference.
          if (frameProcessingTimer) {
            clearTimeout(frameProcessingTimer); // Stop the recurring frame processing.
            frameProcessingTimer = null;
          }
          console.info('QR Scanner: Camera stream successfully terminated and resources released.');
        }
      };

      /**
       * Captures a single frame from the video feed, draws it onto the hidden canvas,
       * and then attempts to decode a QR code from that frame.
       * This function calls itself recursively via setTimeout to create a continuous scanning loop.
       */
      const captureAndDecodeFrame = () => {
        // Only proceed if a stream is active and the video element has sufficient data to draw.
        if (currentCameraStream && cameraFeedVideo.readyState >= cameraFeedVideo.HAVE_ENOUGH_DATA) {
          // Draw the current video frame onto the canvas, scaling to canvas dimensions.
          canvas2dContext.drawImage(
            cameraFeedVideo,
            0, 0,
            decodingCanvas.width,
            decodingCanvas.height
          );

          try {
            // Invoke the global QR code decoding function.
            // The result will be passed to window.qrcode.callback.
            window.qrcode.decode();
          } catch (decodingFailure) {
            // If decoding fails (e.g., no QR code found, or corrupted data),
            // invoke the provided error handler.
            if (typeof decodeErrorHandler === 'function') {
              decodeErrorHandler(decodingFailure);
            } else {
              console.debug("QR Scanner: Frame decoding attempt failed:", decodingFailure.message);
            }
          }
        } else {
          // Log a debug message if the stream isn't ready yet, indicating a waiting state.
          console.debug("QR Scanner: Waiting for video stream to be fully ready for frame capture...");
        }

        // Schedule the next frame capture and decoding attempt.
        frameProcessingTimer = setTimeout(captureAndDecodeFrame, FRAME_CAPTURE_DELAY_MS);
      };

      // Cross-browser compatibility shim for window.URL (for createObjectURL).
      const urlApiPolyfill = window.URL || window.webkitURL || window.mozURL || window.msURL;

      // Determine the best available API for accessing user media (camera).
      // Prioritize modern navigator.mediaDevices.getUserMedia (Promise-based)
      // then fallback to older navigator.getUserMedia (callback-based).
      const mediaAccessGateway = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ?
                                 navigator.mediaDevices :
                                 (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

      /**
       * Callback function executed when the camera stream is successfully obtained.
       * @param {MediaStream} acquiredStream - The MediaStream object from the camera.
       */
      const onStreamSuccessfullyAcquired = (acquiredStream) => {
        currentCameraStream = acquiredStream; // Store the active stream.

        // Assign the acquired stream to the video element.
        if ('srcObject' in cameraFeedVideo) {
          // Modern browsers use srcObject.
          cameraFeedVideo.srcObject = acquiredStream;
        } else {
          // Fallback for older browsers using createObjectURL.
          cameraFeedVideo.src = (urlApiPolyfill && urlApiPolyfill.createObjectURL(acquiredStream)) || acquiredStream;
        }

        cameraFeedVideo.play(); // Explicitly start video playback.

        // After a short grace period, initiate the continuous frame processing loop.
        frameProcessingTimer = setTimeout(captureAndDecodeFrame, STREAM_INIT_GRACE_PERIOD_MS);
      };

      // Attempt to request access to the user's camera.
      if (mediaAccessGateway) {
        // Define video constraints: prefer the 'environment' (rear) camera on mobile devices.
        const mediaConstraints = { video: { facingMode: 'environment' } };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Use the modern, Promise-based getUserMedia API.
          navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(onStreamSuccessfullyAcquired)
            .catch(streamError => {
              console.error("QR Scanner: Error accessing camera via modern API:", streamError);
              if (typeof mediaStreamErrorHandler === 'function') {
                mediaStreamErrorHandler(streamError);
              } else {
                alert('QR Scanner: Unable to access your camera. Please check browser permissions and ensure no other application is using it.');
              }
            });
        } else if (mediaAccessGateway.getUserMedia) {
          // Fallback to the deprecated, callback-based getUserMedia API for older browsers.
          mediaAccessGateway.getUserMedia(
            mediaConstraints,
            onStreamSuccessfullyAcquired,
            streamError => {
              console.error("QR Scanner: Error accessing camera via legacy API:", streamError);
              if (typeof mediaStreamErrorHandler === 'function') {
                mediaStreamErrorHandler(streamError);
              } else {
                alert('QR Scanner: Unable to access your camera with legacy API. Please check permissions.');
              }
            }
          );
        }
      } else {
        // If no getUserMedia API is supported at all.
        const noSupportMessage = 'QR Scanner: Camera streaming functionality (getUserMedia) is not supported by this browser.';
        console.warn(noSupportMessage);
        if (typeof mediaStreamErrorHandler === 'function') {
          mediaStreamErrorHandler(new Error(noSupportMessage));
        } else {
          alert(noSupportMessage + ' Please use a modern web browser to enable camera scanning.');
        }
      }

      // Assign the user-provided success handler to the global qrcode callback.
      // This is how the qrcode.js library reports a successful decode.
      window.qrcode.callback = decodeSuccessHandler;

      // Attach a custom event listener to the host element to allow external stopping of the scanner.
      // This provides a clean way to manage resources when the scanner is no longer needed.
      hostElementWrapper.on('qrscanner:stop', releaseCameraResources);

    }); // End of .each() loop.
  }; // End of enhanceWithQrScanner plugin definition.

})(jQuery); // Pass jQuery object to the IIFE.