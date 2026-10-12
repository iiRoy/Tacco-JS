function main(inputLines) {
  const parseNumericLine = (lineStr) => lineStr.split(" ").map(s => Number(s));

  const initialParameters = parseNumericLine(inputLines[0]);
  const monsterCount = initialParameters[0];
  const bombRange = initialParameters[1];
  const bombDamage = initialParameters[2];

  const monsterPositions = [];
  for (let lineIndex = 1; lineIndex <= monsterCount; lineIndex++) {
    monsterPositions.push(parseNumericLine(inputLines[lineIndex]));
  }

  monsterPositions.sort((monsterA, monsterB) => monsterA[0] - monsterB[0]);

  let totalBombDrops = 0;
  const effectiveBlastDiameter = bombRange * 2;

  for (let currentMonsterIndex = 0; currentMonsterIndex < monsterCount; currentMonsterIndex++) {
    const currentMonsterData = monsterPositions[currentMonsterIndex];
    const currentMonsterHealth = currentMonsterData[1];

    if (currentMonsterHealth > 0) {
      const bombsRequiredForCurrent = Math.ceil(currentMonsterHealth / bombDamage);
      totalBombDrops += bombsRequiredForCurrent;

      const blastReachLimit = currentMonsterData[0] + effectiveBlastDiameter + 1;

      for (let affectedMonsterIndex = currentMonsterIndex; affectedMonsterIndex < monsterCount; affectedMonsterIndex++) {
        const targetMonsterData = monsterPositions[affectedMonsterIndex];

        if (targetMonsterData[0] <= blastReachLimit) {
          targetMonsterData[1] -= bombDamage * bombsRequiredForCurrent;
        } else {
          break;
        }
      }
    }
  }

  console.log(totalBombDrops);
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");
main(inputData);
