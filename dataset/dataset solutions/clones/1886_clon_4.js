let storedInputData = "";
let dataCursor = 0;
let parsedValueCache = [];

const obtainValue = (asString) => {
    const currentPiece = parsedValueCache[dataCursor++];
    return asString ? currentPiece : Number(currentPiece);
};

const commenceProcessing = (entireInputString) => {
    parsedValueCache = entireInputString.trim().split(/\s+/);
    const finalOutcome = determineParenthesesValidity();
    if (finalOutcome !== undefined) {
        console.log(finalOutcome);
    }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    storedInputData += chunk;
});
process.stdin.on('end', () => {
    commenceProcessing(storedInputData);
});

const determineParenthesesValidity = () => {
    const NEGATIVE_RESPONSE = "No";
    const POSITIVE_RESPONSE = "Yes";

    const totalSegments = obtainValue(false);
    let aggregatedBalance = 0;

    const segmentProperties = [];

    for (let segmentIdx = 0; segmentIdx < totalSegments; ++segmentIdx) {
        const currentText = obtainValue(true);

        const metrics = currentText.split('').reduce((accumulator, character) => {
            if (character === '(') {
                accumulator.currentBalance++;
            } else {
                accumulator.currentBalance--;
            }
            if (accumulator.currentBalance < accumulator.minBalance) {
                accumulator.minBalance = accumulator.currentBalance;
            }
            return accumulator;
        }, { currentBalance: 0, minBalance: 0 });

        const balanceProgress = metrics.currentBalance;
        const minAchievedBalance = metrics.minBalance;

        aggregatedBalance += balanceProgress;

        segmentProperties.push({
            finalChange: balanceProgress,
            initialDipRequirement: -minAchievedBalance,
            endingDipRequirement: -minAchievedBalance + balanceProgress
        });
    }

    if (aggregatedBalance !== 0) {
        return NEGATIVE_RESPONSE;
    }

    let currentAvailableBalance = 0;

    const groupOneSegments = segmentProperties.filter(p => p.initialDipRequirement > 0 && p.finalChange > 0);
    groupOneSegments.sort((a, b) => a.initialDipRequirement - b.initialDipRequirement);

    const groupTwoSegments = segmentProperties.filter(p => p.initialDipRequirement > 0 && p.finalChange <= 0);
    groupTwoSegments.sort((a, b) => b.endingDipRequirement - a.endingDipRequirement);

    const groupThreeSegments = segmentProperties.filter(p => p.initialDipRequirement <= 0);
    for (const segment of groupThreeSegments) {
        currentAvailableBalance += segment.finalChange;
    }

    for (const segment of groupOneSegments) {
        if (segment.initialDipRequirement > currentAvailableBalance) {
            return NEGATIVE_RESPONSE;
        }
        currentAvailableBalance += segment.finalChange;
    }

    for (const segment of groupTwoSegments) {
        if (segment.endingDipRequirement > currentAvailableBalance) {
            return NEGATIVE_RESPONSE;
        }
        currentAvailableBalance += segment.finalChange;
    }

    return POSITIVE_RESPONSE;
};