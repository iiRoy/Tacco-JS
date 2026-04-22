const refineText = (rawString) => {
    let frontIndex = 0;
    let backIndex = rawString.length - 1;
    while (frontIndex <= backIndex && /\s/.test(rawString[frontIndex])) {
        frontIndex++;
    }
    while (backIndex >= frontIndex && /\s/.test(rawString[backIndex])) {
        backIndex--;
    }
    return rawString.substring(frontIndex, backIndex + 1);
};

const divideByNewlines = (fullText) => {
    const lineSegments = [];
    let currentLine = '';
    for (let currentCharacter = 0; currentCharacter < fullText.length; currentCharacter++) {
        if (fullText[currentCharacter] === '\n') {
            lineSegments.push(currentLine);
            currentLine = '';
        } else {
            currentLine += fullText[currentCharacter];
        }
    }
    lineSegments.push(currentLine);
    return lineSegments;
};

const divideBySpaces = (lineText) => {
    const lineParts = [];
    let currentPart = '';
    for (let currentCharacter = 0; currentCharacter < lineText.length; currentCharacter++) {
        if (lineText[currentCharacter] === ' ') {
            if (currentPart.length > 0) {
                lineParts.push(currentPart);
            }
            currentPart = '';
        } else {
            currentPart += lineText[currentCharacter];
        }
    }
    if (currentPart.length > 0) {
        lineParts.push(currentPart);
    }
    return lineParts;
};

const systemUtility = globalThis.process.versions.node ? require('node:fs') : null;
const sourceContent = systemUtility.readFileSync('/dev/stdin', 'utf8');
let processedDataUnits = divideByNewlines(refineText(sourceContent));

const orchestrateDataProcessing = (dataSeries) => {
    let seriesPosition = 0;
    while (seriesPosition < dataSeries.length) {
        const currentDataSetSize = Number(dataSeries[seriesPosition++]);
        if (currentDataSetSize === 0) {
            break;
        }

        const dataSetMembers = divideBySpaces(dataSeries[seriesPosition++]);

        const analysisOutcome = performDataSetAnalysis(currentDataSetSize, dataSetMembers);

        if (analysisOutcome.hasDominantMember) {
            console.log(`${analysisOutcome.dominantMemberName} ${analysisOutcome.discoveryStep}`);
        } else {
            console.log('TIE');
        }
    }
};

const performDataSetAnalysis = (totalParticipants, participantIdentifiers) => {
    const finalAnalysisResult = participantIdentifiers.reduce((intermediateState, currentParticipant, participantIndex) => {
        if (intermediateState.hasDominantMember) {
            return intermediateState;
        }

        const updatedTally = new Map(intermediateState.participantScores);
        updatedTally.set(currentParticipant, (updatedTally.get(currentParticipant) || 0) + 1);

        let minScore1 = Infinity;
        let minIdentifier1 = null;
        let minScore2 = Infinity;
        let minIdentifier2 = null;

        for (const [keyIdentifier, currentScore] of updatedTally.entries()) {
            if (currentScore < minScore1) {
                minScore2 = minScore1;
                minIdentifier2 = minIdentifier1;
                minScore1 = currentScore;
                minIdentifier1 = keyIdentifier;
            } else if (currentScore < minScore2 && keyIdentifier !== minIdentifier1) {
                minScore2 = currentScore;
                minIdentifier2 = keyIdentifier;
            }
        }

        if (updatedTally.size === 1) {
            minScore2 = 0;
            minIdentifier2 = minIdentifier1;
        }

        const remainingSteps = totalParticipants - (participantIndex + 1);

        if (minScore1 === minScore2) {
            return {
                hasDominantMember: false,
                dominantMemberName: null,
                discoveryStep: -1,
                participantScores: updatedTally
            };
        } else if (minScore1 > minScore2 + remainingSteps) {
            return {
                hasDominantMember: true,
                dominantMemberName: minIdentifier1,
                discoveryStep: participantIndex + 1,
                participantScores: updatedTally
            };
        } else {
            return {
                hasDominantMember: false,
                dominantMemberName: null,
                discoveryStep: -1,
                participantScores: updatedTally
            };
        }
    }, {
        hasDominantMember: false,
        dominantMemberName: null,
        discoveryStep: -1,
        participantScores: new Map()
    });

    return finalAnalysisResult;
};

orchestrateDataProcessing(processedDataUnits);