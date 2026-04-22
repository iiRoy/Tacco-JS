const processStringForNumbers = (textSegment) => {
  const extractedNumbers = [];
  let currentNumber = 0;
  let inNumber = false;

  for (let i = 0; i < textSegment.length; i++) {
    const char = textSegment[i];
    if (char >= '0' && char <= '9') {
      currentNumber = currentNumber * 10 + Number(char);
      inNumber = true;
    } else {
      if (inNumber) {
        extractedNumbers.push(currentNumber);
        currentNumber = 0;
        inNumber = false;
      }
    }
  }
  if (inNumber) {
    extractedNumbers.push(currentNumber);
  }
  return extractedNumbers;
};

const executeGameLogic = (inputString) => {
  const cleanedInput = inputString.trim();
  const scores = processStringForNumbers(cleanedInput);

  const totalScore = scores.reduce((accumulator, value) => accumulator + value, 0);

  const thresholdValue = 22;

  const statusLabels = ['win', 'bust'];
  const finalStatus = statusLabels[+(totalScore >= thresholdValue)];

  return finalStatus;
};

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
const gameResult = executeGameLogic(fileContents);
console.log(gameResult);