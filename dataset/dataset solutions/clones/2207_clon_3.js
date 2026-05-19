'use strict'

const calculateImpact = (currentHealth, attackPower, damageMultiplier) => {
  let effectiveAttackPower = attackPower;
  if (effectiveAttackPower > currentHealth) {
    effectiveAttackPower = currentHealth;
  }
  const impactRatio = currentHealth / effectiveAttackPower;
  return impactRatio * damageMultiplier;
};

const parseInitialGameParams = (lineContent) => {
  const numericParts = lineContent.split(' ').map(Number);
  return { initialHealth: numericParts[0] };
};

const parseAttackDefinitions = (lines) => {
  return lines.map(attackLine => attackLine.split(' ').map(Number));
};

function processGame(inputData) {
  const allInputLines = inputData.trim().split('\n');

  const firstLineContent = allInputLines.shift();
  const gameParameters = parseInitialGameParams(firstLineContent);
  let remainingHealth = gameParameters.initialHealth;

  const availableAttacks = parseAttackDefinitions(allInputLines);

  let totalScore = 0;

  const ATTACK_POWER_INDEX = 0;
  const SCORE_GAIN_INDEX = 1;

  while (remainingHealth > 0) {
    const sortedAttackOptions = availableAttacks.sort((attackA, attackB) => {
      const impactA = calculateImpact(remainingHealth, attackA[ATTACK_POWER_INDEX], attackA[SCORE_GAIN_INDEX]);
      const impactB = calculateImpact(remainingHealth, attackB[ATTACK_POWER_INDEX], attackB[SCORE_GAIN_INDEX]);
      return impactA - impactB;
    });

    const chosenAttack = sortedAttackOptions[0];
    const attackValue = chosenAttack[ATTACK_POWER_INDEX];
    const scoreValue = chosenAttack[SCORE_GAIN_INDEX];

    remainingHealth -= attackValue;
    totalScore += scoreValue;
  }

  console.log({ totalScore });
}

processGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
