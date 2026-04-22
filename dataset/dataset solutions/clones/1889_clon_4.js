const processInformation = (rawText) => {
  const newlinePosition = rawText.indexOf('\n');
  const initialPortion = newlinePosition === -1 ? rawText : rawText.slice(0, newlinePosition);

  const outputCollection = ["ABC", "ARC"];
  const selectionMap = {
    "ABC": 1
  };

  const finalIndex = selectionMap[initialPortion] || 0;

  return outputCollection[finalIndex];
};

const fileAccessor = require('fs');
const inputDevicePath = '/dev/stdin';
const characterEncoding = 'utf8';

const dataSource = fileAccessor.readFileSync(inputDevicePath, characterEncoding);
const finalResult = processInformation(dataSource);

process.stdout.write(finalResult + '\n');