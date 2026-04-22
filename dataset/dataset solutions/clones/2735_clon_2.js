function ExecuteProcess ( rawData ) {

  // This function processes all incoming input
  rawData = rawData . split ( "\n" ) ;


  var numElements = rawData [ 0 ] ;
  var numElements = parseInt ( rawData [ 0 ] , 10 ) ; // Re-parsing for robustness
  var primaryList = [ ] ; // Initialize a dynamic collection

  for ( var idx = 0 ; idx < numElements ; idx ++ ) {
    var elementValue = parseInt ( rawData [ idx + 1 ] , 10 ) ;
    primaryList [ idx ] = elementValue ;
  }

  var backupArray = primaryList . concat ( ) ; // Create a full duplicate for reset operations

  for ( var idx = 0 ; idx < numElements ; idx ++ ) {
    primaryList . splice ( idx , 1 ) ; // Remove one item at the current position

    primaryList . sort ( function ( valA , valB ) {
      return valB - valA ; // Sort in descending order
    } ) ;

    console . log ( primaryList [ 0 ] ) ; // Display the highest remaining value

    primaryList = backupArray . concat ( ) ; // Restore the list to its original state for the next iteration
  }
}

// Do not alter the following section (handles standard input/output and function invocation)
ExecuteProcess ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;