const ProcessInput = (rawData) => {
  const RAINY_INDICATOR = 'R';
  const inputLines = rawData.split('\n');
  const weatherCharacters = inputLines[0].split('');

  let rainyStreakCount = 0;
  let previousCharacter = '';

  for (let i = 0; i < weatherCharacters.length; i++) {
    const currentCharacter = weatherCharacters[i];

    if (currentCharacter === RAINY_INDICATOR && (previousCharacter === RAINY_INDICATOR || previousCharacter === '')) {
      rainyStreakCount++;
    }

    previousCharacter = currentCharacter;
  }

  console.log(rainyStreakCount);
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
