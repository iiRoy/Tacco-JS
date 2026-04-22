function processInputText(incomingText) {
  const cleanedSequence = incomingText.replace(/^\s+|\s+$/g, '');
  const sequenceLength = cleanedSequence.length;

  if (sequenceLength <= 1) {
    return displayResult(true);
  }

  let initialIndex = 0;
  let finalIndex = sequenceLength - 1;
  let isSymmetrical = true;

  while (initialIndex < finalIndex) {
    if (cleanedSequence[initialIndex] !== cleanedSequence[finalIndex]) {
      isSymmetrical = false;
      break;
    }
    initialIndex++;
    finalIndex--;
  }

  displayResult(isSymmetrical);
}

function displayResult(outcome) {
  if (outcome) {
    process.stdout.write('YES\n');
  } else {
    process.stdout.write('NO\n');
  }
}

const gatherData = (sourcePath) => {
    const fileSystem = require('fs');
    return fileSystem.readFileSync(sourcePath, 'utf8');
};

processInputText(gatherData('/dev/stdin'));