function processInput(data) {
  const inputLines = data.split('\n');
  const targetString = 'keyence';
  const targetLength = targetString.length;

  const currentLine = inputLines[0];
  const currentLineLength = currentLine.length;

  let prefixMatchCount = 0;
  while (
    prefixMatchCount < targetLength &&
    prefixMatchCount < currentLineLength &&
    currentLine[prefixMatchCount] === targetString[prefixMatchCount]
  ) {
    prefixMatchCount++;
  }

  let suffixMatchCount = 0;
  while (
    suffixMatchCount < targetLength &&
    suffixMatchCount < currentLineLength &&
    currentLine[currentLineLength - 1 - suffixMatchCount] ===
      targetString[targetLength - 1 - suffixMatchCount]
  ) {
    suffixMatchCount++;
  }

  if (prefixMatchCount === targetLength) {
    console.log('YES');
  } else if (
    prefixMatchCount + suffixMatchCount >= targetLength &&
    prefixMatchCount <= currentLineLength - suffixMatchCount
  ) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  accumulatedInput += chunk;
});
process.stdin.on('end', function() {
  processInput(accumulatedInput);
});
