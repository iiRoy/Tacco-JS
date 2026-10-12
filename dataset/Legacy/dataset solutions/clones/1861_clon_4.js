class InputHandler {
  constructor(rawInputContent) {
    this.tokenStream = rawInputContent.split(/ |\n/).filter(segment => segment !== '');
    this.currentPosition = 0;
  }

  fetchNextInteger() {
    return Number(this.tokenStream[this.currentPosition++]);
  }

  fetchNextBigInt() {
    return BigInt(this.tokenStream[this.currentPosition++]);
  }
}

const PRIME_MODULUS = 1_000_000_007n;

function calculateGreatestCommonDivisor(valueA, valueB) {
  let absA = valueA > 0n ? valueA : -valueA;
  let absB = valueB > 0n ? valueB : -valueB;
  while (absB !== 0n) {
    [absA, absB] = [absB, absA % absB];
  }
  return absA;
}

function executeModularMultiplication(operandA, operandB) {
  return (operandA * operandB) % PRIME_MODULUS;
}

function executeModularExponentiation(baseValue, exponentValue) {
  let finalResult = 1n;
  let currentBase = baseValue;
  let currentExponent = exponentValue;
  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      finalResult = executeModularMultiplication(finalResult, currentBase);
    }
    currentBase = executeModularMultiplication(currentBase, currentBase);
    currentExponent /= 2n;
  }
  return finalResult;
}

function ensurePositiveModulo(value) {
  return (value % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
}

function standardizeVectorCoordinates(xComponent, yComponent) {
  if (xComponent === 0n && yComponent === 0n) {
    return { x: 0n, y: 0n };
  }

  const commonDivisor = calculateGreatestCommonDivisor(xComponent, yComponent);
  let standardizedX = xComponent / commonDivisor;
  let standardizedY = yComponent / commonDivisor;

  if (standardizedX < 0n) {
    standardizedX = -standardizedX;
    standardizedY = -standardizedY;
  }
  if (standardizedX === 0n && standardizedY < 0n) {
    standardizedY = -standardizedY;
  }
  return { x: standardizedX, y: standardizedY };
}

function processVectorData() {
  const inputReader = new InputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));
  const totalVectorCount = inputReader.fetchNextInteger();

  let originPointCount = 0;
  let xAxisOnlyCount = 0;
  let yAxisOnlyCount = 0;

  const vectorDirectionMap = new Map(); // Map<BigInt, Map<BigInt, BigInt>> stores 2^k for each unique direction

  for (let idx = 0; idx < totalVectorCount; idx++) {
    const currentX = inputReader.fetchNextBigInt();
    const currentY = inputReader.fetchNextBigInt();

    if (currentX === 0n && currentY === 0n) {
      originPointCount++;
      continue;
    }
    if (currentX === 0n) {
      xAxisOnlyCount++;
      continue;
    }
    if (currentY === 0n) {
      yAxisOnlyCount++;
      continue;
    }

    const { x: stdX, y: stdY } = standardizeVectorCoordinates(currentX, currentY);

    if (!vectorDirectionMap.has(stdX)) {
      vectorDirectionMap.set(stdX, new Map());
    }
    const innerMap = vectorDirectionMap.get(stdX);

    const currentPowerOfTwo = innerMap.get(stdY) || 1n;
    innerMap.set(stdY, executeModularMultiplication(currentPowerOfTwo, 2n));
  }

  let overallResult = executeModularExponentiation(2n, BigInt(xAxisOnlyCount));
  overallResult = ensurePositiveModulo(overallResult + executeModularExponentiation(2n, BigInt(yAxisOnlyCount)));
  overallResult = ensurePositiveModulo(overallResult - 1n);

  const processedDirectionKeys = new Set(); // Tracks unique string keys of directions already handled in a perpendicular pair

  for (const [xKey, yMap] of vectorDirectionMap.entries()) {
    for (const [yKey, countValue] of yMap.entries()) {
      const currentDirectionKey = `${xKey.toString()},${yKey.toString()}`;
      if (processedDirectionKeys.has(currentDirectionKey)) {
        continue;
      }

      const perpendicularX = yKey;
      const perpendicularY = -xKey;

      const { x: stdPerpX, y: stdPerpY } = standardizeVectorCoordinates(perpendicularX, perpendicularY);
      const perpendicularDirectionKey = `${stdPerpX.toString()},${stdPerpY.toString()}`;

      let combinedGroupValue = countValue; // This is 2^k1 for the current direction

      if (vectorDirectionMap.has(stdPerpX) && vectorDirectionMap.get(stdPerpX).has(stdPerpY) && currentDirectionKey !== perpendicularDirectionKey) {
        const perpendicularCountValue = vectorDirectionMap.get(stdPerpX).get(stdPerpY); // This is 2^k2 for the perpendicular direction
        combinedGroupValue = ensurePositiveModulo(countValue + perpendicularCountValue - 1n); // (2^k1 + 2^k2 - 1)
        processedDirectionKeys.add(perpendicularDirectionKey); // Mark the perpendicular direction as processed
      }
      overallResult = executeModularMultiplication(overallResult, combinedGroupValue);
    }
  }

  return ensurePositiveModulo(overallResult - 1n + BigInt(originPointCount));
}

const finalOutput = processVectorData();
if (finalOutput !== undefined) console.log(finalOutput.toString());
