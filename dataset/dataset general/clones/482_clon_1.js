/*
 * This is a Type I clone of the original Base64 encoding/decoding utility script.
 * All functional aspects, variable names, method names, and operators
 * remain precisely as they were in the source code.
 *
 * This version showcases significant alterations in whitespace (indentation,
 * line breaks, spacing around operators and keywords) and comments (addition,
 * modification, and elaboration) to create a visually distinct but
 * logically identical representation of the original code.
 */
var Base64 =
{

    // This is a private property that defines the character set used for Base64 encoding and decoding.
    // It includes standard alphanumeric characters, plus signs, and forward slashes,
    // followed by the padding character '='.
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    // Public method for encoding data into Base64 format.
    // It takes a string 'input' and returns its Base64 encoded equivalent.
    encode : function ( input )
    {
        var output = ""; // Initialize an empty string to store the encoded result.
        // Declare variables to hold 8-bit character codes (chr1, chr2, chr3)
        // and their corresponding 6-bit Base64 indices (enc1, enc2, enc3, enc4).
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0; // Initialize an index counter for iterating through the input string.

        // Loop through the input string, processing three characters at a time.
        while ( i < input.length )
        {

            // Retrieve the ASCII character codes for the current three characters.
            // The 'i++' post-increments the index after each character is read.
            chr1 = input.charCodeAt( i++ );
            chr2 = input.charCodeAt( i++ );
            chr3 = input.charCodeAt( i++ );

            // Convert the three 8-bit characters (24 bits total) into four 6-bit segments.
            // These 6-bit segments will then be mapped to Base64 characters.
            enc1 = chr1 >> 2;                                       // First 6 bits of chr1
            enc2 = ( ( chr1 & 3 ) << 4 ) | ( chr2 >> 4 );           // Last 2 bits of chr1 and first 4 bits of chr2
            enc3 = ( ( chr2 & 15 ) << 2 ) | ( chr3 >> 6 );          // Last 4 bits of chr2 and first 2 bits of chr3
            enc4 = chr3 & 63;                                       // Last 6 bits of chr3

            // Handle padding for inputs whose length is not a multiple of 3.
            // If chr2 is not a valid number (e.g., end of string, only 1 byte left),
            // it means only chr1 was available.
            if ( isNaN( chr2 ) )
            {
                enc3 = enc4 = 64; // Set enc3 and enc4 to 64, which corresponds to '=' padding.
            }
            // If chr3 is not a valid number (e.g., end of string, only 2 bytes left),
            // it means chr1 and chr2 were available.
            else if ( isNaN( chr3 ) )
            {
                enc4 = 64; // Set enc4 to 64, which corresponds to '=' padding.
            }

            // Concatenate the Base64 characters corresponding to the calculated indices
            // to the output string. Each index (enc1, enc2, enc3, enc4) represents a 6-bit value.
            output = output +
                     this._keyStr.charAt( enc1 ) +
                     this._keyStr.charAt( enc2 ) +
                     this._keyStr.charAt( enc3 ) +
                     this._keyStr.charAt( enc4 );

        } // End of while loop for encoding.

        return output; // Return the fully Base64 encoded string.
    },


    // Public method for decoding a Base64 string back to its original format.
    // It takes a Base64 encoded 'input' string and returns the decoded result.
    decode : function ( input )
    {
        var output = ""; // Initialize an empty string to store the decoded result.
        // Declare variables to hold 8-bit character codes (chr1, chr2, chr3)
        // and their corresponding 6-bit Base64 indices (enc1, enc2, enc3, enc4).
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0; // Initialize an index counter for iterating through the input string.

        // Clean the input string by removing any characters that are not part of
        // the standard Base64 alphabet, including the padding character.
        input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        // Loop through the cleaned Base64 input string, processing four characters at a time.
        while ( i < input.length )
        {

            // Find the index (6-bit value) of each Base64 character in the _keyStr.
            // This effectively converts the Base64 character back to its numeric value.
            enc1 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc2 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc3 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc4 = this._keyStr.indexOf( input.charAt( i++ ) );

            // Convert the four 6-bit segments (24 bits total) back into three 8-bit characters.
            chr1 = ( enc1 << 2 ) | ( enc2 >> 4 );                   // Reconstruct chr1 from enc1 and enc2
            chr2 = ( ( enc2 & 15 ) << 4 ) | ( enc3 >> 2 );          // Reconstruct chr2 from enc2 and enc3
            chr3 = ( ( enc3 & 3 ) << 6 ) | enc4;                    // Reconstruct chr3 from enc3 and enc4

            // Append the first reconstructed character (chr1) to the output string.
            output = output + String.fromCharCode( chr1 );

            // Check if enc3 is not the padding character (64). If not, append chr2.
            // This handles cases where original data was 2 bytes, thus one '=' padding.
            if ( enc3 != 64 )
            {
                output = output + String.fromCharCode( chr2 );
            }
            // Check if enc4 is not the padding character (64). If not, append chr3.
            // This handles cases where original data was 1 or 2 bytes, thus two or one '=' padding.
            if ( enc4 != 64 )
            {
                output = output + String.fromCharCode( chr3 );
            }

        } // End of while loop for decoding.

        return output; // Return the fully decoded string.

    } // End of decode method.
}; // End of Base64 object definition.