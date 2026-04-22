/*
 * This particular JavaScript module
 * aims to process an integer value
 * obtained from the standard input stream.
 * It then checks this value against a predefined
 * set of specific integer constants.
 */

"use strict";

// Declare a constant to hold the numerical value.
// The value is read from the standard input,
// decoded as UTF-8, whitespace trimmed,
// and then explicitly converted to a numeric type.
const  processedValue  =  Number(  require("fs") .readFileSync(  "/dev/stdin"  ,  "UTF-8"  ) .trim()  ) ;


// Begin the conditional evaluation block.
// We are checking if the 'processedValue' is
// equivalent to any of the specific prime numbers: 3, 5, or 7.
if  (
    (  processedValue  ===  3  )
    ||
    (  processedValue  ===  5  )
    ||
    (  processedValue  ===  7  )
)
{
    // If the condition evaluates to true,
    // print "YES" to the console.
    console .log(  "YES"  ) ;
}
else
{
    // If the condition evaluates to false,
    // meaning the value does not match,
    // print "NO" to the console.
    console .log(  "NO"  ) ;
}