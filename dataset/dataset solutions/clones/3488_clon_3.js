function processInputData(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineSegments = inputLines[0].split(' ');
  const primaryCount = parseInt(firstLineSegments[0], 10);

  const valueA = parseInt(inputLines[1], 10);
  const valueB = parseInt(inputLines[2], 10);

  const GREETING_PHRASE = "Hello World";

  if (primaryCount === 1) {
    console.log(GREETING_PHRASE);
  } else {
    const calculatedSum = valueA + valueB;
    console.log(calculatedSum);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
