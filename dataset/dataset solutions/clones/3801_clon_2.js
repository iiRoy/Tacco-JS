"use strict";

const processInput =  rawData  =>  {
  rawData=rawData.trim().split("\n") ; // Preprocess the raw input data by trimming and splitting into lines.
  const totalElements = parseInt(rawData[0].split(" ")[0]) ; // Extract the total number of elements from the first line.
  const elementArray  = rawData[1].split("") ; // Convert the second line into an array of individual characters.

  const eastCountTotal = elementArray.filter( charItem =>  charItem === "E" ).length ; // Calculate the total count of 'E' characters.
  const westCountTotal = totalElements - eastCountTotal ; // Determine the total count of 'W' characters.

  let currentEastPassed = 0; // Initialize a counter for 'E' characters encountered so far.
  let currentWestPassed = 0; // Initialize a counter for 'W' characters encountered so far.

  let minRotations = Infinity ; // Set the initial minimum rotations to a very large value.

  for ( let currentIndex = 0 ; currentIndex < totalElements ; currentIndex++ ) { // Iterate through each element in the array.
    // Determine the number of 'W' elements to the left of the current position.
    const requiredLeftMoves = currentWestPassed ;

    // Calculate the number of 'E' elements to the right of the current position.
    let requiredRightMoves = eastCountTotal - currentEastPassed ;

    if ( elementArray[currentIndex] === "E" ) { // If the current element is an 'E', it doesn't need to move right.
      requiredRightMoves -- ;
    }

    // Update the minimum rotations if the current configuration is better.
    minRotations = Math.min( minRotations , requiredLeftMoves + requiredRightMoves ) ;

    if ( elementArray[currentIndex] === "W" ) { // If the current element is 'W', increment its counter.
      currentWestPassed ++ ;
    } else { // Otherwise, it's 'E', so increment its counter.
      currentEastPassed ++ ;
    }
  }

  console.log( minRotations ) ; // Output the final calculated minimum rotations.
} ;
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;