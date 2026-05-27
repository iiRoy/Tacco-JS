let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  rawInputBuffer += chunk;
});
process.stdin.on('end', () => {
  const allInputLines = rawInputBuffer.split('\n');
  processInput(allInputLines);
});

const charMapping = new Map([
  ['1', ['.', ',', '!', '?', ' ']],
  ['2', ['a', 'b', 'c']],
  ['3', ['d', 'e', 'f']],
  ['4', ['g', 'h', 'i']],
  ['5', ['j', 'k', 'l']],
  ['6', ['m', 'n', 'o']],
  ['7', ['p', 'q', 'r', 's']],
  ['8', ['t', 'u', 'v']],
  ['9', ['w', 'x', 'y', 'z']]
]);

function decodeSequence(inputSequence) {
  const decodedCharacters = [];
  const pressSegments = inputSequence.split('0');

  pressSegments.forEach(currentSegment => {
    if (currentSegment.length > 0) {
      const digitCharacter = currentSegment[0];
      const pressCount = currentSegment.length;

      const availableChars = charMapping.get(digitCharacter);

      if (availableChars) {
        const charSelectionIndex = (pressCount - 1) % availableChars.length;
        decodedCharacters.push(availableChars[charSelectionIndex]);
      }
    }
  });

  return decodedCharacters.join('');
}

function processInput(allInputLines) {
  const numberOfCases = parseInt(allInputLines[0], 10);

  allInputLines.slice(1, 1 + numberOfCases).forEach(sequenceLine => {
    console.log(decodeSequence(sequenceLine));
  });
}
