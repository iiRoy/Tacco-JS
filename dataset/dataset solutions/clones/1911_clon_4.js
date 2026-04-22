const obtainInput = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const parsedMainLine = obtainInput[0].split(' ').map(Number);
const totalInputCount = parsedMainLine[0];
let initialAlpha = parsedMainLine[1];
let initialBeta = parsedMainLine[2];
let initialGamma = parsedMainLine[3];

const allInputStrings = [];
for (let k = 0; k < totalInputCount; k++) {
    allInputStrings.push(obtainInput[k + 1]);
}

const mappingChars = ['A', 'B', 'C'];
const mappingPairs = { 'AB': [0, 1], 'AC': [0, 2], 'BC': [1, 2] };

function determineStepAction(currentBalances, currentPairIndices, nextPairIndices) {
    const [pIdx1, pIdx2] = currentPairIndices;
    let bal1 = currentBalances[pIdx1];
    let bal2 = currentBalances[pIdx2];

    if (bal1 === 0 && bal2 === 0) {
        return null;
    }

    let chosenCharIndex;

    if (bal1 === 0) {
        chosenCharIndex = pIdx1;
    } else if (bal2 === 0) {
        chosenCharIndex = pIdx2;
    } else {
        if (nextPairIndices) {
            const otherIdx = [0, 1, 2].find(idx => idx !== pIdx1 && idx !== pIdx2);

            const nextIsP1Other = (nextPairIndices[0] === pIdx1 && nextPairIndices[1] === otherIdx) || (nextPairIndices[0] === otherIdx && nextPairIndices[1] === pIdx1);
            const nextIsP2Other = (nextPairIndices[0] === pIdx2 && nextPairIndices[1] === otherIdx) || (nextPairIndices[0] === otherIdx && nextPairIndices[1] === pIdx2);

            if (nextIsP1Other && bal1 === 1) {
                chosenCharIndex = pIdx1;
            } else if (nextIsP2Other && bal2 === 1) {
                chosenCharIndex = pIdx2;
            } else {
                chosenCharIndex = pIdx1;
            }
        } else {
            chosenCharIndex = pIdx1;
        }
    }

    const nextBalances = [...currentBalances];
    if (chosenCharIndex === pIdx1) {
        nextBalances[pIdx1]++;
        nextBalances[pIdx2]--;
    } else {
        nextBalances[pIdx1]--;
        nextBalances[pIdx2]++;
    }

    return {
        modifiedBalances: nextBalances,
        selectedSymbol: mappingChars[chosenCharIndex]
    };
}

const processInteractions = (currentInteractionIndex, currentBalances, accumulatedChoices) => {
    // This handles processing for allInputStrings[currentInteractionIndex]
    // The main loop in the original code iterates from i = 0 to N-2.
    // The last element, s[N-1], is handled after the loop.
    // So, if currentInteractionIndex is N-1, it's the 'final' element processing.

    if (currentInteractionIndex === totalInputCount) { // All N elements processed, including the 'final' one
        return { outcome: true, selection: accumulatedChoices };
    }

    const currentPair = allInputStrings[currentInteractionIndex];
    const nextPair = (currentInteractionIndex + 1 < totalInputCount) ? allInputStrings[currentInteractionIndex + 1] : null;

    const currentPairingIndices = mappingPairs[currentPair];
    const nextPairingIndices = nextPair ? mappingPairs[nextPair] : null;

    let stepResult;
    if (currentInteractionIndex < totalInputCount - 1) { // This corresponds to the original loop (i = 0 to N-2)
        stepResult = determineStepAction(currentBalances, currentPairingIndices, nextPairingIndices);
    } else { // This corresponds to the final element (s[N-1]) handling after the loop
        const [fIdx1, fIdx2] = currentPairingIndices;
        let balF1 = currentBalances[fIdx1];
        let balF2 = currentBalances[fIdx2];

        let finalChosenCharIdx;
        if (balF1 === balF2 && balF1 === 0) {
            return { outcome: false, selection: [] };
        } else if (balF1 < balF2) {
            finalChosenCharIdx = fIdx1;
        } else {
            finalChosenCharIdx = fIdx2;
        }
        stepResult = {
            modifiedBalances: currentBalances, // Balances are not changed in the final step, only a choice is made
            selectedSymbol: mappingChars[finalChosenCharIdx]
        };
    }

    if (stepResult === null) {
        return { outcome: false, selection: [] };
    }

    return processInteractions(currentInteractionIndex + 1, stepResult.modifiedBalances, [...accumulatedChoices, stepResult.selectedSymbol]);
};

const finalResult = processInteractions(0, [initialAlpha, initialBeta, initialGamma], []);

if (!finalResult.outcome) {
    console.log('No');
} else {
    console.log('Yes');
    finalResult.selection.forEach(s => console.log(s));
}