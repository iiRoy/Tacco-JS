function AnalyzeNumericSequence(inputStringData) {
    const textLines = inputStringData.split('\n');
    const initialSettings = textLines[0].split(' ');

    const totalItems = Number(initialSettings[0]);
    const stepValue = Number(initialSettings[1]);

    const parsedNumbers = textLines.map(Number);

    const segmentForOrdering = parsedNumbers.slice(1, totalItems);
    segmentForOrdering.sort((a, b) => a - b);

    const orderedNumericSet = [
        parsedNumbers[0],
        ...segmentForOrdering,
        parsedNumbers[totalItems]
    ];

    let minimalGap = Math.abs(orderedNumericSet[1] - orderedNumericSet[stepValue]);

    const loopUpperBound = totalItems - stepValue - 2;

    if (loopUpperBound >= 1) {
        const spanCalculations = Array.from({ length: loopUpperBound }, (_, iterator) => {
            const currentPosition = iterator + 1;
            return orderedNumericSet[currentPosition + stepValue] - orderedNumericSet[currentPosition];
        });
        minimalGap = Math.min(minimalGap, ...spanCalculations);
    }
    
    console.log(minimalGap);
}

const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8");

AnalyzeNumericSequence(acquireSourceData());