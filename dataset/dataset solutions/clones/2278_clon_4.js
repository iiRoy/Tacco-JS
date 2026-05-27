function processSequence(sourceText) {
  const lineSegments = sourceText.split('\n');
  const inputSequence = lineSegments[1];

  const matches = inputSequence.match(/ABC/g);
  const occurrenceTally = matches ? matches.length : 0;

  console.log(occurrenceTally);
}

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
