global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');
global.process.stdin.on('data', (payloadText) => {
  const lineCollection = payloadText.split('\n');

  lineCollection.forEach((individualEntry) => {
    const dataParts = individualEntry.split(' ');
    const numValueA = +dataParts[0] || 0;
    const numValueB = +dataParts[1] || 0;
    const numValueC = +dataParts[2] || 0;

    if (numValueA || numValueB || numValueC) {
      const calculationFactorX = numValueA / 100 + 1;
      const calculationFactorY = numValueB / 100 + 1;
      const comparisonTarget = numValueC;

      const operandRange = Array.from({ length: 999 }, (_, indexVal) => indexVal + 1);

      const ultimateValue = operandRange
        .flatMap(operandOne =>
          operandRange.map(operandTwo => [operandOne, operandTwo])
        )
        .filter(([operandOne, operandTwo]) =>
          (Math.floor(operandOne * calculationFactorX) + Math.floor(operandTwo * calculationFactorX)) === comparisonTarget
        )
        .map(([operandOne, operandTwo]) =>
          (Math.floor(operandOne * calculationFactorY) + Math.floor(operandTwo * calculationFactorY))
        )
        .reduce((currentHigh, currentVal) => Math.max(currentHigh, currentVal), 0);

      global.console.log(ultimateValue);
    }
  });
});