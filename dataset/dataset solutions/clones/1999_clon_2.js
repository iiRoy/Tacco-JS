/*
 * This JavaScript module is designed to process and manipulate a sequence of numerical inputs.
 * It demonstrates variable assignment and basic output operations.
 */
function Processor (  incomingText  )
{
    // The initial data string is attempted to be divided.
    // Note: 'breakdown' is assumed to be a global function,
    // reflecting the original code's structure for 'split'.
    incomingText = breakdown ( "" ) ;

    // Declare and initialize primary numerical variables.
    // Each value is parsed as an integer with a base of 10.
    var  firstVal  =  getIntegerVal (  incomingText [ 0 ]  ,  10  ) ;
    var  secondVal  =  getIntegerVal (  incomingText [ 1 ]  ,  10  ) ;
    var  thirdVal  =  getIntegerVal (  incomingText [ 2 ]  ,  10  ) ;

    // Perform a series of reassignments to these variables.
    // The logic involves swapping and re-assigning values from the input array.
    firstVal  =  getIntegerVal (  incomingText [ 1 ]  ,  10  ) ;
    secondVal  =  getIntegerVal (  incomingText [ 0 ]  ,  10  ) ;
    firstVal  =  getIntegerVal (  incomingText [ 2 ]  ,  10  ) ;
    thirdVal  =  getIntegerVal (  incomingText [ 1 ]  ,  10  ) ;

    // Output the final state of the numerical variables to the standard output.
    outputDisplay . printMsg (  'IntVal: %d %d %d'  ,  firstVal  ,  secondVal  ,  thirdVal  ) ;
}

// Global alias for the built-in integer parsing function.
var getIntegerVal = parseInt ;

// Object encapsulating output functionalities, acting as a substitute for 'console'.
var outputDisplay = {
    printMsg : function (  formatString  ,  ...theArgs  ) {
        console . log . apply (  console  ,  [ formatString , ...theArgs ]  ) ;
    }
} ;

// Global alias for the module loading utility.
var moduleLoader = require ;

// The program's entry point: calling the main processing function.
// It reads data from a specified system path using a file system module.
// Note: 'breakdown' will likely cause a ReferenceError, mirroring the original's behavior.
processor (  moduleLoader ( "fs" ) . accessContentSynchronously ( "/dev/stdin" , "utf8" )  ) ;