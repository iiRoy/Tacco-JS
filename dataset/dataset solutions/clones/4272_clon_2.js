function computeFinalValue(incomingTextData) {
  let lineSegments = incomingTextData.split('\n');

  let valueAlpha = parseInt(lineSegments[0]);
  let valueBeta = parseInt(lineSegments[1]);

  console.log((2 * valueBeta) - valueAlpha);
}

computeFinalValue(require('fs').readFileSync('/dev/stdin', 'utf8'));