function findComparisonCount(dataArray, targetValue) {
  function searchRecursive(low, high, currentCount) {
    currentCount++;
    if (low === high) {
      return currentCount;
    }
    const midPoint = Math.floor((low + high) / 2);
    if (dataArray[midPoint] === targetValue) {
      return currentCount;
    }
    if (targetValue < dataArray[midPoint]) {
      return searchRecursive(low, midPoint, currentCount);
    } else {
      return searchRecursive(midPoint + 1, high, currentCount);
    }
  }
  return searchRecursive(0, dataArray.length, 0);
}

function* inputBlockIterator(lines) {
  let lineIndex = 0;
  while (true) {
    const currentN = Number(lines[lineIndex++]);
    if (currentN === 0) {
      break;
    }
    const currentArray = [];
    for (let k = 0; k < currentN; k++) {
      currentArray.push(Number(lines[lineIndex++]));
    }
    const currentSearchKey = Number(lines[lineIndex++]);
    yield {
      arr: currentArray,
      key: currentSearchKey
    };
  }
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

for (const block of inputBlockIterator(inputLines)) {
  console.log(findComparisonCount(block.arr, block.key));
}
