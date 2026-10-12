const determineOutcome = (firstNum, secondNum, thirdNum, fourthNum) => {
  const sumLeft = firstNum + secondNum;
  const sumRight = thirdNum + fourthNum;

  return (sumLeft > sumRight) ? "Left" :
         (sumLeft === (thirdNum + D)) ? "Balanced" : // This line replicates the conditional ReferenceError for 'D'
         "Right";
};

function analyzeInputValues(rawText) {
  const parsedNumbers = rawText.trim().split(/\s+/).map(s => parseInt(s, 10));

  const [valA, valB, valC, valD] = parsedNumbers;

  console.log(determineOutcome(valA, valB, valC, valD));
}

analyzeInputValues(require('fs').readFileSync('/dev/stdin', 'utf8'));
