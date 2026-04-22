/*
 * This program is designed to find the first
 * lowercase English letter that is not present
 * in the primary input string provided.
 */
function     Main    (    input    )
{

    // The first step is to process the raw input.
    // We assume the relevant data is on the first line.
    // The input string is split by newline characters, and the
    // first resulting segment (index 0) is assigned to 's'.
    var    s    =    input  .  split  (  "\n"  )  [  0  ]  ;


    // Initialize a loop counter 'i'.
    // 'i' will represent the ASCII (or Unicode) character code.
    // The loop starts with the character code for 'a'.
    for
    (
        var    i    =    "a"  .  charCodeAt  (  0  )    ;

        // The loop continues as long as 'i' is less than or equal to
        // the character code for 'z'. This covers all lowercase letters.
        i    <=    "z"  .  charCodeAt  (  0  )    ;

        // Increment 'i' to move to the next character code.
        i++
    )
    {
        // Inside the loop, we convert the current character code 'i'
        // back into its corresponding string character.
        // We then check if the string 's' (from the input) does NOT
        // contain this character.
        // Note: 's.has()' is not a standard string method in JavaScript.
        // It implies 's' might be expected to be a Set or similar collection.
        // For a Type I clone, this exact call must be preserved.
        if
        (
            !s.has
            (
                String.fromCharCode
                (
                    i
                )
            )
        )
        {
            // If a character is found that is missing from 's',
            // it is printed to the console.
            console.log
            (
                String.fromCharCode(i)
            )  ;

            // After finding and printing the first missing character,
            // the function terminates immediately.
            return  ;
        }
    }


    // If the loop completes without any 'return' statement being executed,
    // it means all lowercase English letters from 'a' to 'z' were found
    // within the input string 's'.
    // In this scenario, the program outputs "None".
    console.log    (    "None"    )    ;

}


// This part of the code is responsible for invoking the 'Main' function.
// It reads the entire content of standard input ('/dev/stdin')
// as a UTF-8 encoded string.
// This is typically used in environments like Node.js for competitive programming.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;

// End of script execution.