/*
 * This program converts a decimal number to its base -2 representation.
 * Original problem: Base -2 conversion.
 */
"use strict" ; // Enforce strict parsing and error handling rules.


const    DEBUG_MODE    =    false   ; // Flag to enable debug input.


const    rawInput    =    DEBUG_MODE
       ?    "-9"                                     // Debug input value.
       :    require("fs")                            // Node.js file system module.
                .readFileSync("/dev/stdin", "utf8")  // Read input from standard input.
                .trim()                              ; // Remove leading/trailing whitespace.


const    process    =    inputRaw    =>    {          // Main processing function definition.
    let    input    =    parseInt(inputRaw) ;        // Convert raw string input to an integer.
    let    result    =    ""             ;          // Initialize an empty string to store the base -2 result.


    while    (    input    !==    0    )    {        // Loop continues until the input number becomes zero.
        let    remainder    =    input    %    -2   ; // Calculate the remainder when divided by -2.
        input    =    ~~(input    /    -2)   ;        // Perform integer division by -2 using bitwise NOT operator.


        if    (    remainder    <    0    )    {    // If the remainder is negative, adjust it.
            remainder    *=    -1    ;              // Make the remainder positive.
            input    +=    1     ;                  // Adjust the quotient (input) accordingly.
        }


        result    =    Number(remainder).toString()    +    result    ; // Prepend the remainder (as a string) to the result.
    } // End of while loop.


    console.log(result)    ; // Output the final base -2 representation to the console.
} ; // End of process function definition.


process(rawInput)    ; // Call the processing function with the obtained raw input.
// End of script.