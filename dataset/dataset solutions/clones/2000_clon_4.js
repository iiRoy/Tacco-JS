((sourceIdentifier) => {
  const rawTextBlob = sourceIdentifier.readFileSync(0, 'utf8');

  const numericalElements = rawTextBlob.match(/\d+/g).map(valStr => Number(valStr));

  const elementAlpha = numericalElements[2];
  const elementBeta = numericalElements[0];
  const elementGamma = numericalElements[1];

  const finalOutputString = elementAlpha + ' ' + elementBeta + ' ' + elementGamma;

  process.stdout.write(finalOutputString + '\n');
})(process.stdin);