const inputProcessor = require("fs");
const primeModulus = 1000000007;

const secureModulo = (value) => (value % primeModulus + primeModulus) % primeModulus;

(async () => {
  try {
    const completeInput = inputProcessor.readFileSync(0, "utf8");
    const firstNonSpaceSequence = completeInput.trim().split(/\s+/)[0];

    if (!firstNonSpaceSequence) {
      console.log(0);
      return;
    }

    const frequencyCounter = new Map();
    for (const characterUnit of firstNonSpaceSequence) {
      frequencyCounter.set(characterUnit, (frequencyCounter.get(characterUnit) || 0) + 1);
    }

    let productAccumulator = 1;
    for (const countValue of frequencyCounter.values()) {
      productAccumulator = secureModulo(productAccumulator * (countValue + 1));
    }

    const finalResult = secureModulo(productAccumulator - 1);
    console.log(finalResult);

  } catch (operationError) {
    console.error("Input processing failed:", operationError);
  }
})();