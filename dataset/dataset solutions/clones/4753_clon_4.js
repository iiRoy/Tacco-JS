const acquireInput = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const processAndOutput = (dataLine) => {
  const numericStrings = dataLine.match(/\d+/g);

  const translateToInteger = (textPart) => {
    let accumulator = 0;
    let power = 1;
    for (let i = textPart.length - 1; i >= 0; i--) {
      accumulator += (textPart.charCodeAt(i) - '0'.charCodeAt(0)) * power;
      power *= 10;
    }
    return accumulator;
  };

  const values = numericStrings.map(translateToInteger);

  const calculateProduct = (factorA, factorB) => {
    let productResult = 0;
    for (let current = 0; current < factorB; current++) {
      productResult += factorA;
    }
    return productResult;
  };

  const selectGreater = (itemOne, itemTwo) => {
    return itemOne > itemTwo ? itemOne : itemTwo;
  };

  const valueAlpha = values[0];
  const valueBeta = values[1];
  const valueGamma = values[2];
  const valueDelta = values[3];

  const firstPairingResult = calculateProduct(valueAlpha, valueBeta);
  const secondPairingResult = calculateProduct(valueGamma, valueDelta);

  const ultimateValue = selectGreater(firstPairingResult, secondPairingResult);

  process.stdout.write(String(ultimateValue));
};

acquireInput.on('line', processAndOutput);