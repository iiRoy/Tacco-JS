function processInput(rawData) {
    const lines = rawData.split("\n");
    const [nStr, kStr] = lines[0].split(" ");

    const numElements = parseInt(nStr, 10);
    const numIterations = parseInt(kStr, 10);
    const elementStrings = lines[1].split(" ");

    let currentSequence = [];
    const sequenceHistory = [""];

    const NOT_FOUND_INDEX = -1;

    for (let iterCount = 0; iterCount < numIterations; iterCount++) {
        for (let elemIndex = 0; elemIndex < numElements; elemIndex++) {
            const currentElement = elementStrings[elemIndex];
            const existingIdx = currentSequence.indexOf(currentElement);

            if (existingIdx !== NOT_FOUND_INDEX) {
                currentSequence = currentSequence.slice(0, existingIdx);
            } else {
                currentSequence.push(currentElement);
            }
        }

        const currentSequenceStr = currentSequence.join(" ");
        if (!sequenceHistory.includes(currentSequenceStr)) {
            sequenceHistory.push(currentSequenceStr);
        } else {
            break;
        }
    }

    const finalSequenceString = currentSequence.join(" ");
    const cycleStartIdx = sequenceHistory.indexOf(finalSequenceString);

    if (cycleStartIdx === numIterations) {
        console.log(sequenceHistory[numIterations]);
    } else {
        const remainingIterations = numIterations - cycleStartIdx;
        const cycleLength = sequenceHistory.length - cycleStartIdx;
        const cycleOffset = remainingIterations % cycleLength;
        console.log(sequenceHistory[cycleStartIdx + cycleOffset]);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
