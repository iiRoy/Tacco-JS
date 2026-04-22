const processSourceData = (rawDataContainer) => {
  const pullNumericElements = (textInput) =>
    textInput.match(/-?\d+(\.\d+)?/g).map(Number);

  const [
    temporalUnitPrimary,
    temporalUnitSecondary,
    alphaComponentPrimary,
    alphaComponentSecondary,
    betaComponentPrimary,
    betaComponentSecondary,
  ] = pullNumericElements(rawDataContainer);

  const computationalContext = {};

  computationalContext.differenceA = alphaComponentPrimary - betaComponentPrimary;
  computationalContext.differenceB = alphaComponentSecondary - betaComponentSecondary;

  computationalContext.weightedPrimary = temporalUnitPrimary * computationalContext.differenceA;
  computationalContext.weightedSecondary = temporalUnitSecondary * computationalContext.differenceB;

  const firstComparisonValue = computationalContext.weightedPrimary;
  const secondComparisonValue = computationalContext.weightedSecondary + firstComparisonValue;

  const getResult = (val1, val2) => {
    const signCheck1 = Math.sign(val1);
    const signCheck2 = Math.sign(val2);

    if (signCheck1 === signCheck2) {
      return 0;
    }

    if (val2 === 0) {
      return "infinity";
    }

    const absoluteVal1 = Math.abs(val1);
    const absoluteVal2 = Math.abs(val2);

    if (absoluteVal1 % absoluteVal2 === 0) {
      return (absoluteVal1 / absoluteVal2) * 2;
    } else {
      return Math.ceil(absoluteVal1 / absoluteVal2) * 2 - 1;
    }
  };

  console.log(getResult(firstComparisonValue, secondComparisonValue));
};

processSourceData(require("fs").readFileSync("/dev/stdin", "utf8"));