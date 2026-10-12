const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandler;
const inputLines = [];

inputReader.on('line', (line) => {
  inputLines.push(line);
});

inputReader.on('close', () => {
  inputHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function parseInputToken(token, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(token, 10);
      case 2: return token.split(' ');
      case 4: return token.split(' ').map(Number);
      case 6: return token.split('');
      case 7: return token.split('').map(Number);
      case 8: return token.join(' ');
      case 9: return token.join('\n');
      case 0: return token.join('');
      default: return token;
    }
  } catch (e) {
    return token;
  }
}

function readInt() { return parseInputToken(getNextToken(), 1); }
function readStrArray() { return parseInputToken(getNextToken(), 2); }
function readIntArray() { return parseInputToken(getNextToken(), 4); }
function readCharArray() { return parseInputToken(getNextToken(), 6); }

function getNextToken() { return inputHandler.next(); }
function hasMoreTokens() { return inputHandler.hasNext(); }

function initializeInputHandler(linesArray) {
  let currentIdx = 0;
  const maxIdx = linesArray.length;

  const handler = {
    hasNext: function() {
      return currentIdx < maxIdx;
    },
    next: function() {
      if (this.hasNext()) {
        return linesArray[currentIdx++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
  return handler;
}

function printOutput(data) { console.log(data); }
function printDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function executeMainLogic() {
  const firstLineData = readIntArray();
  const numElements = firstLineData[0];
  const numQueries = firstLineData[1];

  const unionFindStructure = createUnionFind(numElements);

  const processSingleQuery = (queryType, elementU, elementV) => {
    if (queryType === 0) {
      unionFindStructure.uniteSets(elementU, elementV);
    } else {
      const result = unionFindStructure.areConnected(elementU, elementV) ? 1 : 0;
      printOutput(result);
    }
  };

  for (let i = 0; i < numQueries; i++) {
    const queryData = readIntArray();
    const queryType = queryData[0];
    const elementU = queryData[1];
    const elementV = queryData[2];
    processSingleQuery(queryType, elementU, elementV);
  }
}

function createUnionFind(size) {
  const parentOrSize = Array.from({ length: size }, () => -1);

  const findRootInternal = (index) => {
    if (parentOrSize[index] < 0) {
      return index;
    }
    parentOrSize[index] = findRootInternal(parentOrSize[index]);
    return parentOrSize[index];
  };

  const unionFindInstance = {
    areConnected: function(idxA, idxB) {
      return findRootInternal(idxA) === findRootInternal(idxB);
    },

    uniteSets: function(idxA, idxB) {
      let rootA = findRootInternal(idxA);
      let rootB = findRootInternal(idxB);

      if (rootA === rootB) {
        return;
      }

      // Original logic: attach based on root index value, not size.
      // If rootA's index is greater than or equal to rootB's index, attach rootB to rootA.
      // Otherwise, attach rootA to rootB.
      if (rootA >= rootB) {
        parentOrSize[rootA] += parentOrSize[rootB];
        parentOrSize[rootB] = rootA;
      } else {
        parentOrSize[rootB] += parentOrSize[rootA];
        parentOrSize[rootA] = rootB;
      }
    },

    getSetSize: function(index) {
      const rootIndex = findRootInternal(index);
      return -parentOrSize[rootIndex];
    }
  };

  return unionFindInstance;
}
