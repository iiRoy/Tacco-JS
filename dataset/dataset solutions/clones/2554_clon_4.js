function main(tapDance) {
  const allowedForEvenIndexPositions = new Set(['R', 'U', 'D']);
  const allowedForOddIndexPositions = new Set(['L', 'U', 'D']);

  const currentSequenceLength = tapDance.length;

  if (currentSequenceLength === 0) {
    return 'Yes';
  }

  if (currentSequenceLength === 1) {
    return tapDance[0] === 'L' ? 'No' : 'Yes';
  }

  const relevantCharacters = Array.from(tapDance).slice(0, currentSequenceLength - 1);

  const allCharactersPassValidation = relevantCharacters.every((charElement, charIndex) => {
    const isCurrentIndexEven = charIndex % 2 === 0;
    if (isCurrentIndexEven) {
      return allowedForEvenIndexPositions.has(charElement);
    } else {
      return allowedForOddIndexPositions.has(charElement);
    }
  });

  return allCharactersPassValidation ? 'Yes' : 'No';
}

console.log(main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n')[0].trim()));
