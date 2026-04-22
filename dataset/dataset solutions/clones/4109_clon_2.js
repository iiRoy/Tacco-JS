"use strict";

const processInput = ( inputData ) => {

  inputData = inputData.trim().split("\n");
  const numItems = parseInt(inputData[0].split(" ")[0]);
  let initialHealth = parseInt(inputData[0].split(" ")[1]);
  const itemStats = inputData.slice(1, numItems + 1).map(  statPair => statPair.split(" ")  );

  let maxAttackPower = 0;
  let maxAttackIndex = 0;
  let totalThrowDamage = 0;

  for (let idx in itemStats) {
    const currentAttack = parseInt(itemStats[idx][0]);
    const currentThrow = parseInt(itemStats[idx][1]);

    totalThrowDamage += currentThrow;

    if (currentAttack > maxAttackPower) {
      maxAttackIndex = idx;
      maxAttackPower = currentAttack;
    }
  }

  let bestWeaponStats = itemStats[maxAttackIndex];

  // First, if all weapons thrown can defeat the target, that's the best strategy.
  if (totalThrowDamage >= initialHealth) {
    console.log(numItems);
    return;
  }

  // There's no need to use weapons with weak regular attacks.
  // Throw all weapons except the one with the highest regular attack.
  if (numItems > 1) {
    initialHealth -= totalThrowDamage - itemStats[maxAttackIndex][1];
  }

  // It's sufficient to ceil ((remaining HP - thrown damage of best weapon) / regular attack power of best weapon).
  const finalHealthRemaining = initialHealth - itemStats[maxAttackIndex][1];

  // Number of swings for the best weapon + number of thrown weapons.
  const totalActionsNeeded = Math.ceil(finalHealthRemaining / itemStats[maxAttackIndex][0]);

  console.log(totalActionsNeeded);

  // There's a special case when only one item exists.
  console.log(numItems === 1 ? totalActionsNeeded + 1 : totalActionsNeeded + (numItems - 1));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));