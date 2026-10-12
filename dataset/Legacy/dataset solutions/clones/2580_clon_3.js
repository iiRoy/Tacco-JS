const processInputData = (rawData) => {
  const parseLineToFloats = (lineString) => {
    return lineString.split(' ').map(parseFloat);
  };

  const parsedLines = rawData.split('\n');
  const parsedData = parsedLines.map(parseLineToFloats);

  const numElements = parsedData[0];
  let baseArray = parsedData[1];
  
  const firstValue = baseArray[0];
  const lastValue = baseArray[baseArray.length - 1];
  baseArray = [firstValue, ...baseArray, lastValue];
  
  let totalSum = 0;
  
  for (let i = 1; i < baseArray.length; i++) {
    const previousElement = baseArray[i - 1];
    const currentElement = baseArray[i];
    totalSum += Math.min(previousElement, currentElement);
  }
  
  process.stdout.write(totalSum.toString());
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
