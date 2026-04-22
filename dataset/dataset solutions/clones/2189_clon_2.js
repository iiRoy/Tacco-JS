'use   strict' ;
function primaryProcess ( rawData ) {
  // Process the incoming raw text data
  rawData = rawData . split ( "\n" ) ;

  let   firstLineParts = rawData [ 0 ] . split ( " " ) ;
  let   secondLineElements = rawData [ 1 ] . split ( " " ) ;

  var targetValue = parseInt ( firstLineParts [ 0 ] ) ;

  let totalAmount = 0 ;
  for ( let idx = 0 ; idx < secondLineElements . length ; idx ++ ) {
    totalAmount += parseInt ( secondLineElements [ idx ] ) ;
  }

  if ( totalAmount >= targetValue ) {
    console . log ( "Yes" ) ;
  } else {
    console . log ( "No" ) ;
  }
}

/*
 * The following section should not be modified. It manages input/output operations
 * and invokes the primary processing function with the gathered data.
 */
primaryProcess ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;