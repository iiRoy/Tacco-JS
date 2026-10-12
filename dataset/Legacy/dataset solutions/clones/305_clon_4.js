const obtainStreamContent = () => {
  return new Promise((resolveContent) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    let accumulatedPayload = '';

    process.stdin.on('data', (dataSegment) => {
      accumulatedPayload += dataSegment;
    });

    process.stdin.on('end', () => {
      resolveContent(accumulatedPayload);
    });
  });
};

const performCalculation = (firstOperand, secondOperand, factor) => {
  return (firstOperand * secondOperand) / factor;
};

obtainStreamContent().then((fullStreamData) => {
  const dataSegments = fullStreamData.split(' ');

  const valueOne = Number(dataSegments[0]);
  const valueTwo = Number(dataSegments[1]);

  const conversionRatio = 3.305785;

  const computedOutcome = performCalculation(valueOne, valueTwo, conversionRatio);

  console.log(computedOutcome);
});
