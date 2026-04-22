function    Main   (   input   )   {
    // This is the main function that processes the input data.

    input  =  input.split( "\n" ) ; // Split the input string by newline characters.

    if ( input [ input.length - 1 ] === '' ) {
        input.pop ( ) ; // Remove the last element if it's an empty string (common for trailing newlines).
    }

    const N = input [ 0 ] . split ( ' ' ) [ 0 ] - 0 ; // Extract the first number from the first line and convert to integer.

    var temp , pointer ; // Declare temporary variables: 'temp' for calculations, 'pointer' for array traversal.

    const A = input [ 1 ] . split ( ' ' ) . map ( e => { // Parse the second line into an array of numbers.
        return e - 0 ; // Convert each string element 'e' to a number.
    } ) ;

    var memo = [ ] ; // Initialize an array to store intermediate results (memoization).

    pointer = 0 ; // Initialize pointer to the start of array A.
    temp = 0 ; // Initialize temp to 0.

    // First phase: find the longest prefix satisfying the condition.
    while ( pointer < N && ( ( temp ^ A [ pointer ] ) === ( temp + A [ pointer ] ) ) ) {
        temp = temp + A [ pointer ] ; // Update 'temp' by adding the current element.
        pointer ++ ; // Move the pointer to the next element.
    }

    memo.push ( pointer - 1 ) ; // Store the end index of the first valid segment.

    // Second phase: iterate through the array, adjusting 'temp' and 'pointer'.
    for ( var i = 1 ; i < N ; i ++ ) {
        temp = temp ^ A [ i - 1 ] ; // Update 'temp' by XORing with the element that is no longer part of the segment.

        while ( pointer < N && ( ( temp ^ A [ pointer ] ) === ( temp + A [ pointer ] ) ) ) {
            temp = temp + A [ pointer ] ; // Extend the segment to the right as long as the condition holds.
            pointer ++ ;
        }
        memo.push ( pointer - 1 ) ; // Store the end index for the current 'i'.
    }

    // Calculate and log the final result by reducing the 'memo' array.
    console.log ( memo.reduce ( ( acc , cur , index ) => {
        return acc + ( cur - index + 1 ) ; // Accumulate the sum based on the formula.
    } , 0 ) ) ;

} // End of Main function definition.


/*
 * The following line should NOT be modified under any circumstances.
 * It is responsible for reading the entire standard input at once
 * and then invoking the 'Main' function with that input.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;