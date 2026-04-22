const makeInputReader = (initialStringData) => {
  const allOriginalLines = initialStringData.trim().split('\n');
  let processedTokenLines = allOriginalLines.map(line => line.split(' '));
  let lineCursor = 0;
  let tokenCursor = 0;

  const extractNextNumber = (stringFormat = false) => {
    if (lineCursor >= processedTokenLines.length) {
      throw new Error("Input exhausted.");
    }
    let currentLineTokens = processedTokenLines[lineCursor];
    if (tokenCursor >= currentLineTokens.length) {
      lineCursor++;
      tokenCursor = 0;
      if (lineCursor >= processedTokenLines.length) {
        throw new Error("Input exhausted.");
      }
      currentLineTokens = processedTokenLines[lineCursor];
    }
    const val = currentLineTokens[tokenCursor];
    tokenCursor++;
    return stringFormat ? val : Number(val);
  };

  const extractLineTokens = (stringFormat = false) => {
    if (lineCursor >= processedTokenLines.length) {
      throw new Error("Input exhausted.");
    }
    const tokens = processedTokenLines[lineCursor];
    lineCursor++;
    tokenCursor = 0;
    return stringFormat ? tokens : tokens.map(Number);
  };

  const extractGridData = (count, stringFormat = false) => {
    const segment = processedTokenLines.slice(lineCursor, lineCursor + count);
    lineCursor += count;
    tokenCursor = 0;
    return stringFormat ? segment : segment.map(row => row.map(Number));
  };

  const extractNumericVector = (count, stringFormat = false) => {
    const segment = allOriginalLines.slice(lineCursor, lineCursor + count);
    lineCursor += count;
    tokenCursor = 0;
    return stringFormat ? segment : segment.map(Number);
  };

  return {
    fetchNumber: extractNextNumber,
    fetchLine: extractLineTokens,
    fetchMatrix: extractGridData,
    fetchVector: extractNumericVector,
  };
};

const buildNestedArray = (initialValue, ...dimensions) => {
  const createLevel = (levelIndex) => {
    if (levelIndex === dimensions.length - 1) {
      return Array(dimensions[levelIndex]).fill(initialValue);
    } else {
      return Array(dimensions[levelIndex]).fill(null).map(() => createLevel(levelIndex + 1));
    }
  };
  return createLevel(0);
};

const primeDivisor = 998244353;

const getModularProduct = (operand1, operand2) => {
  const highPart1 = operand1 >>> 16;
  const lowPart1 = operand1 & 0xFFFF;

  const termHigh = (highPart1 * operand2 % primeDivisor * 0x10000) % primeDivisor;
  const termLow = (lowPart1 * operand2) % primeDivisor;

  return (termHigh + termLow) % primeDivisor;
};

const chainModularProduct = (...values) => {
  if (values.length === 0) return 1;
  return values.reduce((accumulator, currentVal) => getModularProduct(accumulator, currentVal));
};

const powerWithMod = (base, exponent) => {
  if (exponent === 0) return 1;
  if (exponent < 0) throw new Error("Negative exponents are not supported.");
  
  const squaredBase = getModularProduct(base, base);
  let partialResult = powerWithMod(squaredBase, Math.floor(exponent / 2));
  
  if (exponent % 2 === 1) {
    partialResult = getModularProduct(partialResult, base);
  }
  return partialResult;
};

const solveDynamicProblem = (elements, initialDPState, multiplierForSelf = 1) => {
  return elements.reduce((currentDP, elementVal) => {
    const maxCurrentSum = currentDP.length - 1;
    const newMaxSum = maxCurrentSum + elementVal;
    const nextDP = buildNestedArray(0, newMaxSum + 1);

    currentDP.forEach((waysToSum, sumIndex) => {
      if (waysToSum === 0) return;

      nextDP[sumIndex] = (nextDP[sumIndex] + chainModularProduct(waysToSum, multiplierForSelf)) % primeDivisor;
      nextDP[sumIndex + elementVal] = (nextDP[sumIndex + elementVal] + waysToSum) % primeDivisor;
    });
    return nextDP;
  }, initialDPState);
};

const findSpecificSumWays = (numberSequence, targetSum) => {
  const finalDP = solveDynamicProblem(numberSequence, [1], 1);
  const ways = finalDP[targetSum] || 0;
  return chainModularProduct(ways, 3);
};

const calculateOutcome = (dataProcessor) => {
  const quantity = dataProcessor.fetchNumber();
  const values = dataProcessor.fetchVector(quantity).sort((v1, v2) => v1 - v2);
  const totalValueSum = values.reduce((acc, val) => acc + val, 0);

  const mainDPResult = solveDynamicProblem(values, [1], 2);

  let finalResult = powerWithMod(3, quantity);

  if (totalValueSum % 2 === 0) {
    const targetHalfSum = totalValueSum / 2;
    finalResult = (finalResult + findSpecificSumWays(values, targetHalfSum)) % primeDivisor;
  }

  const subtractionStartIdx = Math.floor((totalValueSum + 1) / 2);

  const totalSubtraction = mainDPResult.slice(subtractionStartIdx).reduce((acc, dpValue) => {
    if (dpValue === 0) return acc;
    return (acc + chainModularProduct(dpValue, 3)) % primeDivisor;
  }, 0);

  finalResult = (finalResult - totalSubtraction + primeDivisor) % primeDivisor;

  return finalResult;
};

const fileContent = require("fs").readFileSync("/dev/stdin","utf8");
const inputHandler = makeInputReader(fileContent);
console.log(calculateOutcome(inputHandler));