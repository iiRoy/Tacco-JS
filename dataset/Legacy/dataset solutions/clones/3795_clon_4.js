const processInput = (rawInput) => {
    const dataLines = rawInput.split('\n');
    const sequenceLength = Number(dataLines.shift());
    const characterString = dataLines.join('');

    const calculateCharCount = (textSegment, targetChar) =>
        Array.from(textSegment).reduce((accumulator, currentCharacter) => accumulator + (currentCharacter === targetChar ? 1 : 0), 0);

    let lowestChangeCount = 300000;

    if (sequenceLength === 0) {
        console.log(lowestChangeCount);
        return 0;
    }

    const allIterationCounts = Array.from({ length: sequenceLength }, (_, currentIdx) => {
        const prefixSegment = characterString.substring(0, currentIdx);
        const suffixSegment = characterString.substring(currentIdx + 1, sequenceLength);

        const prefixWestCount = calculateCharCount(prefixSegment, 'W');
        const suffixEastCount = calculateCharCount(suffixSegment, 'E');

        return prefixWestCount + suffixEastCount;
    });

    if (allIterationCounts.includes(0)) {
        lowestChangeCount = 0;
    } else {
        lowestChangeCount = Math.min(...allIterationCounts);
    }

    console.log(lowestChangeCount);
    return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
