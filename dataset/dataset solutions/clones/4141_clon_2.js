// This module processes incoming data.
function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  rawData = rawData.split("\n");

  // Parse the first line to get key parameters.
  let firstLineParts = rawData[0].split(" ");

  // Initialize variables for the problem.
  const itemCount = parseInt(firstLineParts[0], 10);
  const targetValue = parseInt(firstLineParts[1], 10);

  let attackValues = [];
  let specialValues = [];
  let effectiveSpecials = [];
  let lineSegments = [];

  let actionCounter = 0;
  let cumulativeDamage = 0;
  let currentDamage = 0;

  // Populate attack and special values from subsequent input lines.
  for (let idx = 1; idx <= itemCount; idx++) {
    lineSegments[idx] = rawData[idx].split(" ");
    attackValues[idx] = lineSegments[idx][0];
    specialValues[idx] = lineSegments[idx][1];
  }

  // Determine the maximum attack power.
  let maxAttackPower = 0;
  for (let idx = 1; idx <= attackValues.length; idx++) {
    if (maxAttackPower < attackValues[idx]) {
      maxAttackPower = attackValues[idx];
    }
  }

  // Identify and collect special attacks that are more powerful than the max regular attack.
  for (let idx = 1; idx <= specialValues.length; idx++) {
    if (maxAttackPower < specialValues[idx]) {
      effectiveSpecials.push(parseInt(specialValues[idx], 10));
    }
  }

  // Calculate the total damage from all effective special attacks.
  for (let idx = 0; idx < effectiveSpecials.length; idx++) {
    cumulativeDamage += effectiveSpecials[idx];
  }

  // Decide the strategy based on whether special attacks alone are sufficient.
  if (cumulativeDamage < targetValue) {
    // If special attacks are not enough, calculate remaining target value.
    let remainingTarget = targetValue - cumulativeDamage;
    let fullHitsRequired = parseInt(remainingTarget / maxAttackPower, 10);

    // Add an extra hit if there's any remainder.
    if (remainingTarget % maxAttackPower !== 0) {
      actionCounter++;
    }

    // Sum up all actions taken.
    actionCounter += effectiveSpecials.length;
    actionCounter += fullHitsRequired;
  } else {
    // If special attacks are sufficient, sort them in descending order.
    effectiveSpecials.sort(function (valA, valB) {
      if (valA > valB) return -1;
      if (valA < valB) return 1;
      return 0;
    });

    // Count the first action.
    actionCounter++;

    // Iterate through sorted special attacks to reach the target.
    for (let idx = 0; idx < effectiveSpecials.length; idx++) {
      currentDamage += effectiveSpecials[idx];
      if (targetValue > currentDamage) {
        actionCounter++;
      }
    }
  }

  // Output the final count of actions.
  console.log(actionCounter);
}

// The following line should not be modified (it reads input and calls the main processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
