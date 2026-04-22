const classifyNumericValue = (val) => {
  if (val === 0) return '2';
  if (val >= 1 && val <= 12) return '1';
  return '0';
};

const processInputDate = (sourceText) => {
  const segmentOne = parseInt(sourceText.substring(0, 2), 10);
  const segmentTwo = parseInt(sourceText.substring(2, 4), 10);

  const statusOne = classifyNumericValue(segmentOne);
  const statusTwo = classifyNumericValue(segmentTwo);

  let finalOutcome;

  if (statusOne === '2' || statusTwo === '2' || (statusOne === '0' && statusTwo === '0')) {
    finalOutcome = 'NA';
  } else {
    const decisionMatrix = {
      '10': 'MMYY',
      '11': 'AMBIGUOUS',
      '01': 'YYMM',
    };
    finalOutcome = decisionMatrix[statusOne + statusTwo];
  }
  return finalOutcome;
};

process.stdout.write(processInputDate(process.argv[2] || require('fs').readFileSync('/dev/stdin', 'utf8')) + '\n');