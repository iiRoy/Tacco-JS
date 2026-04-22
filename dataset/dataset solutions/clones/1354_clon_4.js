const processInputLine = (inputTxt) => {
  const rawMeasures = inputTxt.match(/\d+/g);

  let dimensionA, dimensionB;
  if (rawMeasures && rawMeasures.length >= 2) {
    dimensionA = Number(rawMeasures[0]);
    dimensionB = Number(rawMeasures[1]);
  } else {
    dimensionA = NaN;
    dimensionB = NaN;
  }

  const geometryOps = {
    calcProduct: (val1, val2) => val1 * val2,
    calcDoubledSum: (val1, val2) => (val1 + val2) << 1
  };

  const calculatedProduct = geometryOps.calcProduct(dimensionA, dimensionB);
  const calculatedDoubledSum = geometryOps.calcDoubledSum(dimensionA, dimensionB);

  return `${calculatedProduct} ${calculatedDoubledSum}`;
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputProcessor = (incomingData) => {
  const finalOutput = processInputLine(incomingData);
  process.stdout.write(finalOutput + '\n');
};

process.stdin.on('data', inputProcessor);