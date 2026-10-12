class InputReader {
  constructor(inputString) {
    this._sourceLines = inputString.split("\n");
    this._currentLineIndex = 0;
  }

  readAtom(asString) {
    const lines = this._sourceLines;
    const lineIdx = this._currentLineIndex;

    if (typeof lines[lineIdx] === "string") {
      lines[lineIdx] = lines[lineIdx].split(" ").reverse();
    }

    const resultValue = lines[lineIdx].pop();

    if (!lines[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? resultValue : +resultValue;
  }

  readLine(asString) {
    const currentLineContent = this._sourceLines[this._currentLineIndex++];
    const parts = currentLineContent.split(" ");
    return asString ? parts : parts.map(val => +val);
  }

  readMatrix(numRows, asString) {
    const lines = this._sourceLines;
    const startLineIdx = this._currentLineIndex;
    const resultMatrix = [];

    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      const lineContent = lines[startLineIdx + rowIdx];
      const rowParts = lineContent.split(" ");
      resultMatrix[rowIdx] = asString ? rowParts : rowParts.map(val => +val);
    }

    this._currentLineIndex += numRows;
    return resultMatrix;
  }
}

const inputHandler = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
  const count = inputHandler.readAtom();
  let dataArray = inputHandler.readLine();
  let processedArray = [];

  if (count <= 2) {
    return Math.max(...dataArray);
  }

  for (let idx = 0; idx < count - 1; idx++) {
    processedArray[idx] = Math.max(dataArray[idx], dataArray[idx + 1]);
  }

  const remainder = count % 4;

  if (remainder === 1 || remainder === 2) {
    const combinedArray = dataArray.concat(processedArray);
    return getMiddleElement(combinedArray);
  }

  if (remainder === 3) {
    processedArray.sort((valA, valB) => valA - valB);
    const medianOfData = getMiddleElement(dataArray);
    
    const medianIdxB1 = (count - 1) >> 1;
    const medianIdxB2 = (count - 2) >> 1;
    const finalMedianCandidates = [
      medianOfData,
      medianOfData,
      processedArray[medianIdxB1],
      processedArray[medianIdxB2]
    ];
    return getMiddleElement(finalMedianCandidates);
  }

  dataArray.sort((valA, valB) => valA - valB);
  const medianOfProcessed = getMiddleElement(processedArray);
  
  const medianIdxA1 = count >> 1;
  const medianIdxA2 = (count - 1) >> 1;
  const finalMedianCandidates = [
    medianOfProcessed,
    medianOfProcessed,
    dataArray[medianIdxA1],
    dataArray[medianIdxA2]
  ];
  return getMiddleElement(finalMedianCandidates);

  function getMiddleElement(arr) {
    arr.sort((valA, valB) => valA - valB);
    return arr[arr.length >> 1];
  }
}
