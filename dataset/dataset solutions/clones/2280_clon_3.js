function processInput(rawData) {
  const lines = rawData.split('\n');

  const firstLineValue = parseInt(lines[0], 10);
  const targetString = lines[1];

  let foundCount = 0;

  const iterationLimit = firstLineValue - 2;

  for (let currentPos = 0; currentPos < iterationLimit; currentPos++) {
    const charAtCurrent = targetString[currentPos];
    const charAtNext = targetString[currentPos + 1];
    const charAtAfterNext = targetString[currentPos + 2];

    if (charAtCurrent === 'A' && charAtNext === 'B' && charAtAfterNext === 'C') {
      foundCount++;
    }
  }

  console.log(foundCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
