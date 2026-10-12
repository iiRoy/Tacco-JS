function processInputData(rawData) {
    let finalOutcome = -1;

    const lineSegments = rawData.trim().split("\n");

    const totalElementsCount = parseInt(lineSegments[0].split(' ')[0]);

    const assignmentInstructions = lineSegments.slice(1);

    let digitMap = new Map();

    assignmentInstructions.forEach(instructionLine => {
        const [position, value] = instructionLine.split(' ').map(Number);
        digitMap.set(position - 1, value);
    });

    const constructedDigitsArray = Array.from({ length: totalElementsCount }, (_, idx) =>
        digitMap.has(idx) ? String(digitMap.get(idx)) : 'a'
    );

    const rawNumericString = constructedDigitsArray.join('');

    const effectiveNumericString = (rawNumericString.replace(/^a+/, '').replace(/a/g, '0')) || '0';

    if (effectiveNumericString === '00') {
        finalOutcome = 100;
    } else if (effectiveNumericString === '0') {
        finalOutcome = 10;
    } else {
        finalOutcome = Number(effectiveNumericString);
    }

    console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
