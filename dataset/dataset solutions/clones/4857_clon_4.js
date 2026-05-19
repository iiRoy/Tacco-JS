function ProcessInput(rawData) {
    const parsedLines = rawData.split('\n');
    const transformationCycles = Number(parsedLines[0]);
    let currentSequence = parsedLines.slice(1).map(Number);

    const calculatePairResult = (firstVal, secondVal) =>
        (firstVal === secondVal ? firstVal : Math.abs(firstVal - secondVal));

    const evolveSequence = (sourceSequence) => {
        const pairCount = Math.floor(sourceSequence.length / 2);
        return Array.from({ length: pairCount }, (_, pairIndex) => {
            const valA = sourceSequence[2 * pairIndex];
            const valB = sourceSequence[2 * pairIndex + 1];
            return calculatePairResult(valA, valB);
        });
    };

    const finalSequence = Array.from({ length: transformationCycles }).reduce((accumulatedSequence) => {
        return evolveSequence(accumulatedSequence);
    }, currentSequence);

    console.log(finalSequence[0]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
