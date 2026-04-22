'use strict'; // Enforce strict JavaScript parsing rules.

function ProcessInputData(rawDataStream) {
  // Normalize and split the incoming text into individual lines.
  const parsedContent = rawDataStream.trim() . split  (  / \r?\n / g  );

  // Extract the first line as the total number of elements.
  const dataSize = parseInt(parsedContent.shift(), 10);

  // Transform remaining lines into a 2D array of numbers.
  const valueGrid = parsedContent.map(  dataRow  => dataRow.split(' ').map(numericString => +numericString)  );

  let peakSum = 0; // Initialize a variable to store the highest sum found.

  // Iterate through all possible split points for the calculation.
  for (  let segmentPoint = 0 ;   segmentPoint  < dataSize ;   segmentPoint++  )  {
      let currentSegmentSum = 0; // Reset sum for the current segment.

      // Sum elements from the first row up to the current segment point.
      for (let subSegmentIterator = 0; subSegmentIterator <= segmentPoint; subSegmentIterator++) {
          currentSegmentSum += valueGrid[0][subSegmentIterator];
      }

      // Sum elements from the second row starting from the current segment point.
      for (let subSegmentIterator = segmentPoint; subSegmentIterator < dataSize; subSegmentIterator++) {
          currentSegmentSum += valueGrid[1][subSegmentIterator];
      }

      // Update the maximum sum if the current segment's sum is greater.
      if (peakSum < currentSegmentSum) {
          peakSum = currentSegmentSum;
      }
  }

  // Output the final maximum calculated sum to the console.
  console.log(peakSum);
}

// Standard boilerplate for reading input from the system's standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));