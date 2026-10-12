const processInput = (rawData) => {
  const components = rawData.trim().split(' ');
  const firstOperandText = components[0];
  const secondOperandText = components[1];

  const bigIntFirst = BigInt(firstOperandText);

  let bigIntSecondScaled;
  const pointPosition = secondOperandText.indexOf('.');

  if (pointPosition === -1) {
    // No decimal point, e.g., "123" becomes 12300
    bigIntSecondScaled = BigInt(secondOperandText + '00');
  } else {
    // Has decimal point, e.g., "1.234" becomes 123
    const integralSegment = secondOperandText.substring(0, pointPosition);
    const fractionalSegment = secondOperandText.substring(pointPosition + 1);

    let twoDigitFraction = '';
    if (fractionalSegment.length >= 2) {
      twoDigitFraction = fractionalSegment.substring(0, 2);
    } else if (fractionalSegment.length === 1) {
      twoDigitFraction = fractionalSegment + '0';
    } else { // fractionalSegment.length === 0, e.g., "1."
      twoDigitFraction = '00';
    }
    
    const combinedNumericString = (integralSegment === '' ? '0' : integralSegment) + twoDigitFraction;
    bigIntSecondScaled = BigInt(combinedNumericString);
  }

  const productValue = bigIntFirst * bigIntSecondScaled;
  const finalOutput = (productValue / 100n).toString();

  console.log(finalOutput);
};

process.env.MYTEST ? test() : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
