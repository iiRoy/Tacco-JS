/*
  * This program reads a single numeric value from standard input,
  * performs a specific calculation involving division, modulo,
  * and conditional additions, then prints the final result.
  */

const  rawInputData = require('fs')  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  ;

const  processedLines  =  rawInputData .  split  (  '\n'  )  ;

// Obtain the primary numerical datum by parsing the first line
// The `Number()` constructor is used for explicit type conversion.
let  primaryDatum  =  Number  (  processedLines.shift()  )  ;

// Initialize a variable to store the ultimate calculated outcome.
// The initial calculation involves integer division and multiplication.
let  ultimateOutcome  =  Math  .  floor  (  primaryDatum  /  11  )  *  2  ;

// Determine the remainder component for subsequent conditional logic.
let  remainderComponent  =  primaryDatum  %  11  ;

// Conditional logic for adjusting the ultimate outcome based on the remainder.
if  (  remainderComponent  ===  0  )
{
    // When the remainder is exactly zero, no modifications are applied.
}
else  if  (  remainderComponent  <=  6  )
{
    // If the remainder is between one and six (inclusive), increment by one.
    ultimateOutcome  +=  1  ;
}
else
{
    // For remainders greater than six (i.e., seven through ten), increment by two.
    ultimateOutcome  +=  2  ;
}

// Display the final computed numerical result.
console.log  (  ultimateOutcome  )  ;