/*
 * This is a JavaScript function designed to process input data.
 * It evaluates a specific condition based on numerical values.
 */
function    main   (  input  )
{
    // Process the input string to extract an array of numbers.
    const   nums   =   input
        .trim()     // Remove any leading or trailing whitespace from the input.
        .split(   /\s/   )   // Split the string into an array of substrings using whitespace as a delimiter.
        .map(  str  =>  Number(str)  )   ; // Convert each substring to a numerical value.

    // Evaluate a condition and print "Yes" or "No" to the console.
    // The condition checks if:
    // 1. The first number is not zero.
    // 2. The first number is equal to the second number.
    // 3. The first number is equal to the third number.
    console.log(
            nums[0]   !==   0
        &&
            nums[0]   ===   nums[1]
        &&
            nums[0]   ===   nums[2]
        ?
            "Yes"
        :
            "No"
    )   ;
}

// Execute the main function, providing input read from standard input.
// This typically reads the entire content of a file (e.g., from '/dev/stdin' on Unix-like systems).
main(   require( "fs" ) . readFileSync( "/dev/stdin" ,  "utf8" )   )   ;