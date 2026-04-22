// This module defines a routine to process a numerical entry.

function  ProcessNumber (  incomingValue   )  {
  // Check if the provided numeric argument is an even integer.
  if (   (  incomingValue  %  2   )  ===  0.0   )
  {
    // For even numbers, perform a specific calculation: half the value minus one.
    console.log( (  incomingValue  /  2.0  )  -  1.0   )  ;
  }
  else
  {
    // For odd numbers, apply a different formula: half the value minus zero point five.
    console.log( (  incomingValue  /  2.0  )  -  0.5   )  ;
  }
}

// Invoke the primary processing function with data read from standard input.
ProcessNumber ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;