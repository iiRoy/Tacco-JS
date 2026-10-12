process.stdin.resume();
process.stdin.setEncoding('utf8');

const processLineData = (lineContent) => {
  const lineComponents = lineContent.split(' ');

  const firstValue = lineComponents[0] | 0;
  const secondValue = lineComponents[1] | 0;
  const targetValue = lineComponents[2] | 0;

  if (!(firstValue || secondValue || targetValue)) {
    return;
  }

  const primaryRate = firstValue / 100 + 1;
  const secondaryRate = secondValue / 100 + 1;

  const firstIterators = Array.from({ length: 999 }, (_, index) => index + 1);
  const secondIterators = Array.from({ length: 999 }, (_, index) => index + 1);

  const finalResult = firstIterators.reduce((currentMaximum, iterI) => {
    return secondIterators.reduce((innerMaximum, iterJ) => {
      const primarySum = Math.floor(iterI * primaryRate) + Math.floor(iterJ * primaryRate);

      if (primarySum === targetValue) {
        const secondarySum = Math.floor(iterI * secondaryRate) + Math.floor(iterJ * secondaryRate);
        return Math.max(innerMaximum, secondarySum);
      }
      return innerMaximum;
    }, currentMaximum);
  }, 0);

  console.log(finalResult);
};

process.stdin.on('data', (inputBuffer) => {
  inputBuffer.toString()
    .split('\n')
    .filter(line => line.trim() !== '')
    .forEach(processLineData);
});
