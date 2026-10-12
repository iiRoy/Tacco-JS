const processInputAndOutput = (inputLines) => {
  const [upperBound, iterationCount] = inputLines[0].split(' ').map(Number);

  const generatePairString = (index) => {
    return (upperBound % 2 !== 0)
      ? `${1 + index} ${upperBound - 1 - index}`
      : `${upperBound / 2 - index} ${upperBound / 2 + 1 + index}`;
  };

  Array.from({ length: iterationCount }, (_, currentIdx) => generatePairString(currentIdx))
       .forEach(pairOutput => console.log(pairOutput));
};

let receivedData = '';
process.stdin.on('data', (chunk) => {
  receivedData += chunk;
});

process.stdin.on('end', () => {
  const { EOL: lineSeparator } = require('os');
  const parsedLines = receivedData.split(lineSeparator);
  processInputAndOutput(parsedLines);
});
