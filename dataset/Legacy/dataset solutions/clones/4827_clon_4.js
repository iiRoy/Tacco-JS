function analyzeSuffixes(currentSegment, lexicon) {
  if (currentSegment.length === 0) {
    return true;
  }

  for (const term of lexicon) {
    if (currentSegment.endsWith(term)) {
      const remainingSegment = currentSegment.substring(0, currentSegment.length - term.length);
      if (analyzeSuffixes(remainingSegment, lexicon)) {
        return true;
      }
    }
  }
  return false;
}

function processInput(text) {
  const lexicon = ['dreamer', 'dream', 'eraser', 'erase'];
  return analyzeSuffixes(text, lexicon);
}

function executeProgram(inputString) {
  if (processInput(inputString)) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
