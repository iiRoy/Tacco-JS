const adjustNumericValue = (inputVal, exponentParam) => {
  // Check for undefined or zero exponent parameter, performing standard rounding if so.
  if (typeof exponentParam === 'undefined' || Number(exponentParam) === 0) {
    return Math.round(inputVal);
  }

  // Convert inputs to numbers
  let processedVal = Number(inputVal);
  let processedExp = Number(exponentParam);

  // Validate inputs: return NaN if value is not a number, or exponent is not an integer.
  if (Number.isNaN(processedVal) || !(typeof processedExp === 'number' && processedExp % 1 === 0)) {
    return Number.NaN;
  }

  // Handle non-finite numbers (Infinity, -Infinity) which the original code converts to NaN via string manipulation.
  if (!Number.isFinite(processedVal)) {
    return Number.NaN;
  }

  // Define a custom rounding function that replicates Math.round's behavior for all numbers
  const applyExactRounding = (numToRound) => {
    if (numToRound >= 0) {
      return Math.floor(numToRound + 0.5);
    } else {
      return Math.ceil(numToRound - 0.5);
    }
  };

  // Determine the scaling factor using powers of 10.
  const numericalBase = 10;
  const scalingMultiplier = Math.pow(numericalBase, processedExp);

  // First transformation: divide the value by the scaling factor (equivalent to value * 10^-exp)
  let downScaled = processedVal / scalingMultiplier;

  // Apply the custom rounding to the down-scaled value
  let adjustedScaled = applyExactRounding(downScaled);

  // Second transformation: multiply the rounded value back by the scaling factor (equivalent to rounded_value * 10^exp)
  let finalOutput = adjustedScaled * scalingMultiplier;

  return finalOutput;
};

module.exports = adjustNumericValue;