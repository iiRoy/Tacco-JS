const processInput = (inputString) => {
  return BigInt(inputString.trim());
};

const solveProblem = (targetValue) => {
  const searchRangeLimit = 100n;
  const powerCache = new Map();
  const reversePowerCache = new Map();

  for (let currentNum = 0n; currentNum < searchRangeLimit; currentNum++) {
    const calculatedPower = currentNum ** 5n;
    powerCache.set(currentNum, calculatedPower);
    reversePowerCache.set(calculatedPower, currentNum);
  }

  for (let firstOperand = 0n; firstOperand < searchRangeLimit; firstOperand++) {
    const firstPower = powerCache.get(firstOperand);

    const requiredSecondPowerSub = firstPower - targetValue;
    if (reversePowerCache.has(requiredSecondPowerSub)) {
      const secondOperand = reversePowerCache.get(requiredSecondPowerSub);
      return `${firstOperand} ${secondOperand}`;
    }

    const requiredSecondPowerAdd = targetValue - firstPower;
    if (reversePowerCache.has(requiredSecondPowerAdd)) {
      const secondOperand = reversePowerCache.get(requiredSecondPowerAdd);
      return `${firstOperand} ${-secondOperand}`;
    }
  }
};

const entryPoint = (inputData) => {
  const parsedInput = processInput(inputData);
  const result = solveProblem(parsedInput);
  console.log(result);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : entryPoint(require('fs').readFileSync('dev/stdin', 'utf8')))
  : entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
