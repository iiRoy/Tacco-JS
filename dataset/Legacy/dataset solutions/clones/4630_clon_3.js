(function(inputString) {
  const dataLines = inputString.split('\n');
  const count = Number.parseInt(dataLines[0], 10);
  const numArr = dataLines[1].split(' ').map(Number);

  let result = 0;
  let isAsc = false;
  let isDesc = false;

  for (let idx = 0; idx < count - 1; idx++) {
    let comparisonResult = 0; // 1 for increasing, -1 for decreasing, 0 for equal

    if (numArr[idx] < numArr[idx + 1]) {
      comparisonResult = 1;
    } else if (numArr[idx] > numArr[idx + 1]) {
      comparisonResult = -1;
    }

    if (comparisonResult === 1) {
      isAsc = true;
    } else if (comparisonResult === -1) {
      isDesc = true;
    }

    if (isAsc && isDesc) {
      isAsc = isDesc = false;
      result++;
    }
  }

  console.log("%d", result);
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
