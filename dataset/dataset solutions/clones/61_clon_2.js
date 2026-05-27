var fileSystem = require('fs');

var fileSize = fileSystem.fstatSync(process.stdin.fd).size;

var dataBuffer = new Buffer(fileSize);

var actualBytesRead = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

processInputData();

function processInputData() {
  for (var currentCase = 1, totalCases = inputLines[0]; currentCase <= totalCases; currentCase++) {
    var lineIndex = currentCase * 2;
    var firstNumStr = inputLines[lineIndex - 1].split("").reverse().join("");
    var secondNumStr = inputLines[lineIndex].split("").reverse().join("");

    var firstLength = firstNumStr.length;
    var secondLength = secondNumStr.length;
    var maxLength = (firstLength > secondLength) ? firstLength : secondLength;

    var sumDigits = new Int8Array(maxLength + 1);

    for (var digitPos = 1; digitPos < maxLength; digitPos++) {
      var digitOne = (firstLength <= digitPos) ? 0 : (firstNumStr[digitPos] - '0');
      var digitTwo = (secondLength <= digitPos) ? 0 : (secondNumStr[digitPos] - '0');
      var currentSum = digitOne + digitTwo + sumDigits[digitPos];

      if (currentSum >= 10) {
        sumDigits[digitPos + 1]++;
        sumDigits[digitPos] = (currentSum - 10);
      } else {
        sumDigits[digitPos] = currentSum;
      }
    }

    var finalSumString = '';
    for (var digitPos = sumDigits.length; digitPos--;) {
      if ((sumDigits[digitPos] || finalSumString) && digitPos) {
        finalSumString += '' + sumDigits[digitPos];
      }
    }

    if (finalSumString.length >= 80) {
      console.log("overflow");
    } else {
      console.log(finalSumString);
    }
  }
}
