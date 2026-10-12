function flipString(inputStr) {
  return inputStr.split('').reverse().join('');
}

function processInput(sourceText) {
  const targetPhrases = ['dreamer', 'dream', 'eraser', 'erase'];
  const flippedPhrases = targetPhrases.map(phrase => flipString(phrase));
  let remainingText = flipString(sourceText);

  textProcessingLoop: while (remainingText.length > 0) {
    for (const currentPhrase of flippedPhrases) {
      if (remainingText.startsWith(currentPhrase)) {
        remainingText = remainingText.substring(currentPhrase.length);
        continue textProcessingLoop;
      }
    }
    return false;
  }
  return true;
}

function executeProgram(programInput) {
  if (processInput(programInput)) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
