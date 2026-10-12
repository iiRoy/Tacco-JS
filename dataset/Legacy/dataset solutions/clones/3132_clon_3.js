"use strict";

function toggleBit(val, bitPos) {
  const bitMask = 1 << bitPos;
  return val ^ bitMask;
}

function generateGraySequence(sequence, currentBitIndex) {
  if (currentBitIndex > 0) {
    generateGraySequence(sequence, currentBitIndex - 1);
    const lastValueInSequence = sequence[sequence.length - 1];
    sequence.push(toggleBit(lastValueInSequence, currentBitIndex));
    generateGraySequence(sequence, currentBitIndex - 1);
    return;
  }
  if (currentBitIndex === 0) {
    const lastValueInSequence = sequence[sequence.length - 1];
    sequence.push(lastValueInSequence ^ 1);
  }
}

function createInversionSequence(resultSequence, maxBitIndex) {
  const totalBitsForGrayGeneration = 2 * maxBitIndex;
  let temporaryGrayList = [0];
  generateGraySequence(temporaryGrayList, totalBitsForGrayGeneration);
  temporaryGrayList.shift();

  for (let i = 0; i < totalBitsForGrayGeneration; i++) {
    const filteredTemporaryGray = [];
    for (const grayValue of temporaryGrayList) {
      if (((grayValue >> i) & 1) === 0) {
        filteredTemporaryGray.push(grayValue);
      }
    }
    temporaryGrayList = filteredTemporaryGray;

    const currentLastResultElement = resultSequence[resultSequence.length - 1];
    for (let j = 0; j < temporaryGrayList.length; j++) {
      resultSequence.push(currentLastResultElement ^ temporaryGrayList[j]);
    }
    resultSequence.push(toggleBit(resultSequence[resultSequence.length - 1], i));
  }
  resultSequence.push(toggleBit(resultSequence[resultSequence.length - 1], totalBitsForGrayGeneration));
}

function processInput(rawData) {
  const parsedNumericValues = rawData.trim().split(/\s+/).map(s => parseInt(s, 10));
  const totalBits = parsedNumericValues.shift();
  const startValue = parsedNumericValues.shift();
  const endValue = parsedNumericValues.shift();

  let xorDifference = startValue ^ endValue;
  const zeroBitIndices = [];
  const oneBitIndices = [];

  for (let bitPosition = 0; bitPosition < totalBits; bitPosition++) {
    if ((xorDifference & 1) === 0) {
      zeroBitIndices.push(bitPosition);
    } else {
      oneBitIndices.push(bitPosition);
    }
    xorDifference >>= 1;
  }

  if (oneBitIndices.length % 2 === 0) {
    console.log('NO');
    return;
  }
  console.log('YES');

  const graySequenceForZeros = [0];
  const numZeroBits = zeroBitIndices.length;
  if (numZeroBits > 0) {
    generateGraySequence(graySequenceForZeros, numZeroBits - 1);
  } else {
    graySequenceForZeros.shift();
  }

  for (let i = 0; i < graySequenceForZeros.length; i++) {
    let currentAccumulatedValue = 0;
    const originalGrayValue = graySequenceForZeros[i];
    for (let j = 0; j < zeroBitIndices.length; j++) {
      if (((originalGrayValue >> j) & 1) === 1) {
        currentAccumulatedValue |= (1 << zeroBitIndices[j]);
      }
    }
    graySequenceForZeros[i] = currentAccumulatedValue;
  }
  if (numZeroBits > 0) {
    graySequenceForZeros.shift();
  }

  const grayInversionSequenceForOnes = [0];
  const numOneBits = oneBitIndices.length;
  if (numOneBits > 0) {
    createInversionSequence(grayInversionSequenceForOnes, numOneBits - 1);
  } else {
    grayInversionSequenceForOnes.shift();
  }

  for (let i = 0; i < grayInversionSequenceForOnes.length; i++) {
    let currentAccumulatedValue = 0;
    const originalGrayValue = grayInversionSequenceForOnes[i];
    for (let j = 0; j < oneBitIndices.length; j++) {
      if (((originalGrayValue >> j) & 1) === 1) {
        currentAccumulatedValue |= (1 << oneBitIndices[j]);
      }
    }
    grayInversionSequenceForOnes[i] = currentAccumulatedValue;
  }
  if (numOneBits > 0) {
    grayInversionSequenceForOnes.shift();
  }

  const finalResultPath = [startValue];
  for (let i = 0; i < grayInversionSequenceForOnes.length; i++) {
    let lastElementInPath = finalResultPath[finalResultPath.length - 1];
    for (let j = 0; j < graySequenceForZeros.length; j++) {
      finalResultPath.push(lastElementInPath ^ graySequenceForZeros[j]);
    }
    lastElementInPath = finalResultPath[finalResultPath.length - 1];
    finalResultPath.push(lastElementInPath ^ grayInversionSequenceForOnes[i]);
  }
  finalResultPath.push(endValue);
  console.log(finalResultPath.join(' '));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
