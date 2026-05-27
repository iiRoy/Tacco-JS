function ProcessInput( rawData ) {

    // The raw input string is split into an array of lines based on newline characters.
    rawData = rawData.split( '\n' );
    
    // The first line of the input specifies the total number of strings that follow.
    const numLines = Number( rawData[0] );
    
    // An array to hold each input string, converted into a sorted array of its characters.
    let sortedCharArrays = [];
    
    // Loop through the input lines, starting from the second line (index 1)
    // up to the line indicated by 'numLines'.
    for ( let idx = 1; idx < numLines + 1; idx++ ) {
        // For each relevant input line, convert it into an array of characters,
        // then sort these characters alphabetically, and add the resulting array
        // to our collection.
        sortedCharArrays.push( [].slice.call( rawData[idx] ).sort() );
    }
    
    // This variable is declared but not directly used for building the final output string
    // as the result is joined at the very end.
    let finalOutputString = ''; 
    
    // The first sorted character array is extracted to serve as the initial set
    // of common characters. This array will be progressively intersected with others.
    let currentIntersection = sortedCharArrays.shift();
    
    /**
     * Recursively computes the intersection of characters across multiple sorted character arrays.
     * It takes a base array and a list of remaining arrays, finding characters common to all.
     * 
     * @param {Array<string>} currentBase The current set of common characters found so far.
     * @param {Array<Array<string>>} remainingArrays A list of character arrays yet to be intersected.
     * @returns {Array<string>} An array containing characters common to all original strings.
     */
    function findCommonCharacters( currentBase, remainingArrays ) {
        // Base case: If there are no more arrays left to process,
        // the 'currentBase' contains the final common characters.
        if ( remainingArrays.length === 0 ) {
            return currentBase;
        }
        
        // Get the next character array from the list to intersect with the current base.
        let nextStringChars = remainingArrays.shift();
        
        // This array will store the characters that are common between 'currentBase'
        // and 'nextStringChars'.
        let intersectionResult = [];
        
        // Iterate through each character in the 'currentBase' array.
        for ( let idx = 0; idx < currentBase.length; idx++ ) {
            // For each character in 'currentBase', iterate through characters in 'nextStringChars'.
            for ( let charIdx = 0; charIdx < nextStringChars.length; charIdx++ ) {
                // If a character from 'currentBase' matches a character from 'nextStringChars'...
                if ( currentBase[idx] === nextStringChars[charIdx] ) {
                    // Add the common character to our 'intersectionResult'.
                    intersectionResult.push( currentBase[idx] );
                    // Remove the matched character from 'nextStringChars' to ensure
                    // that each character is used only once per intersection (important for duplicates).
                    nextStringChars.splice( charIdx, 1 );
                    // Break from the inner loop and move to the next character in 'currentBase'.
                    break;
                }
            }
        }
        
        // Recursively call the function with the newly found intersection as the new base,
        // and the rest of the arrays.
        return findCommonCharacters( intersectionResult, remainingArrays );
    }
    
    // Initiate the recursive process to determine the characters common to all input strings.
    const finalCommonChars = findCommonCharacters( currentIntersection, sortedCharArrays );
    
    // After processing all strings, check if any common characters were found.
    if ( finalCommonChars.length === 0 ) {
        // If the array of common characters is empty, print an empty line to standard output.
        console.log();
    } else {
        // Otherwise, join the common characters into a single string and print it.
        console.log( finalCommonChars.join( '' ) );
    }
    
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
