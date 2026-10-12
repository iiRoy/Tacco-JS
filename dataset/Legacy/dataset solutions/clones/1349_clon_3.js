function calculateCubeValue(inputNumber) {
  const numericInput = Number(inputNumber);
  const result = Math.pow(numericInput, 3);
  return result;
}

function processAndLogCube(rawData) {
  const cleanedData = rawData.trim();
  const finalOutput = calculateCubeValue(cleanedData);
  console.log(finalOutput);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processAndLogCube(fileContent);
