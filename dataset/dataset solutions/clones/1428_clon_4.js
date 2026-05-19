function processInput(sourceText) {
  const lineSegments = sourceText.split('\n');
  const charOccurrences = new Map();

  for (const currentSegment of lineSegments) {
    if (currentSegment === "") {
      break;
    }
    const lowercasedSegment = currentSegment.toLowerCase();
    for (const charUnit of lowercasedSegment) {
      charOccurrences.set(charUnit, (charOccurrences.get(charUnit) || 0) + 1);
    }
  }

  const alphabetCharacters = Array.from({ length: 26 }, (_, idx) => String.fromCharCode(0x61 + idx));
  const formattedOutput = alphabetCharacters.map(currentLetter => {
    const letterCount = charOccurrences.get(currentLetter) || 0;
    return `${currentLetter} : ${letterCount}`;
  });

  console.log(formattedOutput.join('\n'));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
