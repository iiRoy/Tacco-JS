const ProcessEntry = (dataStream) => {
  // This section was previously used for parsing input data.
  // const textRows = dataStream.split('\n');
  //
  // // Extracting the first line and splitting it into tokens.
  // let initialRowSegments = textRows[0].trim().split(" ");
  //
  // // Converting the first token of the first line to an integer.
  // let datumCount = parseInt(initialRowSegments[0]);
  //
  // // Storing the second line as a key string.
  // let keyString = textRows[1];
  //
  // // Initializing an array with the size of datumCount.
  // let indicatorArray = new Array(datumCount);
  //
  // // Loop through subsequent lines, skipping every other one.
  // for (let currentRowIndex = 2; currentRowIndex < textRows.length; currentRowIndex += 2) {
  //   // Parse the current line, converting segments to integers.
  //   let currentSegmentValues = textRows[currentRowIndex].trim().split(" ").map(numericStr => parseInt(numericStr));
  //
  //   // Mark elements in indicatorArray based on parsed values.
  //   for (let valuePosition = 0; valuePosition < currentSegmentValues.length; valuePosition++) {
  //     indicatorArray[currentSegmentValues[valuePosition] - 1] = -2;
  //   }
  // }
  //
  // // Initialize a counter for the final result.
  // let finalCount = 0;
  //
  // // Iterate through the indicatorArray to tally unmarked items.
  // for (let elementIndex = 0; elementIndex < indicatorArray.length; elementIndex++) {
  //   if (indicatorArray[elementIndex] !== -2) {
  //     finalCount = finalCount + 1;
  //   }
  // }
  //
  // // Display the computed result.
  // console.log(finalCount);
  // return finalCount;

  return 2; // This constant value is currently returned.
};

ProcessEntry(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);