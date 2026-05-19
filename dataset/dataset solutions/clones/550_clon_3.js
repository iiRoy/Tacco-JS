const parseInteger = (value) => parseInt(value, 10);

function processInputData() {
  let currentLineIndex = 0;
  let currentNumEntries;

  while (true) {
    const lineForNumEntries = processedLines[currentLineIndex++];
    currentNumEntries = parseInteger(lineForNumEntries);

    if (isNaN(currentNumEntries) || currentNumEntries === 0) {
      break;
    }

    const translationMap = new Map();

    for (let i = 0; i < currentNumEntries; i++) {
      const entryLine = processedLines[currentLineIndex++];
      const [keyIdentifier, valueIdentifier] = entryLine.split(' ');
      translationMap.set(keyIdentifier, valueIdentifier);
    }

    const lineForNumStrings = processedLines[currentLineIndex++];
    const numStringsToTranslate = parseInteger(lineForNumStrings);

    const translatedSegments = [];

    const getTranslatedSegment = (originalWord) => {
      return translationMap.has(originalWord) ? translationMap.get(originalWord) : originalWord;
    };

    for (let i = 0; i < numStringsToTranslate; i++) {
      const wordToTranslate = processedLines[currentLineIndex++];
      const translatedWord = getTranslatedSegment(wordToTranslate);
      translatedSegments.push(translatedWord);
    }

    console.log(translatedSegments.join(''));
  }
}

let rawDataBuffer = '';
let processedLines;

const finalizeInputAndProcess = () => {
  processedLines = rawDataBuffer.split(/\r\n|\r|\n/g);
  processInputData();
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  rawDataBuffer += chunk;
});
process.stdin.on('end', finalizeInputAndProcess);
