const ioHandler = require('fs');

function handleInputEntry(entryValue) {
  const exitConditionString = '0 0';
  if (entryValue !== exitConditionString) {
    const components = entryValue.split(' ');
    const orderedComponents = components.sort();
    const finalOutput = orderedComponents.join(' ');
    console.log(finalOutput);
  }
}

const rawData = ioHandler.readFileSync('/dev/stdin', 'utf8');
const rawLineSegments = rawData.split("\n");
const processedNumericValues = rawLineSegments.map(Number);

processedNumericValues.forEach(handleInputEntry);
