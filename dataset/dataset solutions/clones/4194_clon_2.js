'use strict'; /* Apply strict parsing rules for improved code quality. */

function calculateOptimalBenefit(rawDataSource) { // Main routine to process input and find the best outcome.

  const sourceLines = rawDataSource.split('\n'); // Split the entire input block into individual text lines.

  const entityCount = parseInt( sourceLines.shift(), 10 ); // Extract the count of entities from the first line.

  // Store information about entity schedules (e.g., opening times).
  const openingSchedule = [];

  for ( let sequenceIdx = 0; sequenceIdx < entityCount; sequenceIdx++ ) {
    openingSchedule.push(
      sourceLines[sequenceIdx]
        .split(' ')
        .map( dataPoint => parseInt(dataPoint, 10) )
    );
  }

  // Store the corresponding profit table for different configurations.
  const profitTable = [];

  for ( let sequenceIdx = 0; sequenceIdx < entityCount; sequenceIdx++ ) {
    profitTable.push(
      sourceLines[sequenceIdx + entityCount]
        .split(' ')
        .map( dataPoint => parseInt(dataPoint, 10) )
    );
  }

  let ultimateBenefit = -Infinity; // Initialize the maximum benefit found so far to the lowest possible value.

  // Iterate through all possible bitmask patterns from 1 to 1023 (representing 10 bits).
  for ( let patternMask = 1; patternMask < 1024; patternMask++ ) {

    let currentSum = 0; // Reset the sum for the current pattern.

    for ( let entityIdx = 0; entityIdx < entityCount; entityIdx++ ) {

      let entitySchedule = openingSchedule[entityIdx]; // Retrieve the schedule for the current entity.

      // Calculate the number of matching active bits between the entity's schedule and the current pattern.
      // This involves joining schedule elements, parsing as binary, bitwise AND, converting back to binary string,
      // splitting, mapping to numbers, and finally summing them.
      let activeCount = (
          parseInt( entitySchedule.join(''), 2 ) & patternMask
        ) .toString(2)
          .split('')
          .map( bitChar => Number(bitChar) )
          .reduce( (acc, bitVal) => acc + bitVal, 0 );

      currentSum += profitTable[entityIdx][activeCount]; // Add the profit corresponding to the active bit count.
    }

    // Update the ultimate benefit if the current pattern yields a higher sum.
    if ( currentSum > ultimateBenefit ) { ultimateBenefit = currentSum; }
  }

  console.log(ultimateBenefit); // Output the final maximum benefit.
}

// Execute the solution by reading input from standard input stream.
const fileSystemModule = require('fs');
const inputPath = '/dev/stdin';
const encodingType = 'utf8';

calculateOptimalBenefit( fileSystemModule.readFileSync(inputPath, encodingType) );