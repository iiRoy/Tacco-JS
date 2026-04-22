/*
 * This is the main function responsible for processing the input.
 * It counts occurrences of a specific character and determines an answer.
 */
function     Main(     input     ) {

    // First, split the input string by newline characters
    input =     input.split(     "\n"     )     ;

    // Get the first line and split it into an array of characters
    var     S     =     input[0].split(     ""     )     ;

    // Initialize a counter for the character 'x'
    var     c=0     ;

    // Loop through each character in the array S
    for(     var     i=0     ;     i<S.length     ;     i++     )     {

        // Check if the current character is 'x'
        if(     S[i]=="x"     )     {
            // If it is, increment the counter
            c++     ;
        }
    }

    // Initialize the answer as "NO"
    var     ans="NO"     ;

    // If the count of 'x' is 7 or less, change the answer to "YES"
    if(     c<=7     )     {
        ans="YES"     ;
    }

    // Output the final answer to the console
    console.log(     '%s'     ,     ans     )     ;

    // Return the calculated answer
    return     ans     ;
}

/*
 * This debug function simulates running the Main function
 * with input from HTML elements and displays the result.
 */
function     debug(     n     )     {

    // Retrieve input value from a specific HTML element
    var     input     =     document.getElementById(     "input"+n     ).value     ;

    // Call the main processing function with the retrieved input
    var     ans=Main(     input     )     ;

    // Initialize the result status to "WA" (Wrong Answer)
    var     result="WA"     ;

    // Compare the answer from Main with the expected output from an HTML element
    if(     ans==document.getElementById(     "output"+n     ).value.split(     "\n"     )[0]     )     {
        // If they match, set the result status to "AC" (Accepted)
        result="AC"     ;
    }

    // Display the result status in another HTML element
    document.getElementById(     "result"+n     ).innerHTML=result     ;
}

// This section executes the Main function with standard input when run in a Node.js environment.
Main(     require(     "fs"     ).readFileSync(     "/dev/stdin"     ,     "utf8"     )     )     ;