process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedRawData = '';
process.stdin.on('data', function(inputChunk) {
    accumulatedRawData += inputChunk;
});

process.stdin.on('end', function() {
    const linesFromInput = accumulatedRawData.split(/\r?\n/);
    processInputContent(linesFromInput);
});

function determineTwoCount(sourceText) {
    const targetDigit = '2';
    const searchRegex = new RegExp(targetDigit, 'g');
    const foundOccurrences = sourceText.match(searchRegex);

    // If no matches are found, .match() returns null.
    // We want to treat this as 0 occurrences for the count.
    return foundOccurrences ? foundOccurrences.length : 0;
}

function processInputContent(inputLinesArray){
  // The original code `input = input + ""` on an array converts it to a string
  // by joining elements with commas. We explicitly replicate this behavior.
  const combinedInputString = String(inputLinesArray);

  // Utilize the helper function to perform the core counting logic
  const finalCount = determineTwoCount(combinedInputString);

  console.log(finalCount);
}
