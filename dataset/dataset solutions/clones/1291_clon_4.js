let recordedData = "";

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (segment) => {
  recordedData += segment;
});

process.stdin.on('end', () => {
  const dataSegments = recordedData.split('\n');

  // Function to determine the grade based on three components
  const determineRank = (valOne, valTwo, valThree) => {
    const modifiedOne = valOne === -1 ? 0 : valOne;
    const modifiedTwo = valTwo === -1 ? 0 : valTwo;
    const aggregateSum = modifiedOne + modifiedTwo;

    // Handle potential NaN or undefined from map(Number) on malformed input for valThree
    // Using -Infinity ensures comparisons like `>= 50` correctly fail for non-numeric values
    const effectiveValThree = Number.isNaN(valThree) || valThree === undefined ? -Infinity : valThree;

    // Grading criteria defined as an ordered list of test functions and their corresponding results
    const gradingCriteria = [
      { check: (sumValue, thirdValue) => sumValue >= 80, outcome: "A" },
      { check: (sumValue, thirdValue) => sumValue >= 65, outcome: "B" },
      { check: (sumValue, thirdValue) => sumValue >= 50, outcome: "C" },
      { check: (sumValue, thirdValue) => sumValue >= 30 && thirdValue >= 50, outcome: "C" },
      { check: (sumValue, thirdValue) => sumValue >= 30, outcome: "D" },
      { check: (sumValue, thirdValue) => true, outcome: "F" } // Default case
    ];

    for (const criterion of gradingCriteria) {
      if (criterion.check(aggregateSum, effectiveValThree)) {
        return criterion.outcome;
      }
    }
    return "F"; // Fallback, should not be reached if the last rule is `true`
  };

  // Recursive function to process each line of input
  const traverseInput = (currentIndex) => {
    if (currentIndex >= dataSegments.length) {
      return; // All segments processed or end of array
    }

    const segmentContent = dataSegments[currentIndex].trim();

    // Primary termination conditions: if the line is "0" or empty, stop all further processing.
    // This mirrors the original's `while (input[i] != 0)` condition with loose equality.
    if (segmentContent === "0" || segmentContent === "") {
      return;
    }

    const parsedElements = segmentContent.split(' ').map(Number);

    const primaryComponent = parsedElements[0];
    const secondaryComponent = parsedElements[1];
    const tertiaryComponent = parsedElements[2];

    // Secondary termination condition: -1 -1 -1
    if (primaryComponent === -1 && secondaryComponent === -1 && tertiaryComponent === -1) {
      return;
    }

    const finalVerdict = determineRank(primaryComponent, secondaryComponent, tertiaryComponent);
    console.log(finalVerdict);

    // Proceed to the next segment recursively
    traverseInput(currentIndex + 1);
  };

  // Initiate the recursive processing from the first segment
  traverseInput(0);
});