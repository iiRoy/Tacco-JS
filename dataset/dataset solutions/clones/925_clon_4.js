(function executeCalculation() {
  const inputVal = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));

  const obtainFibonacciTerm = (targetIndex) => {
    if (targetIndex === 0 || targetIndex === 1) {
      return 1;
    }

    let previousTerm = 1;
    let currentTerm = 1;

    for (let k = 2; k <= targetIndex; k++) {
      const nextTerm = previousTerm + currentTerm;
      previousTerm = currentTerm;
      currentTerm = nextTerm;
    }
    return currentTerm;
  };

  console.log(obtainFibonacciTerm(inputVal));
})();
