class InputSource {
    constructor(lines) {
        this.lineData = lines;
        this.currentLineIndex = 0;
    }

    retrieveNextLine() {
        if (this.currentLineIndex < this.lineData.length) {
            return this.lineData[this.currentLineIndex++];
        }
        throw new Error('Input exhausted: No more lines to read.');
    }

    transformInput(value, conversionType) {
        try {
            switch (conversionType) {
                case 1: return parseInt(value);
                case 2: return value.split(' ');
                case 4: return value.split(' ').map(Number);
                case 6: return value.split('');
                case 7: return value.split('').map(Number);
                case 8: return value.join(' ');
                case 9: return value.join('\n');
                case 0: return value.join('');
                default: return value;
            }
        } catch (e) {
            return value;
        }
    }

    fetchInteger() {
        return this.transformInput(this.retrieveNextLine(), 1);
    }
}

let allInputLines = [];
let dataStream;

require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', line => allInputLines.push(line))
  .on('close', () => {
    dataStream = new InputSource(allInputLines);
    console.error('\n');
    const executionStart = Date.now();
    executeCoreLogic();
    const executionEnd = Date.now() - executionStart;
    outputDebugInfo('time : ' + executionEnd + 'ms');
    outputDebugInfo('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function produceDeepCopy(originalObject) {
    if (originalObject instanceof Set) {
        return new Set(Array.from(originalObject));
    }
    return structuredClone(originalObject);
}

function displayResult(content) { console.log(content); }
function outputDebugInfo(message) { console.error('debug:' + require('util').inspect(message, false, null)); }

function executeCoreLogic() {
    const upperLimit = dataStream.fetchInteger();
    const divisorTally = new Array(upperLimit + 1).fill(0);

    for (let currentFactor = 1; currentFactor <= upperLimit; ++currentFactor) {
        for (let currentMultiple = currentFactor; currentMultiple <= upperLimit; currentMultiple += currentFactor) {
            divisorTally[currentMultiple]++;
        }
    }

    let totalAccumulator = 0;
    for (let numberValue = 1; numberValue <= upperLimit; ++numberValue) {
        totalAccumulator += numberValue * divisorTally[numberValue];
    }

    displayResult(totalAccumulator);
}
