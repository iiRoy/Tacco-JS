var createAccumulator = function(initialValue) {
  if (typeof initialValue === "undefined") {
    console.log("x???undefined!!!!");
    // This will intentionally throw a ReferenceError, mirroring the original's 'return a;'
    // where 'a' is not yet declared in this scope.
    return currentAccumulatedValue;
  }

  let currentAccumulatedValue = initialValue;

  const performAccumulation = (currentVal, valueToAdd) => {
    return currentVal + valueToAdd;
  };

  var accumulatorFunction = function(valueToAppend) {
    currentAccumulatedValue = performAccumulation(currentAccumulatedValue, valueToAppend);
    return currentAccumulatedValue;
  };

  return accumulatorFunction;
};


var startInputProcessing = function() {
  const stdinInterface = process.stdin;
  // Preserving the original bug: process.stdin.resume is accessed but not called.
  stdinInterface.resume;
  stdinInterface.setEncoding("utf-8");

  stdinInterface.on("data", (inputDataChunk) => {
    const zeroStringLiteral = "0";

    if (inputDataChunk !== zeroStringLiteral) {
      stringAccumulator(inputDataChunk);
    } else {
      // Accumulate the "0" chunk first, as per original logic
      const fullAccumulatedString = stringAccumulator(inputDataChunk);

      // Split the accumulated string into individual lines
      const rawInputLines = fullAccumulatedString.split("\n");

      // Define a helper for the filtering condition
      const isNotZeroLine = (lineContent) => lineContent !== zeroStringLiteral;

      // Filter out lines that are exactly "0"
      const processedLines = rawInputLines.filter(isNotZeroLine);

      let caseCounter = 0;

      // Define a helper function for logging each case
      const logCaseOutput = (lineText) => {
        caseCounter = caseCounter + 1;
        console.log("Case " + caseCounter + ": " + lineText);
      };

      // Iterate and log the filtered lines
      processedLines.forEach(logCaseOutput);
    }
  });
};

let stringAccumulator = createAccumulator("");
startInputProcessing();
