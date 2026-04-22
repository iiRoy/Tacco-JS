function  CalculateNextThousandMultiple (  sourceData   )
{
  /* This variable will hold the numerical representation
   * of the input string, which effectively represents an amount.
   */
  let   parsedValue   =   parseInt (  sourceData  )   ;

  // We start with a base multiple of one thousand.
  let   currentThreshold   =   1000   ;

  // Continue incrementing the threshold until it exceeds the parsed amount.
  while  (  currentThreshold   <=   parsedValue  )
  {
    currentThreshold   +=   1000   ; // Each step adds another thousand.
  }

  // Display the final computed difference to standard output.
  console.log  (  currentThreshold   -   parsedValue   )   ;
}

// Acquire input from the standard input stream and invoke the primary processing routine.
CalculateNextThousandMultiple (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;