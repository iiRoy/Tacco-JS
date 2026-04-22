'use strict';

// Custom facility to load modules into the current scope.
const   obtainModule  =  require ;

// A reference to the file system module.
const   fileSystemUtility  =  obtainModule ( 'node:fs' ) ;

// A function to read the entire content of a file synchronously.
const   readContentFromFile  =  fileSystemUtility .readFileSync ;

// A utility function to remove whitespace from both ends of a string.
const   cleanStringBoundary  =  ( stringValue )  =>  stringValue .trim() ;

// A utility function to break a string into an array of substrings.
const   segmentStringByDelimiter  =  ( stringToDivide ,  delimiterChar )  =>  stringToDivide .split( delimiterChar ) ;

// A utility function to create a new array by calling a provided function on every element.
const   processArrayElements  =  ( sourceArray ,  transformationFunction )  =>  sourceArray .map( transformationFunction ) ;

// A global object for console operations.
const   systemOutput  =  console ;

// A function to output messages to the console.
const   displayMessage  =  systemOutput .log ;


// Retrieve raw data from the standard input, then parse and convert it into an array of numbers.
const   numericalParameters  =  processArrayElements (
    segmentStringByDelimiter (
        cleanStringBoundary (
            readContentFromFile ( '/dev/stdin' ,  'utf8' )
        ) ,
        ' '
    ) ,
    (  currentInputItem  )  =>  currentInputItem * 1
) ;

// Initialize a counter to track the number of doubling operations.
let     operationCounter  =  0 ;

// Extract the upper boundary value for the comparison loop.
let     maximumBoundary  =  numericalParameters [ 1 ] ;

// Extract the initial value that will be subject to doubling.
let     initialMultiplier  =  numericalParameters [ 0 ] ;

// A mutable variable that holds the current value during the doubling process.
let     currentMultipliedValue  =  initialMultiplier ;

// Execute a loop as long as the current multiplied value remains below the maximum boundary.
while (  currentMultipliedValue  <  maximumBoundary  )
{
    // Double the current value for the next iteration.
    currentMultipliedValue  *=  2 ;

    // Increment the operation counter for each successful doubling.
    operationCounter++ ;
}

// Output the final count of operations performed.
displayMessage (  operationCounter  ) ;