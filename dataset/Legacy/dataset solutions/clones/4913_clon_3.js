function processInput(rawInputString) {
  const RADIX_DECIMAL = 10;

  const trimmedInput = rawInputString.trim();
  const inputLines = trimmedInput.split("\n");

  const numIterations = parseInt(inputLines[0], RADIX_DECIMAL);

  let accumulatorA = 1;
  let accumulatorT = 1;

  const parseLine = (lineStr) => {
    return lineStr.split(" ").map((val) => parseInt(val, RADIX_DECIMAL));
  };

  for (let loopIndex = 1; loopIndex <= numIterations; loopIndex++) {
    const currentLineValues = parseLine(inputLines[loopIndex]);

    const targetRatioT = currentLineValues[0];
    const targetRatioA = currentLineValues[1];

    const requiredMultiplierForT = Math.ceil(accumulatorT / targetRatioT);
    const requiredMultiplierForA = Math.ceil(accumulatorA / targetRatioA);

    const commonMultiplier = Math.max(requiredMultiplierForT, requiredMultiplierForA);

    accumulatorT = targetRatioT * commonMultiplier;
    accumulatorA = targetRatioA * commonMultiplier;
  }

  console.log(accumulatorA + accumulatorT);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
