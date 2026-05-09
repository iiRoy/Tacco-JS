/**
 * Copyright (C) 2013, Markus Sprunck
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are permitted provided that the following
 * conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *
 *   - The name of its contributor may be used to endorse or promote
 *     products derived from this software without specific prior
 *     written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * This file contains the implementation for the SimpleMotionDetector.
 *
 * SimpleMotionDetector:
 *
 * Captures the video signal and compares single frames to
 * detect motion. The center of this motion is used to find
 * the viewpoint of the user. With this viewpoint the camera
 * position will be rotated.
 *
 */
function SimpleMotionDetector ( object ) {

  // Define constants for analysis dimensions
  var PIXELS_HORIZONTAL = 50; // Number of pixels for horizontal analysis
  var PIXELS_VERTICAL = 50; // Number of pixels for vertical analysis

  // Define constants for the info window size
  var WIDTH = 245; // Width of the display canvas
  var HEIGHT = 200; // Height of the display canvas

  // Store the object (expected to be a THREE.camera)
  this.object = object;

  // Set amplification factors for rotation
  this.amplificationAlpha = 3.0;
  this.amplificationGamma = 3.0;

  // Set initial offsets in degrees
  this.offsetAlpha = 15.0;
  this.offsetGamma = 0.0;

  // Define the detection border for the video feed
  this.detectionBorder = 0.66; // Only the upper part of the video should be detected

  // Set the pixel intensity threshold for motion detection
  this.pixelThreshold = 137;

  // Initialize MovingAverager for X-coordinates of detected motion
  this.averageX = new MovingAverager( 500 );
  this.averageX.setValue( WIDTH / 2 );

  // Initialize MovingAverager for Y-coordinates of detected motion
  this.averageY = new MovingAverager( 500 );
  this.averageY.setValue( HEIGHT / 2 );

  // Create an off-screen canvas for video processing
  var videoCanvas = document.createElement( 'canvas' );
  videoCanvas.width = PIXELS_HORIZONTAL;
  videoCanvas.height = PIXELS_VERTICAL;

  // Create the main display canvas
  var canvas = document.createElement( 'canvas' );
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.position = 'absolute'; // Position it absolutely
  canvas.style.left = '0px'; // Align to the left
  canvas.style.top = '0px'; // Align to the top

  // Get 2D rendering contexts
  var videoContext = videoCanvas.getContext( '2d' );
  var ctx = canvas.getContext( '2d' );

  // Declare global application object and motion detector instance
  var APP = {};
  var simpleMotionDetector;

  // Declare texture and video elements
  var texture = null;
  var video;

  // Append the display canvas to the document body
  document.body.appendChild( canvas );

  // --- Prototype methods definition starts here ---

  SimpleMotionDetector.prototype.init = function ( ) {

    simpleMotionDetector = this; // Store reference to current instance

    // Normalize getUserMedia for cross-browser compatibility
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    video = document.createElement( 'video' ); // Create video element

    if ( navigator.getUserMedia ) {
      navigator.getUserMedia( {
          audio: false,
          video: true
        },
        function ( stream ) {
          video.src = window.URL.createObjectURL( stream ); // Set video source
          APP.videoWidth = PIXELS_HORIZONTAL;
          APP.videoHeight = PIXELS_VERTICAL;
          APP.frontCanvas = document.createElement( 'canvas' ); // Create front canvas
          APP.frontCanvas.width = APP.videoWidth;
          APP.frontCanvas.height = APP.videoHeight * 2;
          APP.ctx = APP.frontCanvas.getContext( '2d' ); // Get context for front canvas
          APP.comp = []; // Initialize component array
          simpleMotionDetector.run( ); // Start the motion detection process
        },
        function ( e ) {
          alert( 'getUserMedia did not succeed.\n\ncode=' + e.code ); // Handle errors
        }
      );
    } else {
      alert( 'Your browser does not seem to support UserMedia' ); // Browser not supported
    }

    // Polyfill for requestAnimationFrame
    requestAnimFrame = ( function ( ) {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
          window.setTimeout( callback, 1000 / 60 ); // Fallback to setTimeout
        };
    } )( );

  };

  SimpleMotionDetector.prototype.analyisMotionPicture = function ( ) {
    // Draw the main canvas onto the video context to get pixel data
    videoContext.drawImage( canvas, 0, 0 );
    var data = videoContext.getImageData( 0, 0, PIXELS_HORIZONTAL, PIXELS_VERTICAL ).data;

    ctx.fillStyle = '#FFFFFF'; // Set fill style to white
    ctx.fillRect( 0, 0, WIDTH, HEIGHT ); // Fill the entire canvas with white
    ctx.globalAlpha = 0.2; // Set global alpha for drawing

    var cubeWidth = WIDTH / PIXELS_HORIZONTAL - 1 | 0; // Calculate cube width
    var cubeHeight = HEIGHT / PIXELS_VERTICAL - 1 | 0; // Calculate cube height

    var yTopPosition = Number.MAX_VALUE; // Initialize top Y position

    // Loop through each pixel in the processed video frame
    for ( var y = 0; y < PIXELS_VERTICAL - 1; y++ ) {
      for ( var x = 0; x < PIXELS_HORIZONTAL; x++ ) {
        // Check if pixel intensity exceeds threshold
        if ( data[ x * 4 + y * PIXELS_HORIZONTAL * 4 ] > this.pixelThreshold ) {
          var xPos = x * WIDTH / PIXELS_HORIZONTAL; // Calculate scaled X position
          var yPos = y * HEIGHT / PIXELS_VERTICAL; // Calculate scaled Y position

          // Check if the pixel is within the detection border
          if ( y < PIXELS_VERTICAL * this.detectionBorder ) {
            // Update top position and averages if a new top-most pixel is found
            if ( yTopPosition >= Math.min( yTopPosition, yPos ) ) {
              yTopPosition = yPos;
              this.averageX.setValue( xPos ); // Update average X
              this.averageY.setValue( yPos ); // Update average Y
              ctx.fillStyle = '#000000'; // Draw in black for the primary detected point
              ctx.fillRect( xPos, yPos, cubeWidth, cubeHeight );
            }
            ctx.fillStyle = '#0000FF'; // Draw in blue for general detected pixels in the active region
            ctx.fillRect( xPos, yPos, cubeWidth, cubeHeight );
          } else {
            ctx.fillStyle = '#00FF00'; // Draw in green for detected pixels outside the active region
            ctx.fillRect( xPos, yPos, cubeWidth, cubeHeight );
          }
        }
      }
    }

    // Draw the red cross indicating the averaged motion center
    ctx.fillStyle = '#FF0000'; // Set fill style to red
    ctx.fillRect( simpleMotionDetector.averageX.getValue( ) - cubeWidth * 0.5, simpleMotionDetector.averageY.getValue( ), cubeWidth * 1.5, cubeHeight * 0.5 );
    ctx.fillRect( simpleMotionDetector.averageX.getValue( ), simpleMotionDetector.averageY.getValue( ) - cubeHeight * 0.5, cubeWidth * 0.5, cubeHeight * 1.5 );
  };

  SimpleMotionDetector.prototype.updateCameraPosition = function ( ) {
    // Calculate distance from the center for X and Y
    var distanceFromMiddleX = this.averageX.getValue( ) * PIXELS_HORIZONTAL / WIDTH - PIXELS_HORIZONTAL / 2;
    var alpha = this.amplificationAlpha * Math.asin( distanceFromMiddleX / PIXELS_HORIZONTAL ) + Math.PI / 180 * this.offsetAlpha;

    var distanceFromMiddleY = ( PIXELS_VERTICAL / 2 - this.averageY.getValue( ) / HEIGHT * PIXELS_VERTICAL );
    var gamma = this.amplificationGamma * Math.asin( distanceFromMiddleY / PIXELS_VERTICAL ) + Math.PI / 180 * this.offsetGamma;

    // Get current camera position components
    var x = camera.position.x;
    var z = camera.position.z;
    var y = camera.position.y;
    var radius = Math.sqrt( x * x + y * y + z * z ); // Calculate camera's distance from origin

    // Update camera position based on calculated alpha and gamma angles
    camera.position.x = radius * Math.sin( alpha ) * Math.cos( gamma );
    camera.position.z = radius * Math.cos( alpha ) * Math.cos( gamma );
    camera.position.y = radius * Math.sin( gamma );

    camera.lookAt( scene.position ); // Make the camera look at the scene's origin
  };

  SimpleMotionDetector.prototype.analyseVideo = function ( ) {
    requestAnimFrame( SimpleMotionDetector.prototype.analyseVideo ); // Request next animation frame

    // Draw video frame to videoCanvas and then to APP.ctx
    videoContext.drawImage( video, 0, 0, PIXELS_HORIZONTAL, PIXELS_VERTICAL );
    APP.ctx.drawImage( videoCanvas, 0, 0 );

    // Update texture and apply effects to the main canvas
    texture.loadContentsOf( APP.frontCanvas );
    canvas.draw( texture );
    canvas.mirror( );
    canvas.move( );
    canvas.update( );

    // Draw videoCanvas to the lower half of APP.ctx for comparison
    APP.ctx.drawImage( videoCanvas, 0, PIXELS_VERTICAL );

    // Perform motion analysis and update camera
    simpleMotionDetector.analyisMotionPicture( );
    simpleMotionDetector.updateCameraPosition( );
  };

  SimpleMotionDetector.prototype.run = function ( ) {
    canvas = fx.canvas( ); // Initialize FX canvas
    texture = canvas.texture( APP.frontCanvas ); // Create texture from front canvas
    video.play( ); // Start playing the video stream
    this.analyseVideo( ); // Begin video analysis loop
  };

  // Expose the main display canvas as a DOM element property
  SimpleMotionDetector.prototype.domElement = canvas;
}