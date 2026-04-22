var CryptoJS = require ( './core' ) . CryptoJS ; // Initialize the CryptoJS module.

// This file implements Base64 encoding and decoding for CryptoJS.

( function ( ) { // Self-executing anonymous function to encapsulate the code.

  var C       = CryptoJS ;   // Reference to the main CryptoJS object.
  var C_lib   = C . lib ;    // Access the library namespace of CryptoJS.
  var WordArray = C_lib . WordArray ; // Obtain the WordArray constructor.
  var C_enc   = C . enc ;    // Access the encoding namespace.

  // The Base64 encoding strategy object.
  var Base64 = C_enc . Base64 = {

    // Method to convert a WordArray object into a Base64 encoded string.
    stringify : function ( wordArray ) {

      var words     = wordArray . words ;    // Internal array of 32-bit words.
      var sigBytes  = wordArray . sigBytes ; // Number of significant bytes in the word array.
      var map       = this . _map ;          // The Base64 character mapping string.

      wordArray . clamp ( ) ; // Ensure only significant bits are considered, discarding excess.

      var base64Chars = [ ] ; // Initialize an array to hold the resulting Base64 characters.

      // Iterate through the word array, processing 3 bytes at a time.
      for ( var i = 0 ; i < sigBytes ; i += 3 ) {

        var byte1 = ( words [ i >>> 2 ]       >>> ( 24 - ( i % 4 ) * 8 ) )       & 0xff ; // Extract the first byte.
        var byte2 = ( words [ ( i + 1 ) >>> 2 ] >>> ( 24 - ( ( i + 1 ) % 4 ) * 8 ) ) & 0xff ; // Extract the second byte.
        var byte3 = ( words [ ( i + 2 ) >>> 2 ] >>> ( 24 - ( ( i + 2 ) % 4 ) * 8 ) ) & 0xff ; // Extract the third byte.

        var triplet = ( byte1 << 16 ) | ( byte2 << 8 ) | byte3 ; // Combine the three bytes into a 24-bit triplet.

        // Process the 24-bit triplet into 4 Base64 characters (6 bits each).
        for ( var j = 0 ; ( j < 4 ) && ( i + j * 0.75 < sigBytes ) ; j++ ) {
          base64Chars . push ( map . charAt ( ( triplet >>> ( 6 * ( 3 - j ) ) ) & 0x3f ) ) ; // Append the corresponding Base64 character.
        }
      }

      var paddingChar = map . charAt ( 64 ) ; // Get the padding character, typically '='.

      // Apply padding if the padding character is defined.
      if ( paddingChar ) {
        while ( base64Chars . length % 4 ) { // Add padding until the length is a multiple of 4.
          base64Chars . push ( paddingChar ) ; // Add a padding character.
        }
      }

      return base64Chars . join ( '' ) ; // Join all collected characters to form the final Base64 string.
    } ,

    // Method to parse a Base64 encoded string back into a WordArray object.
    parse : function ( base64Str ) {

      var base64StrLength = base64Str . length ; // Store the initial length of the Base64 string.
      var map             = this . _map ;          // The Base64 character mapping string.

      var paddingChar = map . charAt ( 64 ) ; // Retrieve the padding character.

      // If a padding character is present, adjust the effective string length to ignore it.
      if ( paddingChar ) {
        var paddingIndex = base64Str . indexOf ( paddingChar ) ; // Find the first occurrence of the padding character.
        if ( paddingIndex != -1 ) { // If padding is found.
          base64StrLength = paddingIndex ; // Set the effective length to exclude padding.
        }
      }

      var words  = [ ] ; // Initialize an array to store the parsed 32-bit words.
      var nBytes = 0 ;   // Counter for the number of bytes processed.

      // Iterate through the Base64 string, processing characters.
      for ( var i = 0 ; i < base64StrLength ; i++ ) {
        if ( i % 4 ) { // Process every 4 characters to form 3 bytes.
          var bits1 = map . indexOf ( base64Str . charAt ( i - 1 ) ) << ( ( i % 4 ) * 2 ) ; // Get bits from the previous character.
          var bits2 = map . indexOf ( base64Str . charAt ( i ) ) >>> ( 6 - ( i % 4 ) * 2 ) ; // Get bits from the current character.
          words [ nBytes >>> 2 ] |= ( bits1 | bits2 ) << ( 24 - ( nBytes % 4 ) * 8 ) ; // Combine and store the resulting byte in the word array.
          nBytes++ ; // Increment the count of processed bytes.
        }
      }

      return WordArray . create ( words , nBytes ) ; // Create and return a new WordArray from the parsed words and byte count.
    } ,

    _map : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' // The Base64 character set map, including the padding character at index 64.
  } ; // End of the Base64 object definition.

} ( ) ) ; // End of the self-executing anonymous function.