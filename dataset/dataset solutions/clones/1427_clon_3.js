function processTextAnalysis(textLines) {
  const ASCII_CODE_LOWER_A = 'a'.charCodeAt(0);
  const ASCII_CODE_LOWER_Z = 'z'.charCodeAt(0);

  let letterFrequencyMap = {};

  for (let charCode = ASCII_CODE_LOWER_A; charCode <= ASCII_CODE_LOWER_Z; charCode++) {
    const currentAlphabetChar = String.fromCharCode(charCode);
    letterFrequencyMap[currentAlphabetChar] = 0;
  }

  const processSingleLineForFrequencies = (lineContent) => {
    const normalizedLine = lineContent.toLowerCase();
    for (let charIndex = 0; charIndex <= normalizedLine.length; charIndex++) {
      const charToProcess = normalizedLine[charIndex];
      letterFrequencyMap[charToProcess]++;
    }
  };

  for (let lineIterator = 0; lineIterator < textLines.length; lineIterator++) {
    processSingleLineForFrequencies(textLines[lineIterator]);
  }

  const generateOutputString = (letter, count) => {
    return letter + ' : ' + count;
  };

  for (let charCode = ASCII_CODE_LOWER_A; charCode <= ASCII_CODE_LOWER_Z; charCode++) {
    const currentAlphabetChar = String.fromCharCode(charCode);
    console.log(generateOutputString(currentAlphabetChar, letterFrequencyMap[currentAlphabetChar]));
  }
}

const initializeInputHandler = () => {
  const inputDataSegments = [];

  process.stdin.on('data', (receivedSegment) => {
    inputDataSegments.push(receivedSegment);
  });

  process.stdin.on('end', () => {
    const fullInputContent = inputDataSegments.join('');
    const parsedLines = fullInputContent.split('\n');
    processTextAnalysis(parsedLines);
  });
};

initializeInputHandler();
