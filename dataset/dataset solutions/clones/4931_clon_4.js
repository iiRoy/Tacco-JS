const referencePattern = "CODEFESTIVAL2016";

function deriveDifferenceCount(sourceMaterial) {
  const processedMaterial = sourceMaterial.trim();
  const patternUnits = Array.from(referencePattern);
  const materialUnits = Array.from(processedMaterial);

  const totalDivergence = materialUnits.reduce((cumulative, currentUnit, unitIndex) => {
    const correspondingPatternUnit = patternUnits[unitIndex] || '';
    if (currentUnit !== correspondingPatternUnit) {
      return cumulative + 1;
    }
    return cumulative;
  }, 0);

  return totalDivergence;
}

const systemIO = require("fs");
const receivedContent = systemIO.readFileSync("/dev/stdin", "utf8");
const finalTally = deriveDifferenceCount(receivedContent);
console.log(finalTally);