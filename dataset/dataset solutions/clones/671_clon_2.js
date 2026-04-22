let fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let entryLines = (fileContent.trim()).split("\n");
while (true) {
  let itemQuantity = parseInt(entryLines.shift(), 10);
  if (itemQuantity === 0) {
    break;
  }
  let itemCollection = [];
  let aggregateValue = 0;
  for (let loopIndex = 0; loopIndex < itemQuantity; loopIndex++) {
    let dataPair = (entryLines.shift()).split(" ").map(Number);
    itemCollection.push(dataPair);
    aggregateValue += dataPair[0];
  }
  itemCollection.sort(function(firstElement, secondElement) {
    firstElement = firstElement[1];
    secondElement = secondElement[1];
    return secondElement - firstElement;
  });
  let outcomeStatus = "YES";
  for (let loopIndex = 0; loopIndex < itemCollection.length; loopIndex++) {
    let segmentData = itemCollection[loopIndex];
    if (aggregateValue > segmentData[1]) {
      outcomeStatus = "NO";
      break;
    }
    aggregateValue -= segmentData[0];
  }
  console.log(outcomeStatus);
}