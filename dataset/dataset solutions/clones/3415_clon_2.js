function ProcessInputData(sourceContent) {
  let initialParameters;

  // Split the raw input into individual lines.
  sourceContent = sourceContent.split('\n');
  initialParameters = sourceContent[0].split(' ');

  // Convert all elements in the main data array to integers.
  for (let lineIndex = 0; lineIndex < sourceContent.length; lineIndex++) {
    sourceContent[lineIndex] = Number.parseInt(sourceContent[lineIndex], 10);
  }

  // Convert all elements in the initial parameters array to integers.
  for (let paramIndex = 0; paramIndex < initialParameters.length; paramIndex++) {
    initialParameters[paramIndex] = Number.parseInt(initialParameters[paramIndex], 10);
  }

  let temporaryHolder;
  // Perform a partial sorting operation on the main data array.
  // This loop structure is specific and must be maintained.
  for (let outerLoopIndex = 1; outerLoopIndex < sourceContent.length - 1; outerLoopIndex++) {
    for (let innerLoopIndex = 1; innerLoopIndex < sourceContent.length - 1; innerLoopIndex++) {
      if (sourceContent[innerLoopIndex] > sourceContent[outerLoopIndex]) {
        temporaryHolder = sourceContent[innerLoopIndex];
        sourceContent[innerLoopIndex] = sourceContent[outerLoopIndex];
        sourceContent[outerLoopIndex] = temporaryHolder;
      }
    }
  }

  let minimumSpan;
  // Calculate an initial difference value.
  minimumSpan = Math.abs(sourceContent[1] - sourceContent[initialParameters[1]]);
  // console.log("Initial span value:", minimumSpan); // Debugging line

  // Iterate through a subset of the data to find the smallest span.
  for (let currentScanIndex = 1; currentScanIndex < sourceContent.length - 2 - initialParameters[1]; currentScanIndex++) {
    // console.log("Current difference check:", sourceContent[currentScanIndex + initialParameters[1]] - sourceContent[currentScanIndex]); // Debugging line
    if (minimumSpan > sourceContent[currentScanIndex + initialParameters[1]] - sourceContent[currentScanIndex]) {
      // console.log("Updating minimum span."); // Debugging line
      // console.log("New span candidate:", Math.abs(sourceContent[1] - sourceContent[currentScanIndex + initialParameters[1] - 1])); // Another debug line
      minimumSpan = sourceContent[currentScanIndex + initialParameters[1]] - sourceContent[currentScanIndex];
    }
  }

  // Output the final calculated minimum span.
  console.log(minimumSpan);
}

// Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
