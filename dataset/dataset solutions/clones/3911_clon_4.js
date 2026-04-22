function evaluateSequence(payload) {
  const normalizedPayload = payload.trim();

  const characterMap = normalizedPayload.split('').reduce((tally, symbol) => {
    switch (symbol) {
      case 'a':
      case 'b':
      case 'c':
        tally[symbol] = (tally[symbol] || 0) + 1;
        break;
      default:
        // Ignore other characters
        break;
    }
    return tally;
  }, {});

  const aOccurrences = characterMap['a'] || 0;
  const bOccurrences = characterMap['b'] || 0;
  const cOccurrences = characterMap['c'] || 0;

  if (aOccurrences === 1 && bOccurrences === 1 && cOccurrences === 1) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

evaluateSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));