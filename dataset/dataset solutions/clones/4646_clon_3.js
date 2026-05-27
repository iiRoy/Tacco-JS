function processInputData(rawData) {
    const [firstStringSegment, secondStringSegment] = rawData.split("\n");

    const combinedLength = firstStringSegment.length + secondStringSegment.length;

    const retrieveInterleavedCharacter = (currentIterationIndex, strA, strB) => {
        const characterPosition = Math.floor(currentIterationIndex / 2);
        if (currentIterationIndex % 2 === 0) {
            return strA[characterPosition];
        } else {
            return strB[characterPosition];
        }
    };

    for (let iterationCounter = 0; iterationCounter < combinedLength; iterationCounter++) {
        const charToPrint = retrieveInterleavedCharacter(iterationCounter, firstStringSegment, secondStringSegment);
        console.log(charToPrint);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
