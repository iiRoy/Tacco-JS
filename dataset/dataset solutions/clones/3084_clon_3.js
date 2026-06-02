const INPUT_LINE_SEPARATOR = "\n";
const RED_CHAR_IDENTIFIER = 'R';
const BLUE_CHAR_IDENTIFIER = 'B';
const POSITIVE_OUTCOME_TEXT = 'Yes';
const NEGATIVE_OUTCOME_TEXT = 'No';

function processInputData(rawInputString) {
  const inputSegments = rawInputString.split(INPUT_LINE_SEPARATOR);
  const firstSegment = inputSegments[0];
  const secondSegment = inputSegments[1];

  const totalElementsCount = parseInt(firstSegment, 10);
  const thresholdMidpoint = totalElementsCount / 2;
  const characterSequence = secondSegment;

  let finalDecisionFlag = false;
  let redCharacterAccumulator = 0;
  let blueCharacterAccumulator = 0;

  const evaluateThresholdCondition = (currentAccumulator, thresholdValue, isRedCheck) => {
    if (isRedCheck) {
      return currentAccumulator > thresholdValue;
    } else {
      return currentAccumulator >= thresholdValue;
    }
  };

  for (let elementIndex = 0; elementIndex < totalElementsCount; elementIndex++) {
    const currentElementChar = characterSequence[elementIndex];

    if (currentElementChar === RED_CHAR_IDENTIFIER) {
      redCharacterAccumulator++;
      if (evaluateThresholdCondition(redCharacterAccumulator, thresholdMidpoint, true)) {
        finalDecisionFlag = true;
        break;
      }
    } else if (currentElementChar === BLUE_CHAR_IDENTIFIER) {
      blueCharacterAccumulator++;
      if (evaluateThresholdCondition(blueCharacterAccumulator, thresholdMidpoint, false)) {
        finalDecisionFlag = false;
        break;
      }
    }
  }

  console.log(finalDecisionFlag ? POSITIVE_OUTCOME_TEXT : NEGATIVE_OUTCOME_TEXT);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
