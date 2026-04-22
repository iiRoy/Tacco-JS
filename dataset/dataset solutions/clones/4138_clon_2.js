// The entire incoming dataset is passed as an argument.
function ProcessInput ( rawData )
{
  var textLines = rawData.split ( "\n" ) ;

    var parts = textLines [ 0 ] . split ( " " ) ;

  var lowerLimit = Number ( parts [ 0 ] ) ;
  var upperLimit = Number ( parts [ 1 ] ) ;

    // Determine the integer 'x' such that the expression lowerLimit * 2^(x-1) equals upperBound.
  var finalCount = Math . floor ( Math . Log2 ( upperLimit / lowerLimit ) ) + 1 ;

  console . log ( finalCount ) ;
}

// Do not modify the following section; it handles standard input/output and invokes the main processing function.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;