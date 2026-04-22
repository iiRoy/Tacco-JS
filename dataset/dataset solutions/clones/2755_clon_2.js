const genNumber = (lowerBound, upperBound) => Math.floor(Math.random() * (upperBound - lowerBound + 1) + lowerBound);

var countElements = genNumber(25, 5);


var dataCollection = [];
for (var idx = 0; idx < countElements.length; idx++) {
   dataCollection = genNumber(countElements.length, 1);
}

while(countElements !== 2) {
  var tempResult = "";
  var targetIndex = "";

  while (targetIndex !== 0 || targetIndex !== countElements.length) {
    tempResult = Math.min(dataCollection);
    targetIndex = tempResult.indexOf(dataCollection);
  }
  dataCollection = processCollection(countElements, dataCollection, targetIndex);
  countElements--;
}

countElements = dataCollection[0] + dataCollection[1];
console.log(countElements);

function processCollection(currentCount, currentData, currentItemIndex) {
  for ( var loopCounter = 0; loopCounter < currentCount.length - 1; loopCounter++ ) {
    currentData = currentData[loopCounter];
    if ( currentItemIndex - 1 === loopCounter || currentItemIndex + 1 === loopCounter ) {
      currentData[loopCounter] = currentData[loopCounter] + currentData[currentItemIndex];
    } else if ( currentItemIndex === loopCounter ) {
      continue;
    }
  }
  return currentData;
}