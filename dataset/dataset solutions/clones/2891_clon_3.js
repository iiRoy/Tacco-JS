(function() {
  const retrieveFirstLine = (fullContent) => {
    const contentSegments = fullContent.split("\n");
    // Ensure a string is always returned, even for empty input
    return contentSegments.length > 0 ? contentSegments[0] : "";
  };

  function processStringData(targetString) {
    const characterToCount = 'x';
    let countOfTargetChar = 0;

    // Iterate over each character using a modern loop construct
    for (const singleChar of targetString) {
      if (singleChar === characterToCount) {
        countOfTargetChar++;
      }
    }

    // Define the comparison threshold as a constant
    const minimumRequiredCount = 8;
    const meetsCondition = countOfTargetChar >= minimumRequiredCount;

    // Determine the output message using a conditional expression
    const finalOutcomeMessage = meetsCondition ? 'NO' : 'YES';
    console.log(finalOutcomeMessage);
  }

  // Define constants for input source details
  const standardInputPath = "/dev/stdin";
  const fileReadEncoding = "utf8";

  // Read the raw content from the specified input source
  const rawInputContent = require("fs").readFileSync(standardInputPath, fileReadEncoding);

  // Extract the relevant first line for processing
  const processedInputLine = retrieveFirstLine(rawInputContent);

  // Execute the core logic with the prepared input
  processStringData(processedInputLine);
}());
