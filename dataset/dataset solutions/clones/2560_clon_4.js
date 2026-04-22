function processContestData(rawText) {
    let lineSegments = [];
    let currentLineBeginning = 0;
    while (currentLineBeginning < rawText.length) {
        let nextNewlinePosition = rawText.indexOf('\n', currentLineBeginning);
        if (nextNewlinePosition === -1) {
            lineSegments.push(rawText.substring(currentLineBeginning));
            break;
        }
        lineSegments.push(rawText.substring(currentLineBeginning, nextNewlinePosition));
        currentLineBeginning = nextNewlinePosition + 1;
    }

    let initialConfigurationLine = lineSegments[0];
    let setupMetrics = [];
    let currentNumberString = "";
    for (let k = 0; k < initialConfigurationLine.length; k++) {
        let character = initialConfigurationLine[k];
        if (character === ' ') {
            setupMetrics.push(parseInt(currentNumberString, 10));
            currentNumberString = "";
        } else {
            currentNumberString += character;
        }
    }
    setupMetrics.push(parseInt(currentNumberString, 10));

    let totalParticipantCount = setupMetrics[0];
    let baseScoreValue = setupMetrics[1];
    let totalQuestionCount = setupMetrics[2];

    let requiredPickThreshold = 1 - baseScoreValue + totalQuestionCount;

    let participantPickTallies = {};

    for (let i = 1; i < lineSegments.length; i++) {
        let participantIdentifier = parseInt(lineSegments[i], 10);
        if (participantPickTallies[participantIdentifier]) {
            participantPickTallies[participantIdentifier]++;
        } else {
            participantPickTallies[participantIdentifier] = 1;
        }
    }

    let resultCollection = [];
    for (let participantIndex = 1; participantIndex <= totalParticipantCount; participantIndex++) {
        let participantPicks = participantPickTallies[participantIndex] || 0;
        if (participantPicks >= requiredPickThreshold) {
            resultCollection.push("Yes");
        } else {
            resultCollection.push("No");
        }
    }

    let finalOutputString = "";
    for (let j = 0; j < resultCollection.length; j++) {
        finalOutputString += resultCollection[j];
        if (j < resultCollection.length - 1) {
            finalOutputString += "\n";
        }
    }
    console.log(finalOutputString);
}
processContestData(require("fs").readFileSync("/dev/stdin","utf8").trim());