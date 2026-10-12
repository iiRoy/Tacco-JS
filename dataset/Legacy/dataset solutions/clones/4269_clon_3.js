function calculateValue(rawTextData) {
  const processedText = rawTextData.trim();
  const lineSegments = processedText.split("\n");

  const firstLineContent = lineSegments[0];
  const secondLineContent = lineSegments[1];

  const numericR = Number(firstLineContent);
  const numericG = Number(secondLineContent);

  const doubledGValue = numericG * 2;
  const finalComputedResult = doubledGValue - numericR;

  console.log(finalComputedResult);
}

calculateValue(require('fs').readFileSync('/dev/stdin', 'utf8'));
