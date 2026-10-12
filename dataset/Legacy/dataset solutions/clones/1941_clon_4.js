function engageCombat(battleInput) {
  const combatantStats = battleInput.split(' ').map(Number);

  const firstFighterHealth = combatantStats[0];
  const firstFighterAttack = combatantStats[1];
  const secondFighterHealth = combatantStats[2];
  const secondFighterAttack = combatantStats[3];

  const hitsForFirstToWin = Math.ceil(secondFighterHealth / firstFighterAttack);

  const hitsForSecondToWin = Math.ceil(firstFighterHealth / secondFighterAttack);

  if (hitsForFirstToWin <= hitsForSecondToWin) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

engageCombat(require('fs').readFileSync('/dev/stdin', 'utf8'));
