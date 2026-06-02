function parseInteger(strValue) {
  return parseInt(strValue, 10);
}

function assembleModifiedString(originalStr, preSegmentEndIndex, middleContent, postSegmentStartIndex) {
  const prefixPart = originalStr.slice(0, preSegmentEndIndex);
  const suffixPart = originalStr.slice(postSegmentStartIndex);
  return prefixPart + middleContent + suffixPart;
}

var rawInputBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(dataChunk) {
  rawInputBuffer += dataChunk;
});

process.stdin.on('end', function() {
  const inputLines = rawInputBuffer.split("\n");

  let currentStringState = inputLines[0];
  const numQueries = parseInteger(inputLines[1]);

  const totalCommandLinesToProcess = numQueries + 1;

  for (let queryIterationIndex = 0; queryIterationIndex < totalCommandLinesToProcess; queryIterationIndex++) {
    const currentLineIndex = queryIterationIndex + 2;

    const commandLine = inputLines[currentLineIndex];
    const commandTokens = commandLine.split(" ");
    const commandType = commandTokens[0];

    const startIdx = parseInteger(commandTokens[1]);
    const endIdx = parseInteger(commandTokens[2]);

    switch (commandType) {
      case "print":
        console.log(currentStringState.slice(startIdx, endIdx + 1));
        break;
      case "reverse":
        const segmentToReverse = currentStringState.slice(startIdx, endIdx + 1);
        const reversedSegment = segmentToReverse.split("").reverse().join("");
        currentStringState = assembleModifiedString(currentStringState, startIdx, reversedSegment, endIdx + 1);
        break;
      case "replace":
        const replacementValue = commandTokens[3];
        currentStringState = assembleModifiedString(currentStringState, startIdx, replacementValue, endIdx + 1);
        break;
    }
  }
});
