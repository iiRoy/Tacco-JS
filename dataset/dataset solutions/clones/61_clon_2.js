// Module for reading input data
var fileSystemHandler = require('fs')
  , contentSize = fileSystemHandler.fstatSync(process.stdin.fd).size
  , dataContainer = Buffer.allocUnsafe(contentSize)
  , actualBytesRead = fileSystemHandler.readSync(process.stdin.fd, dataContainer, 0, contentSize, 0)
  , rawInputLines = dataContainer.toString('utf8', 0, actualBytesRead).split('\n');

executeProcessing();
 
// Main processing routine begins here
function executeProcessing() {

  for (
    var testCaseCounter = 1,
        totalTestCases = rawInputLines[0];
    testCaseCounter <= totalTestCases;
    testCaseCounter++
  ) {
    var lineIndex = testCaseCounter << 1;
    var firstString = rawInputLines[lineIndex - 1].split("").reverse().join("");
    var secondString = rawInputLines[lineIndex].split("").reverse().join("");

    var firstStringLength = firstString.length;
    var secondStringLength = secondString.length;
    var maxLength = (firstStringLength > secondStringLength) ? firstStringLength : secondStringLength;

    // Array to hold sum of digits, potentially with carry-overs
    var sumDigitsArray = new Uint8Array(maxLength + 1);

    for (var digitPosition = 0; digitPosition < maxLength; digitPosition++) {
      var digitOne = (firstStringLength <= digitPosition) ? 0 : firstString[digitPosition] - 0;
      var digitTwo = (secondStringLength <= digitPosition) ? 0 : secondString[digitPosition] - 0;
      var currentSum = digitOne + digitTwo + sumDigitsArray[digitPosition];
      
      if (currentSum >= 10) {
        sumDigitsArray[digitPosition + 1]++;
        sumDigitsArray[digitPosition] = (currentSum - 10);
      } else {
        sumDigitsArray[digitPosition] = currentSum;
      }
    }

    var finalResultString = "";
    for (var digitPosition = sumDigitsArray.length; digitPosition--;) {
      if ((sumDigitsArray[digitPosition] || finalResultString) && digitPosition) {
        finalResultString += "" + sumDigitsArray[digitPosition];
      }
    }

    if (finalResultString.length >= 80) {
      console.log("overflow");
    } else {
      console.log(finalResultString);
    }
      
    
  }
  
}