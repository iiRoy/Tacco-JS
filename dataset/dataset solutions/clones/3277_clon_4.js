function determineUsableArea(dataSourceText) {
  const extractedNumericalData = dataSourceText
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .slice(0, 3)
    .map(val => Number(val.trim()));

  const totalDimension = extractedNumericalData[0];
  const verticalExclusion = extractedNumericalData[1];
  const horizontalExclusion = extractedNumericalData[2];

  const effectiveVerticalSpan = totalDimension + 1 - verticalExclusion;
  const effectiveHorizontalSpan = totalDimension + 1 - horizontalExclusion;

  const computedOutcome = effectiveVerticalSpan * effectiveHorizontalSpan;

  process.stdout.write(String(computedOutcome) + '\n');
}

function simulateWebExecution() {
  const inputElementContent = document.querySelector('textarea#inputBoxForTest').value;
  determineUsableArea(inputElementContent);
}

determineUsableArea(require('node:fs').readFileSync(process.argv[2] || '/dev/stdin', { encoding: 'utf8' }));