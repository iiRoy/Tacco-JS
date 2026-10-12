function analyzeNumericProperty(numericInput) {
  const initialValue = Number(numericInput);
  let digitSummation = 0;
  let workingValue = initialValue;

  while (workingValue > 0) {
    digitSummation += workingValue % 10;
    workingValue = Math.floor(workingValue / 10);
  }

  const outcome = (initialValue % digitSummation === 0) ? 'Yes' : 'No';

  console.log(outcome);
}

analyzeNumericProperty(require('fs').readFileSync('/dev/stdin', 'utf8'));
