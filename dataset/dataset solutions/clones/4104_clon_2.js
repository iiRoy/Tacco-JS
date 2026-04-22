'use strict';

// This function is designed to handle raw text input, extract numerical data,
// and then report on the quantity of distinct numbers found after some processing.
function processContent(sourceContent) {
    // First, we parse the incoming string content. It's split into individual lines,
    // and each line is subsequently converted into an integer number using base 10.
    // The resulting collection of numbers is stored in a mutable list.
    let numericValues = sourceContent
                            .split('\n')
                            .map( (currentStr) => parseInt(currentStr, 0xA) );
    
    // We then remove the very first element from our list of parsed numeric items.
    // This is often done to discard a header or a count that's not part of the actual data.
    numericValues.shift();

    // Finally, we perform several operations:
    // 1. Create a new Set from the numeric values to automatically eliminate any duplicate entries.
    // 2. Convert this Set back into an Array to allow for sorting.
    // 3. Sort the unique numbers in ascending order using a comparison function.
    // 4. Retrieve the total count of these unique, sorted numbers.
    // This final count is then printed to the standard output.
    console.log(
        Array
            .from(new Set(numericValues))
            .sort( (valA, valB) => valA - valB )
            .length
    );
}
 
// To initiate the process, we invoke our main data processing routine.
// It reads all content from the standard input stream ('/dev/stdin') as a UTF-8 string,
// and this entire string is then passed as the source content for analysis.
processContent(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);