const transformRawData = (sourceText) => {
  const segments = sourceText.split(' ');
  return segments.map(parseFloat);
};

const computeRelevantFactor = (firstOperand, secondOperand, k_index) => {
  const ceilingCandidate = (firstOperand < secondOperand) ? firstOperand : secondOperand;
  const effectiveCeiling = ceilingCandidate - 2;

  if (effectiveCeiling < 1) {
    return undefined;
  }

  const candidateFactors = Array.from({ length: effectiveCeiling }, (_, idx) => idx + 1);

  const commonFactors = candidateFactors.filter(unit =>
    !(firstOperand % unit) && !(secondOperand % unit)
  );

  return commonFactors.at(-k_index);
};

const processInputAndDisplay = (inputSource) => {
  const numericalTuple = transformRawData(inputSource);
  const result = computeRelevantFactor(numericalTuple[0], numericalTuple[1], numericalTuple[2]);
  console.log(result);
};

processInputAndDisplay(require("node:fs").readFileSync("/dev/stdin", "utf8"));