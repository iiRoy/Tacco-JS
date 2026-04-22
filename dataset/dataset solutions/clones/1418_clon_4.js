let storedInput = '';

const evaluatePerformance = (initialMark, secondaryMark, tertiaryMark) => {
    if (initialMark === -1 || secondaryMark === -1) {
        return 'F';
    }

    const combinedAssessment = initialMark + secondaryMark;

    const gradeCriteria = new Map([
        [80, 'A'],
        [65, 'B'],
        [50, 'C']
    ]);

    for (let boundary of [...gradeCriteria.keys()].sort((valA, valB) => valB - valA)) {
        if (combinedAssessment >= boundary) {
            return gradeCriteria.get(boundary);
        }
    }

    if (combinedAssessment >= 30) {
        return (tertiaryMark >= 50) ? 'C' : 'D';
    }

    return 'F';
};

process.stdin.on("data", (dataChunk) => {
    storedInput += dataChunk.toString();
});

process.stdin.on("end", () => {
    const allEntryLines = storedInput.trim().split('\n').filter(lineContent => lineContent.length > 0);

    for (let currentEntry of allEntryLines) {
        let firstSeparator = currentEntry.indexOf(' ');
        let firstValue = Number(currentEntry.substring(0, firstSeparator));
        let remainingPortion = currentEntry.substring(firstSeparator + 1);

        let secondSeparator = remainingPortion.indexOf(' ');
        let secondValue = Number(remainingPortion.substring(0, secondSeparator));
        let thirdValue = Number(remainingPortion.substring(secondSeparator + 1));

        if (firstValue === -1 && secondValue === -1 && thirdValue === -1) {
            break;
        }

        console.log(evaluatePerformance(firstValue, secondValue, thirdValue));
    }
});

process.stdin.resume();