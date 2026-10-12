(function(rawDataContent) {
  const parseInputLines = (textInput) => {
    return textInput.replace(/\n$/, '').split('\n');
  };

  let processedLines = parseInputLines(rawDataContent);

  const numberOfTestCases = Number(processedLines.shift());

  for (let caseIdx = 0; caseIdx < numberOfTestCases; caseIdx++) {
    const currentCaseNumbers = processedLines.shift().split(' ').map(Number);
    console.log(determineSequenceProperty(currentCaseNumbers));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function determineSequenceProperty(inputArray) {
  const initialComparisonValue = inputArray.shift();

  const relevantElements = inputArray.filter(element => element <= initialComparisonValue);

  let currentMaximumValue = -Infinity;
  let isMonotonicallyIncreasing = true;

  for (let k = 0; k < relevantElements.length; k++) {
    const elementInSequence = relevantElements[k];
    if (elementInSequence > currentMaximumValue) {
      currentMaximumValue = elementInSequence;
    } else {
      isMonotonicallyIncreasing = false;
      break;
    }
  }

  return isMonotonicallyIncreasing ? 'YES' : 'NO';
}
