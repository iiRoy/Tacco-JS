"use strict" ; // Enforce strict mode for cleaner code.

// This function creates an input utility object.
const     create     =    (    )    =>    {
    // Read input from stdin, trim whitespace, and split by newlines.
    const input    =    require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" ) . trim ( ) . split ( "\n" ) ;

    // The result object holds the input list and provides navigation methods.
    const res    =    {
        "list"   :    input    ,    // The array of input lines.
        "index"  :    0        ,    // Current position in the input array.
        "max"    :    input.length, // Total number of input lines.

        // Checks if there are more elements to read.
        "hasNext" :    function    (    )    {
            return    this.index    <    this.max    ;
        }    ,

        // Returns the next element from the input array.
        "next"    :    function    (    )    {
            if    (    !    this.hasNext    (    )    )
            {
                // Throw an error if attempting to read beyond the array bounds.
                throw    "ArrayIndexOutOfBoundsException"    ;
            }
            else
            {
                // Return the current element and then increment the index.
                return    this.list    [    this.index    ++    ]    ;
            }
        }
    }    ;

    // Return the configured input utility object.
    return    res    ;
}    ;

// Initialize the input utility object.
const o    =    create    (    )    ;

// Helper function to get the next string input.
const next    =    (    )    =>    o.next    (    )    ;

// Helper function to get the next integer input.
const nextInt    =    (    )    =>    parseInt    (    o.next    (    )    )    ;

// Helper function to get the next line as an array of strings (split by space).
const nextStrArray    =    (    )    =>    o.next    (    )    .    split    (    " "    )    ;

// Helper function to get the next line as an array of integers (split by space).
const nextIntArray    =    (    )    =>    o.next    (    )    .    split    (    " "    )    .    map    (    el    =>    parseInt    (    el    )    )    ;

// Helper function to get the next line as an array of characters.
const nextCharArray    =    (    )    =>    o.next    (    )    .    split    (    ""    )    ;

// Helper function to check if there is more input.
const hasNext    =    (    )    =>    o.hasNext    (    )    ;

// Custom console output function.
const myout    =    (    ...    x    )    =>    console.log    (    ...    x    )    ;



// Main function where the program logic resides.
const Main    =    (    )    =>    {
    let n    =    nextInt    (    )    ; // Read the first integer (though not used in this specific problem logic).

    // Initialize counters for different submission statuses.
    let a    =    0    ; // Count for "AC" (Accepted).
    let w    =    0    ; // Count for "WA" (Wrong Answer).
    let t    =    0    ; // Count for "TLE" (Time Limit Exceeded).
    let r    =    0    ; // Count for "RE" (Runtime Error).

    // Loop through the remaining input lines.
    while    (    hasNext    (    )    )
    {
        let tmp    =    next    (    )    ; // Get the next submission status string.

        // Increment the corresponding counter based on the status.
        if    (    tmp    ==    "AC"    )    a    ++    ; // If Accepted.
        if    (    tmp    ==    "WA"    )    w    ++    ; // If Wrong Answer.
        if    (    tmp    ==    "TLE"    )    t    ++    ; // If Time Limit Exceeded.
        if    (    tmp    ==    "RE"    )    r    ++    ; // If Runtime Error.
    }

    // Print the final counts for each status.
    console.log    (    `AC x ${a}`    )    ;
    console.log    (    `WA x ${w}`    )    ;
    console.log    (    `TLE x ${t}`    )    ;
    console.log    (    `RE x ${r}`    )    ;

}    ;

// Execute the main function.
Main    (    )    ;