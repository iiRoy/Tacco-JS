/*
 * Phosphor Framework 1.0.2 - http://www.divergentmedia.com/phosphor
 *
 * Copyright 2013, divergent media, inc.
 * Licensed under the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */

/* IIFE for requestAnimationFrame polyfill */
( function () {

  // Reference 1: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // Reference 2: http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  /*
   * requestAnimationFrame polyfill
   * by Erik Möller, with fixes from Paul Irish and Tino Zijdel.
   * Version: https://gist.github.com/raw/1579671/7f515ade253afbc860dac1f84e21998d54359d79/rAF.js
   */

  var lastTime = 0;
  var vendors  = [ 'ms', 'moz', 'webkit', 'o' ];

  for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {

    window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
    window.cancelAnimationFrame  = window[ vendors[ x ] + 'CancelAnimationFrame' ] ||
                                   window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

  }

  if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = function ( callback, element ) {

      var currTime   = new Date().getTime();
      var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
      var id         = window.setTimeout( function () { callback( currTime + timeToCall ); }, timeToCall );

      lastTime = currTime + timeToCall;

      return id;

    };

  }

  if ( !window.cancelAnimationFrame ) {

    window.cancelAnimationFrame = function ( id ) {

      clearTimeout( id );

    };

  }

}() );

function PhosphorPlayer ( bindto_id ) {

    var self = this;

    this.bindId         = bindto_id;
    this.frameworkVersion = 1; /* Current framework version */

    var Base64BitStream = function ( inputString ) {

        var _keyStr       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var _bytePosition = 0;
        var _bitPosition  = 0;
        var _byteArray    = [];


        var setInputString = function ( input ) {

            // If no input, just return
            if ( !input ) {
                return;
            }

            var byte1, byte2, byte3;
            var enc1, enc2, enc3, enc4;
            var i = 0, j = 0;

            // Calculate expected number of bytes
            var bytes = ( input.length / 4 ) * 3;

            for ( i = 0; i < bytes; i += 3 ) {

                // Retrieve the 3 octets from 4 ASCII characters
                enc1 = _keyStr.indexOf( input.charAt( j++ ) );
                enc2 = _keyStr.indexOf( input.charAt( j++ ) );
                enc3 = _keyStr.indexOf( input.charAt( j++ ) );
                enc4 = _keyStr.indexOf( input.charAt( j++ ) );

                byte1 = ( enc1 << 2 ) | ( enc2 >> 4 );
                byte2 = ( ( enc2 & 15 ) << 4 ) | ( enc3 >> 2 );
                byte3 = ( ( enc3 & 3 ) << 6 ) | enc4;

                _byteArray.push( byte1 );
                _byteArray.push( byte2 );
                _byteArray.push( byte3 );

            }

        };


        var _updatePositions = function () {

            // Adjust bit/byte positions to ensure bitPosition is within 0-7 range
            while ( _bitPosition < 0 ) {
                _bytePosition--;
                _bitPosition += 8;
            }

            while ( _bitPosition > 7 ) {
                _bytePosition++;
                _bitPosition -= 8;
            }

        };


        var readByte = function () {
            // Reads 8 bits, effectively a byte
            var result = readBits( 8 );
            return result;
        };


        var readBytes = function ( byteCount ) {

            var accumulator = 0;
            var i;

            // Accumulate multiple bytes into a single number
            for ( i = 0; i < byteCount; i++ ) {
                accumulator = ( accumulator << 8 ) + readByte();
            }

            return accumulator;

        };


        var readBits = function ( bitCount ) {

            var accumulator = 0;

            // Handle reading more than 8 bits by recursively calling for 8-bit chunks
            if ( bitCount > 8 ) {
                accumulator += readBits( 8 ) << ( bitCount - 8 );
                bitCount -= 8;
            }

            // Handle bits spanning across byte boundaries
            if ( ( _bitPosition + bitCount ) > 8 ) {
                var firstBitsLength = 8 - _bitPosition;
                accumulator += readBits( firstBitsLength ) << ( bitCount - firstBitsLength );
                bitCount -= firstBitsLength;
            }

            // Calculate bitmask and shift for current byte
            var leftShift = 8 - bitCount - _bitPosition;
            var bitMask   = 0xFF >> ( 8 - bitCount );
            bitMask       = bitMask << leftShift;

            var bits = _byteArray[ _bytePosition ] & bitMask;

            accumulator += ( bits >> leftShift );

            _bitPosition += bitCount;

            // Normalize bit/byte positions after read operation
            _updatePositions();

            return accumulator;

        };


        var skipBytes = function ( byteCount ) {
            // Advance byte position
            _bytePosition += byteCount;
        };


        var skipBits = function ( bitCount ) {
            // Advance bit position and normalize
            _bitPosition += bitCount;
            _updatePositions();
        };


        var eof = function () {
            // Check if end of byte array has been reached
            return ( _bytePosition >= _byteArray.length );
        };


        var bytePos = function () {
            // Get current byte position
            return _bytePosition;
        };


        var jumpToOffsetByteBits = function ( byteoffset, bitoffset ) {
            // Set byte and bit positions and normalize
            _bytePosition = byteoffset;
            _bitPosition  = bitoffset;
            _updatePositions();
        };


        var byteLength = function () {
            // Get total length of the byte array
            return _byteArray.length;
        };

        // Initialize the class by setting the input string
        setInputString( inputString );

        // Public interface of the Base64BitStream
        return {
            readByte            : readByte,
            readBytes           : readBytes,
            readBits            : readBits,
            skipBytes           : skipBytes,
            skipBits            : skipBits,
            eof                 : eof,
            bytePos             : bytePos,
            jumpToOffsetByteBits: jumpToOffsetByteBits,
            byteLength          : byteLength
        };

    }; /* End Base64BitStream */


    // Internal properties for the PhosphorPlayer instance
    this._debug                  = false;  // Debugging flag
    this._canvas                 = null;   // Canvas element reference
    this._imgArray               = [];     // Array to hold atlas images
    this._animationId            = -1;     // requestAnimationFrame ID
    this._currentFrameNumber     = 0;      // Current frame being displayed
    this._frameCount             = 0;      // Total number of frames
    this._loop                   = false;  // Loop animation flag
    this._jsonData               = null;   // Animation data (JSON)
    this._atlasImagetheresLoaded = false;  // Flag indicating if atlas images are loaded
    this._onLoadHandler          = "";     // Callback for when animation is loaded
    this._currentFrameCallback   = null;   // Callback for each frame update
    this._playbackFinishedCallback = null; // Callback for when playback finishes


    var alertFrameworkVersion = function ( compVersion ) {

        var ctx       = self._canvas.getContext( '2d' );
        var alertText = "Phosphor Framework Version Mismatch!";
        var metrics   = ctx.measureText( alertText );

        ctx.fillStyle = "red";
        ctx.fillRect( self._canvas.width / 2 - metrics.width / 2 - 5,
                      self._canvas.height / 2 - 20,
                      metrics.width + 25,
                      30 );

        ctx.fillStyle = "white";
        ctx.font      = "normal 12px Letter Faces";
        ctx.fillText( alertText,
                      self._canvas.width / 2 - metrics.width / 2,
                      self._canvas.height / 2 );

        console.log( alertText +
                     " Confirm that your phosphor framework is the same or newer than the composition. " +
                     " Composition version: " + compVersion +
                     ", framework version: " + self.frameworkVersion );

    };


    var _doFrameBlits = function ( blits, clearBeforeBlitting, debugBlits ) {

        // Default debugBlits to false if not provided
        debugBlits = ( typeof debugBlits === "undefined" ) ? false : debugBlits;

        var ctx      = self._canvas.getContext( '2d' );
        var isIFrame = false; // Flag to check if the current frame is an I-frame

        var bitStream = Base64BitStream( blits );


        if ( bitStream ) {

            // Process blits while there's enough data for a PPS (Picture Parameter Set)
            while ( ( bitStream.byteLength() - bitStream.bytePos() ) > 10 ) {

                // Parse PPS (Picture Parameter Set)
                bitStream.skipBytes( 1 );             // Skip version byte
                var imgindex       = bitStream.readByte();
                var blockSize      = bitStream.readBits( 5 );
                var frameType      = bitStream.readBits( 3 );
                var blitArrayByteCount = bitStream.readBytes( 2 );

                var srcXYBitDepth    = bitStream.readBits( 4 );
                var destXBitDepth    = bitStream.readBits( 4 );
                var destYBitDepth    = bitStream.readBits( 4 );
                var srcWidthBitDepth = bitStream.readBits( 4 );
                var srcHeightBitDepth = bitStream.readBits( 4 );
                var destWidthBitDepth = bitStream.readBits( 4 );
                var destHeightBitDepth = bitStream.readBits( 4 );

                bitStream.skipBits( 52 ); // Skip reserved bits


                // If it's an I-frame (frameType === 0) and not yet cleared, clear the entire canvas
                if ( frameType === 0 && !isIFrame ) {

                    isIFrame = true; // Mark as I-frame processed
                    var displayWidth  = self._jsonData.framesize.width;
                    var displayHeight = self._jsonData.framesize.height;
                    ctx.clearRect( 0, 0, displayWidth, displayHeight );

                }

                var offset = bitStream.bytePos(); // Store current byte position


                // Iterate through and draw each blit for the current frame
                for ( var i = 0; i < blitArrayByteCount; i++ ) {

                    var sx = bitStream.readBits( srcXYBitDepth ) * blockSize;
                    var sy = bitStream.readBits( srcXYBitDepth ) * blockSize;

                    var w1 = 1 * blockSize;
                    var h1 = 1 * blockSize;

                    // Read source width if bit depth is specified
                    if ( srcWidthBitDepth > 0 ) {
                        w1 = ( bitStream.readBits( srcWidthBitDepth ) + 1 ) * blockSize;
                    }
                    // Read source height if bit depth is specified
                    if ( srcHeightBitDepth > 0 ) {
                        h1 = ( bitStream.readBits( srcHeightBitDepth ) + 1 ) * blockSize;
                    }

                    var dx = bitStream.readBits( destXBitDepth ) * blockSize;
                    var dy = bitStream.readBits( destYBitDepth ) * blockSize;

                    var w2 = w1; // Default destination width
                    var h2 = h1; // Default destination height

                    // Read destination width if bit depth is specified
                    if ( destWidthBitDepth > 0 ) {
                        w2 = ( bitStream.readBits( destWidthBitDepth ) + 1 ) * blockSize;
                    }
                    // Read destination height if bit depth is specified
                    if ( destHeightBitDepth > 0 ) {
                        h2 = ( bitStream.readBits( destHeightBitDepth ) + 1 ) * blockSize;
                    }

                    // If it's a P-frame (frameType == 1) and clearing is enabled, clear the blit area
                    if ( frameType == 1 && clearBeforeBlitting ) {
                        ctx.clearRect( dx, dy, w2, h2 );
                    }

                    // Draw the image blit
                    ctx.drawImage( self._imgArray[ imgindex ], sx, sy, w1, h1, dx, dy, w2, h2 );

                    // If debugging, draw a red rectangle around the blit area
                    if ( debugBlits ) {
                        ctx.lineWidth   = "1";
                        ctx.strokeStyle = "red";
                        ctx.strokeRect( dx + 1, dy + 1, w2 - 2, h2 - 2 );
                    }

                }

            }

        }; /* End _doFrameBlits */


    var animate = function () {

        var metadata    = self._jsonData;
        var dataVersion = metadata.version;

        var ctx = self._canvas.getContext( '2d' );

        // Check for framework version mismatch
        if ( dataVersion > self.frameworkVersion ) {
            alertFrameworkVersion( dataVersion );
            return;
        }

        var clearBeforeBlitting = metadata.hasAlpha;

        var lastTime   = 0;
        var frameDelay = 0;


        // The main animation loop function
        var f = function ( now ) {

            var frames = metadata.frames;

            // Stop if animation has been cancelled
            if ( self._animationId === -1 ) {
                return;
            }

            // Throttle frames if necessary to maintain desired frame rate
            if ( lastTime > 0 && ( now - lastTime < frameDelay ) ) {
                requestAnimationFrame( f );
                return;
            }

            // In debug mode, optionally re-blit the previous frame for visual comparison
            if ( self._debug ) {
                var lastFrameBlits = frames[ self._currentFrameNumber - 1 ];
                if ( lastFrameBlits ) {
                    _doFrameBlits( lastFrameBlits.x, clearBeforeBlitting );
                }
            }

            // Get current frame's blit data
            var blits = frames[ self._currentFrameNumber ];

            if ( blits ) {

                var frameduration = blits.d;
                // Perform the blitting operations for the current frame
                _doFrameBlits( blits.x, clearBeforeBlitting, self._debug );

            }

            // Call current frame callback if registered
            if ( self._currentFrameCallback ) {

                if ( blits && blits.hasOwnProperty( "m" ) ) {
                    self._currentFrameCallback( self._currentFrameNumber, blits.m );
                }
                else {
                    self._currentFrameCallback( self._currentFrameNumber, null );
                }

            }

            // Handle frame progression for non-ping-pong animations
            if ( !self._pingPong ) {

                self._currentFrameNumber++;

                // If end of animation reached
                if ( self._currentFrameNumber == frames.length ) {

                    // Call playback finished callback
                    if ( self._playbackFinishedCallback ) {
                        self._playbackFinishedCallback();
                    }

                    // If looping, reset frame number and `now` time
                    if ( self._loop ) {
                        self._currentFrameNumber = 0;
                        now = 0;
                    }
                    else {
                        return; // Stop animation if not looping
                    }

                }

            }
            // Handle frame progression for ping-pong animations
            else {

                if ( self._playbackDirection == 1 ) { // Moving forward

                    if ( self._currentFrameNumber == frames.length ) {
                        self._playbackDirection = -1; // Change direction
                    }
                    else {
                        self._currentFrameNumber++;
                    }

                }
                else { // Moving backward

                    if ( self._currentFrameNumber == 0 ) {
                        self._playbackDirection = 1; // Change direction
                    }
                    else {
                        self._currentFrameNumber--;
                    }

                }

            }

            // Calculate delay for the next frame
            frameDelay = frameduration * 1000 / metadata.timescale;
            lastTime   = now;

            // Request next animation frame
            self._animationId = requestAnimationFrame( f );

        };

        // Start the animation loop
        self._animationId = requestAnimationFrame( f );

    }; /* End animate */


    var drawCurrentFrame = function () {

        var metadata    = self._jsonData;
        var dataVersion = metadata.version;

        var ctx = self._canvas.getContext( '2d' );

        // Check for framework version mismatch
        if ( dataVersion > self.frameworkVersion ) {
            alertFrameworkVersion( dataVersion );
            return;
        }

        var clearBeforeBlitting = metadata.hasAlpha;
        var displayWidth        = metadata.framesize.width;
        var displayHeight       = metadata.framesize.height;

        var frames = metadata.frames;

        // Clear canvas if alpha is present
        if ( clearBeforeBlitting ) {
            ctx.clearRect( 0, 0, displayWidth, displayHeight );
        }

        // Get current frame's blit data and duration
        var blits         = frames[ self._currentFrameNumber ];
        var frameduration = blits.d;

        // Draw the blits for the current frame
        _doFrameBlits( blits.x, clearBeforeBlitting, self._debug );

    }; /* End drawCurrentFrame */


    this.load_animation = function ( parameters ) {

        self._atlasImagesLoaded = false; // Reset image loaded flag
        self.img_urls           = parameters.imageArray;
        self.img_path           = parameters.imagePath;
        self._onLoadHandler      = parameters.onLoad;
        self._loop               = parameters.loop;
        self._pingPong           = parameters.pingPong;
        self._playbackDirection  = 1; // Initial playback direction (forward)
        self._currentFrameCallback = parameters.currentFrameCallback;
        self._playbackFinishedCallback = parameters.playbackFinishedCallback;


        // Helper function to load images one by one
        self.loadOneImage = function () {

            if ( self.img_urls.length > 0 ) {

                var img = new Image();

                img.onload = function () {
                    self._imgArray.push( img );       // Add loaded image to array
                    self.loadOneImage();              // Load next image recursively
                };

                // Set image source, considering an optional image path
                if ( self.img_path && self.img_path.length > 0 ) {
                    img.src = self.img_path + self.img_urls.shift();
                }
                else {
                    img.src = self.img_urls.shift();
                }

            }
            else {

                self._atlasImagesLoaded = true; // All images loaded
                self._onLoadHandler();          // Call the user-defined onload handler
                return;

            }

        };

        self.loadOneImage(); // Start loading images

        // Set animation data and frame count
        self._jsonData = parameters.animationData;
        self._frameCount = self._jsonData.frames.length;

    }; /* End load_animation */


    this.play = function () {

        // If animation is already running, do nothing
        if ( self._animationId !== -1 ) {
            return;
        }

        // Check if canvas and data are ready, then start animation
        if ( self._canvas && self._canvas.getContext && self._jsonData && self._atlasImagetheresLoaded ) {
            animate();
        }
        else {
            // If not ready, wait a bit and try again
            setTimeout( function () { self.play(); }, 100 );
        }

    }; /* End play */


    this.stop = function () {

        // If animation is not running, do nothing
        if ( self._animationId === -1 ) {
            return;
        }

        // Cancel the animation frame request and reset ID
        cancelAnimationFrame( self._animationId );
        self._animationId = -1;

    }; /* End stop */


    this.currentFrameNumber = function () {
        // Return the current frame number
        return self._currentFrameNumber;
    };

} /* End PhosphorPlayer function */