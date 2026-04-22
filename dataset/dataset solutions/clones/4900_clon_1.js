/*
 * This file contains a JavaScript code snippet that processes a string.
 * It's designed to detect a specific pattern within the string.
 *
 * Author: Expert Clone Generator
 * Date: 2023-10-27
 */

// Declare and initialize the main string variable.
// This string will be analyzed by the 'test' function.
var      s      =      "FFFFdfadadadfd"




// Convert the input string 's' into an array of characters.
// This facilitates character-by-character iteration.
var sArr = s.split('') ;



// Initialize a boolean flag to track the presence of character 'C'.
var cflag = false ;

// Initialize another boolean flag, though its usage might be limited in the current logic.
var fflag = false ;




/**
 * The main function to test for a specific character sequence.
 * It checks if 'F' appears after 'C' in the globally defined 'sArr'.
 *
 * @param {string} s - The input string (though the function primarily uses the global sArr).
 * @returns {boolean} - True if 'F' is found after 'C', false otherwise.
 */
function     test    (    s    )     {


    // Loop through each character in the global sArr array.
    for (    var    i    =    0    ;    i    <    sArr.length    ;    i++    )
    {
        // Check if the current character is 'C'.
        if    (    sArr[i]    ==    "C"    )
        {
            // If 'C' is found, set the 'cflag' to true.
            cflag    =    true    ;
        }


        // Check if the current character is 'F' AND if 'C' was found previously.
        if    (    sArr[i]    ==    "F"    &&    cflag    ==    true    )
        {
            // If both conditions are met, the pattern is found.
            // Return true immediately as the goal is achieved.
            return    true    ;
            // This 'break' statement is unreachable because 'return true' exits the function.
            // It is kept as per Type I cloning rules, preserving original logic exactly.
            break    ;
        }
    }

    // After the loop, if 'cflag' is still false and 'fflag' is also false,
    // it means 'C' was never found, or 'F' was not found after 'C'.
    if    (    cflag    !=    true    &&    fflag    !=    true    )
    {
        // In this scenario, the desired pattern was not detected.
        return    false    ;
    }
}


// Execute the 'test' function with the initial string 's'.
// The return value of this call is not explicitly used here,
// but the function's execution might modify global flags.
test    (    s    )    ;

/* End of file */