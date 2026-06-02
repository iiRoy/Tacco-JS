process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const shiftValue = parseInt(inputLines[0]);
  const sourceText = inputLines[1];

  const baseCharCodeA = 'A'.charCodeAt(0);
  const alphabetSize = 26;

  const encryptedText = sourceText.split('').map(originalChar => {
    const originalCharCode = originalChar.charCodeAt(0);
    const relativePosition = originalCharCode - baseCharCodeA;

    const shiftedPosition = (relativePosition + shiftValue) % alphabetSize;

    const finalCharCode = shiftedPosition + baseCharCodeA;
    return String.fromCharCode(finalCharCode);
  }).join('');

  console.log(encryptedText);
});
