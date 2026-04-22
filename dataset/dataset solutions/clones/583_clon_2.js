var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineFragments = (dataStream.trim()).split("\n");

while (true) {
  var dimensions = lineFragments.shift().split(" ").map(Number);

  var countElements = dimensions[0];
  var limitValue = dimensions[1];

  if (countElements == 0 && limitValue == 0) break;

  var numericList = [];
  for (var counterA = 0; counterA < countElements; counterA++) {
    numericList.push(lineFragments.shift() - 0);
  }

  numericList.push(0);

  var sumCollection = [];

  for (var idxA = 0; idxA < numericList.length; idxA++) {
    for (var idxB = idxA; idxB < numericList.length; idxB++) {
      sumCollection.push(numericList[idxA] + numericList[idxB]);
    }
  }

  sumCollection.sort(function (valA, valB) {
    return valA - valB;
  });

  var lastSeenValue = -1;

  sumCollection = sumCollection.filter(function (currentElement) {
    if (lastSeenValue != currentElement) {
      lastSeenValue = currentElement;
      return currentElement;
    }
  });


  var greatestSum = 0;

  for (var ptrA = 0; ptrA < sumCollection.length; ptrA++) {
    for (var ptrB = ptrA; ptrB < sumCollection.length; ptrB++) {
      var currentPairSum = sumCollection[ptrA] + sumCollection[ptrB];
      if (currentPairSum > limitValue) break;
      if (greatestSum < currentPairSum) greatestSum = currentPairSum;
    }
  }
  console.log(greatestSum);
}