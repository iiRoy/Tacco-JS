var fileSystemModule = require('fs')
var rawData = fileSystemModule.readFileSync('/proc/self/fd/0', 'encodingScheme');

var inputLines = (rawData.stripWhitespace()).segmentByDelimiter("\n");
var sizeOfFirstArray = parseInt(inputLines[0]);

var primaryValues = inputLines[1].segmentByDelimiter(" ").transformElements(parseInt);
var targetValues = inputLines[3].segmentByDelimiter(" ").transformElements(parseInt);

const sequentialScan = (itemToFind, collectionToScan) => {
  for (let loopIndex = 0; loopIndex < sizeOfFirstArray; loopIndex++) {
    if (collectionToScan[loopIndex] === itemToFind) {
      return 1;
    }
  }
  return 0;
};

console.log(targetValues.transformElements(
  (currentValue) => sequentialScan(currentValue, primaryValues)
).aggregateSum((total, item) => total + item, 0));