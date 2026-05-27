function processInput(inputString) {
  const numericStrings = inputString.split('\n').filter(Boolean);

  if (numericStrings.length === 0) {
    console.log(0);
    return;
  }

  let totalRoundedSum = 0;
  let minimumEffectiveRemainder = 11; // Represents the 'sort key' from the original, initialized higher than any possible value (1-10)

  for (const currentString of numericStrings) {
    const currentNumericValue = Number(currentString);
    const currentRemainder = currentNumericValue % 10;
    
    // The original code uses 10 for numbers divisible by 10 as a sort key.
    // This 'effective remainder' determines which number gets the special treatment.
    const effectiveRemainderForSorting = currentRemainder === 0 ? 10 : currentRemainder;

    // Accumulate the sum as if all numbers were rounded up to the nearest multiple of 10.
    totalRoundedSum += Math.ceil(currentNumericValue / 10) * 10;

    // Track the smallest 'effective remainder' found so far.
    if (effectiveRemainderForSorting < minimumEffectiveRemainder) {
      minimumEffectiveRemainder = effectiveRemainderForSorting;
    }
  }

  // The original logic adds the first item (smallest effective remainder) as its original value,
  // and all subsequent items as their rounded-up value.
  // Our `totalRoundedSum` has all items rounded up.
  // To correct this, we subtract the 'rounding penalty' of the item that should have been kept as its original value.
  // The rounding penalty for a number with `effectiveRemainderForSorting` is `(10 - effectiveRemainderForSorting) % 10`.
  // For example, if effectiveRemainderForSorting is 3 (e.g., 23), the penalty is (10-3)%10 = 7.
  // If effectiveRemainderForSorting is 10 (e.g., 20), the penalty is (10-10)%10 = 0.
  const roundingPenaltyToSubtract = (10 - minimumEffectiveRemainder) % 10;
  const finalCalculatedSum = totalRoundedSum - roundingPenaltyToSubtract;

  console.log(finalCalculatedSum);
}

processInput(require('node:fs').readFileSync(0, 'utf8'));
