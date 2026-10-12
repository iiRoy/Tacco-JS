let rawInputBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
  let inputLines = rawInputBuffer.split("\n");

  let currentString = inputLines[0];
  let queryCount = Number(inputLines[1]);

  const operationMap = {
    "print": (str, startIdx, endIdx) => {
      console.log(str.substring(startIdx, endIdx + 1));
      return str;
    },
    "reverse": (str, startIdx, endIdx) => {
      let charArray = Array.from(str);
      let segmentToReverse = charArray.slice(startIdx, endIdx + 1);
      let reversedSegment = segmentToReverse.reverse();
      charArray.splice(startIdx, segmentToReverse.length, ...reversedSegment);
      return charArray.join('');
    },
    "replace": (str, startIdx, endIdx, replacementValue) => {
      let charArray = Array.from(str);
      let segmentLength = endIdx - startIdx + 1;
      let replacementChars = Array.from(replacementValue);
      charArray.splice(startIdx, segmentLength, ...replacementChars);
      return charArray.join('');
    }
  };

  inputLines.slice(2, 2 + queryCount + 1).forEach(queryLine => {
    let parts = queryLine.split(" ");
    let commandName = parts[0];
    let firstParameter = Number(parts[1]);
    let secondParameter = Number(parts[2]);
    let thirdParameter = parts[3];

    let commandExecutor = operationMap[commandName];
    if (commandExecutor) {
      currentString = commandExecutor(currentString, firstParameter, secondParameter, thirdParameter);
    }
  });
});
