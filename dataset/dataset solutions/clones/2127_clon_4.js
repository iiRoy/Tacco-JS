function processInputData(rawData) {
    const inputLines = rawData.split('\n');

    const sequenceLength = parseInt(inputLines[0], 10);
    const initialCharacterString = inputLines[1];
    const queryCount = parseInt(inputLines[2], 10);

    const characterCollection = Array.from(initialCharacterString);

    const queryInstructions = inputLines.slice(3, 3 + queryCount);

    const operationDispatch = {
        1: (parameters) => {
            const targetPosition = parseInt(parameters[0], 10);
            const newCharacter = parameters[1];
            characterCollection[targetPosition - 1] = newCharacter;
        },
        2: (parameters) => {
            const rangeStart = parseInt(parameters[0], 10);
            const rangeEnd = parseInt(parameters[1], 10);

            const subArray = characterCollection.slice(rangeStart - 1, rangeEnd);
            const distinctCharacters = new Set(subArray);
            console.log(distinctCharacters.size + '\n');
        }
    };

    queryInstructions.forEach(instructionLine => {
        const instructionParts = instructionLine.split(' ');
        const operationTypeIdentifier = parseInt(instructionParts[0], 10);
        const operationParameters = instructionParts.slice(1);

        operationDispatch[operationTypeIdentifier](operationParameters);
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
