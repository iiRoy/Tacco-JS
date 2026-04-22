/* This module handling component is responsible for acquiring user input. */
var   lineHandler        =      require(  'readline'  )     ;

// Retrieve a single line of text from the standard input source
var     acquiredText    =    lineHandler(   )    ;

/* Print out a predefined string concatenated with the user-provided text to the standard output. */
console.log(   "ABC"   +   acquiredText   )   ;