const fileSystem = require('fs');
const inputLength = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = new Buffer(inputLength);
const bytesProcessed = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, inputLength, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, bytesProcessed).split('\n');

processInputSequence();

function processInputSequence() {
  const sourceText = rawInputLines[0];
  const thresholdValue = 16;

  const characterCodeArray = Array.from(sourceText, (char) => char.charCodeAt(0));

  const processingResult = characterCodeArray.reduce(
    (accumulator, currentCodeValue) => {
      const { sequenceFragments, lastCodeValue } = accumulator;
      const codeDifference = currentCodeValue - lastCodeValue;
      const signCharacter = codeDifference > 0 ? '+' : '-';
      const absoluteDifference = Math.abs(codeDifference);

      let currentFragment = '';

      if (absoluteDifference < thresholdValue) {
        currentFragment = signCharacter.repeat(absoluteDifference);
      } else {
        const integerSquareRoot = Math.floor(Math.sqrt(absoluteDifference));
        currentFragment =
          '>' +
          '+'.repeat(integerSquareRoot) +
          '[<' +
          signCharacter.repeat(integerSquareRoot) +
          '>-]<';
        const remainder = absoluteDifference - integerSquareRoot * integerSquareRoot;
        currentFragment += signCharacter.repeat(remainder);
      }

      sequenceFragments.push(currentFragment + '.');

      return {
        sequenceFragments,
        lastCodeValue: currentCodeValue,
      };
    },
    { sequenceFragments: [], lastCodeValue: 0 }
  );

  console.log(processingResult.sequenceFragments.join(''));
}
