const fileSystemModule = require('fs');
const dataSize = fileSystemModule.fstatSync( process.stdin.fd ).size;
const dataBuffer = Buffer.alloc( dataSize );
const octetsReceived = fileSystemModule.readSync(
  process.stdin.fd,
  dataBuffer,
  0,
  dataSize,
  0
);
const textLines = dataBuffer.toString('utf8', 0, octetsReceived).split('\n');

const detectLoop = (adjacencyList, vertexIndex, currentPath) => {
  for ( let neighborIndex = 0; neighborIndex < adjacencyList[vertexIndex].length; neighborIndex++ ) {
    if ( currentPath.includes(adjacencyList[vertexIndex][neighborIndex]) ) {
      return true;
    }
    if ( detectLoop(adjacencyList, adjacencyList[vertexIndex][neighborIndex], currentPath.concat(adjacencyList[vertexIndex][neighborIndex])) ) {
      return true;
    }
  }
  return false;
};

(function () {
  let nodeCount;
  let wordList;
  let adjacencies;
  let currentWord;
  let finalCharacter;
  let unusedVariable;
  let outerIndex, innerIndex;

  while (textLines[0] !== '0') {
    nodeCount = parseInt(textLines.shift(), 10);
    wordList = [];
    adjacencies = [];

    for (outerIndex = 0; outerIndex < nodeCount; outerIndex++) {
      wordList.push(textLines.shift());
    }

    for (outerIndex = 0; outerIndex < nodeCount; outerIndex++) {
      currentWord = wordList[outerIndex];
      finalCharacter = currentWord[currentWord.length - 1];
      adjacencies[outerIndex] = [];

      for (innerIndex = 0; innerIndex < nodeCount; innerIndex++) {
        if (outerIndex === innerIndex) {
          continue;
        }
        if (finalCharacter === wordList[innerIndex][0]) {
          adjacencies[outerIndex].push(innerIndex);
        }
      }
    }

    for (outerIndex = 0; outerIndex < nodeCount; outerIndex++) {
      if (detectLoop(adjacencies, outerIndex, [outerIndex])) {
        break;
      }
    }

    console.log(outerIndex !== nodeCount ? 'OK' : 'NG');
  }
})();