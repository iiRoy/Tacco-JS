console.log((inputStr => {
  // Parse the input string: first line contains entityCount, primaryDamage, secondaryEffect.
  // Subsequent lines contain individual entity health values.
  const [[entityCount, primaryDamage, secondaryEffect], ...entityHealths] = inputStr
    .trim()
    .split('\n') // Split input into separate lines
    .map(lineContent => lineContent.split(' ').map(numericValue => numericValue | 0)); // Parse each line into integers

  // Initialize bounds for binary search.
  // 'upperLimit' represents a potential maximum number of attacks.
  // 'lowerLimit' represents a potential minimum number of attacks.
  let upperLimit = Math.ceil(1e9 / secondaryEffect); // A sufficiently large initial upper bound
  let lowerLimit = 0; // The smallest possible number of attacks

  // Perform a binary search to find the minimum number of attacks required.
  searchProcess: while (upperLimit > lowerLimit + 1) {
    // Calculate the midpoint for the current search range.
    let midValue = (upperLimit + lowerLimit) >> 1;
    // Initialize 'attackBudget' with the current 'midValue'.
    let attackBudget = midValue;

    // Iterate through each entity's health to determine if 'midValue' attacks are sufficient.
    for (let entityIndex = 0; entityIndex < entityCount; entityIndex++) {
      // Calculate the remaining health of the current entity after 'midValue' attacks,
      // considering the secondary effect (regeneration).
      let currentHealthRemaining = entityHealths[entityIndex] - midValue * secondaryEffect;

      // If the entity's health is already non-positive, no further attacks are needed for it.
      if (currentHealthRemaining <= 0) {
        continue;
      }

      // If the entity still has health, calculate how many additional attacks are needed
      // using the primary damage, and subtract this from the 'attackBudget'.
      // Note: (primaryDamage - secondaryEffect) must be positive for this to work.
      attackBudget -= Math.ceil(currentHealthRemaining / (primaryDamage - secondaryEffect));
    }

    // Adjust the search bounds based on whether the 'attackBudget' is sufficient.
    if (attackBudget >= 0) {
      // If 'attackBudget' is non-negative, 'midValue' is a possible answer or too high.
      upperLimit = midValue;
    } else {
      // If 'attackBudget' is negative, 'midValue' is too low.
      lowerLimit = midValue;
    }
  }

  // The 'upperLimit' now holds the minimum number of attacks.
  return `${upperLimit}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
