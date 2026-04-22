/*
 * This is a Type I clone of some JavaScript code.
 * It demonstrates variable declarations and conditional logic.
 * The core functionality remains absolutely identical.
 */

// Declare and initialize variable x
var    x    =    A    ; // Assign the value of A to x

// Declare and initialize variable y
var    y    =    B    ; /* Assign B to y */


// Calculate intermediate value i
var    i    =    x    +    (    x    -    1    )    ; // i is x plus (x minus 1)

// Calculate intermediate value j
var    j    =    y    +    (    y    -    1    )    ; /* j is y plus (y minus 1) */

// Calculate final value k
var    k    =    x    +    y    ; // k is the sum of x and y


// Begin conditional logic based on x and y
if    (    x    >    y    )
{
    // If x is greater than y, log i
    console    .    log    (    i    )    ;
}
else    if    (    x    <    y    )
{
    // If x is less than y, log j
    console    .    log    (    j    )    ;
}
else
{
    // If x is equal to y, log k
    console    .    log    (    k    )    ;
}

// End of script