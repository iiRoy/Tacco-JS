/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript practices.
 */
"use strict"

// Define the main function that processes the input argument.
const main = arg => {

    // Trim leading/trailing whitespace from the input and split it into an array of lines.
    arg = arg.trim() .split("\n") ;

    // The first line of the input is the string to be processed.
    const str = arg[0] ;

    // Get the length of the string.
    const len = str.length ;

    // The second line of the input is an integer 'k'. Parse it.
    const k = parseInt(arg[1]) ;

    // Extract unique initial characters from the string, convert to an array, and sort them.
    const initials = [...new Set(str.split(''))].sort() ;

    // Initialize an index for iterating through 'initials'.
    let index = 0 ;

    // Create a Set to store unique substrings (dictionary).
    const dic = new Set() ;


    // Loop until the dictionary contains 'k' unique substrings.
    while ( dic.size < k ) {

        // Iterate through the main string to find substrings.
        for ( let i = 0 ; i < len ; i++ ) {

            // Initialize substring length.
            let j = 1 ;

            // Check if the current single character substring matches the initial character at 'index'.
            // If not, skip to the next character in the main string.
            if ( str.slice( i , i + j ) !== initials[index] )
                continue ;

            // While the substring is within bounds and its length is not more than 5.
            while ( (i + j <= len) && (j <= 5) ) {
                // Add the current substring to the dictionary.
                dic.add(str.slice(i, i + j)) ;
                // Increment substring length.
                j += 1 ;
            }

        }

        // Move to the next initial character for the next iteration of the outer loop.
        index++ ;
    }

    // Convert the Set of substrings to an array, sort it alphabetically, and get the (k-1)-th element.
    const ans = [...dic].sort()[k - 1] ;

    // Print the result to the console.
    console.log(ans) ;
}

// Read input synchronously from standard input, decode it as UTF-8, and pass it to the main function.
main( require("fs").readFileSync("/dev/stdin", "utf8") ) ;