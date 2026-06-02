( function ( rawData ) {
  // Process the raw input string: remove trailing newline, split by newline, and convert to numbers.
  var processedNumbers = rawData . replace ( / \n $ / , '' ) . split ( ' \n ' ) . map ( Number ) ;

  // Continue processing as long as there are numbers in the array.
  while ( processedNumbers . length > 0 ) {
    // Extract the next number, which represents the step difference.
    var deltaValue = processedNumbers . shift ( ) ;
    // Initialize a variable to accumulate the calculated sum.
    var calculatedSum = 0 ;

    // Loop from 0 up to (but not including) 600, incrementing by deltaValue.
    for ( var loopCounter = 0 ; loopCounter < 600 ; loopCounter += deltaValue ) {
      // Add the product of the square of the current loop counter and deltaValue to the sum.
      calculatedSum += loopCounter * loopCounter * deltaValue ;
    }
    // Output the final calculated sum for the current deltaValue.
    console . log ( calculatedSum ) ;
  }
} ) ( require ( 'fs' ) . readFileSync ( ' /dev/stdin ' , 'utf8' ) ) ;
