const sourceData = require('fs').readFileSync('/dev/stdin', 'UTF-8');

const processGeometricForms = (rawData) => {
  const dimensionPairs = rawData.split('\n');

  for (const line of dimensionPairs) {
    const [heightVal, widthVal] = line.split(' ').map(Number);

    if (heightVal === 0 && widthVal === 0) {
      return false;
    }

    const rowPattern = '#'.repeat(widthVal);
    const formOutput = Array.from({ length: heightVal }, () => rowPattern).join('\n');
    console.log(formOutput + '\n');
  }
};

processGeometricForms(sourceData);
