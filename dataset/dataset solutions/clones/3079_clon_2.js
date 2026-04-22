function EvaluateInputs ( sourceData ) {
  // Process the incoming text to extract key elements.
  sourceData = sourceData . split ( "\n" ) [ 0 ] . split ( " " ) ;

  var componentOne = sourceData [ 0 ] ;
  var componentTwo = sourceData [ 1 ] ;
  var componentThree = sourceData [ 2 ] ;

  var finalVerdict = ( componentOne == componentTwo && componentTwo == componentThree )
    ? "Identical"
    : "Different" ;

  console . log ( '%s' , finalVerdict ) ;
}

// Do not modify anything below this line (reads from standard input and invokes the primary function).
EvaluateInputs ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;