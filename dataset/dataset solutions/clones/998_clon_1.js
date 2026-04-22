/*
 * This configuration object holds
 * essential parameters for input processing.
 */
const    config    =    {
    input    :    '/dev/stdin',    // Specifies the standard input file path for reading
    newline    :    '\n'             // Defines the newline character used for splitting input lines
};


// Read the entire input file synchronously,
// decode it as UTF-8, and then split it into an array of lines.
const line    =    require('fs')
    .readFileSync(config.input,    'utf-8')    // Reads file content
    .split(config.newline);                      // Splits content into an array of strings


// Process the 'line' array:
// 1. Remove the first and last elements from the array.
// 2. Convert each remaining element string to an integer.
const    list    =    line
    .slice(1,    line.length    -    1)    // Creates a new array from index 1 up to (but not including) the last element
    .map(    x    =>    parseInt(x)    )      // Converts each string element 'x' to its integer representation
;


// Extract the very first element of the processed 'list'.
const    head    =    list[0]
;


// Create a new array containing all elements of 'list' except the first one.
// This forms the sequence to iterate over for finding differences.
const tail    =    list.slice(1)
;


/*
 * Perform a reduction operation on the 'tail' array.
 * The goal is to find the maximum difference between any element 'x'
 * and the minimum element encountered *before* 'x' in the sequence.
 *
 * The accumulator (acc) keeps track of:
 * - 'result': The maximum difference found so far.
 * - 'min': The minimum value encountered up to the current point in the iteration.
 */
const    ans    =    tail.reduce(
    (    acc    ,    x    )    =>    {
        // Calculate the potential new maximum difference (current element minus current minimum)
        // and update 'acc.result' if this new difference is greater.
        acc.result    =    Math.max(    acc.result    ,    x    -    acc.min    )    ;

        // Update 'acc.min' if the current element 'x' is smaller than the previously recorded minimum.
        acc.min    =    Math.min(    acc.min    ,    x    )    ;

        // Return the updated accumulator for the next iteration.
        return    acc    ;
    }    ,
    // Initial accumulator value:
    // 'result' is initialized to negative infinity, ensuring any valid difference will be larger.
    // 'min' is initialized to 'head', as it's the first value to consider for the minimum
    // before iterating through the 'tail' array.
    {    result    :    -Infinity    ,    min    :    head    }
);


// Output the final calculated maximum difference to the console.
console.log(    ans.result    )    ;