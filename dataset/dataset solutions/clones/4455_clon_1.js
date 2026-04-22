/*
 * This is a Type I clone example.
 * It demonstrates how to create a clone where only whitespace and comments differ.
 * Original functionality is perfectly preserved.
 */

    // Require the 'readline' module to enable synchronous input.
var     readline    =   require   (    'readline'    )    ;

    // Call the readline function and store its return value in variable 'a'.
var a   =   readline   (    )   ;


    // Output a concatenated string to the console.
    // The string consists of "ABC" followed by the value stored in 'a'.
console  .  log  (  "ABC"  +  a  )  ;

// End of file.