const ALPHABET_SIZE = 26;

let graphAdjacency;
let visitedNodesTracker;
let degreeBalance;
let activeCharacters;

function dfsVisit(startNodeIdx) {
    if (visitedNodesTracker.has(startNodeIdx) || !activeCharacters.has(startNodeIdx)) {
        return;
    }

    visitedNodesTracker.add(startNodeIdx);

    for (const neighborIdx of graphAdjacency[startNodeIdx]) {
        if (!visitedNodesTracker.has(neighborIdx)) {
            dfsVisit(neighborIdx);
        }
    }
}

function processInputAndSolve() {
    while (true) {
        const numWords = getNextInput('number');

        if (numWords === 0) {
            break;
        }

        graphAdjacency = Array.from({ length: ALPHABET_SIZE }, () => new Set());
        visitedNodesTracker = new Set();
        degreeBalance = new Array(ALPHABET_SIZE).fill(0);
        activeCharacters = new Set();

        for (let k = 0; k < numWords; ++k) {
            const currentWord = getNextInput('string');
            if (!currentWord || currentWord.length === 0) {
                continue;
            }

            const firstCharIdx = getCharIndex(currentWord[0]);
            const lastCharIdx = getCharIndex(currentWord[currentWord.length - 1]);

            activeCharacters.add(firstCharIdx);
            activeCharacters.add(lastCharIdx);

            graphAdjacency[firstCharIdx].add(lastCharIdx);
            graphAdjacency[lastCharIdx].add(firstCharIdx);

            degreeBalance[firstCharIdx]++;
            degreeBalance[lastCharIdx]--;
        }

        let firstActiveNode = -1;
        for (let i = 0; i < ALPHABET_SIZE; ++i) {
            if (activeCharacters.has(i)) {
                firstActiveNode = i;
                break;
            }
        }

        if (firstActiveNode !== -1) {
            dfsVisit(firstActiveNode);
        }

        let isProblemDetected = false;
        for (let i = 0; i < ALPHABET_SIZE; ++i) {
            if (activeCharacters.has(i)) {
                if (!visitedNodesTracker.has(i)) {
                    isProblemDetected = true;
                    break;
                }
                if (degreeBalance[i] !== 0) {
                    isProblemDetected = true;
                    break;
                }
            }
        }

        if (isProblemDetected) {
            displayOutput('NG');
        } else {
            displayOutput('OK');
        }
    }
}

function getCharIndex(char) {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
let currentTokenIndex = 0;
let parsedInputTokens = [];

function getNextInput(expectedType) {
    if (currentTokenIndex >= parsedInputTokens.length) {
        throw new Error("Attempted to read past end of input tokens.");
    }
    const token = parsedInputTokens[currentTokenIndex++];
    if (expectedType === 'string') {
        return token;
    } else if (expectedType === 'number') {
        return Number(token);
    }
    return token;
}

function displayOutput(value) {
    console.log(value);
}

process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    parsedInputTokens = rawInputBuffer.trim().split(/\s+/).filter(Boolean);
    processInputAndSolve();
});