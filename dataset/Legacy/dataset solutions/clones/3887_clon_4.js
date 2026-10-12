'use strict';

function calculateOptimalPurchase(inputData) {
  const numericValues = inputData
    .split('\n')[0]
    .split(' ')
    .map(val => parseInt(val, 10));

  const priceOfA = numericValues[0];
  const priceOfB = numericValues[1];
  const priceOfCombo = numericValues[2];
  const quantityA = numericValues[3];
  const quantityB = numericValues[4];

  let minimumTotalCost = Infinity;

  const maxComboCount = Math.max(quantityA, quantityB);

  for (let comboUnits = 0; comboUnits <= maxComboCount; comboUnits++) {
    const costFromCombos = comboUnits * priceOfCombo * 2;

    const remainingA = Math.max(0, quantityA - comboUnits);
    const costFromRemainingA = remainingA * priceOfA;

    const remainingB = Math.max(0, quantityB - comboUnits);
    const costFromRemainingB = remainingB * priceOfB;

    const currentScenarioCost = costFromCombos + costFromRemainingA + costFromRemainingB;

    minimumTotalCost = Math.min(minimumTotalCost, currentScenarioCost);
  }

  console.log(minimumTotalCost);
}

calculateOptimalPurchase(require("fs").readFileSync("/dev/stdin", "utf8"));
