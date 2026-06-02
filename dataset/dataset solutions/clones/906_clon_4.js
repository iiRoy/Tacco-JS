function outputResult(value) {
    console.log(value);
}

let rawInputTokens = '';
let tokenCursor = 0;

function getNextNumber() {
    return Number(rawInputTokens[tokenCursor++]);
}

function getNextString() {
    return rawInputTokens[tokenCursor++];
}

function analyzeParentheses(expression) {
    return expression.split('').reduce((accumulator, char) => {
        let [unmatchedClosing, unmatchedOpening] = accumulator;
        if (char === '(') {
            unmatchedOpening++;
        } else { // char === ')'
            if (unmatchedOpening > 0) {
                unmatchedOpening--;
            } else {
                unmatchedClosing++;
            }
        }
        return [unmatchedClosing, unmatchedOpening];
    }, [0, 0]);
}

function executeProcessing() {
    const itemCount = getNextNumber();
    const rawStrings = Array.from({ length: itemCount }, getNextString);

    const parsedParenthesesData = rawStrings.map(analyzeParentheses);

    parsedParenthesesData.sort((itemA, itemB) => {
        const [unmatchedCloseA, unmatchedOpenA] = itemA;
        const [unmatchedCloseB, unmatchedOpenB] = itemB;

        const balanceDiffA = unmatchedOpenA - unmatchedCloseA;
        const balanceDiffB = unmatchedOpenB - unmatchedCloseB;

        if (balanceDiffA < 0 && balanceDiffB < 0) {
            if (unmatchedCloseA === unmatchedCloseB) {
                return balanceDiffB - balanceDiffA;
            } else {
                return unmatchedCloseB - unmatchedCloseA;
            }
        }
        return balanceDiffB - balanceDiffA;
    });

    outputResult(parsedParenthesesData);

    let currentBalance = 0;
    let availableItems = [...parsedParenthesesData];
    let matchedItemsCount = 0;

    let progressMadeInIteration = true;
    while (matchedItemsCount < itemCount && progressMadeInIteration) {
        progressMadeInIteration = false;

        let candidateIndex = -1;
        for (let i = 0; i < availableItems.length; i++) {
            const [unmatchedClosing, unmatchedOpening] = availableItems[i];
            if (currentBalance >= unmatchedClosing) {
                candidateIndex = i;
                break;
            }
        }

        if (candidateIndex !== -1) {
            const [unmatchedClosing, unmatchedOpening] = availableItems[candidateIndex];
            currentBalance += (unmatchedOpening - unmatchedClosing);
            availableItems.splice(candidateIndex, 1);
            matchedItemsCount++;
            progressMadeInIteration = true;
        }
    }

    const finalVerdict = (matchedItemsCount === itemCount && currentBalance === 0) ? 'Yes' : 'No';
    outputResult(finalVerdict);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    rawInputTokens += chunk;
});

process.stdin.on('end', function() {
    rawInputTokens = rawInputTokens.trim().split(/\s+/);
    executeProcessing();
});
