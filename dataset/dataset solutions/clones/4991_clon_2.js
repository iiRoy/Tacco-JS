// This module provides a utility to compute a specific cost based on tiered pricing.

function   CalculateExpenditure (   rawData   ) {
  // The input string, containing multiple lines of data, is parsed into an array of strings.
  rawData = rawData . split ( "\n" ) ;

  /*
   * Extracting and converting all necessary numerical components
   * from the processed input lines. Each line corresponds to a specific value.
   */
  var   overallAmount   =   parseInt ( rawData [ 0 ] , 10 ) ; // Represents the total number of items or units.
  var   initialQuantity   =   parseInt ( rawData [ 1 ] , 10 ) ; // Denotes the quantity for a specially priced first segment.
  var   priceFirstType   =   parseInt ( rawData [ 2 ] , 10 ) ; // The cost per unit for the initial quantity.
  var   priceOtherType   =   parseInt ( rawData [ 3 ] , 10 ) ; // The cost per unit for any quantity beyond the initial segment.
  
  // Perform the core calculation: (cost of the initial segment) + (cost of the remaining segment).
  // The remaining segment's quantity is 'overallAmount - initialQuantity'.
  console . log ( ( initialQuantity * priceFirstType ) + ( ( overallAmount - initialQuantity ) * priceOtherType ) ) ;
}

// Entry point: Reads data from standard input asynchronously and then invokes the calculation function.
CalculateExpenditure ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;