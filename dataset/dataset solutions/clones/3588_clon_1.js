'use strict'
; // This directive enables strict mode for the entire script.

// This is the primary function for processing the input.
// It takes a single string argument.
/**
 * Main function to process input and produce an output.
 * @param   { string }   input   The raw input string, typically from stdin.
 * @returns { void }             This function prints to console and returns nothing.
 */
function main( input )
{

    // Split the input string by newline characters to get individual lines.
    let     eachCol     =   input.split( '\n' )
    ;

    // Remove the first element from the array, as it's often a header or count.
    eachCol.shift( )
    ;

    // Initialize an empty array to store processed results.
    let     resultArray =   [ ]
    ;



    // Iterate over each line (column) obtained from the input.
    eachCol.forEach( ( col ) =>
    {
        // Convert the current line string into an array of characters.
        let temp = col.split( '' )
        ;

        // Map each character in the `temp` array to a boolean value.
        // If the character is '.', it becomes true; otherwise, false.
        let res = temp.map( ( x ) =>
        {

            // Check if the character is a period.
            if  (   x   ===   '.'   )
            {
                // If it's a period, return true.
                return  true
                ;
            }
            else
            {
                // Otherwise, return false.
                return  false
                ;
            }

        } )
        ;

        // Push the resulting boolean array into the main resultArray.
        resultArray.push( res )
        ;
    } )
    ;


    // Filter the resultArray. This step identifies rows where not all elements are true.
    // In other words, it keeps rows that contain at least one false value.
    let firstDone = resultArray.filter( ( row ) =>
    {
        // Reduce the row to a single boolean value using logical AND.
        // If all elements are true, the reduction result is true.
        // We then negate this result, so rows with any false become true (kept).
        return  !row.reduce( ( a , b ) =>
        {
            return  (   a   &&   b   )
            ;
        } )
        ;
    } )
    ;


    // Transpose the `firstDone` array. This effectively swaps rows and columns.
    let secondReady = tArray( firstDone )
    ;


    // Filter the `secondReady` (transposed) array using the same logic as `firstDone`.
    // This identifies columns (which were originally rows) that contain at least one false.
    let secondDone = secondReady.filter( ( row ) =>
    {
        // Apply the same reduction and negation logic.
        return  !row.reduce( ( a , b ) =>
        {
            return  (   a   &&   b   )
            ;
        } )
        ;
    } )
    ;

    // Transpose `secondDone` back to its original orientation, then make it human-readable.
    let ok = makeReadable( tArray( secondDone ) )
    ;

    // Print the final processed array to the console.
    // Each inner array (row) is joined by an empty string, and then all rows are joined by newlines.
    console.log(
        ok.map( ( each ) =>
        {
            // Join elements of each row to form a string.
            return  each.join( '' )
            ;
        } ).join( '\n' ) // Join the resulting strings with newlines.
    )
    ;
}
; // End of the main function definition.


// This utility function transposes a 2D array.
// It effectively swaps rows and columns.
/**
 * Transposes a 2D array (matrix).
 * @param   { Array<Array<any>> }   a   The input 2D array.
 * @returns { Array<Array<any>> }       The transposed 2D array.
 */
const   tArray  =   ( a )   =>
{
    // Map over the columns of the first row to create new rows for the transposed array.
    return  a[ 0 ].map( ( _ , c ) =>
    {
        // For each column index 'c', create a new row by picking the element at 'c'
        // from each original row 'r'.
        return  a.map( ( r ) => r[ c ] )
        ;
    } )
    ;
}
;


/**
 * 最終処理
 * This function converts a 2D boolean array into a 2D array of strings ('.' or '#').
 * @param   { Array<Array<boolean>> }   secondDoneArray   The array completed with processing steps.
 * @return  { Array<Array<string>> }                      The human-readable array ready for joining.
 */
const   makeReadable    =   ( secondDoneArray )   =>
{
    // Map over each row of the input array.
    let     res     =   secondDoneArray.map( ( row ) =>
    {
        // For each row, map its boolean elements to '.' (for true) or '#' (for false).
        return  row.map( ( eachData ) =>
        {
            // If the data is true, return a period.
            if  (   eachData   )
            {
                return  '.'
                ;
            }
            else
            {
                // Otherwise, return a hash.
                return  '#'
                ;
            }
        } )
        ;
    } )
    ;

    // Return the resulting array of strings.
    return  res
    ;
}
;


// Read the entire content of stdin as a UTF-8 string and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) )
;