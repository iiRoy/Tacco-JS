const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedNumbers = rawInput.split('\n').map(Number);

let finalResult;

if (parsedNumbers.length === 0) {
  finalResult = NaN;
} else {
  const extrema = parsedNumbers.reduce(
    (currentExtrema, val) => {
      return {
        lowValue: Math.min(currentExtrema.lowValue, val),
        highValue: Math.max(currentExtrema.highValue, val),
      };
    },
    { lowValue: Infinity, highValue: -Infinity }
  );

  finalResult = (extrema.highValue * 10 - extrema.lowValue * 10) / 10;
}

console.log(finalResult);
