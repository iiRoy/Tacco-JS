/*
 * This JavaScript module defines a primary routine
 * to compute the cube of an input value
 * and then outputs the result.
 */
function         processDataAndOutputResult   (   inputStringValue   )
{
    // Local variable to store the calculated cubed value.
    // JavaScript's multiplication operator will implicitly
    // convert the string input to a numerical type.
    let     computedCubeValue      =   inputStringValue   *   inputStringValue   *   inputStringValue    ;

    // Display the final computed numerical result to the console.
    console.log(     computedCubeValue      )   ;
}


// --- Program Entry Point ---

// Retrieve the Node.js built-in file system module.
// This module provides functionalities for interacting with the file system.
const    fileSystemOpsModule     =      require      (    "fs"     )    ;

// Read the entire content from the standard input stream.
// "/dev/stdin" is a standard Unix-like path for input.
// "utf8" specifies the character encoding for the text being read.
let     rawTextFromInputSource      =    fileSystemOpsModule   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;

// Invoke the main processing function with the data acquired from standard input.
processDataAndOutputResult   (   rawTextFromInputSource   )   ;