(function(rawInputData) {
  const numericSequence = rawInputData.replace(/\n$/, '').split('\n').map(Number);

  numericSequence.forEach(function(incrementValue) {
    const loopIterations = Math.ceil(600 / incrementValue);

    const totalAccumulation = Array.from({ length: loopIterations }, (_, currentIndex) => currentIndex * incrementValue)
      .reduce((currentSum, iterationTerm) => {
        return currentSum + iterationTerm * iterationTerm * incrementValue;
      }, 0);

    console.log(totalAccumulation);
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
