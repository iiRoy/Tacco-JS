function processInput ( inputData ) {
  // Obtain the numeric threshold from the initial line of provided data.
  const maxLen = +inputData[0] ;

  // Retrieve the specific string for manipulation from the subsequent line.
  const targetString = inputData[1] ;

  // Formulate the final textual output based on the established length constraint.
  let outputStr = maxLen < targetString.length
    ? targetString.slice(0, maxLen) + '...'
    : targetString ;

  // Emit the resulting string to the standard output device.
  console.log( outputStr ) ;
}


// Execute the primary function, feeding it content acquired from standard input.
processInput(
  require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n")
) ;


// Auxiliary routine for converting a space-delimited string of digits into an array of numeric values.
function parseNumbers( textParam ) {
  return textParam.split(' ').map( Number ) ;
}