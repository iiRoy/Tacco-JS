function assessPattern(incomingData) {
  const contentBlocks = incomingData.trim().split('\n');
  const targetString = contentBlocks[1];

  const characterTally = targetString.split('').reduce((accumulator, currentCharacter) => {
    if (currentCharacter === 'R' || currentCharacter === 'B') {
      accumulator[currentCharacter] = (accumulator[currentCharacter] || 0) + 1;
    }
    return accumulator;
  }, {});

  const countOfReds = characterTally['R'] || 0;
  const countOfBlues = characterTally['B'] || 0;

  process.stdout.write(countOfReds > countOfBlues ? "Yes" : "No");
}

assessPattern(require("node:fs").readFileSync(0, "utf8"));