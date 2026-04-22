/*
 * This file contains a JavaScript implementation for parsing Parrot Video Encapsulation (PaVE) streams.
 * It's designed to process H264 (MPEG4.10 AVC) video frames received from an AR Drone 2.0 TCP client.
 *
 * Original inspiration derived from Felix Geisendörfer's PaVEParser.js:
 * @see https://github.com/felixge/node-ar-drone/blob/master/lib/video/PaVEParser.js
 *
 * The primary purpose of this parser is to extract raw H264 data from the PaVE containers
 * emitted by the drone, allowing further processing or decoding.
 */

'use strict' ; // Enforce strict mode for cleaner, safer code execution.


var util = require('util') // Core Node.js utility module for various tasks.
  , Stream = require('stream').Stream // The base Stream class from Node.js, for event emission and piping.
  , buffy = require('buffy') // A buffer utility library for easy reading of binary data.
  ; // End of variable declarations for required modules.


module.exports = PaVEParser; // Export the PaVEParser constructor.

util.inherits(PaVEParser, Stream); // Make PaVEParser inherit from Node.js's EventEmitter (via Stream).


/**
 * PaVEParser constructor.
 * Initializes the parser's internal state and sets up stream properties.
 */
function PaVEParser ( )
{
    // Call the parent Stream constructor to properly initialize `this`.
    Stream.call( this );


    this.writable = true ; // Indicate that this stream can be written to.
    this.readable = true ; // Indicate that this stream can be read from (emits 'data' events).

    // Internal buffer reader for parsing incoming data chunks.
    this._parser = buffy.createReader( ) ;

    // Current state of the parser, initially expecting a PaVE header.
    this._state = 'header' ;

    // Number of bytes remaining to read for the current payload.
    this._toRead = undefined ;

    // Placeholder for frame type information (e.g., I-frame, P-frame).
    this._frame_type = undefined ;

    // TODO: Implement a more robust search mechanism to find the last I-Frame
    //       in case of stream corruption or late join.
}


// Define the expected size of a PaVE header.
// Note: Older firmwares might use 64 bytes, but 68 bytes is compatible.
PaVEParser.HEADER_SIZE = 68 ;


/**
 * Processes incoming data buffers. This is the core parsing logic.
 *
 * @param {Buffer} buffer - The incoming data chunk to be processed.
 * @returns {boolean} Always returns `true` to indicate successful processing (or pending).
 */
PaVEParser.prototype.write = function (buffer)
{
    var parser = this._parser // Shortcut to the internal buffy reader.
      , signature // Holds the 4-byte PaVE signature.
      , header_size // The size of the current PaVE header.
      , readable // Number of bytes available in the parser's buffer.
      ;

    // Write the new buffer chunk into the internal parser buffer.
    parser.write(buffer);

    // Loop continuously to process all available data in the buffer
    // until more data is needed or an error occurs.
    while ( true )
    {
        // State machine for parsing different parts of the PaVE stream.
        switch ( this._state )
        {
            case 'header':
                // Check if enough bytes are available to read the full header.
                if ( parser.bytesAhead( ) < PaVEParser.HEADER_SIZE )
                {
                    return true ; // Not enough data, wait for more.
                }

                // Read the 4-byte signature to verify it's a PaVE frame.
                signature = parser.ascii(4);

                // If the signature is not 'PaVE', something is wrong.
                if ( signature !== 'PaVE' )
                {
                    // TODO: Implement a mechanism to skip forward and find the next valid PaVE frame
                    //       instead of just emitting an error and stopping.
                    this.emit( 'error', new Error(
                        'Invalid signature encountered: ' + JSON.stringify(signature)
                    ) );
                    return ; // Stop processing this frame due to invalid signature.
                }

                // Skip 2 bytes (likely version/flags, not used here).
                parser.skip( 2 ) ;

                // Read the actual header size.
                header_size = parser.uint16LE( ) ;

                // Read the size of the video payload that follows.
                this._toRead = parser.uint32LE( ) ;

                // Skip over 18 bytes of various metadata fields:
                // - encoded_stream_width (2 bytes)
                // - encoded_stream_height (2 bytes)
                // - display_width (2 bytes)
                // - display_height (2 bytes)
                // - frame_number (4 bytes)
                // - timestamp (4 bytes)
                // - total_chunks (1 byte)
                // - chunk_index (1 byte)
                parser.skip( 18 ) ;

                // Read the frame type (e.g., 1 for I-frame, 2 for P-frame).
                this._frame_type = parser.uint8( ) ;

                // Calculate bytes consumed so far for validation/debugging:
                // 4 (signature) + 2 (skipped) + 2 (header_size) + 4 (payload_size) + 18 (skipped metadata) + 1 (frame_type) = 31 bytes.
                // Skip any remaining bytes in the header to align with the payload start.
                parser.skip( header_size - 31 ) ;

                // Transition to the 'payload' state to read the video data.
                this._state = 'payload' ;
                break ; // Exit the switch, continue the while loop to process payload if enough data.

            case 'payload':
                // Check how many bytes are currently available in the parser's buffer.
                readable = parser.bytesAhead( ) ;

                // If not enough data for the full payload, wait for more.
                if ( readable < this._toRead )
                {
                    return true ; // Return true, indicating more data is needed.
                }

                // H264 streams often start with a 4-byte NAL unit boundary (0x00 0x00 0x00 0x01).
                // Skip this boundary as it's typically not part of the actual video data to be processed by decoders.
                parser.skip( 4 ) ;
                this._toRead -= 4 ; // Adjust the remaining bytes count.

                // Extract the actual video data payload.
                // Then, emit it along with its frame type.
                this.sendData( parser.buffer(this._toRead), this._frame_type ) ;

                this._toRead = undefined ; // Reset payload size.
                this._state = 'header' ; // Transition back to 'header' to look for the next frame.
                break ; // Exit the switch, continue the while loop for the next frame.
        }
    }
} ;


/**
 * Helper function to emit parsed video data.
 * For I-frames, it attempts to split the data into smaller NAL units.
 *
 * @param {Buffer} data - The raw H264 video data.
 * @param {number} frametype - The type of the frame (e.g., 1 for I-frame).
 */
PaVEParser.prototype.sendData = function ( data, frametype )
{
    var lastBegin = 0 , // Marks the start of the current NAL unit.
        i , // Loop counter.
        l ; // Loop limit.

    // If it's an I-frame (key frame), attempt to split it into individual NAL units.
    // This can be useful for decoders that prefer NAL units individually.
    if ( frametype === 1 )
    {
        // TODO: This splitting logic can be optimized for performance.
        // Iterate through the buffer, looking for NAL unit start codes (0x00 0x00 0x00 0x01).
        for ( i = 0, l = data.length - 4 ; i < l ; i++ )
        {
            if (
                data[i] === 0 &&
                data[i + 1] === 0 &&
                data[i + 2] === 0 &&
                data[i + 3] === 1
            )
            {
                // Found a NAL unit start code.
                // If there's data before this start code, emit it as a NAL unit.
                if ( lastBegin < i )
                {
                    this.emit( 'data', data.slice(lastBegin, i) ) ;
                }
                lastBegin = i + 4 ; // Update lastBegin to the start of the next NAL unit.
                i += 4 ; // Advance 'i' past the start code to avoid re-checking these bytes.
            }
        }
        // Emit any remaining data as the last NAL unit.
        this.emit( 'data', data.slice(lastBegin) ) ;
    }
    else
    {
        // For other frame types (e.g., P-frames), emit the data as a single chunk.
        this.emit( 'data', data ) ;
    }
} ;


/**
 * Handles the 'end' event from the writable stream.
 * Currently, no specific cleanup is required here, but the method
 * is present to prevent 'pipe()' from complaining if it expects one.
 */
PaVEParser.prototype.end = function ( )
{
    // No explicit action needed for PaVEParser upon stream end.
    // The internal buffer will be garbage collected.
} ;