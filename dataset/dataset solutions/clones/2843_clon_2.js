function ProcessInputData(rawData) {
  'use strict'; // Enforce strict parsing and error handling

  // Split the raw input string into an array of individual lines.
  const lineSegments = rawData.split("\n") ;

  // Extract the first line, convert it to an integer (base 10),
  // representing the total number of data entries to process.
  const totalEntries = parseInt(lineSegments.shift(), 10);

  // Initialize two arrays to store calculated vector differences.
  // 'diffVectors' will hold (P1 - P2) and 'reverseVectors' will hold (P2 - P1).
  const diffVectors   =   [];
  const reverseVectors = [];

  // Iterate through the remaining lines to parse each into its components.
  // Each line is expected to contain two space-separated values.
  for ( let idxA = 0; idxA < totalEntries; idxA++ ) {
    lineSegments[idxA] = lineSegments[idxA].split(" ");
  }


  // Calculate all pairwise differences between data points.
  // This involves nested loops to compare each point with every subsequent point.
  for ( let idxA = 0; idxA < totalEntries - 1; idxA++ ) {
    for ( let idxB = idxA + 1; idxB < totalEntries; idxB++ ) {

      // Calculate the difference vector (X1-X2, Y1-Y2)
      diffVectors.push( [
        lineSegments[idxA][0] - lineSegments[idxB][0],
        lineSegments[idxA][1] - lineSegments[idxB][1]
      ] );

      // Calculate the reverse difference vector (X2-X1, Y2-Y1)
      reverseVectors.push( [
        lineSegments[idxB][0] - lineSegments[idxA][0],
        lineSegments[idxB][1] - lineSegments[idxA][1]
      ] );
    }
  }

  // Sort both arrays of vectors. This is crucial for grouping identical vectors
  // together for efficient counting of consecutive matches.
  diffVectors.sort();
  reverseVectors.sort();

  // Initialize variables to track streaks of identical vectors.
  let currentStreak = 1; // Tracks the current sequence length of identical vectors.
  let maxStreak = 0;     // Stores the maximum sequence length found so far.

  // Iterate through the sorted 'diffVectors' to find the longest sequence
  // of identical or reverse-identical vectors.
  for ( let idxC = 0; idxC < diffVectors.length - 1; idxC++ ) {
    // Convert arrays to JSON strings for reliable content comparison.
    const currentVectorStr = JSON.stringify(diffVectors[idxC]);
    const nextVectorStr = JSON.stringify(diffVectors[idxC + 1]);
    const nextReverseVectorStr = JSON.stringify(reverseVectors[idxC + 1]);

    // Check if the current vector is identical to the next vector
    // or identical to the next reverse vector.
    if ( (currentVectorStr === nextVectorStr) || (currentVectorStr === nextReverseVectorStr) ) {
      currentStreak++; // Increment the current streak if a match is found.
    } else {
      // If no match, check if the current streak is the new maximum.
      if (maxStreak < currentStreak) {
        maxStreak = currentStreak;
      }
      currentStreak = 1; // Reset streak for the next sequence.
    }
  }

  // Output the result: total entries minus the maximum streak found.
  console.log(totalEntries - maxStreak);
}

// The following section handles standard input/output and should not be modified.
// It reads the entire content from stdin and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));