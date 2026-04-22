function evaluateSequence(symbolString) {
  const validationSets = [
    new Set(['R', 'U', 'D']),
    new Set(['L', 'U', 'D'])
  ];

  const verificationResult = Array.from(symbolString).reduce((isValid, symbol, position) => {
    if (!isValid) {
      return false;
    }

    const requiredSet = validationSets[position % 2];
    return requiredSet.has(symbol);
  }, true);

  return verificationResult ? 'Yes' : 'No';
}