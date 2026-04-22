// DataCompactor.js

// Copyright (c) 2010 Nuwa Information Co., Ltd, and individual contributors.
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:

//   1. Redistributions of source code must retain the above copyright notice,
//      this list of conditions and the following disclaimer.

//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.

//   3. Neither the name of Nuwa Information nor the names of its contributors
//      may be used to endorse or promote products derived from this software
//      without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


if( typeof DataCompactor === 'undefined' ) {
  DataCompactor = {
    releaseTag: '$Revision: 3026 $'.substring( 11 ).replace( " $", "" ),
  };
}


/**
 * Transforms a textual value into an array of 8-bit octets.
 *
 * @param {InputString} sourceString The input string value.
 * @return {OctetArray} An array of bytes derived from the input string.
 */
DataCompactor.stringToBytes = function( sourceString ) {
  var octetArray = [], charIndex, charValue;

  for ( charIndex = 0; charIndex < sourceString.length; charIndex++ ) {
    charValue = sourceString.charCodeAt( charIndex );

    // 0x00000000 - 0x0000007f -> 0xxxxxxx (Single-byte ASCII)
    if ( charValue <= 0x7f ) {
      octetArray.push( charValue );
    }
    // 0x00000080 - 0x000007ff -> 110xxxxx 10xxxxxx (Two-byte UTF-8)
    else if ( charValue <= 0x7ff ) {
      octetArray.push( ( charValue >> 6 ) | 0xc0 );
      octetArray.push( ( charValue & 0x3F ) | 0x80 );
    }
    // 0x00000800 - 0x0000ffff -> 1110xxxx 10xxxxxx 10xxxxxx (Three-byte UTF-8)
    else if ( charValue <= 0xffff ) {
      octetArray.push( ( charValue >> 12 ) | 0xe0 );
      octetArray.push( ( ( charValue >> 6 ) & 0x3f ) | 0x80 );
      octetArray.push( ( charValue & 0x3f ) | 0x80 );
    }
    // 0x00010000 - 0x001fffff -> 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx (Four-byte UTF-8)
    else {
      octetArray.push( ( charValue >> 18 ) | 0xf0 );
      octetArray.push( ( ( charValue >> 12 ) & 0x3f ) | 0x80 );
      octetArray.push( ( ( charValue >> 6 ) & 0x3f ) | 0x80 );
      octetArray.push( ( charValue & 0x3f ) | 0x80 );
    }
  }

  return octetArray;
};


/**
 * BinaryEncoder Class handles Base64 conversions.
 * Documentation Reference: http://code.google.com/p/javascriptbase64/
 *                          http://www.stringify.com/static/js/base64.js
 * Both are distributed under the MIT License.
 */
DataCompactor.BinaryEncoder = {

  /// Standard Base64 encoding character set.
  encodingAlphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

  /// URL-safe Base64 encoding character set.
  urlSafeAlphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",

  /// Standard Base64 decoding lookup table.
  decodeLookup: new Array( 256 ),

  /// URL-safe Base64 decoding lookup table.
  urlSafeDecodeLookup: new Array( 256 ),


  /**
   * Initializes the lookup tables for the BinaryEncoder.
   */
  initialize: function() {
    /// Prepare internal variables for the BinaryEncoder utility.
    var index, alphabetLength;

    for ( index = 0; index < 256; index++ ) {
      DataCompactor.BinaryEncoder.decodeLookup[ index ] = -1;
      DataCompactor.BinaryEncoder.urlSafeDecodeLookup[ index ] = -1;
    }

    for ( index = 0, alphabetLength = DataCompactor.BinaryEncoder.encodingAlphabet.length; index < alphabetLength; index++ ) {
      DataCompactor.BinaryEncoder.decodeLookup[ DataCompactor.BinaryEncoder.encodingAlphabet.charCodeAt( index ) ] = index;
      DataCompactor.BinaryEncoder.urlSafeDecodeLookup[ DataCompactor.BinaryEncoder.urlSafeAlphabet.charCodeAt( index ) ] = index;
    }

    DataCompactor.BinaryEncoder.decodeLookup[ '=' ] = DataCompactor.BinaryEncoder.urlSafeDecodeLookup[ '=' ] = 0;
  },


  /**
   * Converts a byte array or string into a Base64 encoded string.
   *
   * @param {DataBuffer|InputString} sourceData The byte array or string to encode.
   * @param {LogicalValue} isUrlFriendly True if the encoded string should be URL-safe.
   * @return {EncodedString} The resulting Base64 encoded string.
   */
  transformToB64: function( sourceData, isUrlFriendly ) {
    var currentAlphabet, encodedChunks, sourceOctets, sourceLength,
      evenBlockLength, destinationLength, srcPos, destPos, remainingBytes,
      combinedBits;

    if ( isUrlFriendly )
      currentAlphabet = DataCompactor.BinaryEncoder.urlSafeAlphabet;
    else
      currentAlphabet = DataCompactor.BinaryEncoder.encodingAlphabet;

    if ( sourceData.constructor == Array )
      sourceOctets = sourceData;
    else
      sourceOctets = DataCompactor.stringToBytes( sourceData );

    sourceLength = sourceOctets.length;

    evenBlockLength = ( sourceLength / 3 ) * 3; // Length of data in full 24-bit blocks.
    destinationLength = ( ( sourceLength - 1 ) / 3 + 1 ) << 2; // Calculated length of the output array.
    encodedChunks = new Array( destinationLength );

    // Encode full 24-bit blocks
    for ( srcPos = 0, destPos = 0; srcPos < evenBlockLength; ) {
      // Combine three source bytes into a 24-bit integer, minding the sign.
      combinedBits = ( sourceOctets[ srcPos++ ] & 0xff ) << 16 | ( sourceOctets[ srcPos++ ] & 0xff ) << 8 |
        ( sourceOctets[ srcPos++ ] & 0xff );

      // Convert the 24-bit integer into four Base64 characters.
      encodedChunks[ destPos++ ] = currentAlphabet.charAt( ( combinedBits >> 18 ) & 0x3f );
      encodedChunks[ destPos++ ] = currentAlphabet.charAt( ( combinedBits >> 12 ) & 0x3f );
      encodedChunks[ destPos++ ] = currentAlphabet.charAt( ( combinedBits >> 6 ) & 0x3f );
      encodedChunks[ destPos++ ] = currentAlphabet.charAt( combinedBits & 0x3f );
    }

    // Handle any remaining bytes that don't form a full 24-bit block.
    remainingBytes = sourceLength - evenBlockLength; // 0, 1, or 2 bytes.
    if ( remainingBytes > 0 ) {
      // Prepare the integer for the last few bits
      combinedBits = ( ( sourceOctets[ evenBlockLength ] & 0xff ) << 10 ) |
        ( remainingBytes == 2 ? ( ( sourceOctets[ sourceLength - 1 ] & 0xff ) << 2 ) : 0 );

      // Assign the last four characters, padding with '=' if necessary.
      encodedChunks[ destinationLength - 4 ] = currentAlphabet.charAt( combinedBits >> 12 );
      encodedChunks[ destinationLength - 3 ] = currentAlphabet.charAt( ( combinedBits >> 6 ) & 0x3f );
      encodedChunks[ destinationLength - 2 ] = remainingBytes == 2 ? currentAlphabet.charAt( combinedBits & 0x3f ) : '=';
      encodedChunks[ destinationLength - 1 ] = '=';
    }

    return encodedChunks.join( "" );
  },


  /**
   * Decodes a Base64 encoded string or byte array back into its original form.
   *
   * @param {EncodedString|DataBuffer} encodedInput The Base64 encoded string or byte array.
   * @param {LogicalValue} isUrlFriendly True if the input was encoded using the URL-safe alphabet.
   * @return {DataBuffer|InputString} A decoded byte array or string, depending on the input type.
   */
  transformFromB64: function( encodedInput, isUrlFriendly ) {
    var currentDecodeMap, decodedOctets, inputOctets, inputLength, returnAsBytes,
      startIndex, endIndex, paddingCount, contentLength, separatorCount, decodedLength,
      destWritePos, charCounter, fullBlockDecodeLength,
      accumulatedBits, bitShiftIndex, shiftValue, charIndex, fetchValue; // `fetchValue` is unused, kept for structural fidelity.

    if ( isUrlFriendly )
      currentDecodeMap = DataCompactor.BinaryEncoder.urlSafeDecodeLookup;
    else
      currentDecodeMap = DataCompactor.BinaryEncoder.decodeLookup;

    if ( encodedInput.constructor == Array ) {
      inputOctets = encodedInput;
      returnAsBytes = true;
    } else {
      inputOctets = DataCompactor.stringToBytes( encodedInput );
      returnAsBytes = false;
    }

    inputLength = inputOctets.length;

    startIndex = 0;
    endIndex = inputLength - 1; // Effective start and end indices after trimming.

    // Remove invalid characters from the beginning
    while ( startIndex < endIndex && currentDecodeMap[ inputOctets[ startIndex ] ] < 0 )
      startIndex++;

    // Remove invalid characters from the end
    while ( endIndex > 0 && currentDecodeMap[ inputOctets[ endIndex ] ] < 0 )
      endIndex--;

    // Determine the padding count ('=') at the end (0, 1, or 2).
    paddingCount = inputOctets[ endIndex ] == '=' ? ( inputOctets[ endIndex - 1 ] == '=' ? 2 : 1 ) : 0;
    contentLength = endIndex - startIndex + 1; // Count of relevant characters, including potential separators.
    separatorCount = inputLength > 76 ? ( inputOctets[ 76 ] == '\r' ? contentLength / 78 : 0 ) << 1 : 0;

    // Calculate the exact number of bytes after decoding.
    decodedLength = ( ( contentLength - separatorCount ) * 6 >> 3 ) - paddingCount;
    decodedOctets = new Array( decodedLength ); // Preallocate output array.

    // Decode all but the last 0-2 bytes (which might be padded).
    destWritePos = 0;
    for ( charCounter = 0, fullBlockDecodeLength = ( decodedLength / 3 ) * 3; destWritePos < fullBlockDecodeLength; ) {
      // Reconstruct three bytes from four "valid" Base64 characters.
      accumulatedBits = currentDecodeMap[ inputOctets[ startIndex++ ] ] << 18 | currentDecodeMap[ inputOctets[ startIndex++ ] ] << 12 |
        currentDecodeMap[ inputOctets[ startIndex++ ] ] << 6 | currentDecodeMap[ inputOctets[ startIndex++ ] ];

      // Add the decoded bytes to the output buffer.
      decodedOctets[ destWritePos++ ] = ( accumulatedBits >> 16 ) & 0xff;
      decodedOctets[ destWritePos++ ] = ( accumulatedBits >> 8 ) & 0xff;
      decodedOctets[ destWritePos++ ] = accumulatedBits & 0xff;

      // Skip line separators if present.
      if ( separatorCount > 0 && ++charCounter == 19 ) {
        startIndex += 2;
        charCounter = 0;
      }
    }

    if ( destWritePos < decodedLength ) {
      // Decode the last 1-3 bytes (including padding characters).
      accumulatedBits = 0;
      for ( bitShiftIndex = 0; startIndex <= endIndex - paddingCount; bitShiftIndex++ )
        accumulatedBits |= currentDecodeMap[ inputOctets[ startIndex++ ] ] << ( 18 - bitShiftIndex * 6 );

      for ( shiftValue = 16; destWritePos < decodedLength; shiftValue -= 8 )
        decodedOctets[ destWritePos++ ] = ( accumulatedBits >> shiftValue ) & 0xff;
    }

    if ( returnAsBytes ) {
      return decodedOctets;
    } else {
      for ( charIndex = 0; charIndex < decodedOctets.length; charIndex++ )
        decodedOctets[ charIndex ] = String.fromCharCode( decodedOctets[ charIndex ] );

      return decodedOctets.join( '' );
    }
  }
};


DataCompactor.BinaryEncoder.initialize();


(function() {

  // Constants utilized by the compression/decompression routines.
  const BITS_PER_BYTE = 8;
  const MATCH_BIT_COUNT = 6;
  const MIN_MATCH_LENGTH = 3;
  const MAX_MATCH_LENGTH = ( ( 1 << MATCH_BIT_COUNT ) + ( MIN_MATCH_LENGTH - 1 ) );
  const POSITION_OFFSET_MASK = ( ( 1 << ( 16 - MATCH_BIT_COUNT ) ) - 1 );
  const HASH_TABLE_SIZE = 256;


  /**
   * Applies a rapid and efficient compression algorithm to a string or byte array.
   *
   * Due to JavaScript's inherent performance characteristics, many advanced compression
   * algorithms are impractical for direct implementation. This solution employs a modified
   * LZJB algorithm, which offers a good balance of speed and compression ratio for typical data.
   *
   * This implementation draws inspiration from the OpenSolaris LZJB compression utility:
   * http://src.opensolaris.org/source/raw/onnv/onnv-gate/usr/src/uts/common/os/compress.c
   * It is licensed under CDDL.
   *
   * Note: This function relies on the `stringToBytes` utility.
   *
   * @param {InputString|DataBuffer} sourceStream The string or byte array to be compressed.
   * @return {DataBuffer} The resulting compressed byte array.
   */
  DataCompactor.crunchData = function( sourceStream ) {
    var inputBuffer, outputBuffer = [], inputLength,
      sourcePointer = 0, destPointer = 0,
      copyFromIndex, controlBytePosition,
      flagBitMask = 1 << ( BITS_PER_BYTE - 1 ),
      matchLength, matchOffset,
      hashProbe,
      lastSeenPositions = new Array( HASH_TABLE_SIZE ),
      initIndex, inputIsByteArray;

    // Initialize the hash table with a default value.
    for ( initIndex = 0; initIndex < HASH_TABLE_SIZE; initIndex++ )
      lastSeenPositions[ initIndex ] = 3435973836; // A distinct, large integer.

    // Determine if the input is already a byte array or needs conversion.
    if ( sourceStream.constructor == Array ) {
      inputBuffer = sourceStream;
      inputIsByteArray = true;
    } else {
      inputBuffer = DataCompactor.stringToBytes( sourceStream );
      inputIsByteArray = false;
    }

    inputLength = inputBuffer.length;

    while ( sourcePointer < inputLength ) {
      if ( ( flagBitMask <<= 1 ) == ( 1 << BITS_PER_BYTE ) ) {
        // If the output buffer is too small for a potential escape sequence,
        // revert to uncompressed copy for the remainder.
        if ( destPointer >= inputLength - 1 - 2 * BITS_PER_BYTE ) {
          matchLength = inputLength;
          for ( sourcePointer = 0, destPointer = 0; matchLength; matchLength-- )
            outputBuffer[ destPointer++ ] = inputBuffer[ sourcePointer++ ];
          return outputBuffer;
        }
        flagBitMask = 1;
        controlBytePosition = destPointer;
        outputBuffer[ destPointer++ ] = 0; // Placeholder for control byte.
      }
      if ( sourcePointer > inputLength - MAX_MATCH_LENGTH ) {
        outputBuffer[ destPointer++ ] = inputBuffer[ sourcePointer++ ]; // Copy literal byte.
        continue;
      }
      // Compute hash for the next three bytes.
      hashProbe = ( ( inputBuffer[ sourcePointer ] + 13 ) ^
          ( inputBuffer[ sourcePointer + 1 ] - 13 ) ^
          inputBuffer[ sourcePointer + 2 ] ) &
        ( HASH_TABLE_SIZE - 1 );
      matchOffset = ( sourcePointer - lastSeenPositions[ hashProbe ] ) & POSITION_OFFSET_MASK;
      lastSeenPositions[ hashProbe ] = sourcePointer; // Update last seen position for this hash.
      copyFromIndex = sourcePointer - matchOffset;

      if ( copyFromIndex >= 0 && copyFromIndex != sourcePointer &&
        inputBuffer[ sourcePointer ] == inputBuffer[ copyFromIndex ] &&
        inputBuffer[ sourcePointer + 1 ] == inputBuffer[ copyFromIndex + 1 ] &&
        inputBuffer[ sourcePointer + 2 ] == inputBuffer[ copyFromIndex + 2 ] ) {
        // Found a match, set the corresponding bit in the control byte.
        outputBuffer[ controlBytePosition ] |= flagBitMask;
        for ( matchLength = MIN_MATCH_LENGTH; matchLength < MAX_MATCH_LENGTH; matchLength++ )
          if ( inputBuffer[ sourcePointer + matchLength ] != inputBuffer[ copyFromIndex + matchLength ] )
            break;
        outputBuffer[ destPointer++ ] = ( ( matchLength - MIN_MATCH_LENGTH ) << ( BITS_PER_BYTE - MATCH_BIT_COUNT ) ) |
          ( matchOffset >> BITS_PER_BYTE );
        outputBuffer[ destPointer++ ] = matchOffset;
        sourcePointer += matchLength; // Advance source pointer by match length.
      } else {
        outputBuffer[ destPointer++ ] = inputBuffer[ sourcePointer++ ]; // No match, copy literal byte.
      }
    }

    return outputBuffer;
  };


  /**
   * Reconstructs the original data from a compressed byte array using a rapid and efficient algorithm.
   *
   * This implementation is derived from the OpenSolaris LZJB compression utility:
   * http://src.opensolaris.org/source/raw/onnv/onnv-gate/usr/src/uts/common/os/compress.c
   * It is licensed under CDDL.
   *
   * Note: This function relies on the `stringToBytes` utility.
   *
   * @param {DataBuffer|InputString} compressedStream The compressed string or byte array.
   * @return {InputString} The decompressed string.
   */
  DataCompactor.expandData = function( compressedStream ) {
    var inputBuffer, outputString = "", inputLength,
      sourcePointer = 0,
      copyFromPosition, controlByteValue,
      flagBitMask = 1 << ( BITS_PER_BYTE - 1 ),
      matchSize, backwardOffset,
      loopIndex, inputIsByteArray, fetchValue; // `fetchValue` is unused, kept for structural fidelity.

    // Convert input to byte array if it's a string.
    if ( compressedStream.constructor == Array ) {
      inputBuffer = compressedStream;
    } else {
      inputBuffer = DataCompactor.stringToBytes( compressedStream );
    }

    inputLength = inputBuffer.length;

    while ( sourcePointer < inputLength ) {
      if ( ( flagBitMask <<= 1 ) == ( 1 << BITS_PER_BYTE ) ) {
        flagBitMask = 1;
        controlByteValue = inputBuffer[ sourcePointer++ ]; // Read the next control byte.
      }
      if ( controlByteValue & flagBitMask ) {
        // This is a matched sequence.
        matchSize = ( inputBuffer[ sourcePointer ] >> ( BITS_PER_BYTE - MATCH_BIT_COUNT ) ) + MIN_MATCH_LENGTH;
        backwardOffset = ( ( inputBuffer[ sourcePointer ] << BITS_PER_BYTE ) | inputBuffer[ sourcePointer + 1 ] ) & POSITION_OFFSET_MASK;
        sourcePointer += 2;
        copyFromPosition = outputString.length - backwardOffset;
        if ( copyFromPosition >= 0 )
          while ( --matchSize >= 0 )
            outputString += outputString.charAt( copyFromPosition++ );
        else
          // A negative offset before the start of the output buffer indicates corrupted input data.
          throw "Corrupted data encountered during decompression.";
      } else {
        // This is a literal byte.
        outputString += String.fromCharCode( inputBuffer[ sourcePointer++ ] );
      }
    }

    return outputString;
  };

})();