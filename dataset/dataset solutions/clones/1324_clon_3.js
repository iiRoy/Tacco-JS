var rawInputBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
  const END_OF_TEXT_MARKER = "END_OF_TEXT";
  let inputLines = rawInputBuffer.split("\n");
  let searchTarget = inputLines[0].toLowerCase();
  let matchCounter = 0;

  const compareWordsCaseInsensitive = (firstWord, secondWord) => {
    return firstWord === secondWord;
  };

  let lineIterator = 1;
  while (true) {
    let currentLineContent = inputLines[lineIterator];
    let currentLineTokens = currentLineContent.split(" ");

    if (currentLineTokens[0] === END_OF_TEXT_MARKER) {
      break;
    }

    for (let tokenIterator = 0; tokenIterator < currentLineTokens.length; tokenIterator++) {
      let processedToken = currentLineTokens[tokenIterator].toLowerCase();
      if (compareWordsCaseInsensitive(searchTarget, processedToken)) {
        matchCounter++;
      }
    }
    lineIterator++;
  }
  console.log(matchCounter);
});
