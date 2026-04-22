const eventKit = require('events');

// Helper to manage internal byte buffer and reading operations
function createByteSequencer() {
    let accumulatedBytes = Buffer.alloc(0);
    let readCursor = 0; // Tracks the current position for reading within accumulatedBytes

    // Appends new data and discards already processed bytes
    const annexData = (incomingSegment) => {
        accumulatedBytes = Buffer.concat([accumulatedBytes.slice(readCursor), incomingSegment]);
        readCursor = 0; // Reset cursor to the beginning of the new accumulated buffer
    };

    // Returns the number of bytes available for reading
    const availableLength = () => accumulatedBytes.length - readCursor;

    // Reads a specified number of bytes as a Buffer
    const extractBytes = (count) => {
        if (availableLength() < count) {
            throw new Error('Insufficient bytes for extraction operation');
        }
        const dataPortion = accumulatedBytes.slice(readCursor, readCursor + count);
        readCursor += count;
        return dataPortion;
    };

    // Advances the read cursor without returning data
    const progressCursor = (count) => {
        if (availableLength() < count) {
            throw new Error('Insufficient bytes for cursor advancement');
        }
        readCursor += count;
    };

    // Reads a 16-bit unsigned integer in little-endian format
    const fetchUnsigned16LE = () => {
        const value = accumulatedBytes.readUInt16LE(readCursor);
        readCursor += 2;
        return value;
    };

    // Reads a 32-bit unsigned integer in little-endian format
    const fetchUnsigned32LE = () => {
        const value = accumulatedBytes.readUInt32LE(readCursor);
        readCursor += 4;
        return value;
    };

    // Reads an 8-bit unsigned integer
    const fetchUnsigned8 = () => {
        const value = accumulatedBytes.readUInt8(readCursor);
        readCursor += 1;
        return value;
    };

    // Reads a specified number of bytes and decodes them as ASCII string
    const fetchAsciiString = (count) => {
        const text = accumulatedBytes.toString('ascii', readCursor, readCursor + count);
        readCursor += count;
        return text;
    };

    return {
        annexData,
        availableLength,
        extractBytes,
        progressCursor,
        fetchUnsigned16LE,
        fetchUnsigned32LE,
        fetchUnsigned8,
        fetchAsciiString
    };
}

// Global constants for parsing logic
const HEADER_BLOCK_SIZE = 68;
const ENCAPSULATION_IDENTIFIER = 'PaVE';
const NAL_UNIT_DELIMITER = Buffer.from([0x00, 0x00, 0x00, 0x01]);

// Factory function to create a video data processor
function initiateVideoProcessor() {
    const dataOutputChannel = new eventKit.EventEmitter();
    const byteSequencer = createByteSequencer();

    let currentParsingMode = 'header_acquisition'; // States: 'header_acquisition', 'payload_retrieval'
    let requiredPayloadDataLength = 0;
    let identifiedFrameType = 0;

    // Function to handle and dispatch the parsed video segments
    const processAndRelaySegment = (segmentPayload, segmentKindIdentifier) => {
        if (segmentKindIdentifier === 1) { // If it's an I-Frame, further decompose into NAL units
            let priorBoundary = 0;
            let searchStartPoint = 0;

            while (true) {
                const nextDelimiterPosition = segmentPayload.indexOf(NAL_UNIT_DELIMITER, searchStartPoint);

                if (nextDelimiterPosition === -1) {
                    // No more delimiters, emit the remaining part if any
                    if (priorBoundary < segmentPayload.length) {
                        dataOutputChannel.emit('processed_unit', segmentPayload.slice(priorBoundary));
                    }
                    break;
                }

                // Emit the data preceding the delimiter
                if (priorBoundary < nextDelimiterPosition) {
                    dataOutputChannel.emit('processed_unit', segmentPayload.slice(priorBoundary, nextDelimiterPosition));
                }

                // Move past the delimiter for the next search
                priorBoundary = nextDelimiterPosition + NAL_UNIT_DELIMITER.length;
                searchStartPoint = priorBoundary;
            }
        } else {
            // For other frame types, emit the entire payload as one unit
            dataOutputChannel.emit('processed_unit', segmentPayload);
        }
    };

    // Main entry point for feeding raw buffer chunks into the processor
    const feedDataChunk = (incomingBufferSegment) => {
        byteSequencer.annexData(incomingBufferSegment);

        while (true) {
            try {
                if (currentParsingMode === 'header_acquisition') {
                    if (byteSequencer.availableLength() < HEADER_BLOCK_SIZE) {
                        break; // Not enough data to complete header parsing
                    }

                    const detectedSignature = byteSequencer.fetchAsciiString(4);
                    if (detectedSignature !== ENCAPSULATION_IDENTIFIER) {
                        dataOutputChannel.emit('processing_failure', new Error(`Mismatched signature: ${JSON.stringify(detectedSignature)}`));
                        // In case of error, stop processing this stream.
                        return;
                    }

                    byteSequencer.progressCursor(2); // Skip 2 bytes
                    const headerStructureSize = byteSequencer.fetchUnsigned16LE();
                    requiredPayloadDataLength = byteSequencer.fetchUnsigned32LE(); // This is the total payload size
                    byteSequencer.progressCursor(18); // Skip 18 bytes of various header fields
                    identifiedFrameType = byteSequencer.fetchUnsigned8(); // The frame type byte

                    // Calculate bytes consumed so far in the header for skipping remaining parts
                    const initialHeaderConsumption = 4 + 2 + 2 + 4 + 18 + 1; // Sum of bytes read/skipped
                    byteSequencer.progressCursor(headerStructureSize - initialHeaderConsumption);

                    currentParsingMode = 'payload_retrieval'; // Transition to payload parsing mode
                } else if (currentParsingMode === 'payload_retrieval') {
                    if (byteSequencer.availableLength() < requiredPayloadDataLength) {
                        break; // Not enough data to complete payload retrieval
                    }

                    // Skip the initial 4 bytes within the payload (NAL-Unit boundary prefix)
                    byteSequencer.progressCursor(4);
                    requiredPayloadDataLength -= 4; // Adjust the length after skipping

                    const actualPayloadContent = byteSequencer.extractBytes(requiredPayloadDataLength);
                    processAndRelaySegment(actualPayloadContent, identifiedFrameType);

                    // Reset state for the next frame
                    requiredPayloadDataLength = 0;
                    identifiedFrameType = 0;
                    currentParsingMode = 'header_acquisition';
                }
            } catch (parsingError) {
                // Catch any unexpected errors during byte sequence operations
                dataOutputChannel.emit('processing_failure', parsingError);
                return;
            }
        }
    };

    // Function to signal the end of the data stream
    const concludeProcessing = () => {
        // No specific finalization logic needed for this parser
    };

    // Combine EventEmitter with custom methods to mimic a stream interface
    return Object.assign(dataOutputChannel, {
        feedDataChunk: feedDataChunk,
        concludeProcessing: concludeProcessing
    });
}

module.exports = initiateVideoProcessor;