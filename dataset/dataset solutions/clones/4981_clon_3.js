function ProcessInput(rawData) {
    const sourceString = rawData;
    const lastCharacterIndex = sourceString.length - 1;

    const calculateExpressionSum = (expressionText) => {
        const numberStrings = expressionText.split("+");
        const numericValues = numberStrings.map(Number);
        return numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    };

    function exploreCombinations(currentSegment, currentPosition) {
        if (currentPosition === lastCharacterIndex) {
            return calculateExpressionSum(currentSegment);
        }

        const nextCharacter = sourceString[currentPosition + 1];

        // Option 1: Append the next character directly to form a larger number
        const resultFromDirectAppend = exploreCombinations(currentSegment + nextCharacter, currentPosition + 1);

        // Option 2: Insert a '+' before appending the next character
        const resultFromPlusAppend = exploreCombinations(currentSegment + "+" + nextCharacter, currentPosition + 1);

        return resultFromDirectAppend + resultFromPlusAppend;
    }

    const initialSegment = sourceString[0];
    const finalComputedValue = exploreCombinations(initialSegment, 0);

    console.log(finalComputedValue);
    return;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
