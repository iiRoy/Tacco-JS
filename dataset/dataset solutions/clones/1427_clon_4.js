const charProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let collectedTextSegments = [];

charProcessor.on('line', (incomingLine) => {
  collectedTextSegments.push(incomingLine);
});

charProcessor.on('close', () => {
  const alphabetLetterTallies = Array(26).fill(0); // For 'a' through 'z'

  collectedTextSegments.forEach((pieceOfText) => {
    pieceOfText.toLowerCase().split('').forEach((singleCharacter) => {
      const characterCodePoint = singleCharacter.charCodeAt(0);
      const alphaOffset = characterCodePoint - 'a'.charCodeAt(0);

      if (alphaOffset >= 0 && alphaOffset < 26) {
        alphabetLetterTallies[alphaOffset]++;
      }
    });
  });

  alphabetLetterTallies.forEach((currentTally, arrayIndex) => {
    const associatedLetter = String.fromCharCode('a'.charCodeAt(0) + arrayIndex);
    console.log(`${associatedLetter} : ${currentTally}`);
  });
});