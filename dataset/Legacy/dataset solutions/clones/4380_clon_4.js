function ProcessData(rawData) {
    const initialSegment = rawData.split("\n")[0];

    console.log(initialSegment);

    const extractedSequence = Array.from(initialSegment).reduce((accumulator, currentCharacter, charIndex) => {
        if (charIndex % 2 === 0) {
            return accumulator + currentCharacter;
        }
        return accumulator;
    }, '');

    console.log(extractedSequence);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
