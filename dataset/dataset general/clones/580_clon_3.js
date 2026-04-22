// This module provides a robust parser for Parrot Video Encapsulation (PaVE)
// frames, originating from AR Drone 2.0 H.264 video streams.
// It decodes raw byte streams into individual video frames.
'use strict';

const utilityModule = require('util');
const BaseStream    = require('stream').Stream;
const ByteReader    = require('buffy'); // Renamed buffy to ByteReader for clarity

// Helper for inheritance, mimicking util.inherits but allowing for potential future changes
function establishInheritance(ChildCtor, ParentCtor) {
    utilityModule.inherits(ChildCtor, ParentCtor);
}

module.exports = VideoFrameDecoder;
establishInheritance(VideoFrameDecoder, BaseStream);

/**
 * @class VideoFrameDecoder
 * @extends stream.Stream
 * @description Parses incoming byte streams to extract PaVE encapsulated H.264 video frames.
 */
function VideoFrameDecoder() {
    BaseStream.call(this); // Invoke parent constructor

    this.writable = true; // Indicates this stream can receive data

    // Internal state management for parsing
    this._byteStreamReader = ByteReader.createReader(); // Renamed _parser
    this._currentParsingStage = 'awaiting_header'; // Renamed _state, added a new initial state
    this._bytesRemainingInPayload = 0; // Renamed _toRead
    this._activeFrameType = undefined; // Renamed _frame_type
    this._processedFrameCounter = 0; // New: Add a frame counter
    this._lastFrameTimestamp = 0; // New: Track last frame timestamp

    // Pre-calculate common byte counts
    this._nalUnitBoundarySize = 4; // Moved constant to instance property
}

// Renamed HEADER_SIZE to FRAME_HEADER_BYTE_COUNT
// Note: While older firmwares used 64, the spec allows for variable header sizes,
// but 68 is the standard for AR.Drone 2.0.
VideoFrameDecoder.FRAME_HEADER_BYTE_COUNT = 68;

// New: Define parsing stages as constants for better readability
VideoFrameDecoder.PARSING_STAGES = {
    AWAITING_HEADER: 'awaiting_header',
    PROCESSING_HEADER: 'processing_header',
    PROCESSING_PAYLOAD: 'processing_payload',
    ERROR_STATE: 'error_state' // New error state
};

/**
 * Processes an incoming buffer segment, attempting to extract complete PaVE frames.
 * @param {Buffer} inputSegment The buffer segment to process.
 * @returns {boolean} True if the stream is ready for more data, false otherwise (e.g., error).
 */
VideoFrameDecoder.prototype.processIncomingData = function (inputSegment) { // Renamed write
    if (!Buffer.isBuffer(inputSegment) || inputSegment.length === 0) { // New guard clause
        // Silently ignore empty or invalid input, or emit a 'warn' event
        // this.emit('warn', 'Received empty or invalid input segment.');
        return true;
    }

    const currentReader = this._byteStreamReader; // Renamed parser
    currentReader.write(inputSegment);

    // Loop to process all available data in the reader, potentially multiple frames
    while (currentReader.bytesAhead() > 0) { // Modified loop condition
        switch (this._currentParsingStage) {
        case VideoFrameDecoder.PARSING_STAGES.AWAITING_HEADER:
            // Transition to processing header if enough bytes are available
            if (currentReader.bytesAhead() >= VideoFrameDecoder.FRAME_HEADER_BYTE_COUNT) {
                this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.PROCESSING_HEADER;
                // Fallthrough to PROCESSING_HEADER, or break and re-enter loop
                // For simplicity, we'll fall through.
            } else {
                return true; // Need more data for a full header
            }
            // No break here, intentionally fall through to PROCESSING_HEADER to process immediately
            // if enough bytes are available. This avoids an extra loop iteration.

        case VideoFrameDecoder.PARSING_STAGES.PROCESSING_HEADER:
            if (currentReader.bytesAhead() < VideoFrameDecoder.FRAME_HEADER_BYTE_COUNT) {
                this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.AWAITING_HEADER; // Revert if not enough after fallthrough
                return true; // Not enough data for header, wait for more
            }

            let magicMarker = currentReader.ascii(4); // Renamed signature

            if (magicMarker !== 'PaVE') {
                // Future enhancement: Implement a more robust synchronization mechanism
                // by searching for the next 'PaVE' marker in the buffer.
                this.emit('error', new Error(
                    `Corrupted stream: Invalid magic marker encountered - '${magicMarker}'` // Rewritten error message
                ));
                this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.ERROR_STATE; // New: Enter error state
                this._resetParserState(); // New: Reset parser state for recovery
                return false; // Indicate a critical error, stop processing
            }

            currentReader.skip(2); // Reserved bytes
            const frameHeaderLength = currentReader.uint16LE(); // Renamed header_size

            // Validate header length against expected size (optional, but good for robustness)
            if (frameHeaderLength < VideoFrameDecoder.FRAME_HEADER_BYTE_COUNT) {
                this.emit('error', new Error(
                    `Corrupted stream: Reported header length (${frameHeaderLength}) is less than minimum expected (${VideoFrameDecoder.FRAME_HEADER_BYTE_COUNT}).`
                ));
                this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.ERROR_STATE;
                this._resetParserState();
                return false;
            }

            this._bytesRemainingInPayload = currentReader.uint32LE(); // Renamed _toRead

            // Skip various metadata fields (18 bytes total)
            // encoded_stream_width (2), encoded_stream_height (2), display_width (2),
            // display_height (2), frame_number (4), timestamp (4), total_chunks (1), chunk_index (1)
            currentReader.skip(18);

            this._activeFrameType = currentReader.uint8(); // Renamed _frame_type

            // Calculate bytes already consumed in the header:
            // 4 (magic) + 2 (reserved) + 2 (header_size) + 4 (payload_size) + 18 (metadata) + 1 (frame_type) = 31 bytes
            const consumedHeaderBytes = 4 + 2 + 2 + 4 + 18 + 1;
            const bytesToSkipInHeader = frameHeaderLength - consumedHeaderBytes;

            if (bytesToSkipInHeader > 0) { // Only skip if there are extra bytes
                currentReader.skip(bytesToSkipInHeader);
            } else if (bytesToSkipInHeader < 0) {
                 // This shouldn't happen if frameHeaderLength is valid, but defensive check
                 this.emit('error', new Error(
                    `Internal error: Negative skip calculated for header (${bytesToSkipInHeader}).`
                 ));
                 this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.ERROR_STATE;
                 this._resetParserState();
                 return false;
            }


            this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.PROCESSING_PAYLOAD;
            break;

        case VideoFrameDecoder.PARSING_STAGES.PROCESSING_PAYLOAD:
            const availableBytes = currentReader.bytesAhead(); // Renamed readable

            if (availableBytes < this._bytesRemainingInPayload) {
                return true; // Not enough data for the full payload, wait for more
            }

            // Skip the NAL-Unit boundary (usually 0x00 00 00 01)
            // This is part of the payload but not the actual video data.
            currentReader.skip(this._nalUnitBoundarySize); // Using instance property
            this._bytesRemainingInPayload -= this._nalUnitBoundarySize;

            const frameContentBuffer = currentReader.buffer(this._bytesRemainingInPayload); // Renamed data

            this.dispatchDecodedFrame(frameContentBuffer, this._activeFrameType); // Renamed sendData
            this._processedFrameCounter++; // Increment counter
            this._lastFrameTimestamp = Date.now(); // Update timestamp

            // Reset state for the next frame
            this._bytesRemainingInPayload = 0; // Reset to 0 instead of undefined for consistency
            this._activeFrameType = undefined;
            this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.AWAITING_HEADER;
            break;

        case VideoFrameDecoder.PARSING_STAGES.ERROR_STATE:
            // In an error state, we might try to recover or just stop.
            // For now, we'll just stop processing until external intervention.
            return false;

        default:
            // Should not happen, but good for defensive programming
            this.emit('error', new Error(`Unknown parsing stage: ${this._currentParsingStage}`));
            this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.ERROR_STATE;
            this._resetParserState();
            return false;
        }
    }
    return true; // All available data processed, ready for more
};

/**
 * Dispatches the decoded video frame data.
 * For I-frames, it attempts to split into smaller NAL units if possible.
 * @param {Buffer} frameContent The raw buffer of the video frame payload.
 * @param {number} typeIndicator The type of the frame (e.g., 1 for I-frame).
 */
VideoFrameDecoder.prototype.dispatchDecodedFrame = function (frameContent, typeIndicator) { // Renamed sendData
    const I_FRAME_TYPE = 1; // New constant for I-frame type

    // Helper function to emit data
    const emitFrameSegment = (segment) => {
        if (segment && segment.length > 0) { // New: Guard against empty segments
            this.emit('data', segment);
        }
    };

    if (typeIndicator === I_FRAME_TYPE) {
        // I-Frames (intra-coded frames) often contain multiple NAL units that can be
        // further split and processed independently by a video decoder.
        let lastSliceStart = 0; // Renamed lastBegin
        const nalUnitDelimiter = Buffer.from([0, 0, 0, 1]); // Explicit buffer for comparison

        // Iterate through the buffer to find NAL unit delimiters
        for (let idx = 0; idx < frameContent.length - nalUnitDelimiter.length; idx++) { // Renamed i, l
            // Check for the NAL unit start code: 0x00 00 00 01
            if (frameContent[idx]     === nalUnitDelimiter[0] &&
                frameContent[idx + 1] === nalUnitDelimiter[1] &&
                frameContent[idx + 2] === nalUnitDelimiter[2] &&
                frameContent[idx + 3] === nalUnitDelimiter[3])
            {
                // If a NAL unit boundary is found, and there's data before it,
                // emit the segment preceding this boundary.
                if (lastSliceStart < idx) { // Check if a valid slice exists
                    emitFrameSegment(frameContent.slice(lastSliceStart, idx));
                }
                // Advance lastSliceStart past the delimiter for the next segment
                lastSliceStart = idx + nalUnitDelimiter.length;
                idx += nalUnitDelimiter.length - 1; // Adjust index to continue search efficiently
            }
        }
        // Emit any remaining data as the last segment
        emitFrameSegment(frameContent.slice(lastSliceStart));
    } else {
        // For other frame types (e.g., P-frames, B-frames), emit the entire payload as one block.
        emitFrameSegment(frameContent);
    }
};

/**
 * Resets the internal parser state, usually after an error, to attempt recovery.
 * This discards any partially read data in the current frame.
 * @private
 */
VideoFrameDecoder.prototype._resetParserState = function () { // New helper method
    this._byteStreamReader.clear(); // Clear any remaining data in the buffer
    this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.AWAITING_HEADER;
    this._bytesRemainingInPayload = 0;
    this._activeFrameType = undefined;
    // Optionally, emit a recovery event
    this.emit('recovery', 'Parser state reset after error.');
};

/**
 * Handles the end of the stream. No specific action required as it's a passive parser.
 */
VideoFrameDecoder.prototype.finalizeProcessing = function () { // Renamed end
    // Clean up resources if necessary. For this stream, it's mostly passive.
    // We could emit a 'summary' event here if we wanted to report total frames processed etc.
    // this.emit('summary', { totalFrames: this._processedFrameCounter });
    this._byteStreamReader.clear(); // Ensure buffer is empty on end
    this._currentParsingStage = VideoFrameDecoder.PARSING_STAGES.AWAITING_HEADER; // Reset state
};