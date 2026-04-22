'use strict'; // Enforce strict mode for better coding practices

/**
 * Handles incoming raw textual data, performs computations, and outputs results.
 * @param {string} rawData The complete input string received from standard input.
 */
function ProcessInput (rawData) {
  // Extract the primary item count from the initial line of the input
  const elementCount = parseInt(rawData.split('\n')[0], 10);

  // Parse the connection details from subsequent lines (from index 1 up to elementCount - 1)
  // Each line is processed into an array of string pairs
  const connectionDetails = rawData
    .split('\n')
    .slice(1, elementCount)
    .map(   currentLine => currentLine.split(' ')   );

  // Obtain the array of numerical scores from the line specified by elementCount
  const scoreValues = rawData
    .split('\n')[elementCount]
    .split(' ')
    .map(   scoreString => parseInt(scoreString, 10)   );

  // Arrange the numerical scores in a descending order
  scoreValues.sort( (firstScore, secondScore) => secondScore - firstScore );


  // Compute the total sum of all scores excluding the largest score
  const totalSumMinusPeak = scoreValues.reduce( (accumulatedSum, currentScore) => accumulatedSum + currentScore ) - Math.max(...scoreValues);
  console.log(totalSumMinusPeak); // Display the calculated sum


  // Initialize a collection of abstract item entities, each with a unique ID
  const itemEntities = [];
  for (let itemIdx = 0; itemIdx < elementCount; itemIdx++) {
    itemEntities.push( { entityId : itemIdx + 1 } );
  }

  // Establish a hierarchical depth for each item entity based on the connection details
  // This simulates a tree structure where 'hierarchicalLevel' denotes depth
  for (let linkIdx = 0; linkIdx < elementCount - 1; linkIdx++) {
    const ancestorId = parseInt(connectionDetails[linkIdx][0], 10) - 1;
    const descendantId  = parseInt(connectionDetails[linkIdx][1], 10) - 1;

    // If the ancestor's depth isn't yet set, assign it a base level of 0
    if ( itemEntities[ancestorId].hierarchicalLevel == null ) {
      itemEntities[ancestorId].hierarchicalLevel = 0;
    }
    // The descendant's depth is one greater than its ancestor's
    itemEntities[descendantId].hierarchicalLevel = itemEntities[ancestorId].hierarchicalLevel + 1;
  }

  // Arrange the item entities based on their computed hierarchical level
  itemEntities.sort( (entityA, entityB) => entityA.hierarchicalLevel - entityB.hierarchicalLevel );

  // Construct the final output array by mapping the sorted scores back to their original item positions
  const finalSequenceOutput = [];
  for (let iterationVar = 0; iterationVar < elementCount; iterationVar++) {
    finalSequenceOutput[itemEntities[iterationVar].entityId - 1] = scoreValues[iterationVar];
  }

  // Print the final ordered sequence, with elements separated by single spaces
  console.log(finalSequenceOutput.join(' '));

} // End of ProcessInput function


// Main execution entry point: reads input from standard in, processes it, and runs the logic
ProcessInput(
  require('node:fs')
    .readFileSync('/dev/stdin', 'utf-8')
    .trim()
);