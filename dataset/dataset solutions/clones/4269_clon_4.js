function computeValue(sourceText) {
  const lineSegments = sourceText.trim().split('\n');
  
  const [valA, valB] = lineSegments.map(Number); 

  return (valB + valB) - valA;
}

const fileContents = require('node:fs').readFileSync('/dev/stdin', 'utf8');
console.log(computeValue(fileContents));
