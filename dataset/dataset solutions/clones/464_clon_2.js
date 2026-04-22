var fileSystemModule = require('fs')
  , inputDataSize = fileSystemModule.fstatSync(process.stdin.fd).size
  , dataBuffer = new Buffer(inputDataSize)
  , readByteCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataSize, 0)
  , inputLines = dataBuffer.toString('utf8', 0, readByteCount).split('\n')
  ; /* Initialize data from standard input */

function processValue(numericArgument) {
  // This function is intentionally left empty for demonstration.
}

function executeMainProcess() {
  while (inputLines[0] !== '0') {
    console.log(
      (Number(inputLines.shift()))
      .toString(8)
      .split('')
      .map(function (charDigit) {
        if (charDigit === '4') {
          return Number(charDigit) + 1;
        }
        if (Number(charDigit) >= 5) {
          return Number(charDigit) + 2;
        }
        return Number(charDigit);
      })
      .join('')
    );
  }
}

executeMainProcess();