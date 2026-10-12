const processGrid = (gridData, heightDim, widthDim, targetCount, debugMode = 0) => {
  const getFlatIndex = (r, c) => r * widthDim + c;
  let finalCount = 0;

  const maxRowMaskValue = 1 << heightDim;
  const maxColMaskValue = 1 << widthDim;

  const checkCellCondition = (r, c, currentGridData, currentRowMask, currentColMask) => {
    const cellIsBlack = currentGridData[getFlatIndex(r, c)];
    const rowBitSet = (1 << r) & currentRowMask;
    const colBitSet = (1 << c) & currentColMask;
    return cellIsBlack && (rowBitSet !== 0) && (colBitSet !== 0);
  };

  for (let rowMask = 0; rowMask < maxRowMaskValue; rowMask++) {
    for (let colMask = 0; colMask < maxColMaskValue; colMask++) {
      let currentBlackCount = 0;
      for (let rowIndex = 0; rowIndex < heightDim; rowIndex++) {
        for (let colIndex = 0; colIndex < widthDim; colIndex++) {
          if (checkCellCondition(rowIndex, colIndex, gridData, rowMask, colMask)) {
            currentBlackCount++;
          }
        }
      }

      if (currentBlackCount === targetCount) {
        finalCount++;
      }
    }
  }
  return finalCount;
};

const runProgram = async (inputStream, outputStream) => {
  const rlModule = require('readline');
  const lineIterator = rlModule.createInterface({ input: inputStream })[Symbol.asyncIterator]();

  const fetchNextLine = async () => (await lineIterator.next()).value;

  const parseDimensionsAndTarget = async () => {
    const rawInputParts = (await fetchNextLine()).split(' ');
    const parsedNumbers = rawInputParts.map(str => Number(str));
    const [hVal, wVal, kVal] = parsedNumbers;
    return { hVal, wVal, kVal };
  };

  const { hVal: heightDim, wVal: widthDim, kVal: targetCount } = await parseDimensionsAndTarget();

  const gridData = new Uint8Array(heightDim * widthDim);
  const getFlatIndex = (r, c) => r * widthDim + c;

  const populateGridData = async (targetGrid, h, w, indexMapper) => {
    for (let r = 0; r < h; r++) {
      const inputLine = await fetchNextLine();
      for (let c = 0; c < w; c++) {
        targetGrid[indexMapper(r, c)] = inputLine[c] === '#';
      }
    }
  };

  await populateGridData(gridData, heightDim, widthDim, getFlatIndex);

  const finalResult = processGrid(gridData, heightDim, widthDim, targetCount);
  outputStream.write(`${finalResult}\n`);
};

if (require.main === module) {
  runProgram(process.stdin, process.stdout);
}
