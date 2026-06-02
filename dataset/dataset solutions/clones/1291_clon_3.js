var rawDataBuffer = "";

function getNumericScoreComponent(scoreString) {
  const numericVal = parseInt(scoreString, 10);
  // For the first two scores, a value of -1 is treated as 0.
  return numericVal === -1 ? 0 : numericVal;
}

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(chunk) {
  rawDataBuffer += chunk;
});
 
process.stdin.on('end', function() {
  const linesOfData = rawDataBuffer.split("\n");
  let currentLineIdx = 0;

  // Helper function to encapsulate the grading logic
  const determineGrade = (totalScoreValue, supplementaryScoreString) => {
    if (totalScoreValue >= 80) {
      return "A";
    } else if (totalScoreValue >= 65) {
      return "B";
    } else if (totalScoreValue >= 50) {
      return "C";
    } else if (totalScoreValue >= 30) {
      // Special condition for scores between 30 and 49
      const parsedSupplementary = parseInt(supplementaryScoreString, 10);
      if (parsedSupplementary >= 50) {
        return "C";
      } else {
        return "D";
      }
    } else {
      return "F";
    }
  };

  // Loop through each line of input data
  while (linesOfData[currentLineIdx] != 0) { // Original condition: `input[i] != 0`
    const currentLine = linesOfData[currentLineIdx];
    const scoreParts = currentLine.split(" ");

    // Check for the specific termination sequence: "-1 -1 -1"
    // Added a length check for robustness, preserving original behavior for malformed input.
    if (scoreParts.length === 3 && scoreParts[0] === "-1" && scoreParts[1] === "-1" && scoreParts[2] === "-1") {
      break;
    }

    // Parse and adjust the first two score components using the helper
    const primaryScoreComponent1 = getNumericScoreComponent(scoreParts[0]);
    const primaryScoreComponent2 = getNumericScoreComponent(scoreParts[1]);

    // Calculate the total score
    const calculatedTotal = primaryScoreComponent1 + primaryScoreComponent2;

    // Determine and print the final grade using the helper function
    const finalGradeResult = determineGrade(calculatedTotal, scoreParts[2]);
    console.log(finalGradeResult);

    currentLineIdx++;
  }
});
