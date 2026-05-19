const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let collectedLines = [];
inputReader.on('line', (currentLine) => {
  collectedLines.push(currentLine);
});

inputReader.on('close', () => {
  console.error("\n");
  const startTime = Date.now();
  processInputAndCompute();
  const duration = Date.now() - startTime;
  logDebugInfo("time : " + duration + "ms");
  logDebugInfo("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function logOutput(content) { console.log(content); }
function logDebugInfo(content) { console.error("debug:" + require("util").inspect(content, false, null)); }

let linePointer = 0;
function retrieveNextLine() {
  if (linePointer < collectedLines.length) {
    return collectedLines[linePointer++];
  }
  throw new Error("No more input lines available.");
}

function parseLineAsNumbers() {
  return retrieveNextLine().split(' ').map(Number);
}

function processInputAndCompute() {
  const dimensions = parseLineAsNumbers();
  const primaryDimension = dimensions[0];
  const secondaryDimension = dimensions[1];

  const calculateMinimumAreaDifference = (lengthToSplit, fixedDimension) => {
    if (lengthToSplit < 3) { // Cannot split into 3 pieces if length is less than 3
      return 100000000000; // Return a very large value if invalid split
    }
    
    return Array.from({ length: lengthToSplit - 2 })
      .map((_, iterationIndex) => iterationIndex + 1)
      .reduce((currentMinOverallDiff, currentSplitPoint) => {
        const remainingLength = lengthToSplit - currentSplitPoint;

        // Strategy 1: Split 'lengthToSplit' into three heights, 'fixedDimension' is full width
        const h1 = currentSplitPoint;
        const h2 = Math.floor(remainingLength / 2);
        const h3 = Math.ceil(remainingLength / 2);
        const areasA = [h1 * fixedDimension, h2 * fixedDimension, h3 * fixedDimension];
        const diffA = Math.max(...areasA) - Math.min(...areasA);

        // Strategy 2: Split 'lengthToSplit' into 'currentSplitPoint' and 'remainingLength',
        // then split 'fixedDimension' for the 'remainingLength' part.
        const areaB1 = currentSplitPoint * fixedDimension;
        const w1 = Math.floor(fixedDimension / 2);
        const w2 = Math.ceil(fixedDimension / 2);
        const areaB2 = remainingLength * w1;
        const areaB3 = remainingLength * w2;
        const areasB = [areaB1, areaB2, areaB3];
        const diffB = Math.max(...areasB) - Math.min(...areasB);

        return Math.min(currentMinOverallDiff, diffA, diffB);
      }, 100000000000);
  };

  const resultForHW = calculateMinimumAreaDifference(primaryDimension, secondaryDimension);
  const resultForWH = calculateMinimumAreaDifference(secondaryDimension, primaryDimension);

  logOutput(Math.min(resultForHW, resultForWH));
}
