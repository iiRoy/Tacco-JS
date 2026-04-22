// This module processes incoming textual data to determine a specific outcome.

function  processInput  (  rawData  )  {
  // Split the raw input string into an array of lines based on newline characters.
  let  linesOfText  =  rawData.split (  / \n /  )  ;

  // The first line contains space-separated numeric values. Parse them.
  let  numericValues  =  linesOfText[0] .split (  / \s /  )  ;

  // The second line indicates the number of iterations for the main loop.
  // We'll iterate according to the value in the second line.
  for (  let  iterationCount  =  0  ;
        iterationCount  <  parseInt ( linesOfText[1] )  ;
        iterationCount++  )
  {
    // Check condition based on the second and third numeric values.
    if  (  parseInt(numericValues[1])  >=  parseInt(numericValues[2])  )
    {
      // If condition met, double the third value.
      numericValues[2]  *=  2  ;
    }
    // Otherwise, check condition based on the first and second numeric values.
    else  if  (  parseInt(numericValues[0])  >=  parseInt(numericValues[1])  )
    {
      // If this condition met, double the second value.
      numericValues[1]  *=  2  ;
    }
  }

  // After all iterations, evaluate the final state of the numeric values.
  if  (  parseInt(numericValues[1])  <=  parseInt(numericValues[2])
         &&  parseInt(numericValues[0])  <=  parseInt(numericValues[1])  )
  {
    // Output 'yes' if the final condition holds true.
    console.log  (  'yes'  )  ;
  }
  else
  {
    // Otherwise, output 'no'.
    console.log  (  'no'  )  ;
  }
}

// Invoke the primary processing function with data read from standard input.
processInput(  require (  'fs'  )  .readFileSync (  '/dev/stdin'  ,  'utf8'  )  )  ;