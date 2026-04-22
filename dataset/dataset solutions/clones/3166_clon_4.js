const acquireInputLines = () => {
  return new Promise((resolveSolely) => {
    const acquiredContent = [];
    const streamProcessor = require('node:readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    streamProcessor.on('line', (individualLine) => {
      acquiredContent.push(individualLine);
    });

    streamProcessor.on('close', () => {
      resolveSolely(acquiredContent);
    });
  });
};

const evaluateTemporalState = (receivedData) => {
  const boundaryMark = new Date(2019, 3, 30); // Month 3 is April (0-indexed)

  if (receivedData.length !== 1) {
    return 'TBD';
  }

  const prospectiveDateTime = new Date(receivedData[0]);

  if (isNaN(prospectiveDateTime.getTime())) {
    return 'TBD';
  }

  const comparisonResult = prospectiveDateTime.getTime() <= boundaryMark.getTime();

  const designationLookup = new Map([
    [true, 'Heisei'],
    [false, 'TBD']
  ]);

  return designationLookup.get(comparisonResult);
};

acquireInputLines()
  .then(evaluateTemporalState)
  .then(console.log)
  .catch(console.error);