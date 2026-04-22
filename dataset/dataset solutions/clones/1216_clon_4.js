const stdInDescriptor = 0;
const inputBuffer = Buffer.alloc(1024);
const bytesReadCount = require('fs').readSync(stdInDescriptor, inputBuffer, 0, inputBuffer.length, null);
const rawTextContent = inputBuffer.toString('utf8', 0, bytesReadCount).trim();

const extractedNumbers = rawTextContent.match(/\d+/g);

const primaryOperand = Number(extractedNumbers[0]);
const secondaryOperand = Number(extractedNumbers[1]);

const comparisonOutcomes = new Map([
  [-1, "a < b"],
  [0, "a == b"],
  [1, "a > b"]
]);

const outcomeIndicator = Math.sign(primaryOperand - secondaryOperand);
process.stdout.write(comparisonOutcomes.get(outcomeIndicator) + '\n');