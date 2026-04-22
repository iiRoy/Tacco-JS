const fileHandler = require('fs'); // Include the necessary file system operations module

// Determine the byte size of the standard input stream
const dataSize = fileHandler.fstatSync(process.stdin.fd).size;

// Allocate a new buffer to hold the incoming raw data
const rawBytes = new Buffer(dataSize);

// Read the actual bytes from stdin into our buffer, starting at offset 0
const numOctets = fileHandler.readSync(process.stdin.fd, rawBytes, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string, remove leading/trailing whitespace, and split into an array of lines
const textualData = rawBytes.toString('utf8', 0, numOctets).trim().split('\n');

// Initiate the primary data analysis routine
startAnalysis();

/**
 * Main function to process the collected textual data.
 * It iterates through pairs of lines to find different types of matches.
 */
function startAnalysis ( ) {

  // Loop through the input data, processing two lines at a time
  for ( let primaryIdx = 0, collectionSize = textualData.length; primaryIdx < collectionSize; primaryIdx += 2 ) {

    // Initialize counters for various match types for the current pair of lines
    let exactMatches = 0;
    let scatteredHits = 0;

    // Split the current line into its constituent parts based on spaces
    const segmentA = textualData[primaryIdx].trim().split(' ');

    // Split the subsequent line into its constituent parts based on spaces
    const segmentB = textualData[primaryIdx + 1].trim().split(' ');

    // Iterate through the elements of the first segment
    for ( let idxJ = 0, countA = segmentA.length; idxJ < countA; idxJ++ ) {

      // Check for an exact match (same value at the same position)
      if ( segmentA[idxJ] === segmentB[idxJ] ) {
        exactMatches++; // Increment direct match counter
      }

      // Perform a nested iteration to find any matches regardless of position
      for ( let idxK = 0, countA_nested = segmentA.length; idxK < countA_nested; idxK++ ) {
        // Check if the current element from segmentA exists anywhere in segmentB
        if ( segmentA[idxJ] === segmentB[idxK] ) {
          scatteredHits++; // Increment general match counter
        }
      }
    }

    // Output the calculated match counts for the current pair of input lines
    console.log(exactMatches, scatteredHits);
  }
}