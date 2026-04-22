'use strict';

function calculateOrderTotal( inputData ) {

  // Process the raw input string: extract the first line, split by spaces, and convert to numbers.
  let processedValues = inputData . split( '\n' ) [ 0 ] . split( ' ' ) . map( ( token ) => Number( token ) );

  const itemAPrice = processedValues[ 0 ]; // Cost for a single 'A' item.
  const itemBPrice = processedValues[ 1 ]; // Cost for a single 'B' item.
  const comboPrice = processedValues[ 2 ]; // Cost for an 'AB' combo.
  const requiredItemA = processedValues[ 3 ]; // Quantity of 'A' items needed.
  const requiredItemB = processedValues[ 4 ]; // Quantity of 'B' items needed.

  // Determine the absolute difference in quantities for A and B.
  const quantityDifference = Math.abs( requiredItemA - requiredItemB );
  // Find the minimum quantity among A and B, which can be bought as combos.
  const minimumRequired = Math.min( requiredItemA , requiredItemB );
  let finalCalculatedCost = 0; // Initialize the total cost.

  // Compare the cost of buying A and B individually versus buying two combo packs.
  if ( ( itemAPrice + itemBPrice ) <= ( comboPrice * 2 ) ) {
    // Individual purchases are more economical or equal to double combo cost.
    finalCalculatedCost = ( itemAPrice * requiredItemA ) + ( itemBPrice * requiredItemB );
  }
  else {
    // Combo packs are cheaper than buying A and B individually.
    // Evaluate if buying remaining items individually is cheaper than more combos.
    if ( ( ( requiredItemA - minimumRequired ) * itemAPrice + ( requiredItemB - minimumRequired ) * itemBPrice ) <= ( comboPrice * quantityDifference ) ) {
      // Use combo packs for the common quantity, then buy the remaining items individually.
      finalCalculatedCost = ( comboPrice * minimumRequired * 2 ) + ( ( requiredItemA - minimumRequired ) * itemAPrice ) + ( ( requiredItemB - minimumRequired ) * itemBPrice );
    }
    else {
      // It's most cost-effective to purchase all required items as combo packs.
      // This covers the case where buying remaining individually is still more expensive than just buying more combos.
      finalCalculatedCost = comboPrice * Math.max( requiredItemA , requiredItemB ) * 2;
    }
  }

  console.log( finalCalculatedCost ); // Output the final computed cost.
}

// Read input from standard input and pass it to the calculation function.
calculateOrderTotal(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));