const computeCharacterMetric = (dataSegment) => {
  const totalUnits = dataSegment.length;
  const specificSymbolCount = dataSegment.split('p').length - 1;

  const derivedNumerator = totalUnits - (specificSymbolCount << 1);
  const finalMeasurement = Math.floor(derivedNumerator / 2);

  return finalMeasurement;
};

const peripheralInterface = {
  fetchPayload: () => {
    return require('node:fs').readFileSync(process.stdin.fd, 'utf8').trim();
  },
  processAndDisplay: (payloadData) => {
    console.log(computeCharacterMetric(payloadData));
  }
};

peripheralInterface.processAndDisplay(peripheralInterface.fetchPayload());