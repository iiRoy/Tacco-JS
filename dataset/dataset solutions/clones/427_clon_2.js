(  function  processInputData  (  )  {
  /* This module reads numerical data from standard input,
     processes it in groups, and prints a character label
     alongside the maximum sum found within each group. */

  // Obtain the file system utility to manage file operations.
  const    fileSystemModule  =  require('fs')   ;

  // Define the constant path for reading standard input.
  const  standardInputPath  =  '/dev/stdin'  ;

  // Specify the character encoding for input data.
  const  encodingType      =  'utf8'        ;

  // Read all content from the standard input path using the specified encoding.
  let incomingText = fileSystemModule.readFileSync( standardInputPath ,  encodingType ) ;

  // Define the delimiter used to split the input into individual lines.
  const  newLineDelimiter  =  '\n' ;

  // Trim any leading/trailing whitespace from the entire input and then split it into an array of lines.
  let lineSegments = incomingText.trim().split( newLineDelimiter ) ;

  // Initialize an array to temporarily hold calculated sums.
  // This buffer will be reset after a certain number of sums are accumulated.
  let calculatedSums = [ ] ;

  // Define the specific string that acts as a signal to terminate processing.
  const  terminationSignal  =  "0 0" ;

  // Set the required number of sums to collect before performing a group calculation.
  const  groupSize  =  5   ;

  // Create an array of characters that will be used as labels for output.
  const  alphabetSequence  =  [ 'A' , 'B' , 'C' , 'D' , 'E' ] ;

  // Iterate through each line segment obtained from the input.
  for  (  let  idx  =  0  ;  idx  <  lineSegments.length  ;  idx++  )  {

    // Check if the current line is the termination signal and if the sums buffer is empty.
    // This condition prevents processing further input once the signal is encountered at the start of a new group.
    if  (  calculatedSums.length  ===  0  &&  lineSegments[idx]  ===  terminationSignal  )  {
      break ; // Exit the loop, stopping further input processing.
    }

    // Define the delimiter used to separate numbers within a single line.
    const  spaceDelimiter  =  ' '  ;

    // Split the current line by the space delimiter and convert each resulting part into a number.
    const  parsedPair = lineSegments[idx].split( spaceDelimiter ).map( Number ) ;

    // Sum the two numbers from the parsed pair and add the result to the calculated sums buffer.
    calculatedSums.push( parsedPair[0]  +  parsedPair[1] ) ;

    // Evaluate if the calculated sums buffer has reached its predefined group size.
    if  (  calculatedSums.length  ===  groupSize  )  {
      // Use the reduce method to find the maximum value among the sums in the current buffer.
      const  peakValue  =  calculatedSums.reduce(  ( current , next )  =>  Math.max( current , next )  ) ;

      // Determine the index of the peak value within the calculated sums.
      const  valueIndex  =  calculatedSums.indexOf( peakValue ) ;

      // Retrieve the corresponding character label from the alphabet sequence using the found index.
      const  finalSymbol  =  alphabetSequence[ valueIndex ] ;

      // Print the character label and the peak value to the console, separated by a space.
      console.log( finalSymbol  +  " "  +  peakValue ) ;

      // Reset the calculated sums buffer to an empty array, preparing for the next group of inputs.
      calculatedSums  =  [ ] ;
    }
  }

})(); // Execute the defined function immediately upon script load.