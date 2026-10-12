const calculateCombinations = (gridValues, gridHeight, gridWidth, targetCount) => {
  const checkCellContribution = (r, c, currentGridValues, currentGridWidth, selectedRowMask, selectedColMask) => {
    const cellValue = currentGridValues[r * currentGridWidth + c];
    const isRowSelected = (1 << r) & selectedRowMask;
    const isColSelected = (1 << c) & selectedColMask;
    return cellValue && isRowSelected && isColSelected ? 1 : 0;
  };

  const allRowMasks = Array.from({ length: 1 << gridHeight }, (_, rIdx) => rIdx);
  const allColMasks = Array.from({ length: 1 << gridWidth }, (_, cIdx) => cIdx);

  const validCombinations = allRowMasks.reduce((totalValid, rowMask) => {
    return totalValid + allColMasks.reduce((rowValid, colMask) => {
      const currentMatchCount = Array.from({ length: gridHeight }).reduce((accRow, _, r) => {
        return accRow + Array.from({ length: gridWidth }).reduce((accCol, _, c) => {
          return accCol + checkCellContribution(r, c, gridValues, gridWidth, rowMask, colMask);
        }, 0);
      }, 0);

      return rowValid + (currentMatchCount === targetCount ? 1 : 0);
    }, 0);
  }, 0);

  return validCombinations;
};

const processInputOutput = async (inputStream, outputStream) => {
  const readline = require('readline');
  const inputIterator = readline.createInterface({ input: inputStream })[Symbol.asyncIterator]();
  const fetchLine = async () => (await inputIterator.next()).value;
  const fetchMany = async () => (await fetchLine()).split(' ');

  const [hVal, wVal, kVal] = (await fetchMany()).map(Number);

  const gridRowsData = await Promise.all(
    Array.from({ length: hVal }, async (_, rIndex) => {
      const currentInputLine = await fetchLine();
      return Array.from(currentInputLine, (char) => char === '#');
    })
  );

  const gridData = new Uint8Array(hVal * wVal);
  gridRowsData.forEach((rowContent, rIndex) => {
    rowContent.forEach((cellBoolean, cIndex) => {
      gridData[rIndex * wVal + cIndex] = cellBoolean;
    });
  });

  const finalResult = calculateCombinations(gridData, hVal, wVal, kVal);
  outputStream.write(`${finalResult}\n`);
};

if (require.main === module) {
  processInputOutput(process.stdin, process.stdout);
}
