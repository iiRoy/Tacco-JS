function parseNumericValue(str) {
  return Number(str);
}

function processInput(rawData) {
  let lines = rawData.split("\n");
  let count = parseNumericValue(lines[0]);
  let numStrings = lines[1].split(" ");

  let numericValues = numStrings.map(parseNumericValue);

  let greatestVal = 0;
  let totalSum = 0;

  for (let idx = 0; idx < count; idx++) {
    let currentNum = numericValues[idx];
    greatestVal = Math.max(greatestVal, currentNum);
    totalSum += currentNum;
  }

  if (2 * greatestVal < totalSum) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInput(fileContent);
