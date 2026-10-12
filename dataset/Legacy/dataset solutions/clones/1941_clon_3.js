function simulateCombat(rawInputString) {
  const parseNumericValue = (valueString) => {
    const RADIX_BASE = 10;
    return parseInt(valueString, RADIX_BASE);
  };

  const parsedValues = rawInputString.split(' ');

  let combatantA_HP = parseNumericValue(parsedValues[0]);
  let combatantA_Attack = parseNumericValue(parsedValues[1]);
  let combatantB_HP = parseNumericValue(parsedValues[2]);
  let combatantB_Attack = parseNumericValue(parsedValues[3]);

  let isBattleActive = true;

  while (isBattleActive) {
    combatantB_HP -= combatantA_Attack;

    if (combatantB_HP <= 0) {
      isBattleActive = false;
    } else {
      combatantA_HP -= combatantB_Attack;

      if (combatantA_HP <= 0) {
        isBattleActive = false;
      }
    }
  }

  const combatantB_IsDefeated = combatantB_HP <= 0;

  if (combatantB_IsDefeated) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

simulateCombat(require('fs').readFileSync('/dev/stdin', 'utf8'));
