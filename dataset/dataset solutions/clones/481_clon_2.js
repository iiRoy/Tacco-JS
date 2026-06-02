var fileSys = require('fs');

var dataSize = fileSys.fstatSync(process.stdin.fd).size;

var dataBuffer = new Buffer(dataSize);

var readBytesCount = fileSys.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

var rawDataLines = dataBuffer.toString('utf-8', 0, readBytesCount).split('\n');

function findCycle(graphAdj, currNodeIdx, pathVisited) {
  if (pathVisited.length === graphAdj.length) {
    return ~graphAdj[pathVisited[pathVisited.length - 1]].indexOf(pathVisited[0]);
  }
  for (var neighborIdx = 0; neighborIdx < graphAdj[currNodeIdx].length; neighborIdx++) {
    var nextNode = graphAdj[currNodeIdx][neighborIdx];
    if (~pathVisited.indexOf(nextNode)) {
      continue;
    }
    if (findCycle(graphAdj, nextNode, pathVisited.concat(nextNode))) {
      return true;
    }
  }
  return false;
}

!function () {
  var nodeCount,
    wordList,
    graphAdj,
    currentWord,
    lastChar,
    outerLoopIdx,
    innerLoopIdx;
  while (rawDataLines[0] !== '0') {
    nodeCount = rawDataLines.shift() - 0;
    wordList = [];
    graphAdj = [];
    for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
      wordList.push(rawDataLines.shift());
    }
    for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
      currentWord = wordList[outerLoopIdx];
      lastChar = currentWord[currentWord.length - 1];
      graphAdj[outerLoopIdx] = [];
      for (innerLoopIdx = 0; innerLoopIdx < nodeCount; innerLoopIdx++) {
        if (outerLoopIdx === innerLoopIdx) {
          continue;
        }
        if (lastChar === wordList[innerLoopIdx][0]) {
          graphAdj[outerLoopIdx].push(innerLoopIdx);
        }
      }
    }
    console.log(findCycle(graphAdj, 0, [0]) ? 'OK' : 'NG');
  }
}();
