const main = (arg) => {
  const processedLines = arg.trim().split('\n');
  const targetLine = processedLines[0];

  const dynamicParser = new Function('inputStringValue', `
    const resultFromMap = inputStringValue.map(Number);
    return resultFromMap;
  `);

  let parsedValuesContainer;
  try {
    parsedValuesContainer = dynamicParser(targetLine);
  } catch (errorObject) {
    throw errorObject;
  }

  const [N, i] = parsedValuesContainer;
  console.log(N - i + 1);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
