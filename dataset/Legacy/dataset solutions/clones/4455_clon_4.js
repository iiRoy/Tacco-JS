const fs = require('fs');

const inputBufferCapacity = 256;
const dataBuffer = Buffer.alloc(inputBufferCapacity);
let collectedInput = '';
let bytesProcessed;

try {
  while ((bytesProcessed = fs.readSync(process.stdin.fd, dataBuffer, 0, inputBufferCapacity, null)) !== 0) {
    collectedInput += dataBuffer.toString('utf8', 0, bytesProcessed);
    if (collectedInput.includes('\n')) {
      collectedInput = collectedInput.substring(0, collectedInput.indexOf('\n'));
      break;
    }
  }
} catch (readError) {
  // If stdin is not available or other read errors occur, collectedInput might remain empty
  // or the program might terminate depending on the error.
  // This matches the potential behavior of a synchronous readline() if it fails.
}

const outputPrefix = "ABC";
const finalMessage = `${outputPrefix}${collectedInput}`;

console.log(finalMessage);
