'use strict';

const applyModulo = (value, modConstant) => (value % modConstant + modConstant) % modConstant;

function processInputData(rawData) {
  const MODULO_CONST = 998244353;
  const LARGE_POWER_OF_TWO = Math.pow(2, 50);

  const trimmedInput = rawData.trim();
  const stringNumbers = trimmedInput.split(/\s+/);
  const parsedNumbers = stringNumbers.map(val => Number(val));

  const numElements = parsedNumbers.shift();
  const inputValues = parsedNumbers;

  const totalSum = inputValues.reduce((acc, current) => acc + current, 0);
  const targetHalfSum = Math.floor(totalSum / 2);

  const powerOfTwoFactors = [3];
  for (let i = 1; i < numElements; ++i) {
    powerOfTwoFactors.push(applyModulo(powerOfTwoFactors[i - 1] * 2, MODULO_CONST));
  }

  const dynamicProgTable = Array.from({ length: numElements + 1 }, (_, elementIdx) =>
    Array.from({ length: elementIdx + 1 }, () =>
      Array(targetHalfSum + 1).fill(0)
    )
  );

  dynamicProgTable[0][0][0] = 1;

  for (let elementIdx = 0; elementIdx < numElements; ++elementIdx) {
    const currentInputValue = inputValues[elementIdx];
    for (let countUsed = 0; countUsed <= elementIdx; ++countUsed) {
      for (let currentSum = 0; currentSum <= targetHalfSum; ++currentSum) {
        dynamicProgTable[elementIdx + 1][countUsed][currentSum] = applyModulo(
          dynamicProgTable[elementIdx + 1][countUsed][currentSum] +
          dynamicProgTable[elementIdx][countUsed][currentSum],
          MODULO_CONST
        );

        if (currentSum + currentInputValue <= targetHalfSum) {
          dynamicProgTable[elementIdx + 1][countUsed + 1][currentSum + currentInputValue] = applyModulo(
            dynamicProgTable[elementIdx + 1][countUsed + 1][currentSum + currentInputValue] +
            dynamicProgTable[elementIdx][countUsed][currentSum],
            MODULO_CONST
          );
        }
      }
    }
  }

  let finalResult = 1;

  for (let idx = 0; idx < numElements; ++idx) {
    finalResult = applyModulo(finalResult * 3, MODULO_CONST);
  }

  for (let idx = 0; idx < numElements; ++idx) {
    const currentFactor = powerOfTwoFactors[idx];

    let subArraySumCount = 0;
    for (let sumVal = 0; sumVal <= targetHalfSum; ++sumVal) {
      subArraySumCount = applyModulo(subArraySumCount + dynamicProgTable[numElements][idx][sumVal], MODULO_CONST);
    }
    
    finalResult = applyModulo(finalResult - applyModulo(currentFactor * subArraySumCount, MODULO_CONST), MODULO_CONST);
  }

  finalResult = applyModulo(finalResult, MODULO_CONST);

  if (totalSum % 2 === 0) {
    for (let countUsed = 0; countUsed <= numElements; ++countUsed) {
      finalResult = applyModulo(finalResult + applyModulo(3 * dynamicProgTable[numElements][countUsed][targetHalfSum], MODULO_CONST), MODULO_CONST);
    }
  }

  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
