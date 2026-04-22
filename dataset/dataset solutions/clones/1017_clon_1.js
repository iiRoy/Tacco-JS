// This is a Type I clone, focusing solely on whitespace and comments.
// All functional elements, identifiers, and operators remain unchanged.

    var    stdin    =    require (  'fs'  )  .  readFileSync (  '/dev/stdin'  ,   'utf8'  ) ; // Read input from standard input

// Process the input string: trim whitespace and split by spaces to get operands.
var    operands    =    stdin  .  trim (  )  .  split (  ' '  ) ;


var    stack    =    [ ] ; // Initialize an empty stack for RPN evaluation.

// Iterate over each operand to perform the RPN calculation.
operands . forEach ( function ( operand )   {

    if  ( operand   ===   '+' )   {
        // If the operand is '+', pop two numbers, add them, and push the result.
        stack . push ( parseInt ( stack . pop ( ) ,   10 )   +   parseInt ( stack . pop ( ) ,   10 ) ) ;
    }
    else   if  ( operand   ===   '-' )   {
        // If the operand is '-', pop two numbers, subtract them (n1 - n2), and push the result.
        var   n2   =   parseInt ( stack . pop ( ) ,   10 ) ; // Second operand
        var   n1   =   parseInt ( stack . pop ( ) ,   10 ) ; // First operand
        stack . push ( n1   -   n2 ) ;
    }
    else   if  ( operand   ===   '*' )   {
        // If the operand is '*', pop two numbers, multiply them, and push the result.
        stack . push ( parseInt ( stack . pop ( ) ,   10 )   *   parseInt ( stack . pop ( ) ,   10 ) ) ;
    }
    else   {
        // If the operand is a number, parse it as an integer and push it onto the stack.
        stack . push ( parseInt ( operand ,   10 ) ) ;
    }
} ) ;


// After processing all operands, the final result should be the only element left in the stack.
console . log ( stack [ 0 ] ) ; // Output the final result.