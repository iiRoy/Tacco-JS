console.log ( ( inputData => {
    // This module's purpose is to find the minimum number of sequential character positions
    // required to form a 'target' string by repeatedly concatenating a 'source' string.
    // It returns the 1-based index of the last character of the target string within this conceptual infinite source.

    // First, parse the incoming input data. It's expected to be a string
    // containing two lines: the source string on the first, and the target string on the second.
    const [ sourceStr, targetStr ] = inputData .trim()
                                              .split`\n`;

    // Initialize a mapping structure to store all occurrences of each character from 'a' to 'z'.
    // Each element in this array corresponds to an alphabet character (index 0 for 'a', 1 for 'b', etc.).
    // The value at each index is itself an array, holding the zero-based positions where that character appears.
    const charLocationMapping = Array.from ( { length : 26 }, ( _placeholderValue ) => [ ] );

    // Store the lengths of both strings for improved performance, avoiding repeated '.length' calls.
    const sourceStringLength = sourceStr.length;
    const targetStringLength = targetStr.length;

    // Populate the charLocationMapping for the first virtual instance of the source string.
    // This loop records the initial positions of each character.
    for ( let currentCharacterPosition = 0; currentCharacterPosition < sourceStringLength; currentCharacterPosition++ ) {
        // Convert the character to its corresponding 0-25 integer value.
        charLocationMapping[ sourceStr.charCodeAt( currentCharacterPosition ) - 97 ].push( currentCharacterPosition );
    }

    // Populate the charLocationMapping again, simulating a second concatenation of the source string.
    // This allows us to easily find characters that "wrap around" from the end of one source string
    // to the beginning of the next, without complex modulo arithmetic.
    for ( let currentCharacterPosition = 0; currentCharacterPosition < sourceStringLength; currentCharacterPosition++ ) {
        // Add sourceStringLength to the index to reflect its position in the concatenated string (s + s).
        charLocationMapping[ sourceStr.charCodeAt( currentCharacterPosition ) - 97 ].push( currentCharacterPosition + sourceStringLength );
    }

    // Create an array to keep track of the *next* available index to check for each character type.
    // This ensures we always look for characters *after* the previously found character.
    const characterSearchOffsets = Array ( 26 ) .fill ( 0 );

    // Initialize the main sequential search pointer. It starts at -1, conceptually before the first character.
    // Also, initialize a counter for how many full source string cycles have been completed.
    let currentSearchPointer = -1;
    let completedCycleCount = 0;

    // Iterate through each character of the target string, attempting to find it sequentially
    // within the (conceptually infinite) concatenated source string.
    for ( let targetStringCharIndex = 0; targetStringCharIndex < targetStringLength; targetStringCharIndex++ )
    {
        // Get the 0-25 alphabet index for the current character from the target string.
        const charAlphabetIndex = targetStr.charCodeAt( targetStringCharIndex ) - 97;

        // Determine how many positions are recorded for this specific character in our map.
        const totalCharOccurrences = charLocationMapping[ charAlphabetIndex ].length;

        // If a character from the target string is not present in the source string at all,
        // it's impossible to form the target. Return "-1" to indicate this failure.
        if ( !totalCharOccurrences ) {
            return '-1';
        }

        // Advance the search offset for the current character until we find an occurrence
        // that is strictly greater than our 'currentSearchPointer'.
        while ( characterSearchOffsets[ charAlphabetIndex ] < totalCharOccurrences ) {
            if ( currentSearchPointer < charLocationMapping[ charAlphabetIndex ][ characterSearchOffsets[ charAlphabetIndex ] ] ) {
                break; // Found a valid next position for this character.
            }
            characterSearchOffsets[ charAlphabetIndex ]++; // Move to the next recorded position for this character type.
        }

        // Update the main search pointer to the position of the character just found.
        currentSearchPointer = charLocationMapping[ charAlphabetIndex ][ characterSearchOffsets[ charAlphabetIndex ] ];

        // Check if the 'currentSearchPointer' has advanced into the second virtual source string segment.
        // This signifies that a full cycle of the source string has been traversed.
        if ( currentSearchPointer >= sourceStringLength ) {
            completedCycleCount++; // Increment the cycle counter.
            currentSearchPointer -= sourceStringLength; // Adjust the pointer back to its equivalent position within the first segment.
            characterSearchOffsets.fill ( 0 ); // Reset all character search offsets to 0 for the new cycle.
        }
    }

    // Calculate the final 1-based sequential position.
    // This is the total number of characters traversed:
    // (full cycles * length of source string) + (final position within the last cycle + 1 for 1-based indexing).
    return `${ completedCycleCount * sourceStringLength + currentSearchPointer + 1 }`;

} ) ( require('fs') .readFileSync( '/dev/stdin', 'utf8' ) ) ); // Read the initial input from standard input as a UTF-8 encoded string.