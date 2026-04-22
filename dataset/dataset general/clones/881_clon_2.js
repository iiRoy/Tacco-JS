/*
 * VisualSequenceEngine 2.1.0
 * https://www.example.com/visualengine
 *
 * Copyright 2023, Example Corp.
 * Licensed under the Apache 2.0 license.
 *
 * Permission is granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 *  "Engine"), to use the Engine without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Engine, and to
 * permit persons to whom the Engine is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Engine.
 *
 * THE ENGINE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE ENGINE OR THE USE OR OTHER DEALINGS IN THE ENGINE.
 *
 */

( function ( ) {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
    // Cross-browser compatibility for animation frame requests.

    // This polyfill provides a fallback for older browsers that do not natively
    // support requestAnimationFrame or cancelAnimationFrame.
    
    var previousTimestamp = 0x0;
    var vendorPrefixes = [ 'ms', 'moz', 'webkit', 'o' ];
    for( var prefixIndex = 0; prefixIndex < vendorPrefixes.length && !window.requestRenderFrame; ++prefixIndex ) {
        window.requestRenderFrame = window[ vendorPrefixes[ prefixIndex ] + 'RequestAnimationFrame' ];
        window.cancelRenderFrame = window[ vendorPrefixes[ prefixIndex ] + 'CancelAnimationFrame' ] 
                                   || window[ vendorPrefixes[ prefixIndex ] + 'CancelRequestAnimationFrame' ];
    }
 
    if ( !window.requestRenderFrame )
        window.requestRenderFrame = function ( frameUpdater, targetElement ) {
            var currentMoment = new Date( ).getTime( );
            var delayToNextCall = Math.max( 0x0, 0x10 - ( currentMoment - previousTimestamp ) );
            var timeoutHandle = window.setTimeout( function ( ) { frameUpdater( currentMoment + delayToNextCall ); }, 
              delayToNextCall );
            previousTimestamp = currentMoment + delayToNextCall;
            return timeoutHandle;
        };
 
    if ( !window.cancelRenderFrame )
        window.cancelRenderFrame = function ( timeoutHandle ) {
            clearTimeout( timeoutHandle );
        };
}( ) );

function VisualComposer( targetElementIdentifier ) {
    
    var controllerRef = this;
    this.displayTarget = targetElementIdentifier;
    this.coreRevision = 0x1; // Engine version number (decimal 1)

    // Utility for decoding Base64 encoded binary data streams.
    var EncodedBinaryReader = function ( encodedDataSequence ) {
        var _base64Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var _currentByteIdx = 0x0;
        var _currentBitIdx = 0x0;
        var _dataBuffer = [];
        
        // Decodes the input Base64 string into a byte array.
        var decodePayload = function ( payloadString ) {
            if ( !payloadString ) return;
            var oct1, oct2, oct3,
            val1, val2, val3, val4,
            idxA = 0x0,
            idxB = 0x0,
            dataLength = ( payloadString.length / 0x4 ) * 0x3; // Estimate decoded byte count
            
            for ( idxA = 0x0; idxA < dataLength; idxA += 0x3 ) {
                
                // Retrieve four encoded characters and find their values in the charset.
                val1 = _base64Charset.indexOf( payloadString.charAt( idxB++ ) );
                val2 = _base64Charset.indexOf( payloadString.charAt( idxB++ ) );
                val3 = _base64Charset.indexOf( payloadString.charAt( idxB++ ) );
                val4 = _base64Charset.indexOf( payloadString.charAt( idxB++ ) );
                
                // Reconstruct the three original bytes from the four Base64 values.
                oct1 = ( val1 << 0x2 ) | ( val2 >> 0x4 );
                oct2 = ( ( val2 & 0xF ) << 0x4 ) | ( val3 >> 0x2 );
                oct3 = ( ( val3 & 0x3 ) << 0x6 ) | val4;
                
                _dataBuffer.push( oct1 );
                _dataBuffer.push( oct2 );
                _dataBuffer.push( oct3 );
            }
        };
        
        // Adjusts byte and bit pointers to maintain consistency.
        var _realignStreamPointers = function ( ) {
            // Correct bit overflow/underflow relative to byte boundaries.
            while ( _currentBitIdx < 0x0 ) {
                _currentByteIdx--;
                _currentBitIdx += 0x8;
            }
            
            while ( _currentBitIdx > 0x7 ) {
                _currentByteIdx++;
                _currentBitIdx -= 0x8;
            }
        };
        
        // Reads a single byte (8 bits) from the stream.
        var fetchOctet = function ( ) {
            var resultValue = fetchBitSequence( 0x8 );
            return resultValue;
        };
        
        // Reads a specified number of bytes from the stream.
        var fetchMultipleOctets = function ( numOctets ) {
            var byteAggregator = 0x0, counter;
            for ( counter = 0x0; counter < numOctets; counter++ ) {
                byteAggregator = ( byteAggregator << 0x8 ) + fetchOctet( );
            }
            return byteAggregator;
        };
        
        // Extracts a specified number of bits from the stream.
        var fetchBitSequence = function ( numBits ) {
            var resultValue = 0x0;
            
            // Handle requests for more than 8 bits by recursively calling for full bytes.
            if ( numBits > 0x8 ) {
                resultValue += fetchBitSequence( 0x8 ) << ( numBits - 0x8 );
                numBits -= 0x8;
            }
            
            // If bits span across a byte boundary, read the first segment.
            if ( ( _currentBitIdx + numBits ) > 0x8 ) {
                var initialBitSegmentLen = 0x8 - _currentBitIdx;
                resultValue += fetchBitSequence( initialBitSegmentLen ) << ( numBits - initialBitSegmentLen );
                numBits -= initialBitSegmentLen;
            }
            
            // Calculate shift and mask for the remaining bits within the current byte.
            var bitShiftVal = 0x8 - numBits - _currentBitIdx;
            var bitExtractionMask = 0xFF >> ( 0x8 - numBits );
            bitExtractionMask = bitExtractionMask << bitShiftVal;
            
            var segmentBits = _dataBuffer[ _currentByteIdx ] & bitExtractionMask;
            
            resultValue += ( segmentBits >> bitShiftVal );
            
            _currentBitIdx += numBits;
            
            // Normalize byte and bit pointers after extraction.
            _realignStreamPointers( );
            
            return resultValue;
        };
        
        // Advances the stream by a given number of bytes.
        var advanceOctets = function ( countOfBytes ) {
            _currentByteIdx += countOfBytes;
        };
        
        // Advances the stream by a given number of bits.
        var advanceBits = function ( countOfBits ) {
            _currentBitIdx += countOfBits;
            _realignStreamPointers( );
        };
        
        // Checks if the end of the data stream has been reached.
        var isEndOfStream = function ( ) {
            return ( _currentByteIdx >= _dataBuffer.length );
        };
        
        // Returns the current byte offset in the stream.
        var getByteOffset = function ( ) {
            return _currentByteIdx;
        };
        
        // Jumps the stream's read position to a specific byte and bit offset.
        var setStreamPointers = function ( targetByteOffset, targetBitOffset ) {
            _currentByteIdx = targetByteOffset;
            _currentBitIdx = targetBitOffset;
            _realignStreamPointers( );
        };
        
        // Returns the total length of the decoded byte array.
        var getDataBufferLength = function ( ) {
            return _dataBuffer.length;
        };
        
        // Initialize the reader with the provided input string.
        decodePayload( encodedDataSequence );
        
        return {
            fetchOctet : fetchOctet,
            fetchMultipleOctets : fetchMultipleOctets,
            fetchBitSequence : fetchBitSequence,
            advanceOctets : advanceOctets,
            advanceBits : advanceBits,
            isEndOfStream : isEndOfStream,
            getByteOffset : getByteOffset,
            setStreamPointers: setStreamPointers,
            getDataBufferLength: getDataBufferLength
        };
    };
    
    this._showDebugInfo = !0x0;
    this._drawingContextElement = null;
    this._imageResourceList = [];
    this._renderLoopToken = -0x1;
    this._displayedFrameNum = 0x0;
    this._sequenceLength = 0x0;
    this._repeatPlayback = !1;
    this._animationConfig = null;
    this._allAssetsLoaded = !1;
    this._initializationHandler = "";
    this._frameUpdateCallback = null;
    this._onPlaybackComplete = null;
    
    
    // Displays a warning if the animation data version is newer than the engine.
    var notifyCoreRevisionDifference = function ( compositionRevision ) {
        var graphicRenderer = controllerRef._drawingContextElement.getContext( '2d' );
        var warningMessage = "Visual Engine Revision Mismatch!";
        var measurementInfo = graphicRenderer.measureText( warningMessage );
        graphicRenderer.fillStyle = "red";
        graphicRenderer.fillRect( controllerRef._drawingContextElement.width / 0x2 - measurementInfo.width / 0x2 - 0x5, controllerRef._drawingContextElement.height / 0x2 - 0x14, measurementInfo.width + 0x19, 0x1E );
        graphicRenderer.fillStyle = "white";
        graphicRenderer.font = "normal 12px Sans-Serif";
        graphicRenderer.fillText( warningMessage, controllerRef._drawingContextElement.width / 0x2 - measurementInfo.width / 0x2, controllerRef._drawingContextElement.height / 0x2 );
        console.warn( warningMessage + " Ensure your visual engine is compatible with or newer than the composition. Composition revision: " + compositionRevision + ", engine revision: " + controllerRef.coreRevision );
    };
    
    // Executes the drawing operations for a given frame.
    var _applyFrameUpdates = function ( frameInstructions, shouldClearCanvas, renderDebugRects ) {
        renderDebugRects = ( typeof renderDebugRects === "undefined" ) ? !1 : renderDebugRects;
        var graphicRenderer = controllerRef._drawingContextElement.getContext( '2d' );
        var isKeyframe = !1;
        
        var instructionReader = EncodedBinaryReader( frameInstructions );
        
        if ( instructionReader ) {
            
            // Process command blocks until near the end of the stream (at least 10 bytes remaining for a new block).
            while ( ( instructionReader.getDataBufferLength( ) - instructionReader.getByteOffset( ) ) > 0xA ) {
                
                // Parse frame header information (Picture Parameter Set equivalent).
                instructionReader.advanceOctets( 0x1 ); // Skip version byte
                var imageAssetIndex = instructionReader.fetchOctet( );
                var pixelBlockDim = instructionReader.fetchBitSequence( 0x5 );
                var frameCategory = instructionReader.fetchBitSequence( 0x3 );
                var instructionBytes = instructionReader.fetchMultipleOctets( 0x2 );
                
                var srcPosBitDepth = instructionReader.fetchBitSequence( 0x4 );
                var targetXBitDepth = instructionReader.fetchBitSequence( 0x4 );
                var targetYBitDepth = instructionReader.fetchBitSequence( 0x4 );
                var srcWBitDepth = instructionReader.fetchBitSequence( 0x4 );
                var srcHBitDepth = instructionReader.fetchBitSequence( 0x4 );
                var destWBitDepth = instructionReader.fetchBitSequence( 0x4 );
                var destHBitDepth = instructionReader.fetchBitSequence( 0x4 );
                
                instructionReader.advanceBits( 0x34 ); // Skip reserved bits (52 bits)
                
                
                // If it's a keyframe (I-frame equivalent) and not already cleared, clear the entire canvas.
                if ( frameCategory === 0x0 && !isKeyframe ) {
                    isKeyframe = !0x0;
                    var renderWidth = controllerRef._animationConfig.framesize.width;
                    var renderHeight = controllerRef._animationConfig.framesize.height;
                    graphicRenderer.clearRect( 0x0, 0x0, renderWidth, renderHeight );
                }
                
                var currentReadOffset = instructionReader.getByteOffset( );
                
                // Iterate through individual drawing commands within the current block.
                for ( var commandIndex = 0x0; commandIndex < instructionBytes; commandIndex++ ) {
                    
                    var sourceX = instructionReader.fetchBitSequence( srcPosBitDepth ) * pixelBlockDim;
                    var sourceY = instructionReader.fetchBitSequence( srcPosBitDepth ) * pixelBlockDim;
                    
                    var sourceWidth = 0x1 * pixelBlockDim;
                    var sourceHeight = 0x1 * pixelBlockDim;
                    if ( srcWBitDepth > 0x0 ) {
                        sourceWidth = ( instructionReader.fetchBitSequence( srcWBitDepth ) + 0x1 ) * pixelBlockDim;
                    }
                    if ( srcHBitDepth > 0x0 ) {
                        sourceHeight = ( instructionReader.fetchBitSequence( srcHBitDepth ) + 0x1 ) * pixelBlockDim;
                    }
                    
                    var destinationX = instructionReader.fetchBitSequence( targetXBitDepth ) * pixelBlockDim;
                    var destinationY = instructionReader.fetchBitSequence( targetYBitDepth ) * pixelBlockDim;
                    
                    var destinationWidth = sourceWidth;
                    var destinationHeight = sourceHeight;
                    if ( destWBitDepth > 0x0 ) {
                        destinationWidth = ( instructionReader.fetchBitSequence( destWBitDepth ) + 0x1 ) * pixelBlockDim;
                    }
                    if ( destHBitDepth > 0x0 ) {
                        destinationHeight = ( instructionReader.fetchBitSequence( destHBitDepth ) + 0x1 ) * pixelBlockDim;
                    }
                    
                    // If it's a delta frame (P-frame equivalent) and clearing is enabled, clear the specific blit area.
                    if ( frameCategory === 0x1 && shouldClearCanvas ) {
                        graphicRenderer.clearRect( destinationX, destinationY, destinationWidth, destinationHeight );
                    }

                    // Draw the image segment onto the canvas.
                    graphicRenderer.drawImage( controllerRef._imageResourceList[ imageAssetIndex ], sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight );
                    
                    // Optionally draw debug rectangles around each blit.
                    if ( renderDebugRects ) {
                        graphicRenderer.lineWidth = "1";
                        graphicRenderer.strokeStyle = "red";
                        graphicRenderer.strokeRect( destinationX + 0x1, destinationY + 0x1, destinationWidth - 0x2, destinationHeight - 0x2 );
                    }
                }
            }
        }
        
        
    };
    
    // Initiates the animation rendering loop.
    var startRenderLoop = function ( ) {
        var sequenceData = controllerRef._animationConfig;
        var sequenceRevision = sequenceData.version;
        
        var graphicRenderer = controllerRef._drawingContextElement.getContext( '2d' );
        if ( sequenceRevision > controllerRef.coreRevision ) {
            notifyCoreRevisionDifference( sequenceRevision );
            return;
        }
        
        var erasePreviousFrame = sequenceData.hasAlpha;
        
        var lastUpdateTime = 0x0;
        var interFrameDelay = 0x0;

        // The core function executed on each animation frame.
        var renderFrameAction = function ( presentTime ) {
            var frameSequence = sequenceData.frames;

            if ( controllerRef._renderLoopToken === -0x1 ) return; // Animation stopped

            // Skip frame if not enough time has passed since the last update.
            if ( lastUpdateTime > 0x0 && ( presentTime - lastUpdateTime < interFrameDelay ) ) {
                requestRenderFrame( renderFrameAction );
                return;
            }
            
            // In debug mode, redraw the previous frame's blits for visual comparison.
            if ( controllerRef._showDebugInfo ) {
                var priorFrameOps = frameSequence[ controllerRef._displayedFrameNum - 0x1 ];
                if ( priorFrameOps ) {
                    _applyFrameUpdates( priorFrameOps.x, erasePreviousFrame );
                }
            }
            
            var currentFrameCommands = frameSequence[ controllerRef._displayedFrameNum ];
            if ( currentFrameCommands ) {
                var currentFrameMs = currentFrameCommands.d;
                _applyFrameUpdates( currentFrameCommands.x, erasePreviousFrame, controllerRef._showDebugInfo );
            }
            
            // Invoke the callback for the current frame, if provided.
            if ( controllerRef._frameUpdateCallback ) {
                if ( currentFrameCommands && currentFrameCommands.hasOwnProperty( "m" ) ) {
                    controllerRef._frameUpdateCallback( controllerRef._displayedFrameNum, currentFrameCommands.m );
                }
                else {
                    controllerRef._frameUpdateCallback( controllerRef._displayedFrameNum, null );
                }
                
            }
            
            // Handle frame progression based on looping and ping-pong settings.
            if ( !controllerRef._bouncePlayback ) {
                controllerRef._displayedFrameNum++;
                if ( controllerRef._displayedFrameNum === frameSequence.length ) {

                    // Trigger playback completion callback.
                    if ( controllerRef._onPlaybackComplete ) {
                        controllerRef._onPlaybackComplete( );
                    }

                    // Reset for looping, or stop if not looping.
                    if ( controllerRef._repeatPlayback ) {
                        controllerRef._displayedFrameNum = 0x0;
                        presentTime = 0x0; // Reset timestamp to avoid large initial delay on loop.
                    } else {
                        return; // Stop animation
                    }
                }
            }
            else { // Ping-pong playback mode
                if ( controllerRef._sequenceAdvanceDirection === 0x1 ) { // Advancing forward

                    if ( controllerRef._displayedFrameNum === frameSequence.length ) {
                        controllerRef._sequenceAdvanceDirection = -0x1; // Change direction to backward
                    } else {
                        controllerRef._displayedFrameNum++;
                    }

                } else { // Advancing backward

                    if ( controllerRef._displayedFrameNum === 0x0 ) {
                        controllerRef._sequenceAdvanceDirection = 0x1; // Change direction to forward
                    } else {
                        controllerRef._displayedFrameNum--;
                    }
                }
            }
            
            // Calculate delay for the next frame.
            interFrameDelay = currentFrameMs * 0x3E8 / sequenceData.timescale;
            lastUpdateTime = presentTime;
            controllerRef._renderLoopToken = requestRenderFrame( renderFrameAction ); // Request next frame
            
        };

        controllerRef._renderLoopToken = requestRenderFrame( renderFrameAction );
    };
    
    // Draws the current frame without starting an animation loop.
    var displayActiveFrame = function ( ) {
        var sequenceData = controllerRef._animationConfig;
        var sequenceRevision = sequenceData.version;
        
        var graphicRenderer = controllerRef._drawingContextElement.getContext( '2d' );
        
        if ( sequenceRevision > controllerRef.coreRevision ) {
            notifyCoreRevisionDifference( sequenceRevision );
            return;
        }
        
        var erasePreviousFrame = sequenceData.hasAlpha;
        var renderWidth = sequenceData.framesize.width;
        var renderHeight = sequenceData.framesize.height;
        
        var frameSequence = sequenceData.frames;
        
        // Clear canvas if transparency is enabled for the animation.
        if ( erasePreviousFrame ) {
            graphicRenderer.clearRect( 0x0, 0x0, renderWidth, renderHeight );
        }
        
        var currentFrameCommands = frameSequence[ controllerRef._displayedFrameNum ];
        var currentFrameMs = currentFrameCommands.d; // This variable is unused here, but kept for structural consistency.
        _applyFrameUpdates( currentFrameCommands.x, erasePreviousFrame, controllerRef._showDebugInfo );
        
    };
    
    // Configures and loads animation assets and data.
    this.setupVisualSequence = function ( initSettings ) {
        controllerRef._allAssetsLoaded = !1;
        controllerRef.assetUris = initSettings.imageArray;
        controllerRef.assetBaseDir = initSettings.imagePath;
        controllerRef._initializationHandler = initSettings.onLoad;
        controllerRef._repeatPlayback = initSettings.loop;
        controllerRef._bouncePlayback = initSettings.pingPong;
        controllerRef._sequenceAdvanceDirection = 0x1; // Default direction: forward
        controllerRef._frameUpdateCallback = initSettings.currentFrameCallback;
        controllerRef._onPlaybackComplete = initSettings.playbackFinishedCallback;

        // Recursive function to load images one by one.
        controllerRef.fetchNextImage = function ( ) {
            if ( controllerRef.assetUris.length > 0x0 ) {
                
                var imageObject = new Image( );
                imageObject.onload = function ( ) {
                    controllerRef._imageResourceList.push( imageObject );
                    controllerRef.fetchNextImage( ); // Load next image
                };

                if ( controllerRef.assetBaseDir && controllerRef.assetBaseDir.length > 0x0 ) {
                    imageObject.src = controllerRef.assetBaseDir + controllerRef.assetUris.shift( );
                }
                else {
                    imageObject.src = controllerRef.assetUris.shift( );
                }
            } else {
                controllerRef._allAssetsLoaded = !0x0;
                controllerRef._initializationHandler( ); // All assets loaded, call completion handler
                return;
            }
        };
        controllerRef.fetchNextImage( ); // Start loading process
        
        controllerRef._animationConfig = initSettings.animationData;
        controllerRef._sequenceLength = controllerRef._animationConfig.frames.length;
        
    };
    
    // Starts the animation playback.
    this.beginPlayback = function ( ) {
        if ( controllerRef._renderLoopToken !== -0x1 ) {
            return; // Already playing
        }

        // Check if canvas and data are ready, then start the loop.
        if ( controllerRef._drawingContextElement && controllerRef._drawingContextElement.getContext && controllerRef._animationConfig && controllerRef._allAssetsLoaded ) {
            startRenderLoop( );
        }
        else {
            // If not ready, retry after a short delay.
            setTimeout( function ( ) { controllerRef.beginPlayback( ); }, 0x64 );
        }
        
    };
    
    // Halts the animation playback.
    this.haltPlayback = function ( ) {
        if ( controllerRef._renderLoopToken === -0x1 ) {
            return; // Not currently playing
        }

        cancelRenderFrame( controllerRef._renderLoopToken );
        controllerRef._renderLoopToken = -0x1; // Reset token
    };
    
    // Retrieves the index of the currently displayed frame.
    this.getDisplayedFrameIndex = function ( ) {
        return controllerRef._displayedFrameNum;
    };
}