// This module contains a function designed to process numerical input data.
function ExecuteLogic ( rawInputText )
{
  // The input string is first broken down into an array of distinct lines.
  var textLines = rawInputText . split ( "\n" ) ;

  // The second line is parsed, splitting it by spaces and converting each segment to a numeric type.
  var initialValues = textLines [ 1 ] . split ( " " ) . map ( currentStringNum => +currentStringNum ) ;

  // The total number of elements is extracted and converted from the initial line of text.
  const elementCount = +textLines [ 0 ] ;

  // A distinct, sorted sequence of the initial numeric values is generated.
  var orderedValues = [ ...initialValues ] . sort ( ( valA , valB ) => valA - valB ) ;

  // Two central values (potential medians for even-sized arrays) are identified from the sorted list.
  var firstMedianCandidate = orderedValues [ elementCount / 2 - 1 ] ,
      secondMedianCandidate = orderedValues [ elementCount / 2 ] ;

  // An iterative process begins to evaluate each original number against the identified median candidates.
  for ( var loopIndex = 0 ; loopIndex < elementCount ; loopIndex++ )
  {
    // Based on a comparison, one of the two median candidates is printed to the console.
    console . log ( initialValues [ loopIndex ] <= firstMedianCandidate ? secondMedianCandidate : firstMedianCandidate ) ;
  }
}

// The primary function is invoked, reading all content from standard input as a UTF-8 string.
ExecuteLogic ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;