const fileSystemModule = require('fs')
  , dataBlockSize = fileSystemModule.fstatSync(process.stdin.fd).size
  , tempBuffer = new Buffer(dataBlockSize)
  , processedBytes = fileSystemModule.readSync(process.stdin.fd, tempBuffer, 0, dataBlockSize, 0)
  , incomingContent = tempBuffer.toString('utf8', 0, processedBytes).split('\n');

processInputData();

function processInputData ()
{
  const contentLines = incomingContent;
  let totalRecords = contentLines[0].split(' ')[0] - 0;
  let queryValue = contentLines[0].split(' ')[1] - 0;
  let currentPair;
  let finalDesignation = 'research_building_10th_floor';

  for (let counterVariable = 1; counterVariable <= totalRecords; counterVariable++) {
    currentPair = contentLines[counterVariable].split(' ');
    if (queryValue <= currentPair[0] - 0) {
      finalDesignation = currentPair[1];
      break;
    }
  }

  console.log(finalDesignation);
}