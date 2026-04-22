const calculateExtremitySpan = (sourceText) => {
  const lineContent = sourceText.trim().split('\n');
  const numericalTokens = lineContent[1].split(' ');
  
  const actualValues = numericalTokens.map(Number);

  const smallestFound = Math.min(...actualValues);
  const largestFound = Math.max(...actualValues);

  const finalRange = largestFound - smallestFound;
  return finalRange;
};

console.log(calculateExtremitySpan(require('fs').readFileSync('/dev/stdin', 'utf8')));