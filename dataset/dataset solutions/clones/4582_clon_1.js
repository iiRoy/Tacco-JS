// This line enforces strict parsing and error handling in JavaScript.
"use strict" ;


// Define the main processing function, which takes 'arg' as its input parameter.
const main = ( arg ) => {

    // First, clean up the input string by trimming whitespace and splitting it into an array of lines.
    arg = arg . trim ( ) . split ( "\n" ) ;

    // Parse the value of N from the first part of the first line of input.
    const N = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
    // Parse the value of K from the second part of the first line of input.
    const K = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;


    // Process the remaining lines of the input (from index 1 up to N+1).
    // Each line is split by space, and then each part is converted to an integer.
    const AB = arg . slice ( 1 , N + 1 ) . map ( n => n . split ( " " ) . map ( l => parseInt ( l ) ) ) ;


    // Initialize an array with the first element from AB, including its cumulative total amount.
    let array = [ { num : AB [ 0 ] [ 0 ] , amount : AB [ 0 ] [ 1 ] , totalAmount : AB [ 0 ] [ 1 ] } ] ;
    // Initialize a variable to keep track of the running total amount.
    let totalAmount = AB [ 0 ] [ 1 ] ;


    // Loop through the rest of the AB array, starting from the second element.
    for ( let i = 1 ; i < N ; i ++ ) {
        // Add the 'amount' from the *previous* element in AB to the running total.
        totalAmount += AB [ i - 1 ] [ 1 ] ;
        // Create a temporary object for the current element, including its number, amount, and the current cumulative total.
        let temp = { num : AB [ i ] [ 0 ] , amount : AB [ i ] [ 1 ] , totalAmount : totalAmount } ;

        // Add the newly created temporary object to our 'array'.
        array . push ( temp ) ;

    }


    // Iterate over the 'array' to find the first element that meets the condition.
    for ( let i in array ) {
        // Check if the current element's totalAmount is greater than or equal to K.
        if ( array [ i ] . totalAmount >= K ) {
            // The original code had a commented-out debug line here. We'll keep it commented but modify its spacing.
            // console . log ( JSON . stringify ( array [ i ] ) ) ;

            // Calculate the answer based on a ternary condition:
            // If the total amount *before* adding the current item's amount was less than K, use the current item's number.
            // Otherwise, use the number from the *previous* item in the array.
            const answer = array [ i ] . totalAmount - array [ i ] . amount < K ? array [ i ] . num : array [ i - 1 ] . num ;
            // Print the calculated answer to the console.
            console . log ( answer ) ;
            // Exit the function immediately once the answer is found and printed.
            return ;
        }
    }


    // If the loop completes without finding an answer (i.e., totalAmount never reached K),
    // print the entire 'array' as a JSON string. This might indicate an edge case or error.
    console . log ( JSON . stringify ( array ) ) ;
}


// Read the input from standard input (/dev/stdin) as a UTF-8 string,
// and then pass it to the main function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;