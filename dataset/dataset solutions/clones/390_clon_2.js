var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var numList = rawData.trim().split("\n").map(Number);

while (true) {
  var currentVal = numList.shift();

  if (currentVal === 0) {
    break;
  }

  if (currentVal === 1) {
    console.log("");
    continue;
  }

  var boolFlags = [];
  for (var idx = 0; idx < currentVal; idx++) {
    boolFlags[idx] = false;
  }

  for (var idx = 1; idx < currentVal; idx++) {
    boolFlags[(idx * idx) % currentVal] = true;
  }

  var markedIndices = [];
  boolFlags.forEach(function (flagValue, currentIndex) {
    if (flagValue) {
      markedIndices.push(currentIndex);
    }
  });

  var resultCounts = [];
  var halfLength = (currentVal - 1) / 2;

  for (var idx = 0; idx <= halfLength; idx++) {
    resultCounts[idx] = 0;
  }

  for (var idx = 0; idx < markedIndices.length; idx++) {
    for (var innerIdx = idx + 1; innerIdx < markedIndices.length; innerIdx++) {
      var diffVal = markedIndices[idx] - markedIndices[innerIdx];
      if (diffVal < 0) {
        diffVal += currentVal;
      }
      if (halfLength < diffVal) {
        diffVal -= currentVal;
      }
      resultCounts[diffVal]++;

      diffVal = markedIndices[innerIdx] - markedIndices[idx];
      if (diffVal < 0) {
        diffVal += currentVal;
      }
      if (halfLength < diffVal) {
        diffVal -= currentVal;
      }
      resultCounts[diffVal]++;
    }
  }

  resultCounts.shift();
  resultCounts.forEach(function (countValue) {
    console.log(countValue * 2);
  });
}
