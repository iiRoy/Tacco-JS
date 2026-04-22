// This file provides a robust JavaScript implementation
// for Base64 encoding and decoding operations.
// It supports both standard Base64 and URL-safe Base64 variants.

/*
 *  Original Metadata:
 *  $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  License Information:
 *  This software is distributed under the MIT license.
 *  For details, please refer to:
 *  http://opensource.org/licenses/mit-license
 *
 *  Contextual References:
 *  For a comprehensive understanding of Base64, see:
 *  http://en.wikipedia.org/wiki/Base64
 */

(function( global ) {
  'use strict'; // Ensures strict parsing and error handling.

  // Store any pre-existing Base64 object to facilitate `noConflict` operations.
  var _Base64 = global.Base64;

  // Define the current version string of this library.
  var version = "2.1.8";

  // Declare a variable to hold the Node.js Buffer object, if applicable.
  var buffer;

  // Check if running in a Node.js-like environment.
  if ( typeof module !== 'undefined' && module.exports ) {
    // If so, load the native Buffer module.
    buffer = require('buffer').Buffer;
  }


  // --- Constants and Utility Functions ---

  // The standard Base64 character set.
  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  // Generate a lookup table for Base64 characters to their integer values.
  var b64tab = (function( bin ) {
    var t = {}; // Initialize the lookup table.
    var i = 0;
    var l = bin.length;

    // Populate the table: char -> index.
    for ( ; i < l; i++ ) {
      t[bin.charAt(i)] = i;
    }
    return t;
  })(b64chars); // Immediately invoke with the Base64 character set.

  // Reference to the native String.fromCharCode function for efficiency.
  var fromCharCode = String.fromCharCode;


  // --- Encoder Related Logic ---

  // Callback function for `utob` to handle Unicode to UTF-8 byte conversion.
  var cb_utob = function( c ) {
    // Handle characters that require 1, 2, or 3 bytes in UTF-8.
    if ( c.length < 2 ) {
      var cc = c.charCodeAt(0);
      return cc < 0x80 // 1-byte sequence (ASCII)
        ? c
        : cc < 0x800 // 2-byte sequence
          ? ( fromCharCode( 0xc0 | ( cc >>> 6 ) ) +
              fromCharCode( 0x80 | ( cc & 0x3f ) ) )
          : ( fromCharCode( 0xe0 | ( ( cc >>> 12 ) & 0x0f ) ) + // 3-byte sequence
              fromCharCode( 0x80 | ( ( cc >>> 6 ) & 0x3f ) ) +
              fromCharCode( 0x80 | ( cc & 0x3f ) ) );
    } else {
      // Handle surrogate pairs (4-byte UTF-8 sequences).
      var cc = 0x10000 + ( c.charCodeAt(0) - 0xD800 ) * 0x400 + ( c.charCodeAt(1) - 0xDC00 );
      return ( fromCharCode( 0xf0 | ( ( cc >>> 18 ) & 0x07 ) ) + // 4-byte sequence
               fromCharCode( 0x80 | ( ( cc >>> 12 ) & 0x3f ) ) +
               fromCharCode( 0x80 | ( ( cc >>> 6 ) & 0x3f ) ) +
               fromCharCode( 0x80 | ( cc & 0x3f ) ) );
    }
  };

  // Regular expression to match characters that need UTF-8 encoding.
  // This includes surrogate pairs and non-ASCII characters.
  var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;

  // Converts a Unicode string to a UTF-8 string (binary string representation).
  var utob = function( u ) {
    return u.replace( re_utob, cb_utob );
  };

  // Callback function for `btoa` to encode 3 bytes into 4 Base64 characters.
  var cb_encode = function( ccc ) {
    // Determine padding length based on input string length.
    var padlen = [0, 2, 1][ccc.length % 3];
    // Combine 3 characters (up to 24 bits) into a single integer.
    var ord = ccc.charCodeAt(0) << 16
            | ( ( ccc.length > 1 ? ccc.charCodeAt(1) : 0 ) << 8 )
            | ( ( ccc.length > 2 ? ccc.charCodeAt(2) : 0 ) );
    // Map the 24 bits to 4 Base64 characters, applying padding.
    var chars = [
      b64chars.charAt( ord >>> 18 ),
      b64chars.charAt( ( ord >>> 12 ) & 63 ),
      padlen >= 2 ? '=' : b64chars.charAt( ( ord >>> 6 ) & 63 ),
      padlen >= 1 ? '=' : b64chars.charAt( ord & 63 )
    ];
    return chars.join(''); // Join characters to form the Base64 segment.
  };

  // `btoa` implementation: encodes a "binary" string to Base64.
  var btoa = global.btoa // Use native `btoa` if available.
    ? function( b ) {
      return global.btoa( b );
    }
    : function( b ) { // Custom implementation if native `btoa` is not found.
      // Process the input string in 3-byte chunks.
      return b.replace( /[\s\S]{1,3}/g, cb_encode );
    };

  // Internal encoding function that uses Node.js Buffer or `btoa` + `utob`.
  var _encode = buffer // If Node.js Buffer is available.
    ? function ( u ) {
      // Ensure input is a Buffer instance if not already.
      return ( u.constructor === buffer.constructor ? u : new buffer(u) )
        .toString( 'base64' ); // Encode to Base64.
    }
    : function ( u ) { // For browser environments or without Buffer.
      return btoa( utob( u ) ); // Convert to UTF-8 then Base64.
    };

  // Public `encode` function for Base64 encoding.
  var encode = function( u, urisafe ) {
    return !urisafe // If not URI-safe encoding.
      ? _encode( String(u) )
      : _encode( String(u) ) // Apply URI-safe transformations.
        .replace( /[+\/]/g, function( m0 ) {
          return m0 == '+' ? '-' : '_'; // Replace '+' with '-' and '/' with '_'.
        })
        .replace( /=/g, '' ); // Remove padding '=' characters.
  };

  // Public `encodeURI` function, a convenience wrapper for URI-safe encoding.
  var encodeURI = function( u ) {
    return encode( u, true );
  };


  // --- Decoder Related Logic ---

  // Regular expression for matching UTF-8 multi-byte sequences.
  var re_btou = new RegExp( [
    '[\xC0-\xDF][\x80-\xBF]', // 2-byte UTF-8 sequence
    '[\xE0-\xEF][\x80-\xBF]{2}', // 3-byte UTF-8 sequence
    '[\xF0-\xF7][\x80-\xBF]{3}'  // 4-byte UTF-8 sequence
  ].join('|'), 'g' );

  // Callback function for `btou` to convert UTF-8 bytes back to Unicode characters.
  var cb_btou = function( cccc ) {
    switch( cccc.length ) {
      case 4: // 4-byte sequence (surrogate pair).
        var cp = ( ( 0x07 & cccc.charCodeAt(0) ) << 18 )
               | ( ( 0x3f & cccc.charCodeAt(1) ) << 12 )
               | ( ( 0x3f & cccc.charCodeAt(2) ) << 6 )
               | ( 0x3f & cccc.charCodeAt(3) );
        var offset = cp - 0x10000;
        return ( fromCharCode( ( offset >>> 10 ) + 0xD800 ) +
                 fromCharCode( ( offset & 0x3FF ) + 0xDC00 ) );
      case 3: // 3-byte sequence.
        return fromCharCode(
          ( ( 0x0f & cccc.charCodeAt(0) ) << 12 )
            | ( ( 0x3f & cccc.charCodeAt(1) ) << 6 )
            | ( 0x3f & cccc.charCodeAt(2) )
        );
      default: // 2-byte sequence (default case).
        return fromCharCode(
          ( ( 0x1f & cccc.charCodeAt(0) ) << 6 )
            | ( 0x3f & cccc.charCodeAt(1) )
        );
    }
  };

  // Converts a UTF-8 (binary) string to a Unicode string.
  var btou = function( b ) {
    return b.replace( re_btou, cb_btou );
  };

  // Callback function for `atob` to decode 4 Base64 characters into 3 bytes.
  var cb_decode = function( cccc ) {
    var len = cccc.length;
    var padlen = len % 4; // Determine padding length.
    // Convert 4 Base64 characters (up to 24 bits) into a single integer.
    var n = ( len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0 )
          | ( len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0 )
          | ( len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0 )
          | ( len > 3 ? b64tab[cccc.charAt(3)] : 0 );
    // Extract the 3 bytes from the integer.
    var chars = [
      fromCharCode( n >>> 16 ),
      fromCharCode( ( n >>> 8 ) & 0xff ),
      fromCharCode( n & 0xff )
    ];
    // Adjust array length based on padding to remove invalid characters.
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join(''); // Join bytes to form the decoded segment.
  };

  // `atob` implementation: decodes a Base64 string to a "binary" string.
  var atob = global.atob // Use native `atob` if available.
    ? function( a ) {
      return global.atob( a );
    }
    : function( a ) { // Custom implementation if native `atob` is not found.
      // Process the input string in 4-character chunks.
      return a.replace( /[\s\S]{1,4}/g, cb_decode );
    };

  // Internal decoding function that uses Node.js Buffer or `atob` + `btou`.
  var _decode = buffer // If Node.js Buffer is available.
    ? function( a ) {
      // Ensure input is a Buffer instance, converting from base64 string.
      return ( a.constructor === buffer.constructor
               ? a : new buffer(a, 'base64') ).toString(); // Decode from Base64.
    }
    : function( a ) { // For browser environments or without Buffer.
      return btou( atob( a ) ); // Decode from Base64 then to Unicode.
    };

  // Public `decode` function for Base64 decoding.
  var decode = function( a ) {
    return _decode(
      String(a) // Ensure input is a string.
        .replace( /[-_]/g, function( m0 ) {
          return m0 == '-' ? '+' : '/'; // Convert URI-safe chars back to standard.
        })
        .replace( /[^A-Za-z0-9\+\/]/g, '' ) // Remove any non-Base64 characters.
    );
  };


  // --- Utility and Export ---

  // Restores the original `global.Base64` object and returns this library's Base64.
  var noConflict = function() {
    var Base64 = global.Base64;
    global.Base64 = _Base64; // Restore the previous Base64 global.
    return Base64; // Return this library's Base64 object.
  };


  // Export the Base64 object to the global scope.
  global.Base64 = {
    VERSION: version, // Library version.
    atob: atob,       // Binary to ASCII (Base64) - direct implementation.
    btoa: btoa,       // ASCII (binary) to Base64 - direct implementation.
    fromBase64: decode, // Alias for decoding Base64.
    toBase64: encode,   // Alias for encoding to Base64.
    utob: utob,         // Unicode to UTF-8 binary string.
    encode: encode,     // General encoding function.
    encodeURI: encodeURI, // URI-safe encoding.
    btou: btou,         // UTF-8 binary string to Unicode.
    decode: decode,     // General decoding function.
    noConflict: noConflict // No-conflict utility.
  };


  // If ES5 Object.defineProperty is available, extend String.prototype.
  if ( typeof Object.defineProperty === 'function' ) {
    // Helper function to create non-enumerable properties.
    var noEnum = function( v ) {
      return { value: v, enumerable: false, writable: true, configurable: true };
    };

    // Add `extendString` method to Base64.
    global.Base64.extendString = function () {
      // Add `fromBase64` method to String.prototype.
      Object.defineProperty(
        String.prototype, 'fromBase64', noEnum( function () {
          return decode( this );
        })
      );
      // Add `toBase64` method to String.prototype.
      Object.defineProperty(
        String.prototype, 'toBase64', noEnum( function ( urisafe ) {
          return encode( this, urisafe );
        })
      );
      // Add `toBase64URI` method to String.prototype.
      Object.defineProperty(
        String.prototype, 'toBase64URI', noEnum( function () {
          return encode( this, true );
        })
      );
    };
  }

  // Special handling for Meteor.js environment.
  // Ensures `Base64` is available in Meteor's global scope.
  if ( global['Meteor'] ) {
     Base64 = global.Base64; // Assign to a global variable accessible by Meteor.
  }

})( this ); // Pass `this` (which is `window` in browsers, `global` in Node.js) as `global`.