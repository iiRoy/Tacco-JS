function processInputData(rawData) {
  const numericSequence = rawData.split('\n')
                                 .slice(1)
                                 .map(parseFloat)
                                 .sort((valA, valB) => valA - valB);

  const matchingMultiples = numericSequence.reduce((accumulator, currentFactor, currentIndex, fullSequence) => {
    const remainingFactors = fullSequence.slice(currentIndex + 1);

    const foundMultiples = remainingFactors.filter(potentialMultiple => {
      return Number.isInteger(potentialMultiple * currentFactor);
    });

    return accumulator.concat(foundMultiples);
  }, []);

  console.log(matchingMultiples.length);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
