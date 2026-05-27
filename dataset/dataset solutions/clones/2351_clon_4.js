let inputBuffer = '';
let tokenArray = [];
let tokenIndex = 0;

function fetchNextToken() {
    if (tokenIndex >= tokenArray.length) {
        throw new Error("Input token exhaustion.");
    }
    return tokenArray[tokenIndex++];
}

function fetchNextInteger() {
    return parseInt(fetchNextToken(), 10);
}

let totalPeopleCount;
let allPersonAssertions;
let maximumHonestIndividuals = 0;

function explorePossibleConfigurations(currentPersonIdentifier, currentHonestStatus) {
    if (currentPersonIdentifier === totalPeopleCount) {
        let currentHonestCount = 0;
        let isConfigurationValid = true;

        for (let i = 0; i < totalPeopleCount; i++) {
            if (currentHonestStatus[i]) {
                currentHonestCount++;
                for (const assertion of allPersonAssertions[i]) {
                    const assertedTarget = assertion.target;
                    const assertedType = assertion.type;

                    if (currentHonestStatus[assertedTarget] !== (assertedType === 1)) {
                        isConfigurationValid = false;
                        break;
                    }
                }
            }
            if (!isConfigurationValid) {
                break;
            }
        }

        if (isConfigurationValid) {
            maximumHonestIndividuals = Math.max(maximumHonestIndividuals, currentHonestCount);
        }
        return;
    }

    currentHonestStatus[currentPersonIdentifier] = false;
    explorePossibleConfigurations(currentPersonIdentifier + 1, currentHonestStatus);

    currentHonestStatus[currentPersonIdentifier] = true;
    explorePossibleConfigurations(currentPersonIdentifier + 1, currentHonestStatus);
}

process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk.toString();
});

process.stdin.on('end', () => {
    tokenArray = inputBuffer.trim().split(/\s+/g);

    totalPeopleCount = fetchNextInteger();

    allPersonAssertions = new Array(totalPeopleCount);

    for (let i = 0; i < totalPeopleCount; i++) {
        const numberOfAssertions = fetchNextInteger();
        const currentPersonAssertionsList = new Array(numberOfAssertions);
        for (let j = 0; j < numberOfAssertions; j++) {
            const targetPersonIdentifier = fetchNextInteger() - 1;
            const assertionValue = fetchNextInteger();
            currentPersonAssertionsList[j] = { target: targetPersonIdentifier, type: assertionValue };
        }
        allPersonAssertions[i] = currentPersonAssertionsList;
    }

    const initialHonestState = new Array(totalPeopleCount).fill(false);
    explorePossibleConfigurations(0, initialHonestState);

    console.log(maximumHonestIndividuals);
});

process.stdin.resume();
