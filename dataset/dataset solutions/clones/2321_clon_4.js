function processInputData(sourceData) {
    const lines = sourceData.split('\n');
    const numericValue = Number(lines[0]);
    const wordParts = lines[1].split(' ');

    function interleaveCharacters(primarySegment, secondarySegment, iterationCount, currentIndex = 0, collectedCharacters = []) {
        if (currentIndex >= iterationCount) {
            return collectedCharacters.join('');
        }
        collectedCharacters.push(primarySegment.substring(currentIndex, currentIndex + 1));
        collectedCharacters.push(secondarySegment.substring(currentIndex, currentIndex + 1));
        return interleaveCharacters(primarySegment, secondarySegment, iterationCount, currentIndex + 1, collectedCharacters);
    }

    const finalResult = interleaveCharacters(wordParts[0], wordParts[1], numericValue);
    console.log(finalResult);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));