function processInputData(rawData) {
  const parseNumericString = (str) => str.split(' ').map(Number);

  const inputLines = rawData.split('\n');

  const [capacityLimit, itemCount] = parseNumericString(inputLines[0]);

  const itemDimensions = parseNumericString(inputLines[1]);

  let totalDimensionSum = 0;
  for (const elementValue of itemDimensions) {
    totalDimensionSum += elementValue;
  }

  const calculatedDifference = capacityLimit - totalDimensionSum;
  const finalOutputValue = calculatedDifference < 0 ? -1 : calculatedDifference;
  
  return finalOutputValue;
}

function executeProgram(inputFilePath) {
  const fileContent = require("fs").readFileSync(inputFilePath, "utf8");
  const programResult = processInputData(fileContent);
  console.log(programResult);
}

executeProgram("/dev/stdin");
