var fileSystemModule = require('fs');

var rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
var linesOfInput = rawInputContent.split('\n');

processInputData();

function generateRepeatedString(characterToRepeat, repeatCount) {
  let segmentBuilder = '';
  for (let k = 0; k < repeatCount; k++) {
    segmentBuilder += characterToRepeat;
  }
  return segmentBuilder;
}

function processInputData() {
  var sourceString = linesOfInput[0];

  if (!sourceString || sourceString.length === 0) {
    console.log('');
    return;
  }

  var outputSegments = [];
  var currentIdx;
  var charDifference, calculatedSquareRoot, polarityChar;
  var previousCharacterCode = 0;
  var comparisonThreshold = 16;

  var characterCodeSequence = Array.from(sourceString, char => char.charCodeAt(0));
  var sequenceLength = characterCodeSequence.length;

  for (currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
    let currentCharacterCode = characterCodeSequence[currentIdx];
    charDifference = currentCharacterCode - previousCharacterCode;

    if (charDifference === 0) {
      outputSegments.push('.');
    } else {
      polarityChar = charDifference > 0 ? '+' : '-';
      charDifference = Math.abs(charDifference);

      if (charDifference < comparisonThreshold) {
        outputSegments.push(generateRepeatedString(polarityChar, charDifference));
      } else {
        calculatedSquareRoot = Math.floor(Math.sqrt(charDifference));
        outputSegments.push('>');
        outputSegments.push(generateRepeatedString('+', calculatedSquareRoot));
        outputSegments.push('[<');
        outputSegments.push(generateRepeatedString(polarityChar, calculatedSquareRoot));
        outputSegments.push('>-]<');
        var remainingDifference = charDifference - calculatedSquareRoot * calculatedSquareRoot;
        outputSegments.push(generateRepeatedString(polarityChar, remainingDifference));
      }
      outputSegments.push('.');
    }
    previousCharacterCode = currentCharacterCode;
  }
  console.log(outputSegments.join(''));
}
