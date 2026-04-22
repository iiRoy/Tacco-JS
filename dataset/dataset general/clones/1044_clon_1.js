/*
 * WaveEncoder
 *
 * This utility class facilitates the conversion of numerical arrays
 * (specifically, those containing values ranging from 0 to 1)
 * into a base64-encoded data URI format.
 *
 * The core of this encoding process is an optimized base64 algorithm
 * which operates on 16-bit words for efficiency.
 *
 * A significant advantage of this implementation is its independence
 * from the standard `window.btoa` function, meaning it is fully
 * compatible with and usable within Web Worker threads, enhancing
 * performance for intensive audio processing tasks.
 *
 * Original Copyright (c) 2012, Fritz Obermeyer
 * This software is made available under a dual license:
 * Either the MIT License or the GPL Version 2 License.
 * For more details, please refer to the following URLs:
 * http://www.opensource.org/licenses/MIT
 * http://www.opensource.org/licenses/GPL-2.0
 */

var  WavEncoder =  ( function () {

  // --- Exception Handling Utilities ---

    /**
     * @constructor
     * Custom exception type for WavEncoder-specific errors.
     * @param {string} [message] - An optional descriptive error message.
     */
  WavEncoderException = function ( message ) {
    this.message = message || '(unspecified)';
  };

  /**
   * Provides a string representation of the WavEncoderException.
   * @returns {string} The formatted error message.
   */
  WavEncoderException.prototype.toString = function () {
    return 'WavEncoder Error: ' + this.message;
  };

  /**
   * Asserts that a given condition is true. Throws WavEncoderException if false.
   * @param {boolean} condition - The condition to evaluate.
   * @param {string} message - The error message to use if the condition is false.
   */
  var assert = function ( condition ,  message ) {
    if  ( ! condition )  {
      throw  new  WavEncoderException( message );
    }
  };

  /**
   * Asserts that two values are strictly equal. Provides detailed error message if not.
   * Handles non-string inputs by converting them to JSON strings for comparison.
   * @param {*} actual - The actual value.
   * @param {*} expected - The expected value.
   * @param {string} [message] - An optional prefix for the error message.
   */
  var assertEqual = function ( actual ,  expected ,  message ) {
    if  ( ! ( actual  instanceof  String )  ||  ! ( expected  instanceof  String ) )  {
        actual = JSON.stringify( actual );
        expected = JSON.stringify( expected );
    }
    assert( actual  ===  expected ,
            ( message  ||  '' )  +
            '\n    actual   = '  +  actual  +
            '\n    expected = '  +  expected );
  };


  // --- Main WavEncoder Class Definition ---

  /**
   * @constructor
   * Initializes a new WavEncoder instance.
   * This constructor sets up the WAV header based on the provided audio parameters.
   *
   * @param {number} numSamples - The total number of audio samples to be encoded.
   * @param {object} [options] - Configuration options for the WAV file.
   * @param {number} [options.bytesPerSample=2] - Number of bytes per audio sample (e.g., 1 for 8-bit, 2 for 16-bit).
   * @param {number} [options.numChannels=1] - Number of audio channels (e.g., 1 for mono, 2 for stereo).
   * @param {number} [options.sampleRateHz=22050] - Sample rate in Hertz (e.g., 44100, 22050).
   * @param {boolean} [options.clip=true] - Whether to apply clipping (normalization) to samples.
   */
  var WavEncoder = function ( numSamples ,  options ) {

    // Store the number of samples, essential for data chunk sizing.
    this.numSamples = numSamples ;

    // Merge provided options with default values
    options = options  ||  {} ;
    var defaults = WavEncoder.defaults ;

    // Determine audio format parameters, prioritizing options over defaults
    var bytesPerSample = options.bytesPerSample  ||  defaults.bytesPerSample ;
    var numChannels    = options.numChannels     ||  defaults.numChannels ;
    var sampleRateHz   = options.sampleRateHz    ||  defaults.sampleRateHz ;

    // Handle the 'clip' option, ensuring it's a boolean
    this.clip          = 'clip'  in  options  ?  !! options.clip  :  defaults.clip ;


    // --- WAV Header Calculation ---

    // Define standard PCM format code
    var PCM_FORMAT = 1 ;
    // Calculate bits per sample from bytes per sample
    var bitsPerSample = bytesPerSample  *  8 ;
    // Calculate byte rate (bytes per second)
    var byteRateHz = sampleRateHz  *  bytesPerSample  *  numChannels ;
    // Calculate block alignment (bytes per sample frame)
    var byteAlignment = numChannels  *  bytesPerSample ;

    // Define sizes of various WAV chunks
    var formatBytes = 16 ; // Size of the 'fmt ' subchunk
    var dataBytes = numSamples  *  bytesPerSample  *  numChannels ; // Size of the 'data' subchunk
    var chunkBytes = 4  +  ( 8  +  formatBytes )  +  ( 8  +  dataBytes ) ; // Total size of the RIFF chunk (file size - 8 bytes)


    // --- Method Assignment for Encoding ---

    // Cache prototype methods for cleaner access within the constructor
    var getString = this._getString ;
    var getUint16 = this._getUint16 ;
    var getUint32 = this._getUint32 ;

    // Assign the appropriate encoding function based on bytesPerSample
    switch  ( bytesPerSample )  {
      case  1 :
        this.encode = this._encode8 ; // Use 8-bit encoder
        break ;

      case  2 :
        this.encode = this._encode16 ; // Use 16-bit encoder
        break ;

      default :
        // Throw an error for unsupported sample sizes
        throw  new  WavEncoderException(
          'unsupported bytesPerSample: '  +  bytesPerSample
        );
    }


    // --- Initialize WAV Header Words Array ---

    // The 'words' array will hold the 16-bit word representation of the WAV header
    // and will later be extended to include the audio data.
    var words = this.words = [].concat(
        // RIFF Chunk Descriptor
        getString( 'RIFF' ) ,

        // Total file size minus 8 bytes (RIFF and chunk size fields themselves)
        getUint32( chunkBytes ) ,
        getString( 'WAVE' ) ,

        // Format Subchunk
        getString( 'fmt ' ) ,
        getUint32( formatBytes ) ,      // Size of the 'fmt ' subchunk (16 for PCM)
        getUint16( PCM_FORMAT ) ,       // Audio format (1 for PCM)
        getUint16( numChannels ) ,      // Number of channels
        getUint32( sampleRateHz ) ,     // Sample rate
        getUint32( byteRateHz ) ,       // Byte rate (SampleRate * NumChannels * BytesPerSample)
        getUint16( byteAlignment ) ,    // Block alignment (NumChannels * BytesPerSample)
        getUint16( bitsPerSample ) ,    // Bits per sample

        // Data Subchunk
        getString( 'data' ) ,
        getUint32( dataBytes ) ,        // Size of the 'data' subchunk
        [] // Placeholder for audio data
    );

    // Calculate the number of 16-bit words required for the data section
    var bytesPerWord = 2 ;
    var dataWords = dataBytes  /  bytesPerWord ;

    // Resize the words array to accommodate the header and the expected data
    words.length = this._headerWords  +  dataWords ;

    // Pad the words array with zeros if its length is not a multiple of 3.
    // This is crucial for the base64 encoding process which groups 3 words at a time.
    while  ( words.length  %  3 )  words.push( 0 );
  };

  /**
   * Prototype methods for the WavEncoder class.
   * Contains helper functions for converting various data types into
   * 16-bit word arrays suitable for the WAV header, and the actual
   * audio encoding logic.
   */
  WavEncoder.prototype = {

    // Pre-calculated sizes for the WAV header
    _headerBytes: 44 , // Total bytes in the WAV header
    _headerWords: 22 , // Total 16-bit words in the WAV header (44 bytes / 2 bytes/word)

    /**
     * Converts a string into an array of 16-bit words.
     * Each word contains two ASCII characters, with the first char in the high byte.
     *
     * @param {string} s - The input string. Must have an even length.
     * @returns {number[]} An array of 16-bit words.
     */
    _getString: function ( s ) {
      assert( s.length  %  2  ===  0 ,  'expected a string length to be even' );
      var result = [];
      for  ( var i = 0 ,  I = s.length ;  i  <  I ;  i  +=  2 )  {
        var c1 = s.charCodeAt( i  +  0 );
        var c2 = s.charCodeAt( i  +  1 );
        assert( c1  <  256 ,  'bad character: '  +  c1 );
        assert( c2  <  256 ,  'bad character: '  +  c2 );
        result.push( ( c1  <<  8 )  |  c2 );
      }
      return result ;
    } ,

    /**
     * Converts a 16-bit unsigned integer into an array of one 16-bit word,
     * with bytes swapped to little-endian format.
     *
     * @param {number} i - The 16-bit unsigned integer.
     * @returns {number[]} An array containing one 16-bit word.
     */
    _getUint16: function ( i ) {
      // Helper function to swap bytes within a 16-bit word
      var swapBytes = function ( j )  {  return  ( ( j  >>  8 )  |  ( j  <<  8 ) )  &  65535 ;  };
      return  [ i  &  65535 ].map( swapBytes );
    } ,

    /**
     * Converts a 32-bit unsigned integer into an array of two 16-bit words,
     * with bytes swapped to little-endian format for each word.
     *
     * @param {number} i - The 32-bit unsigned integer.
     * @returns {number[]} An array containing two 16-bit words.
     */
    _getUint32: function ( i ) {
      // Re-using the byte-swapping helper from _getUint16
      var swapBytes = function ( j )  {  return  ( ( j  >>  8 )  |  ( j  <<  8 ) )  &  65535 ;  };
      // Split the 32-bit integer into two 16-bit parts and then swap bytes
      return  [ i  &  65535 ,  ( i  >>  16 )  &  65535 ].map( swapBytes );
    } ,

    /**
     * Encodes an array of 8-bit audio samples into the pre-initialized WAV word array.
     * This method is specifically optimized for 8-bit mono audio.
     *
     * @param {number[]} samples - An array of audio samples (normalized [0,1] or similar).
     * @returns {string} The base64-encoded data URI of the WAV file.
     */
    _encode8: function ( samples ) {
      // This implementation is hard-coded for 8-bit mono audio.
      // Assumes input samples are floating-point values in a specific range.

      assertEqual( samples.length ,  this.numSamples ,  'Wrong number of samples' );

      var floor = Math.floor ; // Cache Math.floor for performance
      var sqrt = Math.sqrt ;   // Cache Math.sqrt for performance
      var clip = this.clip ;   // Get clipping preference

      var words = this.words ; // Reference to the main words array
      var h = this._headerWords ; // Starting index for audio data in the words array

      // Process samples in pairs to fill 16-bit words efficiently
      for  ( var t = 0 ,  T = this.numSamples  -  1 ;  t  <  T ;  t  +=  2 )  {
        var x1 = samples[ t  +  0 ];
        var x2 = samples[ t  +  1 ];

        // Apply clipping if enabled
        if  ( clip )  {
          x1 /= sqrt( 1  +  x1  *  x1 );
          x2 /= sqrt( 1  +  x2  *  x2 );
        }

        // Convert normalized samples to 8-bit unsigned format (0-255)
        // 8-bit WAV samples are unsigned, hence the (x + 1) * 128
        var sample1 = floor( 128  *  ( x1  +  1 ) );
        var sample2 = floor( 128  *  ( x2  +  1 ) );

        // Pack two 8-bit samples into one 16-bit word
        words[ h++ ] = ( sample1  <<  8 )  |  sample2 ;
      }

      // Handle the last sample if the total number of samples is odd
      if  ( this.numSamples  %  2 )  {
        var x1 = samples[ t  +  0 ];
        if  ( clip )  x1 /= sqrt( 1  +  x1  *  x1 );
        var sample1 = floor( 128  *  ( x1  +  1 ) );
        // For an odd number of samples, the last sample occupies the high byte, low byte is zero
        words[ h++ ] = sample1  <<  8 ;
      }

      // Once all samples are packed, convert the entire words array to base64
      return this._encodeWords();
    } ,

    /**
     * Encodes an array of 16-bit audio samples into the pre-initialized WAV word array.
     * This method is specifically optimized for 16-bit mono audio.
     *
     * @param {number[]} samples - An array of audio samples (normalized [-1,1] or similar).
     * @returns {string} The base64-encoded data URI of the WAV file.
     */
    _encode16: function ( samples ) {
      // This implementation is hard-coded for 16-bit mono audio.
      // Assumes input samples are floating-point values in a specific range.

      assertEqual( samples.length ,  this.numSamples ,  'Wrong number of samples' );

      var floor = Math.floor ; // Cache Math.floor for performance
      var sqrt = Math.sqrt ;   // Cache Math.sqrt for performance
      var clip = this.clip ;   // Get clipping preference

      var words = this.words ; // Reference to the main words array
      var h = this._headerWords ; // Starting index for audio data in the words array

      // Process each sample individually
      for  ( var t = 0 ,  T = this.numSamples ;  t  <  T ;  ++t )  {
        var x = samples[ t ];

        // Apply clipping if enabled
        if  ( clip )  x /= sqrt( 1  +  x  *  x );

        // Convert normalized samples to 16-bit signed format (-32768 to 32767)
        // 16-bit WAV samples are signed.
        var sample = floor( 32768  *  x );

        // Convert to 2's complement representation if negative,
        // effectively treating it as unsigned for bitwise operations.
        if  ( sample  <  0 )  sample  +=  65536 ; // Add 2^16 for 2's complement

        // Swap bytes (little-endian) and store the 16-bit sample
        words[ h++ ] = ( ( sample  >>  8 )  |  ( sample  <<  8 ) )  &  65535 ;
      }

      // Once all samples are packed, convert the entire words array to base64
      return this._encodeWords();
    } ,

    /**
     * Converts the internal array of 16-bit words (header + data) into
     * a base64-encoded data URI string.
     * This method uses a custom base64 encoding scheme optimized for 16-bit words.
     *
     * @returns {string} The complete base64-encoded data URI.
     */
    _encodeWords: function () {
      var words = this.words ;               // The array of 16-bit words to encode
      var pairTable = WavEncoder._pairTable ; // Pre-computed table for efficient base64 character pair lookup

      // Initialize result array with estimated size, plus space for the data URI prefix
      var result = new Array( 1  +  words.length  *  4/3 );
      var r = 0 ;

      // Add the data URI prefix
      result[ r++ ] = 'data:audio/wav;base64,' ;

      // Iterate through the words array, processing three 16-bit words at a time
      // to produce four 6-bit base64 characters.
      for  ( var r = 1 ,  t = 0 ,  T = words.length ;  t  <  T ; )  {
        // Fetch three 16-bit words
        var a16 = words[ t++ ]; // First 16-bit word
        var b16 = words[ t++ ]; // Second 16-bit word
        var c16 = words[ t++ ]; // Third 16-bit word

        // The base64 encoding scheme here takes three 16-bit words (48 bits total)
        // and converts them into four 12-bit values. Each 12-bit value is then mapped
        // to a pair of base64 characters using the precomputed pairTable.
        // This is a custom optimization, not standard base64 directly on bytes.

        // Visual representation of bit re-arrangement:
        // Original 16-bit words:
        // AAAA AAAA AAAA AAAA
        // BBBB BBBB BBBB BBBB
        // CCCC CCCC CCCC CCCC
        //
        // Derived 12-bit values (for base64 pairs):
        // a12: AAAA AAAA AAAA (first 12 bits of a16)
        // b12: AAAA BBBB BBBB (last 4 bits of a16, first 8 bits of b16)
        // c12: BBBB CCCC CCCC (last 8 bits of b16, first 4 bits of c16)
        // d12: CCCC CCCC CCCC (last 12 bits of c16)

        var a12 = ( a16  >>  4 )  &  4095 ;
        var b12 = ( ( a16  <<  8 )  |  ( b16  >>  8 ) )  &  4095 ;
        var c12 = ( ( b16  <<  4 )  |  ( c16  >>  12 ) )  &  4095 ;
        var d12 = c16  &  4095 ;

        // Append the base64 character pairs to the result array
        result[ r++ ] = pairTable[ a12 ];
        result[ r++ ] = pairTable[ b12 ];
        result[ r++ ] = pairTable[ c12 ];
        result[ r++ ] = pairTable[ d12 ];
      }

      // Join all parts of the result array to form the final data URI string
      return result.join( '' );
    }
  };

  /**
   * Default configuration options for WavEncoder instances.
   * These values are used if corresponding options are not provided
   * during WavEncoder construction.
   */
  WavEncoder.defaults = {
    numChannels: 1 ,       // Default to mono audio
    sampleRateHz: 22050 ,  // Default sample rate of 22.05 kHz
    bytesPerSample: 2 ,    // Default to 16-bit audio
    clip: true             // Default to applying clipping/normalization
  };


  // --- Base64 Pair Table Initialization ---

  // This immediately-invoked function expression (IIFE) pre-computes
  // a lookup table for base64 character pairs. This optimizes the
  // `_encodeWords` method by avoiding repeated string concatenations
  // and character lookups within the main encoding loop.
  ( function () {

    // The standard base64 character set
    var charTable =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var pairTable = [];
    // Populate the pairTable for all possible 12-bit combinations (0 to 4095)
    // Each 12-bit value is split into two 6-bit parts, which map to two base64 characters.
    for  ( var ij = 0 ,  IJ = 64  *  64 ;  ij  <  IJ ;  ++ij )  {
      pairTable[ ij ] = charTable[ ij  >>  6 ]  +  charTable[ ij  &  63 ];
    }

    // Attach the pre-computed table to the WavEncoder static properties
    WavEncoder._pairTable = pairTable ;
  } )();


  // --- Static Properties and Helper Function ---

  // Expose the custom exception type as a static property
  WavEncoder.Exception = WavEncoderException ;

  /**
   * Provides a convenient static method for one-off WAV encoding.
   * This function creates a new WavEncoder instance, encodes the provided data,
   * and returns the resulting data URI. It's suitable for single encoding tasks,
   * though creating an encoder instance directly is more efficient for
   * encoding multiple data sequences with the same parameters.
   *
   * @param {number[]} data - The array of audio samples to encode.
   * @param {object?} options - Optional configuration for the encoder (same as constructor).
   * @returns {string} The base64-encoded WAV data URI.
   */
  WavEncoder.encode = function ( data ,  options ) {
    var encoder = new WavEncoder( data.length ,  options );
    return encoder.encode( data );
  };

  // Return the WavEncoder constructor as the result of the IIFE
  return WavEncoder ;

}() ) ;