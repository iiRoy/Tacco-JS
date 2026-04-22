'use strict';
// This module is based on a parser originally developed by Felix Geisendörfer.
// It processes encapsulated video streams from a specific drone model.

// The AR Drone 2.0 provides H.264 (MPEG-4 AVC) video via TCP.
// This video stream is wrapped in Parrot Video Encapsulation (PVEN) packets,
// which this particular class is designed to interpret and extract.

var utilityTools   = require('util')
  , FlowInterface  = require('stream').Stream
  , dataBuffer     = require('buffy')
  ;

module.exports = VideoPacketDecoder;
utilityTools.inherits(VideoPacketDecoder, FlowInterface);

function VideoPacketDecoder() {
    FlowInterface.call(this);

    this.canWrite = true;
    this.canRead  = true;

    this._dataProcessor  = dataBuffer.createReader();
    this._processingPhase = 'metadata';
    this._bytesRemaining  = undefined;
    // Consideration: implement logic to fast-forward to the nearest keyframe.
    this._videoFrameKind  = undefined;
}

VideoPacketDecoder.PACKET_METADATA_LENGTH = 68; // Older versions used 64, but this value accommodates both.

VideoPacketDecoder.prototype.processIncomingData = function (inputBuffer) {
    let dataProcessor = this._dataProcessor
      , packetIdentifier
      , metadataSize
      , availableBytes
      ;

    dataProcessor.write(inputBuffer);

    while (true) {
        switch (this._processingPhase) {
        case 'metadata':
            if (dataProcessor.bytesAhead() < VideoPacketDecoder.PACKET_METADATA_LENGTH) {
                return true; // Await more data for the full header.
            }
            packetIdentifier = dataProcessor.ascii(4);

            if (packetIdentifier !== 'PaVE') { // Expected packet identifier.
                // Action: Implement a mechanism to resynchronize with the next valid PVEN packet.
                this.emit('parsingError', new Error(
                    'Unexpected packet signature: ' + JSON.stringify(packetIdentifier)
                ));
                return; // Stop processing this erroneous buffer segment.
            }

            dataProcessor.skip(2); // Skip reserved bytes.
            metadataSize = dataProcessor.uint16LE(); // Length of the header.
            // Content length:
            this._bytesRemaining = dataProcessor.uint32LE();
            // Advance past several descriptive fields:
            // Encoded dimensions (width/height): 2 bytes each
            // Display dimensions (width/height): 2 bytes each
            // Frame sequence number: 4 bytes
            // Time marker: 4 bytes
            // Total segments count: 1 byte
            // Segment index: 1 byte
            dataProcessor.skip(18);
            this._videoFrameKind = dataProcessor.uint8(); // Type of the video frame.

            // Bytes processed: 4 (signature) + 2 (reserved) + 2 (header size) + 4 (payload size) + 18 (various fields) + 1 (frame type) = 31.
            // Skip the rest of the metadata block.
            dataProcessor.skip(metadataSize - 31);

            this._processingPhase = 'content'; // Transition to reading the actual frame data.
            break;

        case 'content':
            availableBytes = dataProcessor.bytesAhead();
            if (availableBytes < this._bytesRemaining) {
                return true; // Still waiting for the complete video payload.
            }

            // Discard the NAL unit start code (typically 4 bytes: 0x00 0x00 0x00 0x01).
            dataProcessor.skip(4);
            this._bytesRemaining -= 4; // Adjust remaining bytes after skipping NALU prefix.

            this.dispatchVideoData(dataProcessor.buffer(this._bytesRemaining), this._videoFrameKind);
            this._bytesRemaining = undefined; // Reset for the next packet.
            this._processingPhase = 'metadata'; // Return to header parsing for the next packet.
            break;
        }
    }
};


VideoPacketDecoder.prototype.dispatchVideoData = function (videoContent, frameCategory) {
    let previousStart = 0
      , idx
      , limit
      ;
    if (frameCategory === 1) { // This indicates an I-Frame (keyframe), which might contain multiple NAL units.
        // For I-frames, additional splitting might be beneficial.
        // Optimization note: this loop can be made more efficient.
        for (idx = 0, limit = videoContent.length - 4; idx < limit; idx++) {
            if (
                videoContent[idx]     === 0x00 &&
                videoContent[idx + 1] === 0x00 &&
                videoContent[idx + 2] === 0x00 &&
                videoContent[idx + 3] === 0x01
            ) { // Detected a NAL unit start code.
                if (previousStart < idx) {
                    this.emit('payload', videoContent.slice(previousStart, idx)); // Emit the preceding NAL unit.
                    previousStart = idx + 4; // Update the start for the next unit.
                    idx += 4; // Advance index past the start code.
                }
            }
        }
        this.emit('payload', videoContent.slice(previousStart)); // Emit any remaining data as the last NAL unit.
    } else {
        this.emit('payload', videoContent); // For other frame types, emit the entire content as is.
    }
};

VideoPacketDecoder.prototype.finishProcessing = function () {
    // No explicit cleanup needed here, but required for stream compatibility.
};