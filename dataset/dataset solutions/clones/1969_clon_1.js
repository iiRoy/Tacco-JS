// This function processes the entire input data provided to the script.
function Main ( input ) {


    var [ N , K ] = input [ 0 ] . split ( " " ) . map ( v => v - 0 ) ; // Deconstruct N and K from the first line of input and convert to numbers.


    var ans = BigInt ( 0 ) ; // Initialize the answer as a BigInt to handle large numbers.

    // Loop through possible lengths 'i' for the arithmetic progression.
    // 'i' represents the number of terms in the sum, from K up to N+1.
    for ( var i = K ; i <= N + 1 ; i ++ ) {

        // Calculate the minimum possible sum for 'i' elements.
        // This is the sum of the first 'i' natural numbers: 1 + 2 + ... + i = i * (i - 1) / 2.
        var min = i * ( i - 1 ) / 2 ;

        // Calculate the maximum possible sum for 'i' elements.
        // This is the sum of the last 'i' numbers from 1 to N: (N-i+1) + ... + N.
        // The sum of an arithmetic series is (number of terms / 2) * (first term + last term).
        // Here, first term is (N-i+1), last term is N, and number of terms is 'i'.
        var max = i * ( ( N - i + 1 ) + N ) / 2 ;

        // Add the count of possible sums for the current 'i' to the total answer.
        // The number of possible sums for 'i' elements is (max_sum - min_sum + 1).
        ans += BigInt ( max - min + 1 ) ;
    }

    // Output the final answer, taking the modulo of 10^9 + 7, and converting it to a string.
    console . log ( ( ans % BigInt ( Math . pow ( 10 , 9 ) + 7 ) ) . toString ( ) ) ;
}


// Execute the Main function with input read from standard input.
// The input is read as a UTF-8 string, trimmed, and then split into an array of lines.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ) ;