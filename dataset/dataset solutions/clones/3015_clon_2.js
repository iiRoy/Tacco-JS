function ProcessInput( rawData ) {
 rawData = rawData.split( "\n" ) ;
 firstLineParts = rawData[0].split( " " ) ;
 let countElements = Number.parseInt( firstLineParts[0] ) ;
 let stringNumbers = rawData[1].split( " " ) ;
 let idx = 0 ;
 let resultVal = 0 ; // Declared but not used, kept for structural fidelity
 let minimumAbsValue = 0 ;
 let minimumAbsIndex = 0 ;
 let totalAbsoluteSum = 0 ;
 let negativeCount = 0 ;
 let zeroFoundFlag = 0 ;

 // Determine the quantity of negative values present in the input array.
 for ( idx = 0 ; idx < countElements ; idx++ ) {
  if ( Number.parseInt( stringNumbers[idx] ) < 0 ) {
   negativeCount += 1 ;
  }
  if ( Number.parseInt( stringNumbers[idx] ) === 0 ) {
   zeroFoundFlag = 1 ;
  }
 }
 // Log the tally of negative integers (commented out in original)
 // console.log( negativeCount ) ;
 // Output the zero presence indicator (commented out in original)
 // console.log( zeroFoundFlag ) ;

 // If no zeros are found and the count of negative numbers is odd, identify the position of the smallest absolute value.
 if ( zeroFoundFlag === 0 && ( negativeCount % 2 ) !== 0 ) {
  minimumAbsValue = Math.abs( Number.parseInt( stringNumbers[0] ) ) ;
  minimumAbsIndex = 0 ;
  for ( idx = 1 ; idx < countElements ; idx++ ) {
   if ( minimumAbsValue > Math.abs( Number.parseInt( stringNumbers[idx] ) ) ) {
    minimumAbsValue = Math.abs( Number.parseInt( stringNumbers[idx] ) ) ;
    minimumAbsIndex = idx ;
   }
  }
 }
 // Display the current minimum absolute magnitude (commented out in original)
 // console.log( minimumAbsValue ) ;
 // Show the index of the minimum absolute value (commented out in original)
 // console.log( minimumAbsIndex ) ;

 // Iterate through the collection and accumulate absolute values based on specific conditions.
 for ( idx = 0 ; idx < countElements ; idx++ ) {
  // Print the current loop iteration index (commented out in original)
  // console.log( idx ) ;
  if ( zeroFoundFlag === 1 || ( ( negativeCount % 2 ) === 0 ) ) {
   totalAbsoluteSum = totalAbsoluteSum + Math.abs( Number.parseInt( stringNumbers[idx] ) ) ;
  } else {
   if ( idx === minimumAbsIndex ) {
    totalAbsoluteSum = totalAbsoluteSum - Math.abs( Number.parseInt( stringNumbers[idx] ) ) ;
   } else {
    totalAbsoluteSum = totalAbsoluteSum + Math.abs( Number.parseInt( stringNumbers[idx] ) ) ;
   }
  }
  // This line was a previous attempt at summation (commented out in original)
  // sum = sum + Math.abs( Number.parseInt( A[i] ) ) ;
 }
 console.log( totalAbsoluteSum ) ;
}
ProcessInput( require("fs").readFileSync( "/dev/stdin" , "utf8" ) ) ;