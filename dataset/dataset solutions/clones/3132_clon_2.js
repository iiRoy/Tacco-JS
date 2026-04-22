"use strict"

// This subroutine applies a bitwise XOR operation to flip a specific bit.
function toggleBitVal(origVal, bitPosition) {
  return origVal ^ (1 << bitPosition);
}

// Recursively constructs a Gray code sequence into the provided array.
function computeGraySequence(sequenceContainer, currentBitIdx) {
  // currentBitIdx denotes the power of 2 for the bit currently being processed.
  // sequenceContainer will store the computed 2^n numbers.
  if (currentBitIdx > 0) {
    computeGraySequence(sequenceContainer, currentBitIdx - 1);
    sequenceContainer.push(toggleBitVal(sequenceContainer[sequenceContainer.length - 1], currentBitIdx));
    computeGraySequence(sequenceContainer, currentBitIdx - 1);
    return;
  }
  // Base condition: if the bit index is zero, simply XOR the last element with 1.
  if (currentBitIdx === 0) sequenceContainer.push(sequenceContainer[sequenceContainer.length - 1] ^ 1);
  return;
}

// Generates an array of values representing steps to change a bit string
// from all zeros to all ones, based on an inverted Gray code logic.
function generateInvertedGray(pathSteps, dimensionFactor) {
  // This procedure fills 'pathSteps' with the necessary transitions
  // to achieve a full inversion of bits over 2*dimensionFactor+1 positions.
  let temporarySeries = [0];
  computeGraySequence(temporarySeries, 2 * dimensionFactor);
  temporarySeries.shift(); // Remove the initial zero entry.

  for (let primaryIndex = 0; primaryIndex < 2 * dimensionFactor; primaryIndex++) {
    // Filter the temporary series, keeping only elements where the current bit is zero.
    temporarySeries = temporarySeries.filter(numericElement => (numericElement >> primaryIndex) % 2 === 0);

    const precedingValue = pathSteps[pathSteps.length - 1]; // Obtain the last value from the result array.
    for (let secondaryIndex = 0; secondaryIndex < temporarySeries.length; secondaryIndex++)
      pathSteps.push(precedingValue ^ temporarySeries[secondaryIndex]);
    pathSteps.push(pathSteps[pathSteps.length - 1] ^ (1 << primaryIndex));
  }
  pathSteps.push(pathSteps[pathSteps.length - 1] ^ (1 << (2 * dimensionFactor)));
}

// The primary function to execute the transformation logic.
function ExecuteTransformation(inputData) {
  // Pre-process the raw input string into an array of numeric values.
  inputData = inputData.trim().split(/\s+/).map(strNum => strNum - 0);

  const totalBitLength = inputData.shift(); // The first input value (N).
  const initialNumber = inputData.shift(); // The second input value (A).
  const finalNumber = inputData.shift(); // The third input value (B).

  let differenceValue = initialNumber ^ finalNumber; // Calculate the XOR difference (A ^ B).

  const zeroBitIndices = []; // Stores indices where the differenceValue has a 0 bit.
  const oneBitIndices = []; // Stores indices where the differenceValue has a 1 bit.

  // Iterate through each bit position to categorize them based on differenceValue.
  for (let currentBit = 0; currentBit < totalBitLength; currentBit++) {
    (differenceValue % 2 === 0) ? zeroBitIndices.push(currentBit) : oneBitIndices.push(currentBit);
    differenceValue = Math.floor(differenceValue / 2); // Shift bits to the right.
  }

  // If the count of '1' bits in the XOR difference is even, no solution exists.
  if (oneBitIndices.length % 2 === 0) {
    console.log('NO');
    return;
  }

  console.log('YES'); // A valid transformation path can be generated.

  // Generate the Gray code sequence for bits identified as zero in the difference.
  let zeroComponentSequence = [0];
  computeGraySequence(zeroComponentSequence, zeroBitIndices.length - 1);
  // Convert the generic Gray codes into values specific to their original bit positions.
  for (let seqIndex = 0; seqIndex < zeroComponentSequence.length; seqIndex++) {
    let accumulatedValue = 0;
    for (let bitPosition = 0; bitPosition < zeroBitIndices.length; bitPosition++) {
      accumulatedValue += ((zeroComponentSequence[seqIndex] >> bitPosition) % 2) * Math.pow(2, zeroBitIndices[bitPosition]);
    }
    zeroComponentSequence[seqIndex] = accumulatedValue;
  }
  zeroComponentSequence.shift(); // Remove the initial zero after processing.

  // Generate the inverted Gray sequence for bits identified as one in the difference.
  let oneComponentSequence = [0];
  generateInvertedGray(oneComponentSequence, oneBitIndices.length - 1);
  // Convert these codes into values specific to their original bit positions.
  for (let seqIndex = 0; seqIndex < oneComponentSequence.length; seqIndex++) {
    let accumulatedValue = 0;
    for (let bitPosition = 0; bitPosition < oneBitIndices.length; bitPosition++) {
      accumulatedValue += ((oneComponentSequence[seqIndex] >> bitPosition) % 2) * Math.pow(2, oneBitIndices[bitPosition]);
    }
    oneComponentSequence[seqIndex] = accumulatedValue;
  }
  oneComponentSequence.shift(); // Remove the initial zero after processing.

  // Construct the complete sequence of numbers for the transformation path.
  const finalSequence = [initialNumber];
  for (let i_outer = 0; i_outer < oneComponentSequence.length; i_outer++) {
    const lastElement = finalSequence[finalSequence.length - 1]; // Fetch the most recent value.
    for (let j_inner = 0; j_inner < zeroComponentSequence.length; j_inner++) {
      finalSequence.push(lastElement ^ zeroComponentSequence[j_inner]);
    }
    finalSequence.push(finalSequence[finalSequence.length - 1] ^ oneComponentSequence[i_outer]);
  }
  finalSequence.push(finalNumber); // Append the target number to conclude the path.

  console.log(finalSequence.join(' ')); // Output the entire path as a space-separated string.
}

// Invoke the main process by reading input from standard input.
ExecuteTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));