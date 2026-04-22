// Function to process the main input data and calculate a score based on character sequence rules.
function ProcessInputData(rawDataString) {
  const inputLines = rawDataString.split(/\r?\n/);
  const charSequence = inputLines[0].split('');
  const sequenceLength = charSequence.length + 1;

  const boundaryMarkers = Array(sequenceLength).fill(null);

  if (charSequence[0] === "<") {
    boundaryMarkers[0] = 0;
  }

  for (let charIdx = 0; charIdx < charSequence.length - 1; charIdx++) {
    if (charSequence[charIdx] === ">" && charSequence[charIdx + 1] === "<") {
      boundaryMarkers[charIdx + 1] = 0;
    }
  }

  if (charSequence[charSequence.length - 1] === ">") {
    boundaryMarkers[sequenceLength - 1] = 0;
  }

  const leftScores = Array(sequenceLength).fill(0);
  let currentLeftIncrement = 0;

  for (let charIdx = 0; charIdx < charSequence.length; charIdx++) {
    if (boundaryMarkers[charIdx] === 0) {
      currentLeftIncrement = 0;
    }

    if (charSequence[charIdx] === "<") {
      currentLeftIncrement++;
      leftScores[charIdx + 1] = currentLeftIncrement;
    } else {
      currentLeftIncrement = 0;
      leftScores[charIdx + 1] = currentLeftIncrement;
    }
  }

  const rightScores = Array(sequenceLength).fill(0);
  let currentRightIncrement = 0;

  for (let charIdx = charSequence.length - 1; charIdx >= 0; charIdx--) {
    if (boundaryMarkers[charIdx + 1] === 0) {
      currentRightIncrement = 0;
    }

    if (charSequence[charIdx] === ">") {
      currentRightIncrement++;
      rightScores[charIdx] = currentRightIncrement;
    } else {
      currentRightIncrement = 0;
      rightScores[charIdx] = currentRightIncrement;
    }
  }

  let totalCalculatedScore = 0;

  for (let posIdx = 0; posIdx < sequenceLength; posIdx++) {
    if (boundaryMarkers[posIdx] !== 0) {
      const positionValue = Math.max(leftScores[posIdx], rightScores[posIdx]);
      totalCalculatedScore += positionValue;
    }
  }

  console.log(totalCalculatedScore);
  return totalCalculatedScore;
}

function verifyTestCase(testCaseNumber) {
  const testInputData = document.getElementById(`testInput${testCaseNumber}`).value;
  const calculatedResult = ProcessInputData(testInputData);

  const expectedOutputString = String(document.getElementById(`expectedOutput${testCaseNumber}`).value).split(/\r?\n/)[0];
  let testOutcome = "WA";

  if (String(calculatedResult) === expectedOutputString) {
    testOutcome = "AC";
  }

  document.getElementById(`testResultStatus${testCaseNumber}`).textContent = testOutcome;
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));