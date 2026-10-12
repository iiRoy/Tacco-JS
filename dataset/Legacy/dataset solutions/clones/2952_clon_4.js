function processInputData(rawData) {
    const lineSegments = rawData.split("\n");

    const firstLineParts = lineSegments[0].split(" ");
    const firstNumericValue = Number.parseInt(firstLineParts[0], 10);
    let targetZeroBasedIndex = Number.parseInt(firstLineParts[1], 10);

    const sourceText = lineSegments[1];

    targetZeroBasedIndex = targetZeroBasedIndex - 1;

    const charConversionMap = new Map([
        ['A', 'a'],
        ['B', 'b'],
        ['C', 'c']
    ]);

    const originalChar = sourceText[targetZeroBasedIndex];
    const transformedChar = charConversionMap.get(originalChar) || originalChar;

    const finalOutputString = Array.from(sourceText).reduce((accumulator, currentCharacter, currentIndex) => {
        if (currentIndex === targetZeroBasedIndex) {
            return accumulator + transformedChar;
        } else if (currentIndex < targetZeroBasedIndex - 1) {
            return accumulator + currentCharacter;
        } else if (currentIndex > targetZeroBasedIndex) {
            return accumulator + currentCharacter;
        }
        return accumulator;
    }, '');

    console.log(finalOutputString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
