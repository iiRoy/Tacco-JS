function processInputData(rawDataString) {
  const parsedSegments = rawDataString.split(" ");

  const initialSegmentValue = parsedSegments[0];

  const firstNumericComponent = initialSegmentValue;
  const secondNumericComponent = initialSegmentValue;

  const calculateFinalResult = (valA, valB) => {
    const intermediateDifference = valA - valB;
    const finalComputedValue = intermediateDifference + 1;
    return finalComputedValue;
  };

  console.log(calculateFinalResult(firstNumericComponent, secondNumericComponent));
}

const fileSystemModuleReference = require("fs");
const standardInputFilePath = "/dev/stdin";
const inputEncodingFormat = "utf8";

const fileContentBuffer = fileSystemModuleReference.readFileSync(standardInputFilePath, inputEncodingFormat);

processInputData(fileContentBuffer);
