// This utility provides a mechanism for displaying dynamic visual sequences
// loaded from a specialized binary-encoded data format.
// It leverages browser-native animation capabilities for smooth playback.
//
// Project: Dynamic Visualizer Engine
// Version: 1.1.0-alpha
// License: MIT (retained from original source, with minor rephrasing)
//
// Copyright (c) 2023, [Your Company Name or Author]
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function() {
    // Cross-browser requestAnimationFrame polyfill and fallback.
    // Based on common patterns from Paul Irish, Erik Möller, and Tino Zijdel.
    // Enhanced for robustness and modern development practices.

    if (typeof window === 'undefined') {
        // Skip polyfill if not in a browser environment.
        return;
    }

    let prevTimeMs = 0;
    const browserPrefixes = ['ms', 'moz', 'webkit', 'o'];

    // Attempt to find native requestAnimationFrame/cancelAnimationFrame.
    for (let idx = 0; idx < browserPrefixes.length && !window.requestAnimationFrame; ++idx) {
        const prefix = browserPrefixes[idx];
        window.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
    }

    // Polyfill for requestAnimationFrame if not found.
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callbackFunction, targetElement) {
            const currentTimeStamp = new Date().getTime();
            // Calculate delay to aim for ~60 FPS (1000ms / 60 frames ≈ 16.6ms per frame).
            const delayMs = Math.max(0, 16 - (currentTimeStamp - prevTimeMs));
            const timerId = window.setTimeout(() => {
                callbackFunction(currentTimeStamp + delayMs);
            }, delayMs);
            prevTimeMs = currentTimeStamp + delayMs;
            return timerId;
        };
    }

    // Polyfill for cancelAnimationFrame if not found.
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(identifier) {
            clearTimeout(identifier);
        };
    }
}());

function DynamicMediaPresenter(targetElementId) {

    // Reference to the current instance for internal closures.
    const instanceRef = this;

    // Validate the target element ID.
    if (!targetElementId || typeof targetElementId !== 'string' || targetElementId.trim() === '') {
        console.error("DynamicMediaPresenter: A valid DOM element ID (non-empty string) must be provided.");
        throw new Error("Invalid targetElementId for DynamicMediaPresenter.");
    }

    this.domElementId = targetElementId;
    this.engineRevision = 1; // Internal version of this playback engine.

    // Private utility for reading bit-packed data from a Base64-encoded string.
    var BinarySegmentReader = function(encodedInputPayload) {
        const _encodingAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let _octetCursor = 0; // Current byte position in the _octetsBuffer.
        let _bitOffsetInOctet = 0; // Current bit position within the current byte (0-7).
        let _octetsBuffer = []; // Decoded binary data as an array of bytes.

        // Decodes a Base64 string into a byte array.
        const ingestEncodedPayload = function(encodedInput) {
            if (!encodedInput || typeof encodedInput !== 'string') {
                console.warn("BinarySegmentReader: No valid input string provided for decoding.");
                _octetsBuffer = []; // Ensure buffer is cleared on invalid input.
                _octetCursor = 0;
                _bitOffsetInOctet = 0;
                return;
            }

            _octetsBuffer = []; // Clear existing buffer.
            _octetCursor = 0;
            _bitOffsetInOctet = 0;

            let charVal1, charVal2, charVal3, charVal4;
            let octetA, octetB, octetC;
            let currentInputCharIndex = 0;

            const inputLength = encodedInput.length;
            if (inputLength % 4 !== 0) {
                console.error("BinarySegmentReader: Invalid Base64 input length. Must be a multiple of 4.");
                return;
            }

            // Iterate through the input string, processing 4 characters at a time.
            while (currentInputCharIndex < inputLength) {
                charVal1 = _encodingAlphabet.indexOf(encodedInput.charAt(currentInputCharIndex++));
                charVal2 = _encodingAlphabet.indexOf(encodedInput.charAt(currentInputCharIndex++));
                charVal3 = _encodingAlphabet.indexOf(encodedInput.charAt(currentInputCharIndex++));
                charVal4 = _encodingAlphabet.indexOf(encodedInput.charAt(currentInputCharIndex++));

                // Validate characters.
                if (charVal1 === -1 || charVal2 === -1 || charVal3 === -1 || charVal4 === -1) {
                    console.error(`BinarySegmentReader: Invalid character encountered in Base64 string at index ${currentInputCharIndex - 4}.`);
                    _octetsBuffer = []; // Clear partial buffer on error.
                    return;
                }

                octetA = (charVal1 << 2) | (charVal2 >> 4);
                octetB = ((charVal2 & 0x0F) << 4) | (charVal3 >> 2); // 0x0F is 15 (binary 00001111)
                octetC = ((charVal3 & 0x03) << 6) | charVal4; // 0x03 is 3 (binary 00000011)

                _octetsBuffer.push(octetA);
                // Handle padding characters '=' (index 64 in _encodingAlphabet)
                if (charVal3 !== 64) _octetsBuffer.push(octetB);
                if (charVal4 !== 64) _octetsBuffer.push(octetC);
            }
        };

        // Normalizes the bit and byte positions after read/skip operations.
        const _normalizeBitOctetCursors = function() {
            while (_bitOffsetInOctet < 0) {
                _octetCursor--;
                _bitOffsetInOctet += 8;
            }
            while (_bitOffsetInOctet >= 8) {
                _octetCursor++;
                _bitOffsetInOctet -= 8;
            }
            // Ensure octetCursor doesn't go out of bounds negatively.
            _octetCursor = Math.max(0, _octetCursor);
        };

        // Reads a single byte (8 bits) from the stream.
        const fetchSingleOctet = function() {
            return extractBits(8);
        };

        // Reads multiple bytes and combines them into a single number.
        const fetchMultipleOctets = function(octetQuantity) {
            if (octetQuantity <= 0) return 0;
            let resultAggregate = 0;
            for (let k = 0; k < octetQuantity; k++) {
                resultAggregate = (resultAggregate << 8) | fetchSingleOctet();
            }
            return resultAggregate;
        };

        // Extracts a specified number of bits from the stream.
        const extractBits = function(numBits) {
            if (numBits <= 0) return 0;
            if (numBits > 32) { // Prevent excessively large bit reads that might overflow standard JS numbers.
                instanceRef._verboseLogging && console.warn("BinarySegmentReader: Attempting to read more than 32 bits, potential precision loss.");
            }

            let resultAggregate = 0;

            // Handle cases where the requested bits span multiple bytes or partial bytes.
            while (numBits > 0) {
                if (_octetCursor >= _octetsBuffer.length) {
                    instanceRef._verboseLogging && console.warn("BinarySegmentReader: Attempted to read past end of stream.");
                    return resultAggregate; // Return what's been accumulated so far.
                }

                const bitsRemainingInCurrentOctet = 8 - _bitOffsetInOctet;
                const bitsToReadInThisStep = Math.min(numBits, bitsRemainingInCurrentOctet);

                if (bitsToReadInThisStep === 0) { // Should not happen if _normalizeBitOctetCursors works, but as a safeguard.
                    _bitOffsetInOctet = 0;
                    _octetCursor++;
                    continue;
                }

                // Create a mask for the bits we want to extract from the current byte.
                // Shift the byte to align the desired bits to the rightmost position.
                const currentOctetValue = _octetsBuffer[_octetCursor];
                const shiftForExtraction = bitsRemainingInCurrentOctet - bitsToReadInThisStep;
                const extractedChunk = (currentOctetValue >> shiftForExtraction) & ((1 << bitsToReadInThisStep) - 1);

                resultAggregate = (resultAggregate << bitsToReadInThisStep) | extractedChunk;

                _bitOffsetInOctet += bitsToReadInThisStep;
                numBits -= bitsToReadInThisStep;
                _normalizeBitOctetCursors(); // Update positions after extraction.
            }

            return resultAggregate;
        };

        // Advances the octet cursor by a specified number of bytes.
        const advanceOctetCursor = function(octetQuantity) {
            _octetCursor += octetQuantity;
            _normalizeBitOctetCursors();
        };

        // Advances the bit cursor by a specified number of bits.
        const advanceBitCursor = function(numBits) {
            _bitOffsetInOctet += numBits;
            _normalizeBitOctetCursors();
        };

        // Checks if the end of the stream has been reached.
        const isEndOfStream = function() {
            return _octetCursor >= _octetsBuffer.length;
        };

        // Returns the current octet position.
        const currentOctetPosition = function() {
            return _octetCursor;
        };

        // Seeks to a specific byte and bit offset.
        const seekToOffset = function(targetOctetPos, targetBitPos) {
            _octetCursor = targetOctetPos;
            _bitOffsetInOctet = targetBitPos;
            _normalizeBitOctetCursors();
        };

        // Returns the total length of the byte array.
        const totalOctetLength = function() {
            return _octetsBuffer.length;
        };

        // Resets the reader's state.
        const resetReader = function() {
            _octetCursor = 0;
            _bitOffsetInOctet = 0;
            _octetsBuffer = [];
        };

        // Initial setup: decode the input string.
        ingestEncodedPayload(encodedInputPayload);

        // Public interface for the BinarySegmentReader.
        return {
            fetchSingleOctet: fetchSingleOctet,
            fetchMultipleOctets: fetchMultipleOctets,
            extractBits: extractBits,
            advanceOctetCursor: advanceOctetCursor,
            advanceBitCursor: advanceBitCursor,
            isEndOfStream: isEndOfStream,
            currentOctetPosition: currentOctetPosition,
            seekToOffset: seekToOffset,
            totalOctetLength: totalOctetLength,
            resetReader: resetReader,
            reIngest: ingestEncodedPayload // Expose for re-use
        };
    };

    // Private members for the animation state and resources.
    this._verboseLogging = false; // Enable/disable detailed console output.
    this._renderSurface = null; // The HTML canvas element for drawing.
    this._assetImageCollection = []; // Array of pre-loaded image assets.
    this._activeAnimFrameRequest = -1; // ID returned by requestAnimationFrame.
    this._currentDisplayFrameIdx = 0; // Index of the currently rendered frame.
    this._totalFrameCount = 0; // Total number of frames in the sequence.
    this._shouldLoopSequence = false; // Whether the animation should repeat.
    this._sequenceData = null; // Parsed JSON data containing animation metadata.
    this._allAssetsLoaded = false; // Flag indicating image assets are ready.
    this._completionCallback = null; // Callback for when all initial loading is done.
    this._frameUpdateObserver = null; // Callback for each frame update.
    this._sequenceEndObserver = null; // Callback for when a playback cycle finishes.
    this._isPingPongMode = false; // Whether playback reverses direction.
    this._sequenceDirection = 1; // 1 for forward, -1 for backward in ping-pong mode.

    // Helper to get the 2D rendering context from the canvas.
    const _getCanvasContext = function() {
        if (!instanceRef._renderSurface) {
            instanceRef._renderSurface = document.getElementById(instanceRef.domElementId);
            if (!instanceRef._renderSurface || !(instanceRef._renderSurface instanceof HTMLCanvasElement)) {
                console.error(`DynamicMediaPresenter: Target element '${instanceRef.domElementId}' is not a valid canvas.`);
                return null;
            }
        }
        return instanceRef._renderSurface.getContext('2d');
    };

    // Displays a warning message on the canvas for version mismatches.
    const displayVersionMismatchWarning = function(compositionVersion) {
        const graphicsContext = _getCanvasContext();
        if (!graphicsContext) return;

        const warningMessage = "Engine/Composition Version Mismatch!";
        graphicsContext.font = "normal 16px sans-serif"; // Using a safer default font.
        const textDimensions = graphicsContext.measureText(warningMessage);

        const canvasWidth = instanceRef._renderSurface.width;
        const canvasHeight = instanceRef._renderSurface.height;

        const rectWidth = textDimensions.width + 40;
        const rectHeight = 40;
        const rectX = (canvasWidth / 2) - (rectWidth / 2);
        const rectY = (canvasHeight / 2) - (rectHeight / 2);

        graphicsContext.fillStyle = "rgba(255, 0, 0, 0.8)"; // Semi-transparent red background.
        graphicsContext.fillRect(rectX, rectY, rectWidth, rectHeight);

        graphicsContext.fillStyle = "white";
        graphicsContext.textAlign = "center";
        graphicsContext.textBaseline = "middle";
        graphicsContext.fillText(warningMessage, canvasWidth / 2, canvasHeight / 2 + 2); // Adjust text position slightly.

        console.warn(`DynamicMediaPresenter: Version conflict detected! Composition requires v${compositionVersion}, engine is v${instanceRef.engineRevision}. Update your engine or composition.`);
    };

    // Core function to interpret and render frame blitting instructions.
    const _processFrameInstructions = function(encodedFrameData, clearCanvasSegment, drawDebugOutlines = false) {
        const graphicsContext = _getCanvasContext();
        if (!graphicsContext || !encodedFrameData) {
            instanceRef._verboseLogging && console.log("No context or frame data for blitting.");
            return;
        }

        const frameDataReader = BinarySegmentReader(encodedFrameData);
        let isKeyFrame = false; // Flag to determine if the current frame is an I-frame (key frame).

        // Ensure the reader is valid and has data.
        if (!frameDataReader || frameDataReader.totalOctetLength() < 10) { // Minimum size for PPS header.
            instanceRef._verboseLogging && console.warn("Invalid or empty frame data provided to _processFrameInstructions.");
            return;
        }

        // Loop through the blit instructions encoded in the bitstream.
        while (frameDataReader.totalOctetLength() - frameDataReader.currentOctetPosition() >= 10) {

            // --- Parse Picture Parameter Set (PPS) header ---
            frameDataReader.advanceOctetCursor(1); // Skip version byte (currently unused).
            const imageAssetIndex = frameDataReader.fetchSingleOctet();
            const pixelGridSize = frameDataReader.extractBits(5);
            const currentFrameType = frameDataReader.extractBits(3); // 0 = I-Frame, 1 = P-Frame
            const instructionCount = frameDataReader.fetchMultipleOctets(2); // Number of blit operations in this frame.

            // Bit depths for various coordinate and dimension values.
            const sourceCoordBitDepth = frameDataReader.extractBits(4);
            const destXCoordBitDepth = frameDataReader.extractBits(4);
            const destYCoordBitDepth = frameDataReader.extractBits(4);
            const sourceWidthBitDepth = frameDataReader.extractBits(4);
            const sourceHeightBitDepth = frameDataReader.extractBits(4);
            const destWidthBitDepth = frameDataReader.extractBits(4);
            const destHeightBitDepth = frameDataReader.extractBits(4);

            frameDataReader.advanceBitCursor(52); // Skip reserved bits.

            // If it's an I-frame (key frame) and not already marked, clear the entire canvas.
            // This is generally more efficient than clearing individual blits for key frames.
            if (currentFrameType === 0 && !isKeyFrame) {
                isKeyFrame = true;
                const displayWidth = instanceRef._sequenceData.framesize.width;
                const displayHeight = instanceRef._sequenceData.framesize.height;
                graphicsContext.clearRect(0, 0, displayWidth, displayHeight);
            }

            // Process each individual blit instruction.
            for (let blitIndex = 0; blitIndex < instructionCount; ++blitIndex) {
                if (frameDataReader.isEndOfStream()) {
                    instanceRef._verboseLogging && console.warn(`Premature end of stream encountered at blit ${blitIndex}.`);
                    break;
                }

                // Source coordinates and dimensions on the atlas image.
                const sourceX = frameDataReader.extractBits(sourceCoordBitDepth) * pixelGridSize;
                const sourceY = frameDataReader.extractBits(sourceCoordBitDepth) * pixelGridSize;

                let sourceWidth = pixelGridSize;
                let sourceHeight = pixelGridSize;

                if (sourceWidthBitDepth > 0) {
                    sourceWidth = (frameDataReader.extractBits(sourceWidthBitDepth) + 1) * pixelGridSize;
                }
                if (sourceHeightBitDepth > 0) {
                    sourceHeight = (frameDataReader.extractBits(sourceHeightBitDepth) + 1) * pixelGridSize;
                }

                // Destination coordinates and dimensions on the canvas.
                const destX = frameDataReader.extractBits(destXCoordBitDepth) * pixelGridSize;
                const destY = frameDataReader.extractBits(destYCoordBitDepth) * pixelGridSize;

                let destWidth = sourceWidth;
                let destHeight = sourceHeight;

                if (destWidthBitDepth > 0) {
                    destWidth = (frameDataReader.extractBits(destWidthBitDepth) + 1) * pixelGridSize;
                }
                if (destHeightBitDepth > 0) {
                    destHeight = (frameDataReader.extractBits(destHeightBitDepth) + 1) * pixelGridSize;
                }

                // For P-frames, clear the specific blit area before drawing.
                // This is crucial for animations with transparency or partial updates.
                if (currentFrameType === 1 && clearCanvasSegment) {
                    graphicsContext.clearRect(destX, destY, destWidth, destHeight);
                }

                const currentImage = instanceRef._assetImageCollection[imageAssetIndex];
                if (currentImage && currentImage.complete && currentImage.naturalWidth > 0) { // Check if image is actually loaded.
                    graphicsContext.drawImage(currentImage, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                } else {
                    instanceRef._verboseLogging && console.warn(`Missing or incomplete image asset at index ${imageAssetIndex} for blit.`);
                }

                // Optional: Draw debug outlines around each blitted area.
                if (drawDebugOutlines) {
                    graphicsContext.lineWidth = "1";
                    graphicsContext.strokeStyle = "rgba(255, 0, 0, 0.5)";
                    graphicsContext.strokeRect(destX + 0.5, destY + 0.5, destWidth - 1, destHeight - 1); // Offset for crisper lines.
                }
            }
        }
    };

    // The main animation loop, executed by requestAnimationFrame.
    const startAnimationLoop = function() {
        const animationManifest = instanceRef._sequenceData;
        if (!animationManifest || !animationManifest.frames || animationManifest.frames.length === 0) {
            console.error("Animation manifest or frames data is missing/empty.");
            instanceRef.haltPlayback();
            return;
        }

        const assetVersion = animationManifest.version;
        if (assetVersion > instanceRef.engineRevision) {
            displayVersionMismatchWarning(assetVersion);
            instanceRef.haltPlayback(); // Stop playback on version mismatch.
            return;
        }

        const graphicsContext = _getCanvasContext();
        if (!graphicsContext) {
            instanceRef.haltPlayback();
            return;
        }

        const shouldClearBeforeBlitting = animationManifest.hasAlpha;
        let lastFrameRenderTime = 0; // Timestamp of the previous frame's render.
        let calculatedFrameDelay = 0; // Delay in milliseconds before next frame.

        const animationStepHandler = function(currentTime) {
            // If animation has been stopped externally, exit the loop.
            if (instanceRef._activeAnimFrameRequest === -1) {
                return;
            }

            // Guard against invalid current time or too-fast updates.
            if (isNaN(currentTime) || (lastFrameRenderTime > 0 && (currentTime - lastFrameRenderTime < calculatedFrameDelay))) {
                instanceRef._activeAnimFrameRequest = requestAnimationFrame(animationStepHandler);
                return;
            }

            const frameSequence = animationManifest.frames;

            // Optional: Re-render previous frame for debug comparison if enabled.
            if (instanceRef._verboseLogging && instanceRef._currentDisplayFrameIdx > 0) {
                const previousFrameCommands = frameSequence[instanceRef._currentDisplayFrameIdx - 1];
                if (previousFrameCommands) {
                    _processFrameInstructions(previousFrameCommands.x, shouldClearBeforeBlitting);
                }
            }

            // Get the blit instructions for the current frame.
            const currentFrameCommands = frameSequence[instanceRef._currentDisplayFrameIdx];
            if (currentFrameCommands) {
                _processFrameInstructions(currentFrameCommands.x, shouldClearBeforeBlitting, instanceRef._verboseLogging);
            } else {
                instanceRef._verboseLogging && console.warn(`No frame data found for index: ${instanceRef._currentDisplayFrameIdx}`);
                // If a frame is missing, try to advance to the next or stop.
            }

            // Trigger the frame update observer if set.
            if (instanceRef._frameUpdateObserver) {
                const frameMetadata = currentFrameCommands && currentFrameCommands.hasOwnProperty("m") ? currentFrameCommands.m : null;
                instanceRef._frameUpdateObserver(instanceRef._currentDisplayFrameIdx, frameMetadata);
            }

            // Determine the next frame index.
            if (!instanceRef._isPingPongMode) {
                instanceRef._currentDisplayFrameIdx++;
                if (instanceRef._currentDisplayFrameIdx >= frameSequence.length) {
                    // Sequence has finished.
                    if (instanceRef._sequenceEndObserver) {
                        instanceRef._sequenceEndObserver();
                    }

                    if (instanceRef._shouldLoopSequence) {
                        instanceRef._currentDisplayFrameIdx = 0; // Reset for looping.
                        lastFrameRenderTime = 0; // Reset time to avoid large initial delay on loop.
                    } else {
                        instanceRef.haltPlayback(); // Stop if not looping.
                        return;
                    }
                }
            } else { // Ping-pong mode logic.
                if (instanceRef._sequenceDirection === 1) { // Moving forward.
                    instanceRef._currentDisplayFrameIdx++;
                    if (instanceRef._currentDisplayFrameIdx >= frameSequence.length - 1) { // -1 to avoid going out of bounds and repeating last frame immediately.
                        instanceRef._sequenceDirection = -1; // Reverse direction.
                    }
                } else { // Moving backward.
                    instanceRef._currentDisplayFrameIdx--;
                    if (instanceRef._currentDisplayFrameIdx <= 0) {
                        instanceRef._sequenceDirection = 1; // Reverse direction.
                    }
                }
                // Ensure frame index stays within bounds for ping-pong.
                instanceRef._currentDisplayFrameIdx = Math.max(0, Math.min(frameSequence.length - 1, instanceRef._currentDisplayFrameIdx));
            }

            // Calculate the delay for the next frame.
            const nextFrameDuration = (currentFrameCommands && currentFrameCommands.d) ? currentFrameCommands.d : 1; // Default duration if not specified.
            calculatedFrameDelay = (nextFrameDuration * 1000) / animationManifest.timescale;
            lastFrameRenderTime = currentTime;

            // Request the next animation frame.
            instanceRef._activeAnimFrameRequest = requestAnimationFrame(animationStepHandler);
        };

        // Start the animation loop.
        instanceRef._activeAnimFrameRequest = requestAnimationFrame(animationStepHandler);
    };

    // Renders a specific frame without starting an animation loop.
    const renderStaticFrame = function(frameIndex = instanceRef._currentDisplayFrameIdx) {
        const animationManifest = instanceRef._sequenceData;
        if (!animationManifest || !animationManifest.frames || animationManifest.frames.length === 0) {
            console.error("Animation manifest or frames data is missing/empty for static render.");
            return;
        }

        const assetVersion = animationManifest.version;
        if (assetVersion > instanceRef.engineRevision) {
            displayVersionMismatchWarning(assetVersion);
            return;
        }

        const graphicsContext = _getCanvasContext();
        if (!graphicsContext) return;

        const shouldClearBeforeBlitting = animationManifest.hasAlpha;
        const displayWidth = animationManifest.framesize.width;
        const displayHeight = animationManifest.framesize.height;

        // Clamp frame index to valid range.
        const effectiveFrameIndex = Math.max(0, Math.min(animationManifest.frames.length - 1, frameIndex));
        instanceRef._currentDisplayFrameIdx = effectiveFrameIndex;

        if (shouldClearBeforeBlitting) {
            graphicsContext.clearRect(0, 0, displayWidth, displayHeight);
        }

        const frameCommands = animationManifest.frames[effectiveFrameIndex];
        if (frameCommands) {
            _processFrameInstructions(frameCommands.x, shouldClearBeforeBlitting, instanceRef._verboseLogging);
        } else {
            console.warn(`No frame data found for static render at index: ${effectiveFrameIndex}`);
        }
    };

    // Public method to initialize the presentation with configuration options.
    this.initializePresentation = function(configOptions) {
        if (!configOptions || typeof configOptions !== 'object') {
            console.error("DynamicMediaPresenter.initializePresentation: Configuration options object is required.");
            return;
        }

        // Reset state for new animation load.
        instanceRef._allAssetsLoaded = false;
        instanceRef._assetImageCollection = [];
        instanceRef._currentDisplayFrameIdx = 0;
        instanceRef.haltPlayback(); // Ensure any previous animation is stopped.

        // Assign configuration properties, with fallbacks.
        instanceRef.imageAssetPaths = configOptions.imageArray || [];
        instanceRef.imageBasePath = configOptions.imagePath || '';
        instanceRef._completionCallback = typeof configOptions.onLoad === 'function' ? configOptions.onLoad : () => {};
        instanceRef._shouldLoopSequence = !!configOptions.loop;
        instanceRef._isPingPongMode = !!configOptions.pingPong;
        instanceRef._sequenceDirection = 1; // Always start forward.
        instanceRef._frameProgressNotifier = typeof configOptions.currentFrameCallback === 'function' ? configOptions.currentFrameCallback : null;
        instanceRef._playbackEndNotifier = typeof configOptions.playbackFinishedCallback === 'function' ? configOptions.playbackFinishedCallback : null;
        instanceRef._verboseLogging = !!configOptions.debug; // New debug flag.

        // Ensure canvas element exists and context can be obtained early.
        if (!_getCanvasContext()) {
            console.error("DynamicMediaPresenter: Cannot initialize. Render surface (canvas) is not available.");
            return;
        }

        // Store the animation data.
        instanceRef._sequenceData = configOptions.animationData;
        if (!instanceRef._sequenceData) {
            console.error("DynamicMediaPresenter: Animation data (configOptions.animationData) is missing.");
            return;
        }
        instanceRef._totalFrameCount = instanceRef._sequenceData.frames ? instanceRef._sequenceData.frames.length : 0;

        // Function to sequentially load image assets.
        const loadNextImageAsset = function() {
            if (instanceRef.imageAssetPaths.length > 0) {
                const assetImage = new Image();
                assetImage.onload = () => {
                    instanceRef._assetImageCollection.push(assetImage);
                    loadNextImageAsset(); // Load the next image recursively.
                };
                assetImage.onerror = (e) => {
                    console.error(`Failed to load image: ${assetImage.src}`, e);
                    // For now, continue loading other images, but log the error.
                    // A more robust solution might involve a placeholder image or stopping.
                    instanceRef._assetImageCollection.push(null); // Push null to maintain index alignment.
                    loadNextImageAsset();
                };

                const imageSrc = instanceRef.imageBasePath + instanceRef.imageAssetPaths.shift();
                assetImage.src = imageSrc;
            } else {
                instanceRef._allAssetsLoaded = true;
                instanceRef._completionCallback(); // Notify that all assets are loaded.
            }
        };

        // Start loading image assets.
        loadNextImageAsset();
    };

    // Public method to start the animation playback.
    this.beginPlayback = function() {
        if (instanceRef._activeAnimFrameRequest !== -1) {
            instanceRef._verboseLogging && console.log("Playback already active, ignoring beginPlayback call.");
            return; // Animation is already running.
        }

        if (!instanceRef._renderSurface || !instanceRef._sequenceData || !instanceRef._allAssetsLoaded) {
            instanceRef._verboseLogging && console.log("Playback not ready: waiting for canvas, data, or assets.");
            // Use a short delay to re-attempt playback once resources are ready.
            setTimeout(() => instanceRef.beginPlayback(), 100);
            return;
        }

        // Reset frame index if starting a new playback from stopped state.
        if (instanceRef._currentDisplayFrameIdx >= instanceRef._totalFrameCount || instanceRef._currentDisplayFrameIdx < 0) {
            instanceRef._currentDisplayFrameIdx = 0;
            instanceRef._sequenceDirection = 1; // Reset ping-pong direction.
        }

        // Ensure the initial frame is drawn before starting the loop if it's not the first frame.
        // This prevents a blank frame flicker if starting from a non-zero index.
        renderStaticFrame(instanceRef._currentDisplayFrameIdx);

        startAnimationLoop();
    };

    // Public method to halt the animation playback.
    this.haltPlayback = function() {
        if (instanceRef._activeAnimFrameRequest === -1) {
            instanceRef._verboseLogging && console.log("Playback already halted, ignoring haltPlayback call.");
            return;
        }

        cancelAnimationFrame(instanceRef._activeAnimFrameRequest);
        instanceRef._activeAnimFrameRequest = -1; // Reset ID to indicate no active animation.
        instanceRef._verboseLogging && console.log("Animation playback halted.");
    };

    // Public method to get the index of the currently displayed frame.
    this.getCurrentFrameIndex = function() {
        return instanceRef._currentDisplayFrameIdx;
    };

    // Public method to set a specific frame for display.
    this.setFrameIndex = function(frameIndex) {
        if (typeof frameIndex !== 'number' || !Number.isInteger(frameIndex)) {
            console.warn("setFrameIndex: Invalid frame index provided. Must be an integer.");
            return;
        }
        if (frameIndex < 0 || frameIndex >= instanceRef._totalFrameCount) {
            console.warn(`setFrameIndex: Frame index ${frameIndex} is out of bounds (0-${instanceRef._totalFrameCount - 1}).`);
            return;
        }

        // If animation is running, stop it, set frame, render, then restart.
        const wasPlaying = instanceRef._activeAnimFrameRequest !== -1;
        if (wasPlaying) {
            instanceRef.haltPlayback();
        }

        instanceRef._currentDisplayFrameIdx = frameIndex;
        renderStaticFrame(frameIndex);

        if (wasPlaying) {
            instanceRef.beginPlayback();
        }
    };

    // Public method to clean up resources (useful for SPA scenarios).
    this.dispose = function() {
        this.haltPlayback();
        this._assetImageCollection = [];
        this._sequenceData = null;
        this._renderSurface = null;
        // Potentially remove event listeners if any were added to the canvas.
        instanceRef._verboseLogging && console.log("DynamicMediaPresenter instance disposed.");
    };
}