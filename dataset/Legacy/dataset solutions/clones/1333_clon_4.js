const processOperations = (inputData) => {
    const sourceLines = inputData.split("\n");

    let [initialContent, opCountString, ...operationInstructions] = sourceLines;
    const operationLimit = Number(opCountString);

    const relevantInstructions = operationInstructions.slice(0, operationLimit);

    const actionRegistry = {
        "print": (currentContent, startPos, endPos, _substitute) => {
            console.log(currentContent.substring(startPos, endPos + 1));
            return currentContent;
        },
        "replace": (currentContent, startPos, endPos, substituteText) => {
            const contentChars = currentContent.split('');
            contentChars.splice(startPos, endPos - startPos + 1, ...substituteText.split(''));
            return contentChars.join('');
        },
        "reverse": (currentContent, startPos, endPos, _substitute) => {
            const contentChars = currentContent.split('');
            const segmentToFlip = contentChars.splice(startPos, endPos - startPos + 1);
            segmentToFlip.reverse();
            contentChars.splice(startPos, 0, ...segmentToFlip);
            return contentChars.join('');
        }
    };

    relevantInstructions.reduce((currentAccumulatedContent, instructionLine) => {
        const instructionParts = instructionLine.split(" ");
        const commandKey = instructionParts[0];
        const indexOne = Number(instructionParts[1]);
        const indexTwo = Number(instructionParts[2]);
        const optionalArgument = instructionParts[3];

        const handlerFunction = actionRegistry[commandKey];
        if (handlerFunction) {
            return handlerFunction(currentAccumulatedContent, indexOne, indexTwo, optionalArgument);
        }
        return currentAccumulatedContent;
    }, initialContent);
};

processOperations(require("fs").readFileSync("/dev/stdin", "utf-8"));
