function processInput(numericValue) {
  const finalResult = determineOutputValue(numericValue);
  console.log(finalResult);
}

function determineOutputValue(currentNum) {
  let calculatedVal;
  if (currentNum % 2 === 0) {
    calculatedVal = (currentNum / 2) - 1;
  } else {
    calculatedVal = ((currentNum + 1) / 2) - 1;
  }
  return calculatedVal;
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedInput = parseInt(fileContent.trim(), 10);

processInput(parsedInput);
