(function executeProcess() {
  const content = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
  const numericValue = parseInt(content.trim(), 10);

  const determineSequenceTerm = (limitIndex) => {
    if (limitIndex === 0) {
      return 1;
    }
    if (limitIndex === 1) {
      return 1;
    }

    let previousTerm = 1;
    let currentTerm = 1;
    let nextTerm = 0;

    for (let counter = 2; counter <= limitIndex; counter++) {
      nextTerm = previousTerm + currentTerm;
      previousTerm = currentTerm;
      currentTerm = nextTerm;
    }
    return currentTerm;
  };

  console.info(determineSequenceTerm(numericValue));
})();