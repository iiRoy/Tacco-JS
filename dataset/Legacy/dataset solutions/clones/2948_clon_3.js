function parseInputLines(rawInput) {
  let lines = rawInput.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function parseNumericQueryData(queryLine) {
  return queryLine.split(' ').slice(1).map(Number);
}

function getMedianElementIndex(arrayLength) {
  if (arrayLength === 0) {
    return -1;
  }
  return Math.ceil(arrayLength / 2) - 1;
}

function findSortedInsertionPoint(arr, valueToInsert) {
  if (arr.length === 0 || arr[arr.length - 1] < valueToInsert) {
    return arr.length;
  }
  if (arr[0] >= valueToInsert) {
    return 0;
  }

  let lowIdx = 0;
  let highIdx = arr.length - 1;
  let insertionResultIndex = 0;

  while (lowIdx <= highIdx) {
    let midIdx = Math.floor((lowIdx + highIdx) / 2);
    if (arr[midIdx] < valueToInsert) {
      insertionResultIndex = midIdx + 1;
      lowIdx = midIdx + 1;
    } else {
      insertionResultIndex = midIdx;
      highIdx = midIdx - 1;
    }
  }
  return insertionResultIndex;
}

function processQueries(rawInputLines) {
  const processedLines = parseInputLines(rawInputLines);

  let totalCost = 0;
  let sortedValues = [];

  for (let lineIndex = 1; lineIndex < processedLines.length; lineIndex++) {
    const currentLine = processedLines[lineIndex];

    if (currentLine === '2') {
      const medianIdx = getMedianElementIndex(sortedValues.length);
      console.log(sortedValues[medianIdx], totalCost);
    } else {
      const currentQueryDetails = parseNumericQueryData(currentLine);
      const valueToInsert = currentQueryDetails[0];
      const costToAdd = currentQueryDetails[1];

      if (sortedValues.length === 0) {
        sortedValues.push(valueToInsert);
        totalCost += costToAdd;
        continue;
      }

      const insertionPoint = findSortedInsertionPoint(sortedValues, valueToInsert);
      const currentArrayLength = sortedValues.length;

      if (currentArrayLength % 2 === 0) {
        const rightOfMiddleIdx = currentArrayLength / 2;
        const leftOfMiddleIdx = rightOfMiddleIdx - 1;

        if (insertionPoint > rightOfMiddleIdx) {
          totalCost += valueToInsert - sortedValues[rightOfMiddleIdx];
        } else if (insertionPoint <= leftOfMiddleIdx) {
          totalCost += sortedValues[leftOfMiddleIdx] - valueToInsert;
        }
      } else {
        const medianIdxBeforeInsertion = (currentArrayLength - 1) / 2;
        totalCost += Math.abs(valueToInsert - sortedValues[medianIdxBeforeInsertion]);
      }

      sortedValues.splice(insertionPoint, 0, valueToInsert);
      totalCost += costToAdd;
    }
  }
}

processQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
