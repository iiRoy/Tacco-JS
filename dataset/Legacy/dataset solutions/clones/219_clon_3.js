var fileSystemModule = require('fs');

var inputDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;

var dataBuffer = Buffer.alloc(inputDataLength);

var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0);

var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

processInputData();

function calculateDecimalDigitSum(lineContent) {
  var currentLineParts = lineContent.split(' ');

  var dividend = parseFloat(currentLineParts[0]);
  var divisor = parseFloat(currentLineParts[1]);

  var divisionResult = dividend / divisor;
  var divisionResultStr = String(divisionResult);

  var decimalPartString = divisionResultStr.split('.')[1];
  var decimalDigitsArr = (decimalPartString || '').split('');

  var numDigitsToSum = parseInt(currentLineParts[2], 10);

  var sumOfDigits = 0;
  for (var digitIndex = 0; digitIndex < numDigitsToSum; digitIndex++) {
    var currentDigitChar = decimalDigitsArr[digitIndex];
    var currentDigitVal = parseInt(currentDigitChar, 10);
    sumOfDigits += currentDigitVal || 0;
  }
  
  return sumOfDigits;
}

function processInputData() {
  var totalLines = inputLines.length;
  for (var lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    var currentLine = inputLines[lineIndex];
    var lineResult = calculateDecimalDigitSum(currentLine);
    console.log(lineResult);
  }
}
