const dataAccessor = require('fs');

const processInputAndDisplayResult = (dataService) => {
  const receivedData = dataService.readFileSync('/dev/stdin', 'utf8');
  const dataSize = receivedData.length;

  const constructedString = Array(dataSize).fill('x').join('');

  process.stdout.write(constructedString + '\n');
};

processInputAndDisplayResult(dataAccessor);