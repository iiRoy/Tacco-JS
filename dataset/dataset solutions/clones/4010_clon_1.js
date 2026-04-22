"use strict"; /* This directive enforces strict mode in JavaScript,
                 which helps catch common coding errors and "unsafe" actions. */

// A utility function to generate combinations without repetition.
// The original Japanese comment was replaced with a more descriptive English one.
const combineWithoutRepetitions = ( comboOptions , comboLength ) =>
{
    // Base case: if we need to pick only one element,
    // each option itself forms a combination of length one.
    if ( comboLength === 1 )
    {
        return comboOptions . map ( comboOption => [ comboOption ] ) ;
    }

    // Initialize an array to store all the combinations generated.
    const combos = [ ] ;


    // Iterate through each available option.
    // For each option, we'll recursively find combinations of the remaining options.
    comboOptions . forEach ( ( currentOption , optionIndex ) =>
    {
        // Recursively call the function to find smaller combinations.
        // We slice the array starting from the next element (optionIndex + 1)
        // to ensure no repetition and to maintain order.
        const smallerCombos = combineWithoutRepetitions (
            comboOptions . slice ( optionIndex + 1 ) ,
            comboLength - 1
        ) ;

        // For each smaller combination found, prepend the current option
        // and add it to our main list of combinations.
        smallerCombos . forEach ( ( smallerCombo ) =>
        {
            // Concatenate the current option (as a single-element array)
            // with the smaller combination.
            combos . push ( [ currentOption ] . concat ( smallerCombo ) ) ;
        } ) ;
    } ) ;

    // Return the complete set of combinations.
    return combos ;
}

// The main program logic starts here.
const main = arg =>
{
    // First, clean up the input string:
    // - trim any leading/trailing whitespace.
    // - split the string into an array of lines based on newline characters.
    arg = arg . trim ( ) . split ( "\n" ) ;

    // The first line of input contains the integer N.
    const N = parseInt ( arg [ 0 ] ) ;

    // Extract the 'N' names from the input array.
    // The 'splice' method removes elements from the original array
    // and returns them. We start from index 1 (after N) and take N + 1 items.
    // This might imply an extra item or just how the problem defines input.
    const names = arg . splice ( 1 , N + 1 ) ;

    // These arrays define the indices for the 'march' array to be multiplied.
    // They represent the combinations of 3 distinct letters (M, A, R, C, H).
    const p = [ 0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 , 2 ] ;
    const q = [ 1 , 1 , 1 , 2 , 2 , 3 , 2 , 2 , 3 , 3 ] ;
    const r = [ 2 , 3 , 4 , 3 , 4 , 4 , 3 , 4 , 4 , 4 ] ;

    // Initialize an array to count occurrences of names starting with
    // 'M', 'A', 'R', 'C', 'H' respectively.
    let march = [ 0 , 0 , 0 , 0 , 0 ] ;

    // Loop through each name in the 'names' array.
    // The 'for...in' loop iterates over property names (indices for arrays).
    for ( let i in names )
    {
        // Check the first character of each name.
        // If it matches 'M', increment the counter for 'M'.
        if ( names [ i ] [ 0 ] === "M" )
        {
            march [ 0 ] ++ ;
        }

        // If it matches 'A', increment the counter for 'A'.
        if ( names [ i ] [ 0 ] === "A" )
        {
            march [ 1 ] ++ ;
        }

        // If it matches 'R', increment the counter for 'R'.
        if ( names [ i ] [ 0 ] === "R" )
        {
            march [ 2 ] ++ ;
        }

        // If it matches 'C', increment the counter for 'C'.
        if ( names [ i ] [ 0 ] === "C" )
        {
            march [ 3 ] ++ ;
        }

        // If it matches 'H', increment the counter for 'H'.
        if ( names [ i ] [ 0 ] === "H" )
        {
            march [ 4 ] ++ ;
        }
    }

    // Initialize the variable to hold the final answer.
    let answer = 0 ;

    // Iterate 10 times, corresponding to the 10 combinations defined by p, q, r.
    for ( let i = 0 ; i < 10 ; i ++ )
    {
        // For each iteration, multiply the counts of the characters
        // at indices p[i], q[i], and r[i] from the 'march' array.
        // Add this product to the total answer.
        answer += march [ p [ i ] ] * march [ q [ i ] ] * march [ r [ i ] ] ;
    }

    // Print the final calculated answer to the standard output.
    console . log ( answer ) ;
}

// Execute the main function with input read from '/dev/stdin'.
// This is a common way to handle input in competitive programming environments,
// using Node.js's file system module.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;