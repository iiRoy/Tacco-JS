const processInput = (dataLines) => {
  const parsedNumbers = dataLines[0].split(" ");
  const targetEightPercent = Number(parsedNumbers[0]);
  const targetTenPercent = Number(parsedNumbers[1]);

  let resultValue = -1;

  const lowerBoundForEight = Math.ceil(targetEightPercent / 0.08);
  const lowerBoundForTen = Math.ceil(targetTenPercent / 0.1);
  const searchStart = Math.max(lowerBoundForEight, lowerBoundForTen);

  const upperBoundForEightExclusive = Math.ceil((targetEightPercent + 1) / 0.08);
  const upperBoundForTenExclusive = Math.ceil((targetTenPercent + 1) / 0.1);
  const searchEndExclusive = Math.min(upperBoundForEightExclusive, upperBoundForTenExclusive);

  for (let k = searchStart; k < searchEndExclusive; k++) {
    if (Math.floor(k * 0.08) === targetEightPercent && Math.floor(k * 0.1) === targetTenPercent) {
      resultValue = k;
      break;
    }
  }

  console.log(resultValue);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
