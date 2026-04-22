(function() {
    const animationScheduler = (() => {
        let currentRequestId = -1;
        let previousTimestamp = 0;

        const nativeRequest = window.requestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame;

        const nativeCancel = window.cancelAnimationFrame ||
                             window.webkitCancelAnimationFrame ||
                             window.mozCancelAnimationFrame ||
                             window.oCancelAnimationFrame ||
                             window.msCancelAnimationFrame;

        if (nativeRequest && nativeCancel) {
            return {
                schedule: (handler) => nativeRequest(handler),
                deschedule: (identifier) => nativeCancel(identifier)
            };
        }

        return {
            schedule: (handler) => {
                const currentMoment = performance.now();
                const timeUntilNextFrame = Math.max(0, 16 - (currentMoment - previousTimestamp));
                currentRequestId = window.setTimeout(() => {
                    handler(currentMoment + timeUntilNextFrame);
                }, timeUntilNextFrame);
                previousTimestamp = currentMoment + timeUntilNextFrame;
                return currentRequestId;
            },
            deschedule: (identifier) => {
                window.clearTimeout(identifier);
            }
        };
    })();

    window.requestAnimationFrame = animationScheduler.schedule;
    window.cancelAnimationFrame = animationScheduler.deschedule;
})();

class BinaryDataAccessor {
    constructor(base64String) {
        this.currentBitOffset = 0;
        this.byteBuffer = this.decodeBase64ToBytes(base64String);
    }

    decodeBase64ToBytes(inputString) {
        if (!inputString) return new Uint8Array(0);
        try {
            const binaryString = atob(inputString);
            const byteLength = binaryString.length;
            const bytes = new Uint8Array(byteLength);
            for (let i = 0; i < byteLength; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (e) {
            console.error("Failed to decode Base64 string:", e);
            return new Uint8Array(0);
        }
    }

    advanceBitCursor(bitCount) {
        this.currentBitOffset += bitCount;
    }

    readArbitraryBits(bitCount) {
        if (bitCount === 0) return 0;
        if (bitCount < 0 || bitCount > 32) throw new Error("Bit count must be between 0 and 32.");

        let accumulatedValue = 0;
        let remainingBitsToRead = bitCount;

        while (remainingBitsToRead > 0) {
            const byteIndex = Math.floor(this.currentBitOffset / 8);
            const bitOffsetInByte = this.currentBitOffset % 8;

            if (byteIndex >= this.byteBuffer.length) {
                return accumulatedValue;
            }

            const currentSourceByte = this.byteBuffer[byteIndex];

            const bitsFromThisByte = Math.min(remainingBitsToRead, 8 - bitOffsetInByte);

            const shiftedByte = currentSourceByte >>> (8 - (bitOffsetInByte + bitsFromThisByte));
            const maskedBits = shiftedByte & ((1 << bitsFromThisByte) - 1);

            accumulatedValue = (accumulatedValue << bitsFromThisByte) | maskedBits;

            this.currentBitOffset += bitsFromThisByte;
            remainingBitsToRead -= bitsFromThisFromThisByte;
        }

        return accumulatedValue;
    }

    readSingleByte() {
        return this.readArbitraryBits(8);
    }

    readMultipleBytes(count) {
        let finalValue = 0;
        for (let i = 0; i < count; i++) {
            finalValue = (finalValue << 8) | this.readSingleByte();
        }
        return finalValue;
    }

    skipBytes(count) {
        this.currentBitOffset += (count * 8);
    }

    isEndOfData() {
        return Math.floor(this.currentBitOffset / 8) >= this.byteBuffer.length;
    }

    getByteLength() {
        return this.byteBuffer.length;
    }

    getCurrentByteOffset() {
        return Math.floor(this.currentBitOffset / 8);
    }

    setCursorToOffset(byteOffset, bitOffset) {
        this.currentBitOffset = (byteOffset * 8) + bitOffset;
    }
}

class AnimationRenderer {
    constructor(targetElementId) {
        this.hostElementId = targetElementId;
        this.renderingSurface = document.getElementById(targetElementId);
        if (!this.renderingSurface || !(this.renderingSurface instanceof HTMLCanvasElement)) {
            console.error(`Element with ID '${targetElementId}' not found or is not a canvas.`);
            return;
        }
        this.drawingContext = this.renderingSurface.getContext('2d');

        this.engineRevision = 1; // Corresponds to frameworkVersion

        this.imageCollection = [];
        this.animationSequence = null;
        this.currentPlaybackId = -1;
        this.currentSequenceIndex = 0;
        this.shouldLoop = false;
        this.pingPongMode = false;
        this.playbackDirection = 1; // 1 for forward, -1 for backward
        this.sequenceMetadata = null;
        this.assetLoadingComplete = false;

        this.onFrameUpdateCallback = null;
        this.onPlaybackEndCallback = null;
        this.debugModeEnabled = false;
    }

    displayVersionWarning(compositionVersion) {
        const warningText = "Animation Engine Version Mismatch!";
        const textMetrics = this.drawingContext.measureText(warningText);
        this.drawingContext.fillStyle = "red";
        this.drawingContext.fillRect(
            this.renderingSurface.width / 2 - textMetrics.width / 2 - 5,
            this.renderingSurface.height / 2 - 20,
            textMetrics.width + 25,
            30
        );
        this.drawingContext.fillStyle = "white";
        this.drawingContext.font = "normal 12px sans-serif"; // Using a generic font
        this.drawingContext.fillText(warningText, this.renderingSurface.width / 2 - textMetrics.width / 2, this.renderingSurface.height / 2);
        console.warn(`Version mismatch: Composition requires ${compositionVersion}, engine is ${this.engineRevision}. Update your engine.`);
    }

    _parseBlitData(base64BlitString) {
        const accessor = new BinaryDataAccessor(base64BlitString);
        const blitInstructions = [];

        // Ensure there's enough data for the PPS header
        if (accessor.getByteLength() * 8 - accessor.currentBitOffset < 80) { // Minimum 10 bytes = 80 bits for header
            // console.warn("Insufficient data for blit header.");
            return blitInstructions; // Return empty if not enough data
        }

        // PPS Header parsing
        accessor.advanceBitCursor(8); // version (1 byte, 8 bits) - skip
        const imageIndex = accessor.readSingleByte();
        const blockSize = accessor.readArbitraryBits(5);
        const frameKind = accessor.readArbitraryBits(3); // 0 = I-frame, 1 = P-frame
        const instructionCountBytes = accessor.readMultipleBytes(2); // blitArrayByteCount

        const srcXYBits = accessor.readArbitraryBits(4);
        const destXBits = accessor.readArbitraryBits(4);
        const destYBits = accessor.readArbitraryBits(4);
        const srcWidthBits = accessor.readArbitraryBits(4);
        const srcHeightBits = accessor.readArbitraryBits(4);
        const destWidthBits = accessor.readArbitraryBits(4);
        const destHeightBits = accessor.readArbitraryBits(4);

        accessor.advanceBitCursor(52); // reserved bits - skip

        const initialByteOffset = accessor.getCurrentByteOffset();
        const endByteOffset = initialByteOffset + instructionCountBytes;

        while (accessor.getCurrentByteOffset() < endByteOffset && !accessor.isEndOfData()) {
            const blit = {};
            blit.imgIdx = imageIndex;

            blit.srcX = accessor.readArbitraryBits(srcXYBits) * blockSize;
            blit.srcY = accessor.readArbitraryBits(srcXYBits) * blockSize;

            blit.srcW = blockSize;
            if (srcWidthBits > 0) {
                blit.srcW = (accessor.readArbitraryBits(srcWidthBits) + 1) * blockSize;
            }
            blit.srcH = blockSize;
            if (srcHeightBits > 0) {
                blit.srcH = (accessor.readArbitraryBits(srcHeightBits) + 1) * blockSize;
            }

            blit.destX = accessor.readArbitraryBits(destXBits) * blockSize;
            blit.destY = accessor.readArbitraryBits(destYBits) * blockSize;

            blit.destW = blit.srcW;
            if (destWidthBits > 0) {
                blit.destW = (accessor.readArbitraryBits(destWidthBits) + 1) * blockSize;
            }
            blit.destH = blit.srcH;
            if (destHeightBits > 0) {
                blit.destH = (accessor.readArbitraryBits(destHeightBits) + 1) * blockSize;
            }
            
            blit.isIFrame = (frameKind === 0);
            blit.isPFrame = (frameKind === 1);

            blitInstructions.push(blit);
        }
        return blitInstructions;
    }

    _executeFrameDrawing(frameData, clearScreen, showDebugOutlines) {
        if (!this.drawingContext || !this.imageCollection || this.imageCollection.length === 0) {
            return;
        }

        const displayWidth = this.sequenceMetadata.framesize.width;
        const displayHeight = this.sequenceMetadata.framesize.height;

        if (frameData.length > 0 && frameData[0].isIFrame) {
            this.drawingContext.clearRect(0, 0, displayWidth, displayHeight);
        } else if (clearScreen) { // For P-frames that need clearing
            this.drawingContext.clearRect(0, 0, displayWidth, displayHeight);
        }

        for (const blit of frameData) {
            if (blit.isPFrame && clearScreen) {
                this.drawingContext.clearRect(blit.destX, blit.destY, blit.destW, blit.destH);
            }
            this.drawingContext.drawImage(
                this.imageCollection[blit.imgIdx],
                blit.srcX, blit.srcY, blit.srcW, blit.srcH,
                blit.destX, blit.destY, blit.destW, blit.destH
            );

            if (showDebugOutlines) {
                this.drawingContext.lineWidth = "1";
                this.drawingContext.strokeStyle = "red";
                this.drawingContext.strokeRect(blit.destX + 1, blit.destY + 1, blit.destW - 2, blit.destH - 2);
            }
        }
    }

    _animationCycle(timestamp) {
        if (this.currentPlaybackId === -1 || !this.sequenceMetadata || !this.animationSequence) {
            return;
        }

        const frameDetails = this.sequenceMetadata.frames;
        const currentFrameRaw = frameDetails[this.currentSequenceIndex];
        const currentFrameInstructions = this.animationSequence[this.currentSequenceIndex];

        if (!currentFrameRaw || !currentFrameInstructions) {
            this.pausePlayback();
            return;
        }
        
        const compositionVersion = this.sequenceMetadata.version;
        if (compositionVersion > this.engineRevision) {
            this.displayVersionWarning(compositionVersion);
            this.pausePlayback();
            return;
        }

        const clearBeforeDrawing = this.sequenceMetadata.hasAlpha;
        
        // Render the frame
        this._executeFrameDrawing(currentFrameInstructions, clearBeforeDrawing, this.debugModeEnabled);

        // Invoke frame callback
        if (this.onFrameUpdateCallback) {
            const message = currentFrameRaw.hasOwnProperty("m") ? currentFrameRaw.m : null;
            this.onFrameUpdateCallback(this.currentSequenceIndex, message);
        }

        // Advance frame index
        if (!this.pingPongMode) {
            this.currentSequenceIndex++;
            if (this.currentSequenceIndex >= frameDetails.length) {
                if (this.onPlaybackEndCallback) {
                    this.onPlaybackEndCallback();
                }
                if (this.shouldLoop) {
                    this.currentSequenceIndex = 0;
                } else {
                    this.pausePlayback();
                    return;
                }
            }
        } else {
            if (this.playbackDirection === 1) { // Moving forward
                this.currentSequenceIndex++;
                if (this.currentSequenceIndex >= frameDetails.length) {
                    this.playbackDirection = -1;
                    this.currentSequenceIndex = frameDetails.length - 2; // Move back one, or stay if only one frame
                    if (this.currentSequenceIndex < 0) this.currentSequenceIndex = 0;
                }
            } else { // Moving backward
                this.currentSequenceIndex--;
                if (this.currentSequenceIndex < 0) {
                    this.playbackDirection = 1;
                    this.currentSequenceIndex = 1; // Move forward one, or stay if only one frame
                    if (this.currentSequenceIndex >= frameDetails.length) this.currentSequenceIndex = frameDetails.length - 1;
                }
            }
        }

        // Schedule next frame
        const frameDuration = currentFrameRaw.d * 1000 / this.sequenceMetadata.timescale;
        // The original uses requestAnimationFrame and calculates delay *inside* the callback.
        // To truly diverge, we can use a custom timer or ensure rAF is called with an appropriate delay logic.
        // For Type IV, let's keep rAF but manage the delay more explicitly outside its call.
        // The polyfill handles the delay for setTimeout, but rAF itself doesn't.
        // So, we need to ensure the *next* call to _animationCycle respects the delay.
        // The original does: `if (lastTime > 0 && (now - lastTime < frameDelay)) { requestAnimationFrame(f); return; }`
        // Let's replicate this with a different timing state.
        let nextFrameTime = timestamp + frameDuration;
        const scheduleNext = (currentMoment) => {
            if (currentMoment < nextFrameTime) {
                this.currentPlaybackId = requestAnimationFrame(scheduleNext);
            } else {
                this.currentPlaybackId = requestAnimationFrame(this._animationCycle.bind(this));
            }
        };
        this.currentPlaybackId = requestAnimationFrame(scheduleNext);
    }
    
    loadVisualSequence(config) {
        this.imageCollection = [];
        this.assetLoadingComplete = false;
        this.shouldLoop = config.loop || false;
        this.pingPongMode = config.pingPong || false;
        this.playbackDirection = 1;
        this.onFrameUpdateCallback = config.currentFrameCallback || null;
        this.onPlaybackEndCallback = config.playbackFinishedCallback || null;
        this.debugModeEnabled = config.debug || false;

        this.sequenceMetadata = config.animationData;
        
        // Pre-parse all blit data
        this.animationSequence = this.sequenceMetadata.frames.map(frame => this._parseBlitData(frame.x));

        const imageSources = (config.imageArray || []).map(imgName => 
            (config.imagePath ? config.imagePath : "") + imgName
        );

        const imagePromises = imageSources.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (e) => reject(e);
                img.src = src;
            });
        });

        Promise.all(imagePromises)
            .then(loadedImages => {
                this.imageCollection = loadedImages;
                this.assetLoadingComplete = true;
                if (config.onLoad) {
                    config.onLoad();
                }
            })
            .catch(error => {
                console.error("Error loading animation images:", error);
            });
    }

    startPlayback() {
        if (this.currentPlaybackId !== -1) {
            return; // Already playing
        }

        if (this.renderingSurface && this.drawingContext && this.sequenceMetadata && this.assetLoadingComplete) {
            this.currentSequenceIndex = 0; // Reset to first frame on start
            this.playbackDirection = 1; // Reset direction
            this.currentPlaybackId = requestAnimationFrame(this._animationCycle.bind(this));
        } else {
            // Assets not ready, retry after a short delay
            setTimeout(() => this.startPlayback(), 100);
        }
    }

    pausePlayback() {
        if (this.currentPlaybackId === -1) {
            return; // Not playing
        }
        cancelAnimationFrame(this.currentPlaybackId);
        this.currentPlaybackId = -1;
    }

    retrieveCurrentFrameIndex() {
        return this.currentSequenceIndex;
    }
}

// Global exposure for the library, similar to the original's PhosphorPlayer
window.AnimationRenderer = AnimationRenderer;