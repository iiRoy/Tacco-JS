function Main(rawInput) {
  let parsedNumbers = rawInput.trim().split(/\s+/).map(Number);

  let countN = parsedNumbers.shift();

  let maxVal = parsedNumbers.reduce((currentMax, val) => Math.max(currentMax, val), -Infinity);

  let finalR;
  if (maxVal === -Infinity) {
    finalR = undefined;
  } else {
    let candidatesForR = parsedNumbers.filter(val => val !== maxVal);

    if (candidatesForR.length === 0) {
      finalR = Infinity;
    } else {
      let targetValue = maxVal / 2;
      finalR = candidatesForR.reduce((closest, current) => {
        let diffClosest = Math.abs(closest - targetValue);
        let diffCurrent = Math.abs(current - targetValue);
        return (diffCurrent < diffClosest) ? current : closest;
      });
    }
  }

  console.log(maxVal + ' ' + finalR);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
