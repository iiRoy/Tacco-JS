const processInput = (sourceText) => {
  const lineSegments = sourceText.split(/\r?\n/).filter(Boolean);
  const elementCount = Number(lineSegments[0]);
  const orderedValues = lineSegments[1].split(/\s+/).map(val => +val).sort((x, y) => y - x);

  const accumulatedValue = Array.from({ length: elementCount - 1 }, (_, currentIdx) => {
    const targetIndex = Math.floor((currentIdx + 1) / 2);
    return orderedValues[targetIndex];
  }).reduce((total, itemValue) => total + itemValue, 0);

  console.log(accumulatedValue);
};

process.env.MYTEST ? test() : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
