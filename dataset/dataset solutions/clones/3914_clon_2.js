'use strict';

const processData = ( initialString ) => {
  // Convert the raw input string into an array of numbers
  initialString = initialString
    .split(' ')
    .map( numStr => parseInt(numStr, 10) );

  const lowerLimit = initialString[0]; // The starting number of the range
  const upperLimit = initialString[1]; // The ending number of the range
  const extractCount = initialString[2]; // How many elements to take from start and end

  let fullSequence = []; // Array to hold all numbers in the specified range

  // Populate the array with numbers from lowerLimit to upperLimit, inclusive
  for (let currentValue = lowerLimit; currentValue <= upperLimit; currentValue++) {
    fullSequence.push(currentValue);
  }

  // Extract the first 'extractCount' elements
  const firstPortion = fullSequence.slice(0, extractCount);

  // Extract the last 'extractCount' elements
  const lastPortion = fullSequence.slice(-extractCount);

  // Combine the first and last portions into a Set to ensure uniqueness
  const distinctValues = new Set([...firstPortion, ...lastPortion]);

  // Output each unique value
  distinctValues.forEach( currentElement => console.log(currentElement) );
};

// Read input from standard input and pass it to the processing function
processData(
  require('fs')
    .readFileSync('/dev/stdin',
      'utf-8'
    )
);