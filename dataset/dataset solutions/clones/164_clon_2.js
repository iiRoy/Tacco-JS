// This program reads lines from standard input and attempts to decode them using a substitution cipher.
// It iterates through various cipher keys to find strings containing specific patterns.

require( "fs" )
  .readFileSync( "/dev/stdin", "utf8" ) // Read the entire standard input content as a UTF-8 string.
  .split( '\n' ) // Divide the input string into an array of individual lines.
  .map(
    // Process each obtained line from the input.
    function ( inputLine )
    {
      const ALPHABET_SIZE = 26; // Represents the size of the English alphabet.
      const ASCII_LOWER_A = 97; // The ASCII code for the lowercase letter 'a'.

      // Iterate through all possible multiplication keys for the cipher (from 25 down to 0).
      for ( let multKey = ALPHABET_SIZE - 1; multKey >= 0; multKey-- )
      {
        // Iterate through all possible addition keys for the cipher (from 25 down to 0).
        for ( let addKey = ALPHABET_SIZE - 1; addKey >= 0; addKey-- )
        {
          // Apply a specific affine cipher transformation to the current input line.
          // The cipher works on alphanumeric characters, mapping them based on the current keys.
          let cipheredText = inputLine.replace(
            /[\w]/g, // Regular expression to match any word character (alphanumeric or underscore).
            function ( charToProcess )
            {
              // Get the ASCII value of the character to be processed.
              const originalCharCode = charToProcess.charCodeAt( 0 );

              // Apply the affine cipher formula: ( ( char_val * multKey ) + addKey ) % ALPHABET_SIZE
              // The original code implicitly assumes characters are treated relative to 'a' (97).
              // It effectively maps charCode(0) to a 0-25 range, applies the transformation,
              // and then maps back to ASCII by adding 97.
              let transformedCharCode = ( ( originalCharCode * multKey ) + addKey ) % ALPHABET_SIZE + ASCII_LOWER_A;

              // Convert the new ASCII code back into a character.
              return String.fromCharCode( transformedCharCode );
            }
          );

          // After transformation, check if the resulting text contains the target patterns "this" or "that".
          const foundPattern = cipheredText.match( /th(is|at)/ );

          // If either "this" or "that" is found in the transformed string, print it to the console.
          if ( foundPattern )
          {
            console.log( cipheredText );
          }
          // The original code used a ternary operator with '0' for no-op, an 'if' statement serves the identical logic.
        }
      }
    }
  );