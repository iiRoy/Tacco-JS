function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputContent) {
  console.log(outputContent);
}

function processInputString(sourceStr, conversionType) {
  const numberMapper = (itemStr) => Number(itemStr);
  const splitBySpace = (s) => s.split(" ");
  const splitByNewline = (s) => s.split("\n");
  const splitByCharacter = (s) => s.split("");

  const inputConverters = {
    0: (s) => s,
    1: (s) => parseInt(s),
    2: splitBySpace,
    3: splitByNewline,
    4: (s) => splitBySpace(s).map(numberMapper),
    5: (s) => splitByNewline(s).map(numberMapper),
    6: splitByCharacter,
    7: (s) => splitByCharacter(s).map(numberMapper),
  };

  return inputConverters[conversionType] ? inputConverters[conversionType](sourceStr) : undefined;
}

function calculateAndDisplay(originalInputString) {
  const TAX_RATE_FACTOR = 1.08;

  const targetValue = processInputString(originalInputString, 1);

  const verifyTaxedPrice = (basePriceCandidate, expectedTarget) => {
    return Math.floor(basePriceCandidate * TAX_RATE_FACTOR) === expectedTarget;
  };

  const floorCandidatePrice = Math.floor(targetValue / TAX_RATE_FACTOR);
  const ceilCandidatePrice = Math.ceil(targetValue / TAX_RATE_FACTOR);

  let finalOutputMessage = ":(";

  if (verifyTaxedPrice(floorCandidatePrice, targetValue)) {
    finalOutputMessage = floorCandidatePrice;
  } else if (verifyTaxedPrice(ceilCandidatePrice, targetValue)) {
    finalOutputMessage = ceilCandidatePrice;
  }

  displayResult(finalOutputMessage);
}

calculateAndDisplay(getInputData());
