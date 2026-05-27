const processInputCharacter = (sourceData) => {
  const initialChar = sourceData[0];

  const charLength = initialChar.length;

  const mismatchTally = Array.from({ length: Math.floor(charLength / 2) }).reduce(
    (currentMismatchCount, _, index) => {
      const firstPartChar = initialChar[Math.floor(charLength / 2) - 1 - index];
      const secondPartChar = initialChar[Math.floor(charLength / 2) + (charLength % 2 === 0 ? 0 : 1) + index];
      return currentMismatchCount + (firstPartChar !== secondPartChar ? 1 : 0);
    },
    0
  );

  console.log(mismatchTally);
};

processInputCharacter(require('fs').readFileSync('/dev/stdin', 'utf8'));
