var inputBuffer = '';
var currentInputIndex = 0;

function readToken(tokenType) {
    if (tokenType === 'string') {
        return inputBuffer[currentInputIndex++];
    } else {
        return +inputBuffer[currentInputIndex++];
    }
}

function displayResult(value) {
    console.log(value);
}

class CharacterGraphProcessor {
    constructor() {
        this.nodeConnections = Array.from({ length: 26 }, () => new Set());
        this.nodeBalance = new Array(26).fill(0);
        this.traversalStatus = new Array(26).fill(false);
    }

    addConnection(startChar, endChar) {
        const charA = startChar.charCodeAt(0) - 'a'.charCodeAt(0);
        const charB = endChar.charCodeAt(0) - 'a'.charCodeAt(0);

        this.nodeConnections[charA].add(charB);
        this.nodeConnections[charB].add(charA);

        this.nodeBalance[charA]++;
        this.nodeBalance[charB]--;
    }

    exploreComponent(startIndex) {
        const visitQueue = [startIndex];
        this.traversalStatus[startIndex] = true;

        let queuePointer = 0;
        while (queuePointer < visitQueue.length) {
            const current = visitQueue[queuePointer++];
            for (const neighbor of this.nodeConnections[current]) {
                if (!this.traversalStatus[neighbor]) {
                    this.traversalStatus[neighbor] = true;
                    visitQueue.push(neighbor);
                }
            }
        }
    }

    analyzeGraph() {
        for (let i = 0; i < 26; ++i) {
            if (this.nodeConnections[i].size === 0) {
                this.traversalStatus[i] = true;
            }
        }

        let firstUnvisited = -1;
        for (let i = 0; i < 26; ++i) {
            if (!this.traversalStatus[i]) {
                firstUnvisited = i;
                break;
            }
        }

        if (firstUnvisited !== -1) {
            this.exploreComponent(firstUnvisited);
        }

        let overallValidity = true;
        for (let i = 0; i < 26; ++i) {
            if (!this.traversalStatus[i] || this.nodeBalance[i] !== 0) {
                overallValidity = false;
                break;
            }
        }
        return overallValidity ? 'OK' : 'NG';
    }
}

function runProcessingLoop() {
    while (true) {
        const stringCount = readToken();
        if (stringCount === 0) {
            break;
        }

        const processor = new CharacterGraphProcessor();

        for (let k = 0; k < stringCount; ++k) {
            const currentString = readToken('string');
            processor.addConnection(currentString[0], currentString[currentString.length - 1]);
        }

        displayResult(processor.analyzeGraph());
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    inputBuffer = inputBuffer.split(/\s+/);
    runProcessingLoop();
});
