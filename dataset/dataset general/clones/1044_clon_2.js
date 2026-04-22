// This module provides an AudioProcessor to convert [0,1]-valued numeric arrays
// into base64-encoded data URIs.
// The optimized base64 conversion utilizes 16-bit unsigned integers.
//
// Because this encoder operates independently of 'window.btoa',
// it's suitable for use within Web Worker environments.
//
// Proprietor (c) 2012, F. Obermeyer
// Licensed under the MIT or GPL Version 2 terms.
// See: http://www.opensource.org/licenses/MIT
// See: http://www.opensource.org/licenses/GPL-2.0

var AudioProcessor = ( function () {

  // Constructor for custom error type
  var AudioProcessingError = function ( msgText ) {
    this.message = msgText || '(no specific message)';
  };
  AudioProcessingError.prototype.toString = function () {
    return 'AudioProcessor Fault: ' + this.message;
  };
  var ensureTrue = function ( testCondition, msgText ) {
    if ( !testCondition ) {
      throw new AudioProcessingError( msgText );
    }
  };
  var confirmEquality = function ( currentVal, anticipatedVal, msgText ) {
    if ( !( currentVal instanceof String ) || !( anticipatedVal instanceof String ) ) {
      currentVal = JSON.stringify( currentVal );
      anticipatedVal = JSON.stringify( anticipatedVal );
    }
    ensureTrue( currentVal === anticipatedVal,
      ( msgText || '' ) +
      '\n    actual value = ' + currentVal +
      '\n    expected value = ' + anticipatedVal );
  };

  // Main AudioProcessor constructor function
  var AudioProcessor = function ( sampleCount, config ) {

    this.sampleCount = sampleCount;

    config = config || {};
    var standardSettings = AudioProcessor.standardSettings;
    var octetsPerDatum = config.octetsPerDatum || standardSettings.octetsPerDatum;
    var channelQty     = config.channelQty     || standardSettings.channelQty;
    var samplingFrequency = config.samplingFrequency || standardSettings.samplingFrequency;
    this.truncateAmplitude = 'truncateAmplitude' in config ? !!config.truncateAmplitude : standardSettings.truncateAmplitude;

    var PULSE_CODE_MODULATION_TYPE = 1;
    var bitsPerDatum = octetsPerDatum * 8;
    var byteRatePerSecond = samplingFrequency * octetsPerDatum * channelQty;
    var byteAlignmentValue = channelQty * octetsPerDatum;

    var formatChunkSize = 16;
    var dataPayloadSize = sampleCount * octetsPerDatum * channelQty;
    var overallChunkSize = 4 + ( 8 + formatChunkSize ) + ( 8 + dataPayloadSize );

    var fetchStringBytes = this._fetchStringBytes;
    var fetchWord16 = this._fetchWord16;
    var fetchWord32 = this._fetchWord32;

    switch ( octetsPerDatum ) {
      case 1:
        this.process = this._processOctetStream;
        break;

      case 2:
        this.process = this._processWordStream;
        break;

      default: throw new AudioProcessingError(
            'unsupported octetsPerDatum value: ' + octetsPerDatum );
    }

    // Data is encoded using 16-bit words (unsigned shorts)
    var dataWords = this.dataWords = [ ].concat(
        fetchStringBytes( 'RIFF' ),

        // Only a single primary chunk
        fetchWord32( overallChunkSize ),
        fetchStringBytes( 'WAVE' ),

        // Format sub-chunk information
        fetchStringBytes( 'fmt ' ),
        fetchWord32( formatChunkSize ),
        fetchWord16( PULSE_CODE_MODULATION_TYPE ),
        fetchWord16( channelQty ),
        fetchWord32( samplingFrequency ),
        fetchWord32( byteRatePerSecond ),
        fetchWord16( byteAlignmentValue ),
        fetchWord16( bitsPerDatum ),

        // Data sub-chunk header
        fetchStringBytes( 'data' ),
        fetchWord32( dataPayloadSize ),
        [ ] );

    var octetsPerWord = 2;
    var payloadWords = dataPayloadSize / octetsPerWord;
    dataWords.length = this._headerWordCount + payloadWords;
    while ( dataWords.length % 3 ) dataWords.push( 0 );
  };

  AudioProcessor.prototype = {

    _headerOctets: 44,
    _headerWordCount: 22, // for 16-bit words

    // Retrieves an array of 16-bit words from a string
    // @param {string} inputStr - The string to convert.
    // @returns {number[]} An array of 16-bit word values.
    _fetchStringBytes: function ( inputStr ) {
      ensureTrue( inputStr.length % 2 === 0, 'expected string length to be an even number' );
      var outputArray = [ ];
      for ( var idx = 0, maxIdx = inputStr.length; idx < maxIdx; idx += 2 ) {
        var charOne = inputStr.charCodeAt( idx + 0 );
        var charTwo = inputStr.charCodeAt( idx + 1 );
        ensureTrue( charOne < 256, 'invalid character encountered: ' + charOne );
        ensureTrue( charTwo < 256, 'invalid character encountered: ' + charTwo );
        outputArray.push( ( charOne << 8 ) | charTwo );
      }
      return outputArray;
    },
    // Converts a number to an array containing a single 16-bit word
    // @param {number} numericVal - The number to convert.
    // @returns {number[]} An array with one 16-bit word.
    _fetchWord16: function ( numericVal ) {
      var reverseBytes = function ( tempVal ) { return ( ( tempVal >> 8 ) | ( tempVal << 8 ) ) & 65535; };
      return [ numericVal & 65535 ].map( reverseBytes );
    },
    // Converts a number to an array containing two 16-bit words
    // @param {number} numericVal - The number to convert.
    // @returns {number[]} An array with two 16-bit words.
    _fetchWord32: function ( numericVal ) {
      var reverseBytes = function ( tempVal ) { return ( ( tempVal >> 8 ) | ( tempVal << 8 ) ) & 65535; };
      return [ numericVal & 65535, ( numericVal >> 16 ) & 65535 ].map( reverseBytes );
    },

    // Encodes a stream of 8-bit samples.
    // This method is hardcoded for 8-bit mono audio.
    // @param {number[]} inputSamples - Array of [0,1]-valued audio samples.
    // @returns {string} The base64-encoded data URI.
    _processOctetStream: function ( inputSamples ) {

      confirmEquality( inputSamples.length, this.sampleCount, 'Mismatched sample quantity' );

      var floorFunc = Math.floor;
      var sqrtFunc = Math.sqrt;
      var shouldTruncate = this.truncateAmplitude;

      var dataWords = this.dataWords;
      var headerOffset = this._headerWordCount;
      for ( var timeIndex = 0, totalTime = this.sampleCount - 1; timeIndex < totalTime; timeIndex += 2 ) {
        var valOne = inputSamples[ timeIndex + 0 ];
        var valTwo = inputSamples[ timeIndex + 1 ];
        if ( shouldTruncate ) {
          valOne /= sqrtFunc( 1 + valOne * valOne );
          valTwo /= sqrtFunc( 1 + valTwo * valTwo );
        }
        // 8-bit samples are unsigned
        var processedSampleOne = floorFunc( 128 * ( valOne + 1 ) );
        var processedSampleTwo = floorFunc( 128 * ( valTwo + 1 ) );
        dataWords[ headerOffset++ ] = ( processedSampleOne << 8 ) | processedSampleTwo;
      }
      if ( this.sampleCount % 2 ) {
        var valOne = inputSamples[ timeIndex + 0 ];
        if ( shouldTruncate ) valOne /= sqrtFunc( 1 + valOne * valOne );
        var processedSampleOne = floorFunc( 128 * ( valOne + 1 ) );
        dataWords[ headerOffset++ ] = processedSampleOne << 8;
      }

      return this._transformDataWords();
    },

    // Encodes a stream of 16-bit samples.
    // This method is hardcoded for 16-bit mono audio.
    // @param {number[]} inputSamples - Array of [0,1]-valued audio samples.
    // @returns {string} The base64-encoded data URI.
    _processWordStream: function ( inputSamples ) {

      confirmEquality( inputSamples.length, this.sampleCount, 'Mismatched sample quantity' );

      var floorFunc = Math.floor;
      var sqrtFunc = Math.sqrt;
      var shouldTruncate = this.truncateAmplitude;

      var dataWords = this.dataWords;
      var headerOffset = this._headerWordCount;
      for ( var timeIndex = 0, totalTime = this.sampleCount; timeIndex < totalTime; ++timeIndex ) {
        var currentVal = inputSamples[ timeIndex ];
        if ( shouldTruncate ) currentVal /= sqrtFunc( 1 + currentVal * currentVal );
        // 16-bit samples are signed
        var processedSample = floorFunc( 32768 * currentVal );
        if ( processedSample < 0 ) processedSample += 65536; // 2's complement representation
        dataWords[ headerOffset++ ] = ( ( processedSample >> 8 ) | ( processedSample << 8 ) ) & 65535;
      }

      return this._transformDataWords();
    },

    // Converts the internal 16-bit words array into a base64 string.
    // @returns {string} The base64-encoded data URI.
    _transformDataWords: function () {
      var dataWords = this.dataWords;
      var base64PairLookup = AudioProcessor._base64PairLookup;

      var finalResult = new Array( 1 + dataWords.length * 4 / 3 );
      var resultIdx = 0;
      finalResult[ resultIdx++ ] = 'data:audio/wav;base64,';
      for ( var currentIdx = 1, wordIterator = 0, wordTotal = dataWords.length; wordIterator < wordTotal; ) {
        var firstWord = dataWords[ wordIterator++ ];
        var secondWord = dataWords[ wordIterator++ ];
        var thirdWord = dataWords[ wordIterator++ ];

        // Using 4 bits per letter in the base64 output:
        // A A A A B B B B C C C C
        // A A A B B B C C C D D D

        var firstSegment = ( firstWord >> 4 ) & 4095;
        var secondSegment = ( ( firstWord << 8 ) | ( secondWord >> 8 ) ) & 4095;
        var thirdSegment = ( ( secondWord << 4 ) | ( thirdWord >> 12 ) ) & 4095;
        var fourthSegment = thirdWord & 4095;

        finalResult[ resultIdx++ ] = base64PairLookup[ firstSegment ];
        finalResult[ resultIdx++ ] = base64PairLookup[ secondSegment ];
        finalResult[ resultIdx++ ] = base64PairLookup[ thirdSegment ];
        finalResult[ resultIdx++ ] = base64PairLookup[ fourthSegment ];
      }
      return finalResult.join( '' );
    }
  };

  AudioProcessor.standardSettings = {
    channelQty: 1,      // Monophonic sound
    samplingFrequency: 22050, // 22.05 kHz
    octetsPerDatum: 2,   // 16-bit samples
    truncateAmplitude: true
  };

  ( function () {

    var base64CharSet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var base64PairLookup = [];
    for ( var charPairIdx = 0, maxCharPairIdx = 64 * 64; charPairIdx < maxCharPairIdx; ++charPairIdx ) {
      base64PairLookup[ charPairIdx ] = base64CharSet[ charPairIdx >> 6 ] + base64CharSet[ charPairIdx & 63 ];
    }

    AudioProcessor._base64PairLookup = base64PairLookup;
  } )();

  AudioProcessor.ErrorType = AudioProcessingError;

  // While AudioProcessor is optimized for encoding multiple sequences of the same size,
  // this static method offers a convenient one-off conversion.
  //
  // @param {number[]} inputSignal - The array of audio data.
  // @param {object?}  config - Optional configuration settings.
  // @returns {string} The base64-encoded data URI string.
  AudioProcessor.processData = function ( inputSignal, config ) {
    var processorInstance = new AudioProcessor( inputSignal.length, config );
    return processorInstance.process( inputSignal );
  };

  return AudioProcessor;

}() );