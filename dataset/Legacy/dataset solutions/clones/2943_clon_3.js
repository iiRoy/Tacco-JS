'use strict';

function processRawInput(rawDataString) {
  return rawDataString.trim().split(/\s+/).map(val => parseInt(val, 10));
}

function addAndMod(currentSum, valueToAdd, modulus) {
  let newSum = currentSum + valueToAdd;
  return (newSum % modulus + modulus) % modulus;
}

function multiplyAndMod(currentProduct, factor, modulus) {
  let newProduct = currentProduct * factor;
  return (newProduct % modulus + modulus) % modulus;
}

function calculateTermContribution(termA, termB, termC, termD) {
  return (termA + termB + termC) * 2 - termD;
}

function getModularInverse(number, modulus) {
  let remainderSequence = [modulus, number];
  while (remainderSequence[remainderSequence.length - 1] !== 0) {
    let currentDividend = remainderSequence[remainderSequence.length - 2];
    let currentDivisor = remainderSequence[remainderSequence.length - 1];
    remainderSequence.push(currentDividend % currentDivisor);
  }
  remainderSequence.pop();

  let xCoefficients = [1];
  let yCoefficients = [0];

  while (remainderSequence.length > 2) {
    let currentSequenceLength = remainderSequence.length;
    let r_minus_3 = remainderSequence[currentSequenceLength - 3];
    let r_minus_2 = remainderSequence[currentSequenceLength - 2];
    let r_minus_1 = remainderSequence[currentSequenceLength - 1];
    let quotientValue = Math.floor((r_minus_3 - r_minus_1) / r_minus_2);

    let nextX = yCoefficients[yCoefficients.length - 1] - quotientValue * xCoefficients[xCoefficients.length - 1];
    xCoefficients.push(nextX);
    yCoefficients.push(xCoefficients[xCoefficients.length - 2]);
    remainderSequence.pop();
  }
  return xCoefficients[xCoefficients.length - 1];
}

function solveProblem(rawData) {
  const parsedValues = processRawInput(rawData);
  const valN = Math.min(parsedValues[0], parsedValues[1]);
  const valM = Math.max(parsedValues[0], parsedValues[1]);
  const valK = parsedValues[2];
  const modulusVal = Math.pow(10, 9) + 7;

  let finalResult = 0;

  const SIXTH_CONSTANT = 1 / 6;
  const HALF_CONSTANT = 1 / 2;

  for (let currentDist = 1; currentDist <= valN - 1; currentDist++) {
    const dPlus1 = currentDist + 1;
    const dPlus2 = currentDist + 2;
    const dPlus3 = currentDist + 3;

    const termA = SIXTH_CONSTANT * dPlus1 * dPlus2 * dPlus3;

    const nMinusDMinus1 = valN - currentDist - 1;
    const mMinusDMinus1 = valM - currentDist - 1;
    const termB_common_factor = HALF_CONSTANT * dPlus1 * dPlus2;
    const termB = (nMinusDMinus1 + mMinusDMinus1) * termB_common_factor;

    const termC = nMinusDMinus1 * mMinusDMinus1 * dPlus1;

    const nMinusD = valN - currentDist;
    const mMinusD = valM - currentDist;
    const termD = (nMinusD * valM) + (mMinusD * valN);

    const contribution = calculateTermContribution(termA, termB, termC, termD);
    finalResult = addAndMod(finalResult, currentDist * contribution, modulusVal);
  }

  for (let currentDist = valN; currentDist <= valM - 1; currentDist++) {
    const nValue = valN;
    const nPlus1 = valN + 1;
    const nPlus2 = valN + 2;

    const termA = SIXTH_CONSTANT * nValue * nPlus1 * nPlus2;

    const mMinusDMinus1 = valM - currentDist - 1;
    const termB_common_factor = HALF_CONSTANT * nValue * nPlus1;
    const termB = mMinusDMinus1 * termB_common_factor;

    const termC = 0;

    const mMinusD = valM - currentDist;
    const termD = mMinusD * valN;

    const contribution = calculateTermContribution(termA, termB, termC, termD);
    finalResult = addAndMod(finalResult, currentDist * contribution, modulusVal);
  }

  for (let currentDist = valM; currentDist <= valN + valM - 2; currentDist++) {
    const tempA_value = valN + valM - 1 - currentDist;
    const aPlus1 = tempA_value + 1;
    const aPlus2 = tempA_value + 2;

    const termA = SIXTH_CONSTANT * tempA_value * aPlus1 * aPlus2;

    const termB = 0;
    const termC = 0;
    const termD = 0;

    const contribution = calculateTermContribution(termA, termB, termC, termD);
    finalResult = addAndMod(finalResult, currentDist * contribution, modulusVal);
  }

  const nmMinusTwo = valN * valM - 2;
  for (let loopIdx = 0; loopIdx < valK - 2; loopIdx++) {
    finalResult = multiplyAndMod(finalResult, (nmMinusTwo - loopIdx), modulusVal);
  }

  let denominatorValue = 1;
  for (let loopIdx = 1; loopIdx <= valK - 2; loopIdx++) {
    denominatorValue = multiplyAndMod(denominatorValue, loopIdx, valK);
  }

  const modularInverse = getModularInverse(denominatorValue, modulusVal);

  const overflowGuardFactor = 100000;
  let highPart = Math.floor(finalResult / overflowGuardFactor);
  let lowPart = finalResult % overflowGuardFactor;

  let highPartProduct = multiplyAndMod(highPart, modularInverse, modulusVal);
  let lowPartProduct = multiplyAndMod(lowPart, modularInverse, modulusVal);

  let combinedIntermediate = multiplyAndMod(highPartProduct, overflowGuardFactor, modulusVal);
  finalResult = addAndMod(combinedIntermediate, lowPartProduct, modulusVal);

  console.log(finalResult);
}

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
