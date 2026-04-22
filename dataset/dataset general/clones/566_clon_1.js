FireLogger.Base64 = {
    /*
     * This is a private property holding the
     * character set used for Base64 encoding/decoding.
     * It includes uppercase, lowercase letters, digits, and a few symbols.
     */
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    /**
     * Public method to encode a string into Base64 format.
     * It handles UTF-8 conversion internally before encoding.
     * @param {string} input - The string to be encoded.
     * @returns {string} The Base64 encoded string.
     */
    encode: function( input ) {

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;


        // First, convert the input string to UTF-8.
        input = this._utf8_encode( input );

        // Loop through the input string, processing 3 characters at a time.
        while ( i < input.length ) {

            // Get character codes for 3 bytes.
            chr1 = input.charCodeAt( i++ );
            chr2 = input.charCodeAt( i++ );
            chr3 = input.charCodeAt( i++ );

            // Perform bitwise operations to get 4 Base64 indices.
            enc1 = chr1 >> 2;
            enc2 = ( ( chr1 & 3 ) << 4 ) | ( chr2 >> 4 );
            enc3 = ( ( chr2 & 15 ) << 2 ) | ( chr3 >> 6 );
            enc4 = chr3 & 63;

            // Handle padding for strings not perfectly divisible by 3.
            if ( isNaN( chr2 ) ) {
                enc3 = enc4 = 64; // Set padding characters.
            } else if ( isNaN( chr3 ) ) {
                enc4 = 64; // Only one padding character needed.
            }

            // Append the Base64 characters to the output string.
            output = output +
                this._keyStr.charAt( enc1 ) + this._keyStr.charAt( enc2 ) +
                this._keyStr.charAt( enc3 ) + this._keyStr.charAt( enc4 );

        } // End of while loop.

        return output;
    },


    /*
     * Public method to decode a Base64 string back to its original form.
     * It also handles UTF-8 decoding after the Base64 conversion.
     * @param {string} input - The Base64 encoded string to be decoded.
     * @returns {string} The decoded string.
     */
    decode: function( input ) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        // Remove any non-Base64 characters from the input string.
        input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        // Iterate through the input string, processing 4 Base64 characters.
        while ( i < input.length ) {

            // Get the index of each Base64 character in the key string.
            enc1 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc2 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc3 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc4 = this._keyStr.indexOf( input.charAt( i++ ) );

            // Convert Base64 indices back to 3 original bytes using bitwise operations.
            chr1 = ( enc1 << 2 ) | ( enc2 >> 4 );
            chr2 = ( ( enc2 & 15 ) << 4 ) | ( enc3 >> 2 );
            chr3 = ( ( enc3 & 3 ) << 6 ) | enc4;

            // Append the first character.
            output = output + String.fromCharCode( chr1 );

            // Append the second character if not a padding character.
            if ( enc3 != 64 ) {
                output = output + String.fromCharCode( chr2 );
            }
            // Append the third character if not a padding character.
            if ( enc4 != 64 ) {
                output = output + String.fromCharCode( chr3 );
            }

        } // End of while loop.

        // Finally, decode the UTF-8 string.
        output = this._utf8_decode( output );

        return output;

    },


    /**
     * Private helper method for UTF-8 encoding of a string.
     * Converts a standard JavaScript string to its UTF-8 byte sequence representation.
     * @param {string} string - The input string.
     * @returns {string} The UTF-8 encoded string.
     */
    _utf8_encode: function( string ) {
        // Normalize line endings to LF.
        string = string.replace( /\r\n/g, "\n" );
        var utftext = "";

        for ( var n = 0; n < string.length; n++ ) {

            var c = string.charCodeAt( n );

            if ( c < 128 ) { // 1-byte sequence (ASCII)
                utftext += String.fromCharCode( c );
            } else if ( ( c > 127 ) && ( c < 2048 ) ) { // 2-byte sequence
                utftext += String.fromCharCode( ( c >> 6 ) | 192 );
                utftext += String.fromCharCode( ( c & 63 ) | 128 );
            } else { // 3-byte sequence
                utftext += String.fromCharCode( ( c >> 12 ) | 224 );
                utftext += String.fromCharCode( ( ( c >> 6 ) & 63 ) | 128 );
                utftext += String.fromCharCode( ( c & 63 ) | 128 );
            }

        } // End of for loop.

        return utftext;
    },


    /*
     * Private helper method for UTF-8 decoding.
     * Converts a UTF-8 byte sequence string back to a standard JavaScript string.
     * @param {string} utftext - The UTF-8 encoded string.
     * @returns {string} The decoded string.
     */
    _utf8_decode: function( utftext ) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0; // Initialize character code variables.

        while ( i < utftext.length ) {

            c = utftext.charCodeAt( i );

            if ( c < 128 ) { // 1-byte sequence
                string += String.fromCharCode( c );
                i++;
            } else if ( ( c > 191 ) && ( c < 224 ) ) { // 2-byte sequence
                c2 = utftext.charCodeAt( i + 1 );
                string += String.fromCharCode( ( ( c & 31 ) << 6 ) | ( c2 & 63 ) );
                i += 2;
            } else { // 3-byte sequence
                c2 = utftext.charCodeAt( i + 1 );
                c3 = utftext.charCodeAt( i + 2 );
                string += String.fromCharCode( ( ( c & 15 ) << 12 ) | ( ( c2 & 63 ) << 6 ) | ( c3 & 63 ) );
                i += 3;
            }

        } // End of while loop.

        return string;
    }

}; // End of FireLogger.Base64 object.