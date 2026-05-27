let accumulatedInput = '';
let inputTokens = [];
let tokenIndex = 0;

function getNextToken() {
    return inputTokens[tokenIndex++];
}

function getNextInteger() {
    return parseInt(inputTokens[tokenIndex++], 10);
}

function analyzeParentheses(expressionSegment) {
    return [...expressionSegment].reduce(
        ([unmatchedClosingCount, openParenthesesCount], character) => {
            if (character === '(') {
                return [unmatchedClosingCount, openParenthesesCount + 1];
            } else {
                if (openParenthesesCount > 0) {
                    return [unmatchedClosingCount, openParenthesesCount - 1];
                } else {
                    return [unmatchedClosingCount + 1, openParenthesesCount];
                }
            }
        },
        [0, 0]
    );
}

function executeProcessing() {
    const totalStringCount = getNextInteger();
    const expressionCollection = Array.from({ length: totalStringCount }, () => getNextToken());

    let balanceInformation = expressionCollection.map(analyzeParentheses);

    balanceInformation.sort((itemOne, itemTwo) => {
        const balanceDiffOne = itemOne[1] - itemOne[0];
        const balanceDiffTwo = itemTwo[1] - itemTwo[0];

        if (balanceDiffOne !== balanceDiffTwo) {
            return balanceDiffTwo - balanceDiffOne;
        }
        return itemTwo[0] - itemOne[0];
    });

    let currentAccumulatedBalance = 0;
    let processingPossible = true;
    let itemsProcessed = 0;

    let mutableBalanceInformation = [...balanceInformation];

    while (itemsProcessed < totalStringCount) {
        let foundSuitableItem = false;
        let selectedItemIndex = -1;

        for (let i = 0; i < mutableBalanceInformation.length; i++) {
            const candidateItem = mutableBalanceInformation[i];
            if (currentAccumulatedBalance >= candidateItem[0]) {
                selectedItemIndex = i;
                foundSuitableItem = true;
                break;
            }
        }

        if (foundSuitableItem) {
            const chosenItem = mutableBalanceInformation.splice(selectedItemIndex, 1)[0];
            currentAccumulatedBalance += (chosenItem[1] - chosenItem[0]);
            itemsProcessed++;
        } else {
            processingPossible = false;
            break;
        }
    }

    console.log(processingPossible && currentAccumulatedBalance === 0 ? 'Yes' : 'No');
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    accumulatedInput += chunk;
});

process.stdin.on('end', function() {
    inputTokens = accumulatedInput.trim().split(/\s+/);
    executeProcessing();
});
