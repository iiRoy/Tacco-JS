'use strict';


function   processData (   rawData   ) { // Main entry point for processing incoming data.
  // Process the raw input: trim leading/trailing whitespace and then split into individual lines.
    rawData  =  rawData.trim()  .  split(  '\n'  )  ;

  /*
   * Determine the final outcome based on a specific numerical threshold.
   * If the integer value derived from the first element of the input array
   * is greater than or equal to 3_200, the second input element is used.
   * Otherwise, a default color string, 'scarlet', is applied.
   */
  const   finalResult   =   parseInt(  rawData[0]  ,   10  )   >=   3_200   ?   rawData[1]   :   'scarlet'   ;

  // Display the determined result to the standard output console.
  console.log(   finalResult   ) ;
}


// Initiate the data processing by reading the entire content of standard input
// synchronously, using UTF-8 encoding, and passing it to the processing function.
processData (  require('fs') . readFileSync(  '/dev/stdin'  ,  'utf-8'  )  )  ;