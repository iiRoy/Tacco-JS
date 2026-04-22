/*
 * This JavaScript file contains the 'Main' function designed to process input data.
 * It's a Type I clone, meaning its functionality and core structure are identical
 * to an original source, with only whitespace and comments altered for visual distinction.
 * No identifiers, operators, or expressions have been changed.
 */

function Main ( input )
{
    // Enforcing strict mode helps in writing cleaner code and catching common errors.
    'use strict' ;


    // The input string is first split by newline characters to separate individual lines.
    const   temp    =   input.split ( "\n" ) ;


    // The first element of the 'temp' array (which represents 'n') is parsed as an integer
    // and then removed from the array using 'shift()'.
    const   n   =   parseInt ( temp.shift ( ) ) ;


    // Two empty arrays are declared. 'arr' will store computed differences,
    // while 'arrReverse' is declared but not utilized in the current logic.
    const arr       =   [ ] ;
    const arrReverse=   [ ] ; // This array is present in the original but remains unused.


    // A loop iterates 'n' times to further process the remaining lines in 'temp'.
    for ( let   i   =   0 ; i   <   n ; i ++ )
    {
        // Each line string is split by a space character, converting it into an array of strings.
        temp[ i ]   =   temp[ i ].split ( " " ) ;
        // Original comment indicated a potential parsing step: // temp[i].forEach(e => parseInt(e))
        // However, the actual code does not perform this conversion, leaving values as strings
        // until arithmetic operations implicitly convert them.
    }


    // The 'temp' array is sorted. The custom comparison function `(a, b) => a[0] - b[0]`
    // implicitly converts the first element of each sub-array (which are strings) to numbers
    // for numerical sorting.
    temp.sort ( ( a , b )   =>  a[ 0 ]  -   b[ 0 ] ) ;


    // Nested loops are used to compute differences between all unique pairs of elements
    // from the sorted 'temp' array.
    // The outer loop runs from the first element up to the second-to-last.
    for ( let   i   =   0 ; i   <   n   -   1 ; i ++ )
    {
        // The inner loop starts from the element immediately following 'i' to avoid duplicate pairs
        // and comparing an element with itself.
        for (   let j   =   i   +   1 ; j   <   n ; j ++   )
        {
            // For each pair, the differences between their first and second components are calculated.
            // These calculated differences form a new pair, which is then pushed into the 'arr' array.
            // String values `temp[x][y]` are automatically coerced to numbers during subtraction.
            arr.push (  [   temp[ i ][ 0 ]  -   temp[ j ][ 0 ] ,
                            temp[ i ][ 1 ]  -   temp[ j ][ 1 ]   ]  ) ;
        }
    }


    // The 'arr' array, now containing all the difference pairs, is sorted.
    // The default sort for arrays of numbers will order them lexicographically.
    arr.sort ( ) ;


    // Variables 'm' and 's' are initialized.
    // 'm' will count the current consecutive identical elements.
    // 's' will store the maximum count of identical consecutive elements found so far.
    let m   =   1 ;
    let s   =   0 ;


    // This loop iterates through the sorted 'arr' array to find the longest sequence
    // of identical consecutive difference pairs.
    for (   let i   =   0 ; i   <   arr.length   -   1 ; i ++   )
    {
        // Elements are compared by converting them to JSON strings to ensure a deep comparison
        // for array equality.
        if (    JSON.stringify ( arr[ i ] ) == JSON.stringify ( arr[ i + 1 ] )    )
        {
            m ++ ; // If the current element is identical to the next, increment the counter 'm'.
        }
        else
        {
            // If the elements are different, the current sequence has ended.
            // Check if 'm' (the count of the just-finished sequence) is greater than the
            // previously recorded maximum 's'.
            if (    s   <   m   )
            {
                s   =   m ; // Update 's' if a new maximum sequence length is found.
            }
            m   =   1 ; // Reset 'm' to 1 for the start of a new potential sequence.
        }
    }
    // Note: The original logic does not explicitly handle the case where the *last* sequence
    // in the array is the longest. If the loop ends with 'm' holding the count of the longest
    // sequence (and 's' has not been updated with it), 's' might not reflect the true maximum.
    // This is an exact clone, so this behavior is preserved.


    // Finally, the result (n minus the maximum count 's') is printed to the console.
    // This result typically represents the minimum number of points to remove to satisfy a condition.
    console.log ( n   -   s ) ;
}


// * This section is responsible for reading input and executing the 'Main' function.
// * It must remain unchanged to ensure proper interaction with the standard I/O environment.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;