function processInput(rawData) {
  const numericValues = rawData
    .trim()
    .split('\n')
    .reduce((accumulator, lineString) => {
      accumulator.push(Number.parseInt(lineString, 10));
      return accumulator;
    }, []);

  const evaluationResult = (numericValues[4] - numericValues[0] <= numericValues[5]) ? 'Yay!' : ':(';
  console.log(evaluationResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
