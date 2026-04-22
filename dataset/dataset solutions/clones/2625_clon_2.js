"use strict"
; // Activate strict mode for the entire script

const processInput = ( inputDataStream ) =>
{ // This primary routine handles the incoming data
  inputDataStream  =  inputDataStream .  trim ( ) .  split ( "\n" ) ; // Clean up and segment the data by newlines

  const  firstNumericElement  =  parseInt ( inputDataStream [ 0 ] ) ; // Extract and convert the initial numeric datum
  const  secondStringElement  =  inputDataStream [ 1 ] ; // Obtain the subsequent string datum

  // Display a conditional outcome based on the numeric value
  console .  log ( firstNumericElement >= 3200 ? secondStringElement : "red" ) ;
}

// Execute the processing routine by reading content from the standard input source
processInput ( require ( 'fs' ) .  readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;