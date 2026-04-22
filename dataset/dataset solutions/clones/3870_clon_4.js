function calculateOutcome(sourceString) {
  const processedPortion = sourceString.trim().slice(0, 3);
  const characterArray = Array.from(processedPortion);
  const relevantMarks = characterArray.filter(
    (unitSymbol) => unitSymbol === 'o'
  );
  const totalScore = 700 + (relevantMarks.length * 100);
  console.log(totalScore);
}

calculateOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));