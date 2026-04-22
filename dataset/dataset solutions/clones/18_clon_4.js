const rdr = require('readline').createInterface({
  input: process.stdin,
  terminal: false
});

const outcomeCollection = [];

const calculateEquationRoots = (coeffA, coeffB, coeffC, coeffD, coeffE, coeffF) => {
  // System:
  // coeffA * x_value + coeffB * y_value = coeffC
  // coeffD * x_value + coeffE * y_value = coeffF

  // Calculate determinants using Cramer's rule
  const determinantMain = coeffA * coeffE - coeffB * coeffD;
  const determinantX = coeffC * coeffE - coeffB * coeffF;
  const determinantY = coeffA * coeffF - coeffC * coeffD;

  const x_value = determinantX / determinantMain;
  const y_value = determinantY / determinantMain;

  return { solutionX: x_value, solutionY: y_value };
};

rdr.on('line', (currentLineData) => {
  const numericCoefficients = currentLineData.split(' ').map(Number);
  const [param1, param2, param3, param4, param5, param6] = numericCoefficients;

  const { solutionX, solutionY } = calculateEquationRoots(param1, param2, param3, param4, param5, param6);

  outcomeCollection.push({ xResult: solutionX, yResult: solutionY });
});

rdr.on('close', () => {
  for (const resultPair of outcomeCollection) {
    const outputX = resultPair.xResult.toFixed(3);
    const outputY = resultPair.yResult.toFixed(3);
    process.stdout.write(`${outputX} ${outputY}\n`);
  }
});