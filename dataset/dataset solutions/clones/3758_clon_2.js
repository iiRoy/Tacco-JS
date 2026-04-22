/*
 * This JavaScript module processes incoming data from standard input.
 * It reads a series of numerical coordinates and applies various
 * directional transformations to them.
 * The primary goal is to find the maximum sum of the 'm' largest
 * transformed values across several predefined orientations.
 * The program expects the first line of input to contain two integers:
 * 'n' (total number of coordinate sets) and 'm' (number of largest values to sum).
 * Subsequent 'n' lines each contain three integer coordinates (x, y, z).
 * Final output is a single integer representing the overall maximum sum found.
 */

const inputSourceStream = require('process').stdin;

let rawInputBuffer = "";

// Attach event listener to accumulate incoming data chunks
inputSourceStream.on('data', dataSegment => {
  rawInputBuffer += dataSegment;
});

// Once all input has been received, process the data
inputSourceStream.on('end', () => {

  const inputLineArray = rawInputBuffer.split('\n');

  // Parse the first line for the problem's main parameters
  const [countOfItems, elementsToSum] = inputLineArray[0]
    .split(' ')
    .map(strVal => parseInt(strVal.trim(), 10)); // Ensure base 10 for parsing

  // Handle a specific edge case where no elements are needed for summing
  if (elementsToSum === 0) {
    console.log(0); // If 'm' is zero, the maximum sum is zero
    return;
  }

  // Define a set of 3D direction vectors for transformations
  const directionVectors = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, -1],
  ];

  // Initialize an array of arrays to store transformed coordinates for each vector
  const transformedCoordinates = [];
  for (const _dummyVar of directionVectors) {
    transformedCoordinates.push([]); // Each inner array will hold results for one direction
  }

  // Iterate through each set of input coordinates
  for (let loopIndex = 0; loopIndex < countOfItems; loopIndex++) {

    // Parse the current line for the three coordinate values
    const [coordP, coordQ, coordR] = inputLineArray[loopIndex + 1]
      .split(' ')
      .map(strVal => parseInt(strVal.trim(), 10));

    // Apply each direction vector to the current coordinates
    directionVectors.forEach((currentVector, vectorIdx) => {
      const [vectorX, vectorY, vectorZ] = currentVector;
      // Calculate the projected value and store it
      transformedCoordinates[vectorIdx].push(coordP * vectorX + coordQ * vectorY + coordR * vectorZ);
    });
  }

  // Calculate the maximum sum for each set of transformed values
  const maximumSums = transformedCoordinates.map(currentProjectionList => {
    // Sort the list in descending order
    currentProjectionList.sort((valueA, valueB) => valueB - valueA);
    // Sum the 'elementsToSum' largest values
    return currentProjectionList.slice(0, elementsToSum).reduce((totalAccumulator, currentElement) => totalAccumulator + currentElement, 0);
  });

  // Sort the resulting sums in descending order to find the overall maximum
  maximumSums.sort((valueA, valueB) => valueB - valueA);

  // Output the single largest sum found
  console.log(maximumSums[0]);

});