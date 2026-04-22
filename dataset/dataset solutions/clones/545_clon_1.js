// This script reads input from standard input, processes it, and prints results.

// First, we read the entire content of standard input.
// The 'fs' module is used for file system operations.
var input =   require('fs') .  readFileSync(   '/dev/stdin'  , 'utf8'  )  ;

// Next, we process the input string.
// - trim() removes leading/trailing whitespace.
// - split("\n") breaks the string into an array of lines.
var Arr = (  input.trim()  ) .  split(  "\n"  )  ;


// This is the main processing loop. It continues until a specific condition is met.
while(   true   )
{
    // Read the first number from the array, convert it to a number, and remove it from the array.
    var   n   =   Arr.shift()   -   0   ;

    // Check if the read number 'n' is zero. If so, terminate the loop.
    if  (  n  ==  0  )
    {
        break  ; // Exit the while loop.
    }

    // Initialize scores for two players, 'a' and 'b'.
    var   a   =   0   ;
    var   b   =   0   ;

    // This loop iterates 'n' times to process 'n' rounds of a game.
    for  (  var   i   =   0  ;  i   <   n  ;  i++   )
    {
        // For each round, read a line, split it by space, and convert parts to numbers.
        var   arr   =   (  Arr.shift()  ) .  split(  " "  ) .  map(  Number  )  ;

        // Compare the two numbers in 'arr' to determine who scores.
        // If the first number is greater, player 'a' scores.
        if  (  arr[0]   >   arr[1]  )
        {
            a   +=   arr[0]   +   arr[1]   ;
        }

        // If the second number is greater, player 'b' scores.
        if  (  arr[0]   <   arr[1]  )
        {
            b   +=   arr[0]   +   arr[1]   ;
        }

        // If both numbers are equal, both players score their respective numbers.
        if  (  arr[0]   ==   arr[1]  )
        {
            a   +=   arr[0]   ;
            b   +=   arr[1]   ;
        }
    }

    // After all rounds for the current 'n' are processed, print the scores.
    console.log(   a   +   " "   +   b   )   ;
}

// End of script.