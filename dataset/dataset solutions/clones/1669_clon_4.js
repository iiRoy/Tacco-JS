const processSourceData = (rawData) => {
  const lineSegments = rawData.trim().split('\n');
  const targetLine = lineSegments[1];
  const numericStrings = targetLine.split(' ');

  const resultTally = numericStrings.reduce((counter, stringValue, position) => {
    if (position % 2 !== 0) { // Check if index is odd
      const numericValue = Number(stringValue); // Convert string to number
      if (numericValue % 2 !== 0) { // Check if number itself is odd
        return counter + 1;
      }
    }
    return counter;
  }, 0);

  console.info(resultTally);
};

const acquireAndExecute = () => {
    const externalData = require('node:fs').readFileSync(process.stdin.fd, 'utf8');
    processSourceData(externalData);
};

acquireAndExecute();