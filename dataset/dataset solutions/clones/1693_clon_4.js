const evaluateGridConfigurations = (inputArray, rowExtent, colExtent, targetValue) => {
  const gridMap = Array.from({ length: rowExtent }, (_, r) =>
    Array.from({ length: colExtent }, (_, c) => inputArray[r * colExtent + c])
  );

  let totalValidConfigurations = 0;

  const processRowSelections = (currentSelectedRows = [], currentProcessingRowIdx = 0) => {
    if (currentProcessingRowIdx === rowExtent) {
      const processColSelections = (currentSelectedCols = [], currentProcessingColIdx = 0) => {
        if (currentProcessingColIdx === colExtent) {
          const intersectionTally = currentSelectedRows.reduce((rowAccum, rIdxKey) =>
            rowAccum + currentSelectedCols.reduce((colAccum, cIdxKey) =>
              colAccum + (gridMap[rIdxKey][cIdxKey] ? 1 : 0), 0
            ), 0
          );

          if (intersectionTally === targetValue) {
            totalValidConfigurations++;
          }
          return;
        }

        // Include current column index
        processColSelections([...currentSelectedCols, currentProcessingColIdx], currentProcessingColIdx + 1);
        // Exclude current column index
        processColSelections(currentSelectedCols, currentProcessingColIdx + 1);
      };
      processColSelections();
      return;
    }

    // Include current row index
    processRowSelections([...currentSelectedRows, currentProcessingRowIdx], currentProcessingRowIdx + 1);
    // Exclude current row index
    processRowSelections(currentSelectedRows, currentProcessingRowIdx + 1);
  };

  processRowSelections();
  return totalValidConfigurations;
};

const orchestrateProcessing = async (inputStream, outputStream) => {
  const lineReader = require('readline');
  const asyncIterator = lineReader.createInterface({input: inputStream})[Symbol.asyncIterator]();
  const obtainLine = async () => (await asyncIterator.next()).value;
  const obtainMany = async () => (await obtainLine()).split(' ');

  const [rowDim, colDim, requiredCount] = (await obtainMany()).map(Number);
  const rawData = new Uint8Array(rowDim * colDim);
  for (let r = 0; r < rowDim; r++) {
    const currentLine = await obtainLine();
    for (let c = 0; c < colDim; c++) {
      rawData[r * colDim + c] = currentLine[c] === '#';
    }
  }
  const finalResult = evaluateGridConfigurations(rawData, rowDim, colDim, requiredCount);
  outputStream.write(`${finalResult}\n`);
};

if (require.main === module) {
  orchestrateProcessing(process.stdin, process.stdout);
}