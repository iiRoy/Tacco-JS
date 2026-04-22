function ProcessInputData(problemData) {
  const dataRows = problemData.split("\n");

  const firstLineParts = dataRows[0].split(" ");
  const rowsCount = parseInt(firstLineParts[0], 10);
  const colsCount = parseInt(firstLineParts[1], 10);
  const initialOffset = parseInt(firstLineParts[2], 10);

  const weightsArray = dataRows[1].split(" ").map(itemStr => Number(itemStr));

  const dataMatrix = [];

  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    dataMatrix[rowIndex] = dataRows[rowIndex + 2].split(" ").map(elementStr => Number(elementStr));
  }

  let CodeProcessor = function() {};

  CodeProcessor.prototype = {
    performEvaluation: function() {
      let successfulEvaluations = 0;

      for (let currentRowIndex = 0; currentRowIndex < rowsCount; currentRowIndex++) {
        let rowTotal = 0;

        rowTotal = rowTotal + initialOffset;

        for (let colIndex = 0; colIndex < colsCount; colIndex++) {
          rowTotal = rowTotal + dataMatrix[currentRowIndex][colIndex] * weightsArray[colIndex];
        }

        if (rowTotal > 0) {
          successfulEvaluations++;
        }
      }
      return successfulEvaluations;
    }
  };

  const processorObject = new CodeProcessor();

  console.log(processorObject.performEvaluation());
}

const rawInputText = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessInputData(rawInputText);