function processInput(rawData) {
  const lineSegments = rawData.split('\n');
  const targetString = lineSegments[0];

  const charSequence = targetString.split('');
  const validNucleotides = new Set(['A', 'C', 'G', 'T']);
  
  let longestStreak = 0;
  let currentStreak = 0;

  const isNucleotideChar = (char) => {
    return validNucleotides.has(char);
  };

  for (let idx = 0; idx < charSequence.length; ++idx) {
    const currentChar = charSequence[idx];
    
    if (isNucleotideChar(currentChar)) {
      currentStreak = currentStreak + 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  console.log(longestStreak);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
