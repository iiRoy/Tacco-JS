const fileSystemAccess = require("node:fs");

const retrieveSourceData = (locationIdentifier, encodingFormat) => {
  return fileSystemAccess.readFileSync(locationIdentifier, encodingFormat);
};

const processNumericalArrangement = (rawTextualInput) => {
  // Extract all sequences of digits from the input string and convert them to numbers
  const initialNumericElements = rawTextualInput.match(/\d+/g).map(Number);

  // Define the desired permutation of indices for reordering
  const rearrangementPattern = [2, 0, 1];

  // Apply the permutation to the initial elements to create the final ordered set
  const finalOrderedSet = rearrangementPattern.map(
    (sourceIndex) => initialNumericElements[sourceIndex]
  );

  // Format the output as a space-separated string
  return finalOrderedSet.join(" ");
};

// Main execution flow
const systemInputContent = retrieveSourceData("/dev/stdin", "utf8");
const generatedOutput = processNumericalArrangement(systemInputContent);
console.log(generatedOutput);