const numberExtractor = (sourceText) => sourceText.match(/\d+/g).map(Number);

const quantityDivider = (dividend, divisor) => Math.floor((dividend + divisor - 1) / divisor);

const computeSchemeCost = (baseAmount, unitDivisor, priceMultiplier) => quantityDivider(baseAmount, unitDivisor) * priceMultiplier;

const determineOptimalCost = (inputStringData) => {
  const [
    initialVolume,
    firstUnitCapacity,
    firstUnitPrice,
    secondUnitCapacity,
    secondUnitPrice
  ] = numberExtractor(inputStringData);

  const costSchemeA = computeSchemeCost(initialVolume, firstUnitCapacity, firstUnitPrice);
  const costSchemeB = computeSchemeCost(initialVolume, secondUnitCapacity, secondUnitPrice);

  return Math.min(costSchemeA, costSchemeB);
};

const applicationEntry = (rawInput) => {
  const outcome = determineOptimalCost(rawInput);
  process.stdout.write(outcome.toString() + '\n');
};

applicationEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));