function parseInteger(s) { return parseInt(s); }
function parseFloatNumber(s) { return parseFloat(s); }

Array.prototype.sortNumbersAscending = function () { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumbersDescending = function () { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStringsAscending = function () { return this.sort();                  }
Array.prototype.sortStringsDescending = function () { return this.sort().reverse();        }
Array.prototype.filterOut = function (itemToRemove) { return this.filter((element) => element !== itemToRemove); }

let rawDataBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => rawDataBuffer += chunk);
process.stdin.on('end', () => {
  const rawLines = rawDataBuffer.split('\n');
  const trimmedLines = rawLines.map(lineContent => lineContent.trim());

  let finalProcessedLines = trimmedLines;
  const lastLineIdx = trimmedLines.length - 1;
  if (lastLineIdx >= 0 && trimmedLines[lastLineIdx] === '') {
    finalProcessedLines = trimmedLines.slice(0, lastLineIdx);
  }
  
  processMainLogic(finalProcessedLines);
});

function processMainLogic(inputLines) {
  const firstLineParts = inputLines[0].split(' ');
  const initialParameters = firstLineParts.map(parseInteger);
  
  const itemCount = initialParameters[0];
  const maxWeightCapacity = initialParameters[1];
  
  let maxValueFound = 0;

  const itemDataLines = inputLines.slice(1);
  const parsedItemData = itemDataLines.map(lineContent => lineContent.split(' ').map(parseInteger));

  function exploreCombinations(currentItemIndex, currentAccumulatedWeight, currentAccumulatedValue, depthCounter) {
    if (depthCounter === itemCount) {
      console.log(maxValueFound);
      process.exit(0);
    }

    const iterationLimit = itemCount;
    for (let i = currentItemIndex; i < iterationLimit; i++) {
      const currentItemDetails = parsedItemData[i];
      const itemWeight = currentItemDetails[0];
      const itemValue = currentItemDetails[1];

      const potentialNewTotalWeight = itemWeight + currentAccumulatedWeight;

      if (potentialNewTotalWeight <= maxWeightCapacity) {
        const potentialNewTotalValue = itemValue + currentAccumulatedValue;
        maxValueFound = Math.max(maxValueFound, potentialNewTotalValue);
        
        const nextItemIdx = i + 1;
        const nextAccumulatedWeight = potentialNewTotalWeight;
        const nextAccumulatedValue = potentialNewTotalValue;
        const nextDepthCount = depthCounter + 1;

        exploreCombinations(nextItemIdx, nextAccumulatedWeight, nextAccumulatedValue, nextDepthCount);
      }
    }
  }

  exploreCombinations(0, 0, 0, 0);

  console.log(maxValueFound);
}
