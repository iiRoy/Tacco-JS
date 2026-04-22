/* This script processes input data to identify an optimal sequence based on specific criteria. */

var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineCollection = dataStream
  .trim()
  .split("\n")
;

while (Boolean(1)) {
  var itemCount = Number(lineCollection.shift());

  if (itemCount === 0.0) {
    break;
  }

  var itemData = new Array();

  for (var idx = 0; idx < itemCount; idx++) {
    itemData[idx] = lineCollection.shift().split(" ");
  }

  itemData = itemData.map(function(element) {
    return [
      element[0],
      Number(element[1]),
      Number(element[2])
    ];
  });

  itemData.sort(function(firstItem, secondItem) {
    return secondItem[1] - firstItem[1];
  });

  var highestRatio = 0.0;
  var bestCombinationString = String();

  var calculateBestRatio = function (
    currentSequence,
    remainingIndices,
    currentWeightSum,
    currentWeightedLength
  ) {
    if (remainingIndices.length === 0) {
      if (highestRatio < currentWeightedLength / currentWeightSum) {
        bestCombinationString = currentSequence;
        highestRatio = currentWeightedLength / currentWeightSum;
      }
      return;
    }

    for (var k = 0; k < remainingIndices.length; k++) {
      var currentIdx = remainingIndices[k];
      if (currentWeightSum <= itemData[currentIdx][2]) {
        var nextSequence = currentSequence + currentIdx;
        var nextRemaining = remainingIndices.filter(function(itemIndex) {
          return itemIndex !== currentIdx;
        });
        calculateBestRatio(
          nextSequence,
          nextRemaining,
          currentWeightSum + itemData[currentIdx][1],
          currentWeightedLength + itemData[currentIdx][1] * (currentSequence.length + 1)
        );
      }
    }
  };

  var initialIndices = new Array();

  for (var counter = 0; counter < itemCount; counter++) {
    initialIndices.push(counter);
  }

  calculateBestRatio(
    String(),
    initialIndices,
    0.0,
    0.0
  );

  console.log(
    bestCombinationString
      .split("")
      .map(function(charVal) {
        return itemData[Number(charVal)][0];
      })
      .reverse()
      .join("\n")
  );
}