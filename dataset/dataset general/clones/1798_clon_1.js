/*
 * This is a Type I clone of an original JavaScript worker script.
 * The core logic and identifiers are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally identical, copy.
 */

// Global variables for audio recording and processing state
var recLength = 0,    // Total length of recorded audio across all buffers
    recBuffersL = [], // Array to hold left channel audio buffers
    recBuffersR = [], // Array to hold right channel audio buffers (currently unused but kept for potential stereo)
    bits        = 16, // Bit depth for audio (e.g., 16-bit PCM)
    sampleRate;       // Audio sample rate, initialized during 'init' command


/**
 * Event handler for messages received by the Web Worker.
 * It dispatches commands based on the 'e.data.command' property.
 * @param {MessageEvent} e - The message event object.
 */
this.onmessage = function ( e ) {

  // A switch statement to handle various commands sent to the worker
  switch ( e.data.command ) {

    case 'init':
      // Initialize the worker with configuration settings
      init( e.data.config );
      break;

    case 'record':
      // Record a new audio buffer segment
      record( e.data.buffer );
      break;

    case 'exportWAV':
      // Export the recorded audio as a WAV blob
      exportWAV( e.data.type );
      break;

    case 'getBuffer':
      // Retrieve the raw audio buffers
      getBuffer();
      break;

    case 'clear':
      // Clear all recorded audio data
      clear();
      break;

    // No default case needed as all expected commands are handled.
  }
};


/**
 * Initializes the worker with a given configuration.
 * Currently, it only sets the sample rate.
 * @param {object} config - Configuration object, should contain 'sampleRate'.
 */
function init( config ) {
  // Store the audio sample rate from the configuration
  sampleRate = config.sampleRate;
}


/**
 * Records a new audio input buffer.
 * Assumes a mono input for now, but `inputBuffer[1]` is commented out for stereo.
 * @param {Float32Array[]} inputBuffer - An array containing Float32Arrays for each channel.
 */
function record( inputBuffer ) {
  // Push the left channel's buffer into the collection
  recBuffersL.push( inputBuffer[0] );
  // recBuffersR.push(inputBuffer[1]); // This line is commented out, implying mono recording.
  // Increment the total recorded length by the current buffer's length
  recLength += inputBuffer[0].length;
}


/**
 * Exports the recorded audio as a WAV Blob.
 * It merges buffers, encodes them, and posts the resulting Blob back to the main thread.
 * @param {string} type - The MIME type for the audio blob (e.g., 'audio/wav').
 */
function exportWAV( type ) {
  // Merge all left channel buffers into a single Float32Array
  var bufferL = mergeBuffers( recBuffersL, recLength );

  // The following lines are commented out, indicating mono output.
  // var bufferR = mergeBuffers(recBuffersR, recLength);
  // var interleaved = interleave(bufferL, bufferR);
  // var dataview = encodeWAV(interleaved);

  // Encode the merged left channel buffer into a WAV DataView
  var dataview = encodeWAV( bufferL );

  // Create a Blob from the DataView with the specified MIME type
  var audioBlob = new Blob( [dataview], { type: type } );

  // Post the generated audio Blob back to the main thread
  this.postMessage( audioBlob );
}


/**
 * Retrieves the raw merged audio buffers for both channels (even if right is empty).
 * Posts an array containing the merged left and right buffers.
 */
function getBuffer() {
  // Array to hold the merged buffers
  var buffers = [];

  // Merge left channel buffers and add to the array
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  // Merge right channel buffers (might be empty) and add to the array
  buffers.push( mergeBuffers(recBuffersR, recLength) );

  // Post the array of merged buffers back to the main thread
  this.postMessage( buffers );
}


/**
 * Clears all recorded audio data and resets the recording length.
 */
function clear() {
  // Reset the total recorded length
  recLength = 0;
  // Clear the left channel buffers array
  recBuffersL = [];
  // Clear the right channel buffers array
  recBuffersR = [];
}


/**
 * Merges an array of Float32Arrays into a single Float32Array.
 * @param {Float32Array[]} recBuffers - An array of audio buffers.
 * @param {number} recLength - The total expected length of the merged buffer.
 * @returns {Float32Array} - The single merged audio buffer.
 */
function mergeBuffers( recBuffers, recLength ) {
  // Create a new Float32Array to hold the merged result
  var result = new Float32Array( recLength );
  // Initialize an offset to track the current position in the result buffer
  var offset = 0;

  // Iterate through each buffer in the input array
  for ( var i = 0; i < recBuffers.length; i++ ) {
    // Set (copy) the current buffer into the result at the specified offset
    result.set( recBuffers[i], offset );
    // Advance the offset by the length of the buffer just copied
    offset += recBuffers[i].length;
  }
  // Return the complete merged buffer
  return result;
}


/**
 * Interleaves two mono Float32Arrays into a single stereo Float32Array.
 * (This function is not used in the current mono export WAV logic, but is present.)
 * @param {Float32Array} inputL - Left channel audio data.
 * @param {Float32Array} inputR - Right channel audio data.
 * @returns {Float32Array} - Interleaved stereo audio data.
 */
function interleave( inputL, inputR ) {
  // Calculate the total length of the interleaved buffer
  var length = inputL.length + inputR.length;
  // Create a new Float32Array for the interleaved result
  var result = new Float32Array( length );

  // Initialize indices for the result and input buffers
  var index      = 0,
      inputIndex = 0;

  // Loop until the entire result buffer is filled
  while ( index < length ) {
    // Place left channel sample, then increment result index
    result[index++] = inputL[inputIndex];
    // Place right channel sample, then increment result index
    result[index++] = inputR[inputIndex];
    // Increment the input buffer index for the next pair of samples
    inputIndex++;
  }
  // Return the interleaved stereo buffer
  return result;
}


/**
 * Converts a Float32Array of audio samples to 16-bit PCM format
 * and writes it into a DataView.
 * @param {DataView} output - The DataView to write the PCM data into.
 * @param {number} offset - The starting byte offset in the DataView.
 * @param {Float32Array} input - The Float32Array of audio samples (normalized between -1 and 1).
 */
function floatTo16BitPCM( output, offset, input ) {
  // Iterate through each sample in the input Float32Array
  for ( var i = 0; i < input.length; i++, offset += 2 ) { // offset increments by 2 bytes for 16-bit
    // Clamp the float sample to the range [-1, 1]
    var s = Math.max( -1, Math.min( 1, input[i] ) );
    // Convert float to 16-bit integer (signed) and write to DataView
    // Negative values scale to 0x8000 (-32768), positive to 0x7FFF (32767)
    output.setInt16( offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true );
  }
}


/**
 * Writes a string into a DataView at a specified offset.
 * Useful for writing WAV file headers (e.g., 'RIFF', 'WAVE').
 * @param {DataView} view - The DataView to write into.
 * @param {number} offset - The starting byte offset in the DataView.
 * @param {string} string - The string to write.
 */
function writeString( view, offset, string ) {
  // Iterate through each character of the string
  for ( var i = 0; i < string.length; i++ ) {
    // Write the character's ASCII code (as Uint8) to the DataView
    view.setUint8( offset + i, string.charCodeAt(i) );
  }
}


/*
 * This function 'encodeLowWAV' is completely commented out in the original code.
 * It's kept here as a commented block, preserving its structure and any internal comments.
 * It represents an alternative or older WAV encoding approach.
 */
/*
function encodeLowWAV(samples) {
    var block_align   = (1 * bits) / 8
    ,   byte_rate     = sampleRate * block_align
    ,   data_size     = (samples.length * bits) / 8
    ,   buffer        = new ArrayBuffer(44 + data_size)
    ,   view          = new DataView(buffer);

    writeString( view, 0, 'RIFF' );
    view.setUint32( 4, 32 + data_size, true ); //!!! This comment is from the original.
    writeString( view, 8, 'WAVE' );
    writeString( view, 12, 'fmt ' ); // Note the space in 'fmt '
    view.setUint32( 16, 16, true );
    view.setUint16( 20, 1, true );
    view.setUint16( 22, 1, true ); // Mono channel count
    view.setUint32( 24, sampleRate, true );
    view.setUint32( 28, byte_rate, true );
    view.setUint16( 32, block_align, true );
    view.setUint16( 34, bits, true ); // Bits per sample
    writeString( view, 36, 'data' );
    view.setUint32( 40, data_size, true ); //!!! Another original comment.
    floatTo16BitPCM( view, 44, samples );

    return view;
}
*/


/**
 * Encodes audio samples into a standard WAV file format DataView.
 * This function generates a mono, 16-bit PCM WAV header and data chunk.
 * @param {Float32Array} samples - The audio samples (normalized between -1 and 1).
 * @returns {DataView} - A DataView representing the complete WAV file.
 */
function encodeWAV( samples ) {
  // Create an ArrayBuffer large enough for the WAV header (44 bytes) plus audio data
  // Each sample is 2 bytes (16-bit PCM)
  var buffer = new ArrayBuffer( 44 + samples.length * 2 );
  // Create a DataView to manipulate the buffer's bytes
  var view = new DataView( buffer );

  /* RIFF identifier 'RIFF' */
  writeString( view, 0, 'RIFF' );
  /* File length (32 bytes for header + data size) */
  view.setUint32( 4, 32 + samples.length * 2, true );
  /* RIFF type 'WAVE' */
  writeString( view, 8, 'WAVE' );
  /* Format chunk identifier 'fmt ' */
  writeString( view, 12, 'fmt ' );
  /* Format chunk length (16 for PCM) */
  view.setUint32( 16, 16, true );
  /* Sample format (1 for PCM) */
  view.setUint16( 20, 1, true );

  /* Channel count */
  // The original had a stereo option commented out: view.setUint16(22, 2, true); /*STEREO*/
  view.setUint16( 22, 1, true ); /* MONO CHANNEL COUNT */

  /* Sample rate */
  view.setUint32( 24, sampleRate, true );

  /* Byte rate (sample rate * block align) */
  // The original had a stereo option commented out: view.setUint32(28, sampleRate * 4, true); /*STEREO*/
  view.setUint32( 28, sampleRate * 2, true ); /* MONO BYTE RATE (sampleRate * 2 bytes/sample) */

  /* Block align (channel count * bytes per sample) */
  // The original had a stereo option commented out: view.setUint16(32, 4, true); /*STEREO*/
  view.setUint16( 32, 2, true ); /* MONO BLOCK ALIGN (1 channel * 2 bytes/sample) */

  /* Bits per sample (16-bit) */
  view.setUint16( 34, 16, true );

  /* Data chunk identifier 'data' */
  writeString( view, 36, 'data' );
  /* Data chunk length (total bytes of audio data) */
  view.setUint32( 40, samples.length * 2, true );

  // Convert the Float32Array samples to 16-bit PCM and write them into the DataView
  floatTo16BitPCM( view, 44, samples );

  // Return the DataView, which can be used to create a Blob
  return view;
}