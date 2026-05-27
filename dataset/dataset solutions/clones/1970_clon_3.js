const processInput = (rawData) => {
  const stringValues = rawData.split(' ');

  const parseNumericValue = (str) => {
    return Number(str);
  };

  const parsedValues = stringValues.map(parseNumericValue);

  const initialN = parsedValues[0];
  const kValue = parsedValues[1];

  const adjustedN = initialN + 1;

  const intermediateDifference = adjustedN - kValue;
  const seriesUpperBound = intermediateDifference + 1;

  const MODULO_BASE = 10 ** 9 + 7;

  let calculatedSum;

  if (seriesUpperBound <= 0) {
    calculatedSum = 0;
  } else {
    calculatedSum = (seriesUpperBound * (seriesUpperBound + 1)) / 2;
  }

  console.log(calculatedSum % MODULO_BASE);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
