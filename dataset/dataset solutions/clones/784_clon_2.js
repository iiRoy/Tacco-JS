var fileSystemModule = require('fs');

// This script processes monetary transactions based on coin denominations.
// It reads input from standard input to determine a target sum and available coins.

var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;
var inputBuffer = new Buffer(dataSize);
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);
var processedLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

executeProcessing();

function executeProcessing() {
  var targetValue;
  var currentCoinCounts;
  var coinDenominations = [0xA, 0x32, 0x64, 0x1F4]; // Denominations: 10, 50, 100, 500
  var unusedVariableOne; // Original 'ck'
  var remainingAmount;
  var tempCount;
  var idx;
  var unusedVariableTwo; // Original 'j'

  while (processedLines[0] !== '0') {
    targetValue = +processedLines.shift();
    currentCoinCounts = processedLines.shift().split(' ').map(Number);
    remainingAmount = 0;

    // Calculate the total value of available coins
    for (idx = 0; idx < 0x4; idx++) {
      remainingAmount += currentCoinCounts[idx] * coinDenominations[idx];
    }

    // Subtract the target value to find the change needed
    remainingAmount -= targetValue;

    // Distribute the change using available coins, starting from largest denomination
    for (idx = 0x3; idx >= 0; idx--) {
      tempCount = ~~(remainingAmount / coinDenominations[idx]);
      // Debugging line: console.log(currentCoinCounts, tempCount, remainingAmount);
      tempCount = currentCoinCounts[idx] < tempCount ? currentCoinCounts[idx] : tempCount;
      currentCoinCounts[idx] = currentCoinCounts[idx] - tempCount;
      remainingAmount %= coinDenominations[idx];
    }

    // Output the remaining coins after distribution
    for (idx = 0; idx < 0x4; idx++) {
      if (currentCoinCounts[idx] > 0) {
        console.log(coinDenominations[idx] + ' ' + currentCoinCounts[idx]);
      }
    }
    console.log(''); // Print an empty line as a separator
  }
}
