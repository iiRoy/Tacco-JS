/*
 * This program processes numerical input.
 * The 'input' parameter contains all the raw input data.
 */
// The main function where all processing happens.
function    Main  (  input  ) {

    // Declare and initialize variable 'a'.
    // It extracts the first number from the first line of input.
    var  a  =  input[0].split(" ")[0]  -  0  ;

    // Declare and initialize variable 'b'.
    // It extracts the second number from the first line of input.
    var  b  =  input[0].split(" ")[1]  -  0  ;


    // Initialize the answer counter.
    var ans    =    0    ;

    // Loop through all numbers from 'a' to 'b' (inclusive).
    for ( var i  =  a  ;  i  <=  b  ;  i++  )  {

        // Convert the current number 'i' to a string, then split it into an array of characters.
        var    tmp    =    i.toString().split("")    ;

        // Check if the number is a palindrome.
        // This is done by comparing the original string representation with its reversed version.
        if  (  tmp.join("")  ==  tmp.reverse().join("")  )
        {
            // If it is a palindrome, increment the answer counter.
            ans++;
        }

    }
    // Output the final count of palindromic numbers found.
    console.log  (  ans  )  ;
}

// Read input from standard input, decode it as UTF-8, and split it by newlines.
// Then, call the Main function with the processed input.
Main  (  require("fs").readFileSync  (  "/dev/stdin"  ,  "utf8"  ) .  split  (  "\n"  )  )  ;