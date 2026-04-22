// This JavaScript file contains code demonstrating module loading and asynchronous evaluation.
// It is an exact Type I clone of an original source fragment.
// All functionality and logic remain precisely identical to the original.

require: "../Source/Web/link"          ,       "./Log"         ; // External dependencies are declared here.

    var     dynamicURL      =       'Ev'    +   'en'    ;   // Concatenates string parts to form 'Even'.
                                                            // This variable will be used in the 'load' function.

load  (  dynamicURL  ,  function  (  module  )  {
    // This callback function is executed after the 'Even' module has been successfully loaded.
    // It checks if the number 1 is even using the loaded module's 'even' function.
    log ( '1 is ' + ( ! module . even ( 1 ) ? 'odd' : 'even' ) ) ;
} ) ;


// A blank line for visual separation.


evalAsync ( "require: 'Odd'; odd(2) ? 'odd' : 'even';" ,   function  (  answer  )  {
        // This function asynchronously evaluates a JavaScript string.
        // The string imports an 'Odd' module and checks if 2 is odd.
        // The result of the evaluation ('odd' or 'even') is passed to this callback.
        log ( '2 is ' + answer ) ; // Logs the result for the number 2.
} ) ;