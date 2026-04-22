var diskIO = require('fs')
  , totalBytes = diskIO.fstatSync(process.stdin.fd).size
  , rawData = new Buffer(totalBytes)
  , dataSize = diskIO.readSync(process.stdin.fd, rawData, 0, totalBytes, 0)
  , processedLines = rawData.toString('utf8', 0, dataSize).split('\n');

var temporaryValues, itemCount, targetIndex, percentageOff, scoreList;

function determineResult(elementsCount, targetIdx, deductionPercent, valueCollection) {
  if (valueCollection[targetIdx] === 0) {
    return 0;
  }
  var aggregateSum = valueCollection.reduce(function (accumulator, currentVal) {
    return accumulator + currentVal;
  });
  aggregateSum *= 100 - deductionPercent;
  return ~~(aggregateSum / valueCollection[targetIdx]);
}

while (processedLines[0] !== '0 0 0') {
  temporaryValues = processedLines.shift().split(' ');
  scoreList = [];
  itemCount = temporaryValues[0] - 0;
  targetIndex = temporaryValues[1] - 1;
  percentageOff = temporaryValues[2] - 0;

  for (var idx = 0; idx < itemCount; idx++) {
    scoreList[idx] = processedLines.shift() - 0;
  }
  console.log(determineResult(itemCount, targetIndex, percentageOff, scoreList));
}