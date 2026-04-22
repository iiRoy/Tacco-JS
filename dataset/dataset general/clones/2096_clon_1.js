// This file implements Base64 encoding and decoding functionalities in JavaScript.
// It provides methods for converting between various string and array formats (UTF-8, UTF-16, Base64).

/*
 * Original file identifier: $Id: base64.js,v 1.7 2012/08/23 10:30:18 dankogai Exp dankogai $
 *
 * This code is made available under the MIT License.
 * For the full license text, please visit: http://www.opensource.org/licenses/mit-license.php
 *
 * For more information on Base64 encoding, refer to: http://en.wikipedia.org/wiki/Base64
 */

( function ( global ) { // Start of the self-executing anonymous function, passing the global object.

  // The standard Base64 character set.
  var b64chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';


  // An array containing the character codes for the Base64 alphabet.
  // This is generated once when the script loads.
  var b64charcodes = ( function ( ) {
    var a = [ ]; // Initialize an empty array to store char codes.

    var codeA = 'A'.charCodeAt( 0 ); // Get ASCII code for 'A'.
    var codea = 'a'.charCodeAt( 0 ); // Get ASCII code for 'a'.
    var code0 = '0'.charCodeAt( 0 ); // Get ASCII code for '0'.

    // Add character codes for A-Z.
    for ( var i = 0; i < 26; i ++ ) {
      a.push( codeA + i );
    }

    // Add character codes for a-z.
    for ( var i = 0; i < 26; i ++ ) {
      a.push( codea + i );
    }

    // Add character codes for 0-9.
    for ( var i = 0; i < 10; i ++ ) {
      a.push( code0 + i );
    }

    // Add character codes for '+' and '/'.
    a.push( '+'.charCodeAt( 0 ) );
    a.push( '/'.charCodeAt( 0 ) );

    return a; // Return the array of Base64 character codes.
  } ) ( ); // Immediately invoke this function.


  // A lookup table (object) that maps Base64 characters to their integer indices.
  var b64tab = ( function ( bin ) {
    var t = { }; // Create an empty object for the lookup table.

    // Populate the table by iterating through the Base64 character string.
    for ( var i = 0, l = bin.length; i < l; i ++ ) {
      t[ bin.charAt( i ) ] = i; // Map character to its numerical index.
    }

    return t; // Return the completed lookup table.
  } ) ( b64chars ); // Immediately invoke with the b64chars string.


  // Helper function to convert a string into an array of its character codes.
  var stringToArray = function ( s ) {
    var a = [ ]; // Array to hold the character codes.

    // Iterate through the input string.
    for ( var i = 0, l = s.length; i < l; i ++ ) {
      a[ i ] = s.charCodeAt( i ); // Get the character code at index 'i'.
    }

    return a; // Return the array of character codes.
  };


  // Converts an array of UTF-8 byte values (integers) into a Base64 encoded string.
  var convertUTF8ArrayToBase64 = function ( bin ) {
    var padlen = 0; // Counter for padding characters.

    // Pad the input array with zeros until its length is a multiple of 3.
    while ( bin.length % 3 ) {
      bin.push( 0 ); // Add a zero byte.
      padlen++; // Increment padding count.
    }
    ; // Semicolon as in original.

    var b64 = [ ]; // Array to store the Base64 character codes.

    // Process the input byte array in chunks of 3 bytes.
    for ( var i = 0, l = bin.length; i < l; i += 3 ) {
      var c0 = bin[ i ]; // First byte.
      var c1 = bin[ i + 1 ]; // Second byte.
      var c2 = bin[ i + 2 ]; // Third byte.

      // Check if any character value is outside the valid byte range (0-255).
      if ( c0 >= 256 || c1 >= 256 || c2 >= 256 ) {
        throw 'unsupported character found'; // Throw an error if an invalid character is detected.
      }

      // Combine the three 8-bit bytes into a single 24-bit integer.
      var n = ( c0 << 16 ) | ( c1 << 8 ) | c2;

      // Extract four 6-bit values from the 24-bit integer and push their corresponding Base64 character codes.
      b64.push(
        b64charcodes[ n >>> 18 ], // First 6 bits (most significant).
        b64charcodes[ ( n >>> 12 ) & 63 ], // Second 6 bits.
        b64charcodes[ ( n >>> 6 ) & 63 ], // Third 6 bits.
        b64charcodes[ n & 63 ] // Fourth 6 bits (least significant).
      );
    }

    // Apply padding characters ('=') based on `padlen`.
    while ( padlen-- ) {
      b64[ b64.length - padlen - 1 ] = '='.charCodeAt( 0 ); // Replace the last `padlen` characters with '='.
    }

    // Convert the array of Base64 character codes into a string.
    return chunkStringFromCharCodeApply( b64 );
  };


  // Converts a Base64 encoded string back into an array of UTF-8 byte values (integers).
  var convertBase64ToUTF8Array = function ( b64 ) {
    // Remove any characters that are not part of the standard Base64 alphabet.
    b64 = b64.replace( /[^A-Za-z0-9+\/]+/g, '' );

    var bin = [ ]; // Array to store the decoded byte values.
    var padlen = b64.length % 4; // Calculate the number of padding characters to account for.

    // Process the Base64 string in chunks of 4 characters.
    for ( var i = 0, l = b64.length; i < l; i += 4 ) {
      // Combine four 6-bit Base64 values into a 24-bit integer.
      var n = ( ( b64tab[ b64.charAt( i ) ] || 0 ) << 18 ) // First Base64 char, shifted 18 bits left.
        | ( ( b64tab[ b64.charAt( i + 1 ) ] || 0 ) << 12 ) // Second Base64 char, shifted 12 bits left.
        | ( ( b64tab[ b64.charAt( i + 2 ) ] || 0 ) << 6 ) // Third Base64 char, shifted 6 bits left.
        | ( ( b64tab[ b64.charAt( i + 3 ) ] || 0 ) ); // Fourth Base64 char.

      // Extract the three 8-bit bytes from the 24-bit integer.
      bin.push(
        ( n >> 16 ), // First byte.
        ( ( n >> 8 ) & 0xff ), // Second byte (mask with 0xff to get lower 8 bits).
        ( n & 0xff ) // Third byte (mask with 0xff to get lower 8 bits).
      );
    }

    // Adjust the length of the output array based on the original padding.
    // [0,0,2,1] maps `padlen` (0, 1, 2, 3) to the number of bytes to remove.
    bin.length -= [ 0, 0, 2, 1 ][ padlen ];

    return bin; // Return the array of decoded UTF-8 byte values.
  };


  // Converts an array of UTF-16 character codes to an array of UTF-8 byte values.
  var convertUTF16ArrayToUTF8Array = function ( uni ) {
    var bin = [ ]; // Array to store the resulting UTF-8 bytes.

    // Iterate through each UTF-16 character code.
    for ( var i = 0, l = uni.length; i < l; i ++ ) {
      var n = uni[ i ]; // Current UTF-16 character code.

      if ( n < 0x80 ) { // If the character is ASCII (0-127), it's a 1-byte UTF-8 sequence.
        bin.push( n );
      }
      else if ( n < 0x800 ) { // If the character is 2-byte UTF-8 (128-2047).
        bin.push(
          0xc0 | ( n >>> 6 ), // First byte: 110xxxxx.
          0x80 | ( n & 0x3f ) // Second byte: 10xxxxxx.
        );
      }
      else { // If the character is 3-byte UTF-8 (2048-65535).
        bin.push(
          0xe0 | ( ( n >>> 12 ) & 0x0f ), // First byte: 1110xxxx.
          0x80 | ( ( n >>> 6 ) & 0x3f ), // Second byte: 10xxxxxx.
          0x80 | ( n & 0x3f ) // Third byte: 10xxxxxx.
        );
      }
    }

    return bin; // Return the array of UTF-8 byte values.
  };


  // Converts an array of UTF-8 byte values to an array of UTF-16 character codes.
  var convertUTF8ArrayToUTF16Array = function ( bin ) {
    var uni = [ ]; // Array to store the resulting UTF-16 character codes.

    // Iterate through the array of UTF-8 bytes.
    for ( var i = 0, l = bin.length; i < l; i ++ ) {
      var c0 = bin[ i ]; // Current byte.

      if ( c0 < 0x80 ) { // If it's a 1-byte sequence (ASCII).
        uni.push( c0 );
      } else {
        var c1 = bin[ ++i ]; // Get the next byte (2nd byte of a multi-byte sequence).

        if ( c0 < 0xe0 ) { // If it's a 2-byte sequence.
          uni.push( ( ( c0 & 0x1f ) << 6 ) | ( c1 & 0x3f ) ); // Reconstruct UTF-16 char.
        } else {
          var c2 = bin[ ++i ]; // Get the third byte.
          uni.push(
            ( ( c0 & 0x0f ) << 12 ) | ( ( c1 & 0x3f ) << 6 ) | ( c2 & 0x3f ) // Reconstruct UTF-16 char.
          );
        }
      }
    }

    return uni; // Return the array of UTF-16 character codes.
  };


  // --- Convenience functions for common conversions ---

  // Converts a string assumed to be UTF-8 encoded directly to Base64.
  var convertUTF8StringToBase64 = function ( bin ) {
    return convertUTF8ArrayToBase64( stringToArray( bin ) );
  };

  // Converts a Base64 string back to a UTF-8 string.
  var convertBase64ToUTF8String = function ( b64 ) {
    return chunkStringFromCharCodeApply( convertBase64ToUTF8Array( b64 ) );
  };

  // Converts a string assumed to be UTF-8 encoded to an array of UTF-16 character codes.
  var convertUTF8StringToUTF16Array = function ( bin ) {
    return convertUTF8ArrayToUTF16Array( stringToArray( bin ) );
  };

  // Converts an array of UTF-8 byte values to a UTF-16 string.
  var convertUTF8ArrayToUTF16String = function ( bin ) {
    return chunkStringFromCharCodeApply( convertUTF8ArrayToUTF16Array( bin ) );
  };

  // Converts a string assumed to be UTF-8 encoded to a UTF-16 string.
  var convertUTF8StringToUTF16String = function ( bin ) {
    return chunkStringFromCharCodeApply(
      convertUTF8ArrayToUTF16Array( stringToArray( bin ) )
    );
  };

  // Converts a string assumed to be UTF-16 encoded to an array of UTF-8 byte values.
  var convertUTF16StringToUTF8Array = function ( uni ) {
    return convertUTF16ArrayToUTF8Array( stringToArray( uni ) );
  };

  // Converts an array of UTF-16 character codes to a UTF-8 string.
  var convertUTF16ArrayToUTF8String = function ( uni ) {
    return chunkStringFromCharCodeApply( convertUTF16ArrayToUTF8Array( uni ) );
  };

  // Converts a string assumed to be UTF-16 encoded to a UTF-8 string.
  var convertUTF16StringToUTF8String = function ( uni ) {
    return chunkStringFromCharCodeApply(
      convertUTF16ArrayToUTF8Array( stringToArray( uni ) )
    );
  };


  /*
   * Important note on `String.fromCharCode.apply`:
   * This method has a limitation: it can only process arrays up to a certain size
   * (typically around 65536 elements) without silently truncating the output.
   * The following `chunkStringFromCharCodeApply` function is designed to work around this
   * by processing the array in smaller, manageable chunks.
   */
  var chunkStringFromCharCodeApply = function ( arr ) {
    var strs = [ ]; // Array to accumulate string chunks.
    var i; // Loop counter.

    // Iterate through the input array in chunks of 65536 elements.
    for ( i = 0; i < arr.length; i += 65536 ) {
      strs.push(
        String.fromCharCode.apply( String, arr.slice( i, i + 65536 ) ) // Apply `fromCharCode` to each chunk.
      );
    }

    return strs.join( '' ); // Join all the generated string chunks into a single string.
  };


  // --- Browser compatibility layer for native `btoa` and `atob` functions ---

  var btoa; // Variable to hold the btoa function (native or custom).
  var convertUTF16StringToBase64; // Variable to hold the UTF-16 to Base64 conversion function.

  if ( global.btoa ) { // Check if the global object provides a native `btoa` function.
    btoa = global.btoa; // Use the native `btoa`.
    convertUTF16StringToBase64 = function ( uni ) {
      // Convert UTF-16 string to UTF-8 string, then use native btoa.
      return btoa( convertUTF16StringToUTF8String( uni ) );
    };
  }
  else {
    btoa = convertUTF8StringToBase64; // Fallback to our custom UTF-8 to Base64 converter.
    convertUTF16StringToBase64 = function ( uni ) {
      // Custom path: Convert UTF-16 string to UTF-8 array, then to Base64.
      return convertUTF8ArrayToBase64( convertUTF16StringToUTF8Array( uni ) );
    };
  }


  var atob; // Variable to hold the atob function (native or custom).
  var convertBase64ToUTF16String; // Variable to hold the Base64 to UTF-16 conversion function.

  if ( global.atob ) { // Check if the global object provides a native `atob` function.
    atob = global.atob; // Use the native `atob`.
    convertBase64ToUTF16String = function ( b64 ) {
      // Use native atob to convert Base64 to UTF-8 string, then convert UTF-8 to UTF-16 string.
      return convertUTF8StringToUTF16String( atob( b64 ) );
    };
  }
  else {
    atob = convertBase64ToUTF8String; // Fallback to our custom Base64 to UTF-8 string converter.
    convertBase64ToUTF16String = function ( b64 ) {
      // Custom path: Convert Base64 to UTF-8 array, then to UTF-16 string.
      return convertUTF8ArrayToUTF16String( convertBase64ToUTF8Array( b64 ) );
    };
  }


  // --- Expose the Base64 API on the global object ---
  global.Base64 = {
    convertUTF8ArrayToBase64: convertUTF8ArrayToBase64,
    convertByteArrayToBase64: convertUTF8ArrayToBase64, // Alias for byte array.
    convertBase64ToUTF8Array: convertBase64ToUTF8Array,
    convertBase64ToByteArray: convertBase64ToUTF8Array, // Alias for byte array.
    convertUTF16ArrayToUTF8Array: convertUTF16ArrayToUTF8Array,
    convertUTF16ArrayToByteArray: convertUTF16ArrayToUTF8Array, // Alias.
    convertUTF8ArrayToUTF16Array: convertUTF8ArrayToUTF16Array,
    convertByteArrayToUTF16Array: convertUTF8ArrayToUTF16Array, // Alias.
    convertUTF8StringToBase64: convertUTF8StringToBase64,
    convertBase64ToUTF8String: convertBase64ToUTF8String,
    convertUTF8StringToUTF16Array: convertUTF8StringToUTF16Array,
    convertUTF8ArrayToUTF16String: convertUTF8ArrayToUTF16String,
    convertByteArrayToUTF16String: convertUTF8ArrayToUTF16String, // Alias.
    convertUTF8StringToUTF16String: convertUTF8StringToUTF16String,
    convertUTF16StringToUTF8Array: convertUTF16StringToUTF8Array,
    convertUTF16StringToByteArray: convertUTF16StringToUTF8Array, // Alias.
    convertUTF16ArrayToUTF8String: convertUTF16ArrayToUTF8String,
    convertUTF16StringToUTF8String: convertUTF16StringToUTF8String,
    convertUTF16StringToBase64: convertUTF16StringToBase64,
    convertBase64ToUTF16String: convertBase64ToUTF16String,
    fromBase64: convertBase64ToUTF8String, // Convenience alias for decoding from Base64.
    toBase64: convertUTF8StringToBase64, // Convenience alias for encoding to Base64.
    atob: atob, // Exposes the chosen (native or custom) atob function.
    btoa: btoa, // Exposes the chosen (native or custom) btoa function.
    utob: convertUTF16StringToUTF8String, // UTF-16 to UTF-8 string conversion.
    btou: convertUTF8StringToUTF16String, // UTF-8 to UTF-16 string conversion.
    encode: function ( u ) { // Main encoding function, produces URL-safe Base64.
      // Converts a UTF-16 string to Base64, then makes it URL and filename safe.
      return convertUTF16StringToBase64( u ).replace( /[+\/]/g, function ( m0 ) {
        return m0 == '+' ? '-' : '_'; // Replace '+' with '-' and '/' with '_'.
      } ).replace( /=+$/, '' ); // Remove any trailing '=' padding characters.
    },
    decode: function ( a ) { // Main decoding function, handles URL-safe Base64.
      // Decodes a URL-safe Base64 string back to a UTF-16 string.
      return convertBase64ToUTF16String( a.replace( /[-_]/g, function ( m0 ) {
        return m0 == '-' ? '+' : '/'; // Restore original Base64 characters from URL-safe ones.
      } ) );
    }
  }; // End of global.Base64 object definition.

} ) ( this ); // Invoke the anonymous function, passing `this` (which is `window` in browsers, or global object in Node.js).