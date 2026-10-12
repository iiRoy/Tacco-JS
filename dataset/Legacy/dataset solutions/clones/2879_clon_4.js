process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = [];
let lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function transformAndCount(currentSegment, currentTally) {
    const occurrenceIndex = currentSegment.indexOf("ABC");
    if (occurrenceIndex === -1) {
        return currentTally;
    } else {
        const modifiedSegment = currentSegment.substring(0, occurrenceIndex) + "BCA" + currentSegment.substring(occurrenceIndex + 3);
        return transformAndCount(modifiedSegment, currentTally + 1);
    }
}

lineProcessor.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

lineProcessor.on('close', () => {
  const initialString = inputBuffer[0];
  const replacementTally = transformAndCount(initialString, 0);
  console.log(replacementTally);
});
