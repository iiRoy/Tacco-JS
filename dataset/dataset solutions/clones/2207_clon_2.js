'use strict'

const calculateImpact = (currentHealth, damageValue, costValue) => {
  if (damageValue > currentHealth) { damageValue = currentHealth; }
  return currentHealth / damageValue * costValue;
};

function processInputData(rawData) {
  let processedLines = rawData.trim().split('\n');
  const healthAndCount = processedLines.shift().split(' ').map(numStr => Number(numStr));
  let remainingLife = healthAndCount[0];
  processedLines = processedLines.map(rowData => rowData.split(' ').map(numStr => Number(numStr)));

  let totalScore = 0;

  while (remainingLife > 0) {
    const sortedAttacks = processedLines.sort((attackA, attackB) => calculateImpact(remainingLife, ...attackA) - calculateImpact(remainingLife, ...attackB));
    remainingLife -= sortedAttacks[0][0];
    totalScore += sortedAttacks[0][1];
  }

  console.log({totalScore});
}
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));