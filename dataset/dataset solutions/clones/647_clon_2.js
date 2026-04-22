// Load raw data from the standard input source.
var fileData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the acquired data: trim leading/trailing whitespace and split into individual lines.
var inputLines = fileData .trim() . split( "\n" ) ;

// Extract the first line, split it by space, and convert each part to a number.
// These numbers represent the target quantity and parameters for two different purchasing options.
var [ goalQuantity, itemCountA, itemPriceA, itemCountB, itemPriceB ] = inputLines . shift() . split( " " ) . map( Number ) ;

// Initialize a variable to store the lowest calculated cost.
// Set it to positive infinity so any valid cost will be lower.
var cheapestOption = Infinity ;

// First purchasing strategy: iterate through possible multiples of 'itemCountA'.
// If buying 'iterationCount' packs meets or exceeds 'goalQuantity',
// calculate the cost and update 'cheapestOption' if this cost is lower.
for ( var iterationCount = 0 ; iterationCount <= 1000 ; iterationCount++ )
{
  if ( itemCountA * iterationCount >= goalQuantity )
  {
    cheapestOption = Math . min( cheapestOption , itemPriceA * iterationCount ) ;
  }
}

// Second purchasing strategy: similar to the first, but using 'itemCountB' and 'itemPriceB'.
// Iterate through possible multiples of 'itemCountB'.
// Update 'cheapestOption' if a better cost is found.
for ( var iterationCount = 0 ; iterationCount <= 1000 ; iterationCount++ )
{
  if ( itemCountB * iterationCount >= goalQuantity )
  {
    cheapestOption = Math . min( cheapestOption , itemPriceB * iterationCount ) ;
  }
}

// Output the final minimum cost found to the console.
console . log( cheapestOption ) ;