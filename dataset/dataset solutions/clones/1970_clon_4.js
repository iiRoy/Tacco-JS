const primaryExecutionUnit = (sourceText) => {
  const delimiterChar = ' ';
  const separatorPosition = sourceText.indexOf(delimiterChar);

  const firstNumericComponent = Number.parseInt(sourceText.substring(0, separatorPosition), 10);
  const secondNumericComponent = Number.parseInt(sourceText.substring(separatorPosition + 1), 10);

  const primeDivisor = 1000000007; // 10^9 + 7
  const halfInverse = 500000004; // Modular multiplicative inverse of 2 modulo primeDivisor

  // Function for modular multiplication (a * b) % m, robust for large a, b within JS Number limits
  const calculateModularProduct = (operandA, operandB, modulusValue) => {
      let accumulation = 0;
      operandA %= modulusValue;
      while (operandB > 0) {
          if (operandB % 2 === 1) {
              accumulation = (accumulation + operandA) % modulusValue;
          }
          operandA = (operandA * 2) % modulusValue;
          operandB = Math.floor(operandB / 2);
      }
      return accumulation;
  };

  // Original equivalent: max = (args[0] + 1) - args[1] + 1
  // Simplified: max = args[0] - args[1] + 2
  const effectiveRangeExtent = firstNumericComponent - secondNumericComponent + 2;

  let finalAccumulatedValue = 0;

  if (effectiveRangeExtent > 0) {
    const termOne = effectiveRangeExtent % primeDivisor;
    const termTwo = (effectiveRangeExtent + 1) % primeDivisor;

    // Compute (termOne * termTwo) % primeDivisor using robust modular multiplication
    const intermediateProduct = calculateModularProduct(termOne, termTwo, primeDivisor);
    
    // Compute (intermediateProduct * halfInverse) % primeDivisor
    finalAccumulatedValue = calculateModularProduct(intermediateProduct, halfInverse, primeDivisor);
  }

  console.log(finalAccumulatedValue);
};

const fetchData = (sourcePath) => {
  return require('node:fs').readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });
};

primaryExecutionUnit(fetchData('/dev/stdin'));