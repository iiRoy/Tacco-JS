function* generateInputTokens() {
    const fileSystem = require("fs");
    const fileContent = fileSystem.readFileSync("/dev/stdin", "utf-8");
    const trimmedContent = fileContent.trim();
    const tokens = trimmedContent.split(/\n|\s/);
    for (const token of tokens) {
        yield token;
    }
}

function retrieveInputValues(numToFetch, inputIterator) {
    const currentIterator = inputIterator || this.inputSource || (this.inputSource = generateInputTokens());
    const collectedItems = [];
    let fetchCounter = 0;
    while (fetchCounter < numToFetch) {
        const nextItem = currentIterator.next().value;
        collectedItems.push(nextItem);
        fetchCounter++;
    }
    return collectedItems;
}

const convertToInteger = (strValue) => {
    return parseInt(strValue, 10);
};

(() => {
    const initialInputStrings = retrieveInputValues(1);
    const [countString] = initialInputStrings;
    const numberOfElements = convertToInteger(countString);

    const elementStrings = retrieveInputValues(numberOfElements);
    const numericElements = elementStrings.map(convertToInteger);

    let cumulativeXor = 0;
    for (const element of numericElements) {
        cumulativeXor ^= element;
    }

    const finalResults = [];
    for (let index = 0; index < numberOfElements; index += 1) {
        const currentElement = numericElements[index];
        const xorResult = cumulativeXor ^ currentElement;
        finalResults.push(xorResult);
    }

    console.log(finalResults.join(' '));
})();
