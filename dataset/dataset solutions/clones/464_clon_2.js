var fileSys = require('fs');

var dataSize = fileSys.fstatSync(process.stdin.fd).size;

var dataBuffer = new Buffer(dataSize);

var readBytesCount = fileSys.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

var inputLines = dataBuffer.toString('utf-8', 0, readBytesCount).split('\n');

function processNumber(numVal) {

}

function executeProcessing() {
  while (inputLines[0] !== String(0)) {
    console.log(
      (inputLines.shift() - 0)
      .toString(8)
      .split('')
      .map(function (charDigit) {
        if (charDigit === String(4)) {
          return +charDigit + 1;
        }
        if (charDigit - 0 >= 5) {
          return +charDigit + 2;
        }
        return +charDigit;
      })
      .join('')
    );
  }
}

executeProcessing();
