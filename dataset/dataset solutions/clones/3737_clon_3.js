function processInput(inputString) {
  const targetCount = Number(inputString);
  const resultNumbers = [];
  let currentLeft = 0;
  let currentRight = 1;

  while (resultNumbers.length < targetCount) {
    const candidateNumber = currentLeft + currentRight;

    const sumDigitsForCandidate = calculateDigitSum(candidateNumber);
    const sumDigitsForNextCandidate = calculateDigitSum(candidateNumber + currentRight);

    const ratioCurrent = candidateNumber / sumDigitsForCandidate;
    const ratioNext = (candidateNumber + currentRight) / sumDigitsForNextCandidate;

    if (ratioCurrent <= ratioNext) {
      resultNumbers.push(candidateNumber);
      currentLeft = candidateNumber;
    } else {
      currentRight *= 10;
    }
  }
  console.log(resultNumbers.join("\n"));
}

function calculateDigitSum(numValue) {
  let sumOfDigits = 0;
  let tempValue = numValue;
  while (tempValue > 0) {
    sumOfDigits += tempValue % 10;
    tempValue = Math.floor(tempValue / 10);
  }
  return sumOfDigits;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
