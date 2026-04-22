function ProcessInputData(rawData)
{
  // This routine processes the incoming raw text content.
  const textSegments = rawData . split ( '\n' ) ;
  const firstString  = textSegments [ 0 ] ;
  const secondString = textSegments [ 1 ] ;

  let comparisonOutcome = ( firstString === secondString.substring(0, secondString.length - 1) ) ? "Yes" : "No" ;

  // A previous debug statement was removed here.
  // console.debug("No interim log output needed.");
  console.log( comparisonOutcome ) ;
}

// Initiate the primary execution flow using data acquired from the standard input stream.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;