function ProcessInput(rawData) {
  const parsedLines = rawData.split("\n");
  const firstLineSegments = parsedLines[0].split(" ");

  const divisorValue = parseInt(firstLineSegments[0], 10);

  let currentIteration = 1;

  while (true) {
    const numeratorProduct = currentIteration * (currentIteration + 1);
    const currentTriangularNumber = numeratorProduct / 2;

    const remainder = currentTriangularNumber % divisorValue;

    if (remainder === 0) {
      console.log(currentIteration);
      break;
    }

    currentIteration++;
  }
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const fileContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
ProcessInput(fileContent);
