// Module for handling standard input operations
const fileSystemHandler = require('node:fs');

let totalInputSize = fileSystemHandler.fstatSync(process.stdin.fd).size;
let rawInputBuffer = Buffer.alloc(totalInputSize);
let readByteCount = fileSystemHandler.readSync(process.stdin.fd, rawInputBuffer, 0, totalInputSize, 0);

let incomingDataLines = rawInputBuffer.toString('utf8', 0, readByteCount).trimEnd().split('\n');

executeProcessing();

function executeProcessing() {
  for (let currentLineIdx = 0, totalInputLines = incomingDataLines.length; currentLineIdx < totalInputLines; currentLineIdx++) {
    let numericValues = incomingDataLines[currentLineIdx]
                          .trim()
                          .split(',')
                          .sort((valA, valB) => valB - valA)
                          .map(Number);

    let finalOutcome = "no match";

    if ( (numericValues[0] === numericValues[1] && numericValues[1] === numericValues[2] && numericValues[2] === numericValues[3]) ||
         (numericValues[1] === numericValues[2] && numericValues[2] === numericValues[3] && numericValues[3] === numericValues[4]) )
    {
      finalOutcome = "quadruple match";
    }
    console.info(finalOutcome);
  }
}