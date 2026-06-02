function parseInteger(sVal) {
  return parseInt(sVal, 10);
}

function parseFloatValue(sVal) {
  return parseFloat(sVal);
}

Array.prototype.sortNumbersAscending = function () {
  const numericSortComparator = (valA, valB) => (valA - valB);
  return this.sort(numericSortComparator);
};

Array.prototype.sortNumbersDescending = function () {
  const numericSortComparator = (valA, valB) => (valB - valA);
  return this.sort(numericSortComparator);
};

Array.prototype.sortStringsAscending = function () {
  return this.sort();
};

Array.prototype.sortStringsDescending = function () {
  const sortedArray = this.sort();
  return sortedArray.reverse();
};

Array.prototype.filterOutElement = function (itemToExclude) {
  const filterPredicate = (currentElement) => currentElement !== itemToExclude;
  return this.filter(filterPredicate);
};

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', dataSegment => {
  rawDataBuffer += dataSegment;
});

function parseAndTrimInputLines(bufferContent) {
  let linesArray = bufferContent.split('\n');
  const trimmedLines = linesArray.map(lineItem => lineItem.trim());

  const lastLineIdx = trimmedLines.length - 1;
  if (lastLineIdx >= 0 && trimmedLines[lastLineIdx] === '') {
    return trimmedLines.slice(0, lastLineIdx);
  }
  return trimmedLines;
}

process.stdin.on('end', () => {
  const finalProcessedLines = parseAndTrimInputLines(rawDataBuffer);
  executeLogic(finalProcessedLines);
});

function executeLogic(inputLines) {
  const getLastCharacter = (targetString) => {
    if (targetString.length === 0) {
      return undefined;
    }
    return targetString[targetString.length - 1];
  };

  const getFirstCharacter = (targetString) => {
    if (targetString.length === 0) {
      return undefined;
    }
    return targetString[0];
  };

  const firstInputLineContent = inputLines[0];
  const stringTokens = firstInputLineContent.split(' ');
  const trimmedTokens = stringTokens.map(token => token.trim());

  const [firstString, secondString, thirdString] = trimmedTokens;

  const firstPairMatch = getLastCharacter(firstString) === getFirstCharacter(secondString);
  const secondPairMatch = getLastCharacter(secondString) === getFirstCharacter(thirdString);

  const overallConditionMet = firstPairMatch && secondPairMatch;

  if (overallConditionMet) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}
