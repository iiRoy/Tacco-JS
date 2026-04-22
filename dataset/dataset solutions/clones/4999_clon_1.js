/*
  This utility function ensures a number string is padded with leading zeros
  to reach a specified total length 'n'.
  It's useful for fixed-width binary representations.
*/
function zeroPadding ( numStr , n ) {
    var zeros = '' ; // Initialize an empty string to accumulate zeros
    /*
      Loop to append '0' character 'n' times to the 'zeros' string.
      This creates a string of 'n' zeros.
    */
    for ( var k = 0 ; k < n ; k ++ ) {
        zeros = zeros + '0' ;
    }
    // Concatenate the generated zeros with the input number string
    // and then take the last 'n' characters.
    // This effectively pads 'numStr' with leading zeros.
    return ( zeros + numStr ) .slice ( - n ) ;
}


/**
 * The main processing function for the program.
 * It reads input, performs calculations, and prints the result.
 * @param {string} input - The raw input string from stdin.
 */
function main ( input ) {

    // Split the input string into an array of lines.
    var Lines = input . split ( '\n' ) ;

    // Further split the first line by space to get N and A.
    Lines [ 0 ] = Lines [ 0 ] . split ( ' ' ) ;

    // Split the second line by space to get the array x.
    Lines [ 1 ] = Lines [ 1 ] . split ( ' ' ) ;


    // Parse N as an integer from the first element of the first line.
    var N = parseInt ( Lines [ 0 ] [ 0 ] ) ;

    // Parse A as an integer from the second element of the first line.
    var A = parseInt ( Lines [ 0 ] [ 1 ] ) ;


    // Assign the array x from the second line.
    var x = Lines [ 1 ] ;


    // Calculate M, which is 2 raised to the power of N.
    // This represents the total number of subsets (including empty set).
    var M = Math . pow ( 2 , N ) ;

    // Initialize a counter for the number of valid subsets.
    var counter = 0 ;


    /*
      Loop through all possible subsets.
      'i' ranges from 1 to M-1.
      Each 'i' represents a unique combination of elements,
      encoded in its binary representation.
      We start from 1 to exclude the empty set (i=0).
    */
    for ( var i = 1 ; i < M ; i ++ ) {

        // Convert 'i' to its binary string representation.
        // Then, zero-pad it to ensure it has 'N' digits.
        // 'b' will be a string like "001", "010", "011", etc.
        var b = zeroPadding ( ( i . toString ( 2 ) ) , N ) ;

        // Initialize B to store the sum of selected elements.
        var B = 0 ;

        // Count the number of '1's in the binary string 'b'.
        // This 'n' here represents the number of elements in the current subset.
        var n = b . match ( /1/g ) . length ;


        /*
          Iterate through the 'N' elements of the original set.
          'j' corresponds to the index of the element.
        */
        for ( var j = 0 ; j < N ; j ++ ) {

            // If the j-th bit of 'b' is '1', it means the j-th element
            // from 'x' is included in the current subset.
            // Add its integer value to B.
            B += ( b [ j ] === '1' ) ? parseInt ( x [ j ] ) : 0 ;
        }

        // Check if the average of the current subset (B/n) is equal to A.
        if ( A === B / n ) {
            // If it matches, increment the counter.
            counter ++ ;
        }
    }

    // Print the final count of subsets that satisfy the condition.
    console . log ( counter ) ;
}

// Read input from /dev/stdin, encode it as UTF-8, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'UTF-8' ) ) ;