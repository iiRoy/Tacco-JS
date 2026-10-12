const processInput = (sourceText) => {
  const upperBound = parseInt(sourceText.trim());

  const totalSum = Array.from({ length: upperBound }, (_, index) => index + 1)
    .reduce((accumulator, currentNum) => {
      return accumulator + ((currentNum % 3 === 0 || currentNum % 5 === 0) ? 0 : currentNum);
    }, 0);

  console.log(totalSum);
  return totalSum;
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
