function ProcessData ( rawContent ) {
  rawContent = rawContent.split( "\n" );
  
  let lineFragments = rawContent[0].split( " " );
  
  const itemCount = Number.parseInt( lineFragments[0] );
  const discountCoupons = Number.parseInt( lineFragments[1] );

  // Store the item values into our primary array
  lineFragments = rawContent[1].split( " " ) ;
  var itemPrices = lineFragments.map( (priceString) => Number.parseInt(priceString) ) ;
  
  // Iterate for each available discount coupon (strategy: reduce the largest item first)
  var discountCounter = 0; // Tracker for applied discounts
  if ( itemCount > 1 ) {
    while ( discountCounter < discountCoupons ) {
      // Identify the item with the maximum value and its array index
      var greatestValue = Math.max.apply( null, itemPrices );
      for ( var currentPosition = 0 ; currentPosition < itemCount ; currentPosition++ ) {
        if ( itemPrices[currentPosition] === greatestValue ) { break; }
      }
      
      var sumOfPrices = itemPrices.reduce( function(accumulatorSum, currentElement) { return accumulatorSum + currentElement; } ) ;
      var tempReductions = Math.ceil( itemPrices[currentPosition] / sumOfPrices );
      
      if ( tempReductions + discountCounter >= discountCoupons ) {
        tempReductions = discountCoupons - discountCounter;
      }
      // Apply the reduction to the item
      itemPrices[currentPosition] = Math.floor( itemPrices[currentPosition] / Math.pow( 2, tempReductions ) );
      discountCounter += tempReductions;
    }
  } else {
    // Special handling for a single item scenario
    itemPrices[0] = Math.floor( itemPrices[0] / Math.pow( 2, discountCoupons ) );
  }
  // Output the final computed total value to standard output
  console.log( itemPrices.reduce( function( finalSum, elementValue ) { return finalSum + elementValue; } ) );
}

ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );