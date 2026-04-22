function executeCalculation (  rawData  ) // This function processes input data
{
  // The raw input string is split into an array of string parts
  const   numericStrings  =
    rawData
      .split
        (  " "  )
  ;

  // Convert the string parts into numerical values for calculation
  const valA = Number(numericStrings[0]); // First numerical component
  const valB = Number(numericStrings[1]); // Second numerical component

  // Validate the range of the numerical inputs
  // Both values must be between 1 and 10 (inclusive)
  if
    (
      (
        valA < 1
        ||
        valA > 10
      )
      ||
      (
        valB < 1
        ||
        valB > 10
      )
    )
  {
    // If validation fails, output an error code
    return console.log(-1)
    ;
  }

  // If inputs are valid, compute their product
  // And display the final computed result
  return console.log
    (
      valA
      *
      valB
    )
  ;
}

// Read input from the standard input stream and pass it to the processing function
executeCalculation
(
  require
    (
      'fs'
    )
    .readFileSync
      (
        '/dev/stdin',
        'utf8'
      )
);