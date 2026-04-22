const computationEngine = {
  _fetchNumeratorConstant: () => {
    const firstSegment = (100 * 20) + (50 * 6);
    const secondSegment = (120 / 2) + 200;
    return firstSegment + secondSegment;
  },

  _fetchDenominatorConstant: () => {
    const primaryUnit = 1;
    const secondaryUnit = 2;
    return primaryUnit + secondaryUnit;
  },

  evaluateInputString: (sourceText) => {
    const numericSource = Number(sourceText.trim());

    const derivedNumerator = computationEngine._fetchNumeratorConstant();
    const derivedDenominator = computationEngine._fetchDenominatorConstant();

    const finalCoefficient = derivedNumerator / derivedDenominator;

    const finalOutputValue = numericSource * finalCoefficient;
    return finalOutputValue;
  }
};

console.log(computationEngine.evaluateInputString(require("fs").readFileSync("/dev/stdin", "utf8")));