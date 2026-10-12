var fs = require('fs');

var dataSize = fs.fstatSync(process.stdin.fd).size;

var dataBuffer = new Buffer(dataSize);

var actualBytesRead = fs.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

var rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

processData();

function processData() {
  var parsedLines = rawInputLines;

  var numEntries = parsedLines[0].split(' ')[0] + 0;
  var queryValue = parsedLines[0].split(' ')[1] + 0;

  var currentEntry;

  var resultName = 'kogakubu10gokan';

  for (var entryIndex = 1; entryIndex <= numEntries; entryIndex++) {
    currentEntry = parsedLines[entryIndex].split(' ');
    if (queryValue > currentEntry[0] + 0) {
      break;
    }
    resultName = currentEntry[1];
  }

  console.log(resultName);
}
