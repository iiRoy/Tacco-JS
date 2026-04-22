const analyzeSequence = (rawContent) => {
  const cleanedContent = rawContent.replace(/^\s+|\s+$/g, '');
  const baseCharacters = new Set(['A', 'T', 'C', 'G']);

  const maximumStreak = Array.from(cleanedContent).reduce(
    (accumulator, character) => {
      const latestRun = baseCharacters.has(character) ? accumulator.currentSpan + 1 : 0;
      return {
        currentSpan: latestRun,
        peakSpan: Math.max(accumulator.peakSpan, latestRun),
      };
    },
    { currentSpan: 0, peakSpan: 0 }
  ).peakSpan;

  return maximumStreak;
};

const obtainSourceMaterial = () => require('fs').readFileSync('/dev/stdin', 'UTF-8');
const finalOutcome = analyzeSequence(obtainSourceMaterial());
console.log(finalOutcome);