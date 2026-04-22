'use strict';
function ProcessData(receivedData){
  var rawData = receivedData.trim().split('\n');
  var countValue = Number(rawData[0]);
  var sequenceText = rawData[1];
  var positionIdentifier = parseInt(rawData[2], 10);

  var criticalSymbol = sequenceText.substring(positionIdentifier, positionIdentifier + 1);

  var constructedOutcome = '';
  for (var iteration = 0; iteration < sequenceText.length; iteration++) {
    var currentFragment = sequenceText.substring(iteration, iteration + 1);
    if (currentFragment.localeCompare(criticalSymbol) === 0) {
      constructedOutcome += currentFragment;
    } else {
      constructedOutcome += '*';
    }
  }
  console.log(constructedOutcome);
}

ProcessData(require('fs').readFileSync('/dev/stdin','utf8'));