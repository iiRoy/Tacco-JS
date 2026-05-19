function processInput() {
  let
    idx,
    counter,
    numEntries,
    numStrings,
    translationMap,
    entryLine,
    outputParts;

  for (idx = 0; (numEntries = parseInt(input[idx++], 10)); ) {
    translationMap = {};
    for (counter = 0; counter < numEntries; counter++) {
      entryLine = input[idx++].split(' ');
      translationMap[entryLine[0]] = entryLine[1];
    }
    numStrings = parseInt(input[idx++], 10);
    outputParts = [];
    for (counter = 0; counter < numStrings; counter++, idx++) {
      outputParts.push(translationMap[input[idx]] || input[idx]);
    }
    console.log(outputParts.join(''));
  }
}

let
  input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  input += dataChunk;
});
process.stdin.on('end', function() {
  input = input.split(/\r\n|\r|\n/g);
  processInput();
});
