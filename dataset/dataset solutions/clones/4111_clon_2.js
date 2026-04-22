"use strict";

const executeBattleSimulation = inputString => {
  inputString = inputString.trim().split("\n");
  const weaponQuantity = parseInt(inputString[0].split(" ")[0]);
  let monsterHealth = parseInt(inputString[0].split(" ")[1]);
  const weaponDataCollection = inputString.slice(1, weaponQuantity + 1).map(item => item.split(" "));

  let highestSwingStrength = 0;
  let bestWeaponPosition = 0;
  let cumulativeThrowDamage = 0;

  for (let weaponIterator in weaponDataCollection) {
    const swingDamage = parseInt(weaponDataCollection[weaponIterator][0]);
    const throwDamage = parseInt(weaponDataCollection[weaponIterator][1]);

    cumulativeThrowDamage += throwDamage;

    if (swingDamage > highestSwingStrength) {
      bestWeaponPosition = weaponIterator;
      highestSwingStrength = swingDamage;
    }
  }

  let optimalWeaponDetails = weaponDataCollection[bestWeaponPosition];

  // First, check if throwing all items is enough to defeat the foe.
  // This is the most efficient strategy if it works.
  if (cumulativeThrowDamage >= monsterHealth) {
    console.log(weaponQuantity);
    return;
  }

  // There's no point in using a weak weapon for regular attacks.
  // We throw all weapons except for the one with the highest regular attack power.
  if (weaponQuantity > 1) {
    monsterHealth -= cumulativeThrowDamage - weaponDataCollection[bestWeaponPosition][1];
  }

  // Calculate the remaining health and divide by the strongest regular attack.
  // Round up to get the number of swings needed.
  const remainingMonsterHealth = monsterHealth - weaponDataCollection[bestWeaponPosition][1];

  // The total number of actions: swings with the strongest weapon + previously thrown items.
  const calculatedAttackCount = Math.ceil(remainingMonsterHealth / weaponDataCollection[bestWeaponPosition][0]);

  // Special handling for the scenario where only one weapon exists.
  console.log(weaponQuantity === 1 ? calculatedAttackCount + 1 : calculatedAttackCount + (weaponQuantity - 1));
};

executeBattleSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));