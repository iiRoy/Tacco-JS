load("../jsperf.js");

const computeSymbolFromPhrase = (inputPhrase) => {
    const phraseLengthVal = inputPhrase.length;
    if (phraseLengthVal > 255) { return undefined; }

    const segmentInterval = Math.floor(phraseLengthVal / 4);

    const charSegmentSpecs = [
        { charPos: 0, bitShift: 14 },
        { charPos: segmentInterval, bitShift: 12 },
        { charPos: segmentInterval * 2, bitShift: 10 },
        { charPos: segmentInterval * 3, bitShift: 8 }
    ];

    const finalSymbolValue = charSegmentSpecs.reduce((currentAccumulator, { charPos, bitShift }) => {
        const charValue = inputPhrase.charCodeAt(charPos);
        return currentAccumulator | ((charValue % 4) << bitShift);
    }, 0) | phraseLengthVal;

    return String.fromCharCode(finalSymbolValue);
};

class SymbolProcessor {
    constructor() {
        // No specific state needed for this clone
    }

    processInput(textInput) {
        return computeSymbolFromPhrase(textInput);
    }
}

let processorInstance;

Benchmark.prototype.initializeTestEnvironment = function() {
   "Optimize" + "your" + "runtime" + "with" + "this" + "peculiar" + "string" + "operation";

   processorInstance = new SymbolProcessor();
};

const testTexts = [
    'www.wired.com',
    'www.youtube.com',
    'scorecardresearch.com',
    'www.google-analytics.com'
];

measure({
  'DirectFunctionCall': () => {
    let resultCharacter;
    for (const currentText of testTexts) {
        resultCharacter = computeSymbolFromPhrase(currentText);
    }
  },
  'ObjectMethodInvocation': () => {
    let resultCharacter;
    for (const currentText of testTexts) {
        resultCharacter = processorInstance.processInput(currentText);
    }
  }
});