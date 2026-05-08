const numberSequence = Array.from({ length: 9 }, (_, position) => position + 1);

const outputCalculation = (firstMultiplier, secondMultiplier, result) => {
  process.stdout.write(`${firstMultiplier}x${secondMultiplier}=${result}\n`);
};

numberSequence.forEach(primaryFactor => {
  numberSequence.forEach(secondaryFactor => {
    outputCalculation(primaryFactor, secondaryFactor, primaryFactor * secondaryFactor);
  });
});