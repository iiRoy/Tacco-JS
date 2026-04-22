// Function to process input string, splitting it into rows and then into elements.
// Optionally converts elements to integers.
function spilitInput ( input , to_int ) {

    // If 'to_int' parameter is not explicitly provided,
    // default its value to 'false'. This ensures consistent behavior.
    if ( typeof to_int === 'undefined' ) {
        to_int = false ;
    }

    // Initialize an empty array to store the processed, split data.
    var splited = [] ;

    // Split the entire input string by newline characters to get individual rows.
    var rows = input.split ( '\n' ) ;

    // Iterate through each row obtained from the input.
    for ( var i = 0 ; i < rows.length ; i += 1 ) {
        // Check if the conversion to integer is requested.
        if ( to_int ) {
            // Split the current row by spaces and then map each resulting
            // string element to its integer representation (base 10).
            splited.push ( rows [ i ] .split ( ' ' ) .map ( function ( d ) {
                return parseInt ( d , 10 ) ;
            } ) ) ;
        } else {
            // If integer conversion is not requested,
            // simply split the current row by spaces and push the array.
            splited.push ( rows [ i ] .split ( ' ' ) ) ;
        }
    }
    // Return the final array of split and optionally converted data.
    return splited ;
}

// Helper function to initialize a dynamic programming array.
// Creates an array of size N+2 and fills it with a specified initial value.
function initDp ( N , init_n ) {
    return Array ( N + 2 ) .fill ( init_n ) ;
}

// Helper function to find the minimum of two values and update 'a'.
// Note: This function as written for primitives has no external effect because 'a' is passed by value.
function chmin ( a , b ) {
    if ( a > b ) {
        a = b ;
    }
}

// Helper function to find the maximum of two values and update 'a'.
// Similar to chmin, this function has no external effect on primitive 'a' passed by value.
function chmax ( a , b ) {
    if ( a < b ) {
        a = b ;
    }
}

// The primary execution function for the program.
// It takes the raw input string, processes it, performs calculations, and outputs the result.
function Main ( input ) {

    // Process the input string, splitting it and converting elements to integers.
    var splited = spilitInput ( input , true ) ;

    // Extract the value of N from the first element of the first processed row.
    var N = splited [ 0 ] [ 0 ] ;

    // Initialize an array to store specific 'hason' values from the input.
    var hasons = [] ;

    // Loop through the remaining rows of the split input (starting from the second row).
    // Extract the first element of each row and add it to the 'hasons' array.
    for ( var i = 1 ; i < splited.length ; i += 1 ) {
        hasons.push ( splited [ i ] [ 0 ] ) ;
    }

    // Initialize a dynamic programming array 'dp' of size N+2, filled with zeros.
    var dp = initDp ( N , 0 ) ;

    // Set the base case for the DP array: dp[0] is 1.
    dp [ 0 ] = 1 ;

    // Main dynamic programming loop.
    // Iterates from 1 up to N (inclusive).
    for ( var i = 1 ; i <= N ; i += 1 ) {

        // Check if the current 'i' matches the first element in the 'hasons' array.
        // This condition likely represents a "skip" or "forbidden" step in the DP.
        if ( hasons [ 0 ] == i ) {
            // If matched, remove the first element from 'hasons' array.
            hasons.shift () ;
            // Skip the rest of the current iteration and move to the next 'i'.
            continue ;
        }

        // DP transition: Add the value from the previous step (i-1).
        dp [ i ] += dp [ i - 1 ] ;

        // If 'i' is 2 or greater, add the value from two steps back (i-2).
        if ( i >= 2 ) {
            dp [ i ] += dp [ i - 2 ] ;
        }

        // Apply modulo operation to keep the numbers within a specific range
        // (often used to prevent integer overflow in competitive programming).
        dp [ i ] %= 1000000007 ;
    }

    // Output the final computed value at dp[N] to the console.
    console.log ( dp [ N ] ) ;
}

// Entry point of the program.
// Reads input from standard input, converts it to a UTF-8 string, and passes it to the Main function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;