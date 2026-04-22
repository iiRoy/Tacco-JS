"use strict"
    ; // Ensure strict mode for the entire script execution.

const main =  arg  =>   {
    // The main function receives the raw input argument.

    arg  =  arg.trim() .split( "\n" ) ; // First, remove leading/trailing whitespace, then split by newlines.

    const N  =  parseInt ( arg [ 0 ] ) ; // The first line of input provides the value for N.

    const A  =  arg [ 1 ] .split( " " ) .map( n => parseInt( 2  *  n ) ) ; // The second line contains space-separated numbers, convert them to integers and double their value.

    let offset  =  0 ; // Initialize an offset variable to accumulate values.

    // This loop calculates the final 'offset' based on the array A.
    for ( let i = 0 ;  i < N ;  i++ ) {
        offset  =  A [ i ]  -  offset ; // Update offset in an alternating sum fashion.
    }


    let x  =  offset  /  2 ; // Calculate the initial value for 'x' which is half of the final offset.

    let cur  =  x ; // Initialize 'cur' with the calculated 'x'. This will be the first element of our result.

    let answer  =  [ ] ; // Create an empty array to store the final computed answer.

    // This loop computes each element of the 'answer' array.
    for ( let i = 0 ;  i < N ;  i++ ) {
        answer.push ( cur ) ; // Add the current value to the answer array.
        cur  =  A [ i ]  -  cur ; // Update 'cur' for the next iteration based on A[i] and the previous 'cur'.
    }

    console.log ( answer.join ( " " ) ) ; // Output the elements of the answer array joined by spaces.
}

main ( require( 'fs' ) .readFileSync ( '/dev/stdin' ,  'utf8' ) ) ; // Read input from standard input and pass it to the main function.