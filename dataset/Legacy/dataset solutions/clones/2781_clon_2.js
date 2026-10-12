var inputData = [];
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

process.stdin.resume();
process.stdin.setEncoding('utf8');

inputProcessor.on('line', (currentLine) => {
  inputData.push(currentLine);
});

inputProcessor.on('close', () => {

  var numericValues = inputData[1].split(' ');
  for (var indexKey in numericValues) {
    numericValues[indexKey] = parseInt(numericValues[indexKey], 10);
  }

  var middleCount = 0;

  for (var indexKey in numericValues) {
    indexKey = parseInt(indexKey, 10);
    if (indexKey === 0 || indexKey === numericValues.length - 1) {
      continue;
    }
    var tempArray = [
      numericValues[indexKey - 1],
      numericValues[indexKey],
      numericValues[indexKey + 1]
    ];
    tempArray.sort();
    if (tempArray[1] === numericValues[indexKey]) {
      middleCount++;
    }
  }

  console.log(middleCount);

});
