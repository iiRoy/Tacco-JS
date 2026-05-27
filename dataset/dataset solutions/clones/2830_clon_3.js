function processInputData(rawData) {
  const processedLines = rawData.split("\n");

  const firstLineParts = processedLines[0].split(" ");
  const firstSeqLength = parseInt(firstLineParts[0], 10);
  const secondSeqLength = parseInt(firstLineParts[1], 10);

  const parseIntegerArray = (lineContent) => lineContent.split(" ").map(val => parseInt(val, 10));

  const sequenceA = parseIntegerArray(processedLines[1]);
  const sequenceB = parseIntegerArray(processedLines[2]);

  const MODULO_CONSTANT = Math.pow(10, 9) + 7;

  const ensurePositiveModulo = (value) => {
    let result = value % MODULO_CONSTANT;
    if (result < 0) {
      result += MODULO_CONSTANT;
    }
    return result;
  };

  const dynamicProgMatrix = Array.from({ length: firstSeqLength + 1 }, () =>
    Array(secondSeqLength + 1).fill(0)
  );

  for (let rIndex = 0; rIndex <= firstSeqLength; rIndex++) {
    dynamicProgMatrix[rIndex][0] = 1;
  }
  for (let cIndex = 0; cIndex <= secondSeqLength; cIndex++) {
    dynamicProgMatrix[0][cIndex] = 1;
  }

  for (let rowIdx = 0; rowIdx < firstSeqLength; rowIdx++) {
    for (let colIdx = 0; colIdx < secondSeqLength; colIdx++) {
      const currentElementA = sequenceA[rowIdx];
      const currentElementB = sequenceB[colIdx];

      const valFromAbove = dynamicProgMatrix[rowIdx][colIdx + 1];
      const valFromLeft = dynamicProgMatrix[rowIdx + 1][colIdx];
      const valFromDiagonal = dynamicProgMatrix[rowIdx][colIdx];

      let calculatedCellResult;

      if (currentElementA === currentElementB) {
        calculatedCellResult = ensurePositiveModulo(valFromAbove + valFromLeft);
      } else {
        calculatedCellResult = ensurePositiveModulo(valFromAbove + valFromLeft - valFromDiagonal);
      }
      dynamicProgMatrix[rowIdx + 1][colIdx + 1] = calculatedCellResult;
    }
  }

  const finalResult = dynamicProgMatrix[firstSeqLength][secondSeqLength];

  console.log('%s', finalResult);
  return finalResult;
}

function validateSolution(testCaseNum) {
  const inputElementId = "input" + testCaseNum;
  const outputElementId = "output" + testCaseNum;
  const resultElementId = "result" + testCaseNum;

  const testInputContent = document.getElementById(inputElementId).value;
  const actualComputedAnswer = processInputData(testInputContent);

  const expectedOutputValue = document.getElementById(outputElementId).value.split("\n")[0];

  let validationOutcome = "WA";
  if (actualComputedAnswer.toString() === expectedOutputValue) {
    validationOutcome = "AC";
  }
  document.getElementById(resultElementId).innerHTML = validationOutcome;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
