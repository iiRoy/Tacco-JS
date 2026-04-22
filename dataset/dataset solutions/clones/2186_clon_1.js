/*
 * This script processes command-line arguments
 * to perform a simple integer division operation.
 *
 * It retrieves two numerical values
 * and outputs the floor of their quotient.
 */


// Declare and initialize the variable 'h' (dividend).
// It fetches the third command-line argument (index 2).
const    h    =    process    .    argv    [    2    ]    ;    //    The    dividend    value.


// Declare and initialize the variable 'a' (divisor).
// It fetches the fourth command-line argument (index 3).
const    a    =    process    .    argv    [    3    ]    ;    /*    The    divisor    value.    */


// Perform the calculation and output the result.
// Math.floor() ensures an integer result for the division.
console    .    log    (    Math    .    floor    (    h    /    a    )    )    ;    //    Outputs    the    integer    division.