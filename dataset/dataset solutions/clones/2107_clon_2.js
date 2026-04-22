function ProcessInputAndQueries(incomingData) {
  incomingData = incomingData.trim()
                             .split("\n")
                             .map(function(lineSegment) {
                               return lineSegment.split(" ");
                             });

  let initialString = incomingData[0][0];
  const totalQueries = Number.parseInt(incomingData[1], 10);

  const queryList = [];
  for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
    queryList.push(incomingData[queryIdx + 2]);
  }

  let characterBuffer = Array.from({
    length: (initialString.length + totalQueries * 2)
  }, () => '');

  let headPointer = totalQueries;
  let tailPointer = totalQueries + initialString.length - 1;
  let temporaryIndex;

  for (let strIdx = 0; strIdx < initialString.length; strIdx++) {
    characterBuffer[strIdx + totalQueries] = initialString.substring(strIdx, 1);
  }

  for (let queryExecutionIdx = 0; queryExecutionIdx < totalQueries; queryExecutionIdx++) {
    if (queryList[queryExecutionIdx][0] === '1') {
      characterBuffer = characterBuffer.reverse();
      temporaryIndex = headPointer;
      headPointer = totalQueries - (tailPointer - (totalQueries + initialString.length - 1));
      tailPointer = totalQueries + initialString.length - 1 + (totalQueries - temporaryIndex);
      continue;
    }
    if (queryList[queryExecutionIdx][1] === '1') {
      headPointer--;
      characterBuffer[headPointer] = queryList[queryExecutionIdx][2];
      continue;
    }
    tailPointer++;
    characterBuffer[tailPointer] = queryList[queryExecutionIdx][2];
  }
  process.stdout.write(characterBuffer.join('') + '\n');
}

ProcessInputAndQueries(require("node:fs").readFileSync("/dev/stdin", "utf8"));