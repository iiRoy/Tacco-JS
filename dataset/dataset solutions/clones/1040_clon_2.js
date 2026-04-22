const fileContent = require('fs') .readFileSync ( '/dev/stdin' , 'utf8' );

/*
  The following lines process the raw input data.
  First, trim any leading/trailing whitespace, then split by newline.
*/
const lineCollection = ( fileContent .trim() ) .split("\n") ;

// Retrieve the first numeric count from the processed lines
const firstCount = Number( lineCollection[0] );

// Parse the second line into an array of numbers for the initial dataset
const firstDataArray = lineCollection[1] .split(" ") .map(Number) ;

// This line was commented out in the original, so it remains inactive.
// const anotherCount = Number(lineCollection[2]);

// Extract and parse the fourth line into a second array of numbers for querying
const secondDataArray = lineCollection[3]. split (" ") .map( Number ) ;


// Define a self-executing function to create our search utility
const probeForValue = ( function (sourceList, listLength) {
  return ( targetElement ) => {
    let middleIndex ;
    let lowerBound = 0;
    let upperBound = listLength;

    // Early exit if the target is outside the array's range
    if ( targetElement < sourceList[0] || sourceList[listLength - 1] < targetElement ) return 0;

    // Perform the binary search operation
    while ( lowerBound < upperBound ) {
      middleIndex = Math.floor( ( lowerBound + upperBound ) / 2 );

      if ( targetElement < sourceList[middleIndex] ) {
        upperBound = middleIndex;
      }
      else if ( targetElement > sourceList[middleIndex] ) {
        lowerBound = middleIndex + 1;
      }
      else {
        // Element found
        return 1;
      }
    }
    // Element not found
    return 0;
  };
}) ( firstDataArray , firstCount ); // Initialize the searcher with the first dataset and its size


// A simple utility function for aggregation
const accumulatorFunc = ( valA, valB ) => valA + valB;


// Process the second data array using the search utility and sum the results
console.log( secondDataArray .map ( probeForValue ( elementItem ) ) .reduce ( (sumA, sumB) => sumA + sumB , 0 ) );