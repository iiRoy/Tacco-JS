function processRawInput(rawString) {
  let lines = rawString.split("\n");
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function MainClone(rawData) {
  const processedLines = processRawInput(rawData);

  const totalElements = parseInt(processedLines[0].split(' ')[0], 10);
  const sortedNumbers = processedLines[1].split(' ').map(Number).sort((valA, valB) => valA - valB);

  const counts = [];
  if (sortedNumbers.length > 0) {
    let currentNumberCount = 1;
    let lastProcessedNumber = sortedNumbers[0];

    for (let k = 1; k < sortedNumbers.length; k++) {
      const currentNum = sortedNumbers[k];
      if (currentNum !== lastProcessedNumber) {
        counts.push(currentNumberCount);
        lastProcessedNumber = currentNum;
        currentNumberCount = 1;
      } else {
        currentNumberCount++;
      }
    }
    counts.push(currentNumberCount);
  }

  counts.sort((valA, valB) => valA - valB);

  for (let groupSize = 1; groupSize <= totalElements; groupSize++) {
    let currentSumOfCounts = 0;
    const maxPossibleStartIndex = counts.length - groupSize;

    for (let idx = 0; idx <= maxPossibleStartIndex; idx++) {
      currentSumOfCounts += counts[idx];
    }

    const maxGroupsFromTotal = Math.floor(totalElements / groupSize);
    const maxElementsFromCounts = currentSumOfCounts * groupSize;
    const finalCalculatedResult = Math.min(maxGroupsFromTotal, maxElementsFromCounts);
    
    console.log(finalCalculatedResult);
  }
}

MainClone(require("fs").readFileSync("/dev/stdin", "utf8"));
