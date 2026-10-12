const calculateMaxDifference = (dataArray) => {
  let idx = 1;
  let currentMaxDiff = -Infinity;
  let currentMinVal = Infinity;

  const loopUpperBound = parseInt(dataArray[0], 10);

  for (idx = 1; idx < loopUpperBound; idx++) {
    const currentElement = parseInt(dataArray[idx], 10);

    currentMaxDiff = Math.max(currentMaxDiff, currentElement - currentMinVal);
    console.log(`maxv: ${currentMaxDiff}`);
    console.log(`min: ${currentMinVal}`);
    console.log(`arr[j]: ${currentElement}`);
    currentMinVal = Math.min(currentMinVal, currentElement);
    console.log(``);
  }
  console.log(currentMaxDiff);
};

const isNonEmptyString = (lineContent) => {
  return lineContent !== "";
};

process.stdin.resume();
process.stdin.setEncoding("utf8");
let rawDataBuffer = "";

process.stdin.on("data", (inputChunk) => {
  rawDataBuffer += inputChunk;
});

process.stdin.on("end", () => {
  const allLines = rawDataBuffer.split("\n");
  const processedLines = allLines.filter(isNonEmptyString);
  calculateMaxDifference(processedLines);
});
