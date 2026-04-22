// This function processes an incoming index to retrieve a specific numeric value.
function  ProcessInput( entryIndex )
{
  /* A string containing a comma-separated list of numerical identifiers. */
  var   numericSequence = "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51"   ;

  // Split the sequence string into an array of individual string values.
  var   parsedValues = numericSequence.split ( "," ) ;

  // Convert the selected string value to an integer and output it.
  console.log ( parseInt ( parsedValues [ entryIndex - 1 ] ) ) ;
}

// Read data from standard input and pass it to the main processing function.
ProcessInput ( require("fs").readFileSync("/dev/stdin", "utf8") ) ;