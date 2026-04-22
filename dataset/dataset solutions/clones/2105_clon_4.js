function processSequence(rawText) {
    const commandLines = rawText.split("\n");
    const baseSegment = commandLines[0];
    const actionDescriptors = commandLines.slice(1);

    const initialState = {
        leadingParts: [],
        trailingParts: [baseSegment],
        isDirectOrder: true
    };

    const finalState = actionDescriptors.reduce((currentState, instructionLine) => {
        const instructionElements = instructionLine.split(" ");
        const primaryDirective = parseInt(instructionElements[0], 10);

        if (primaryDirective === 1) {
            return {
                ...currentState,
                isDirectOrder: !currentState.isDirectOrder
            };
        } else {
            const secondaryDirective = parseInt(instructionElements[1], 10);
            const payloadText = instructionElements[2];

            let shouldPrepend = false;

            if (currentState.isDirectOrder) {
                shouldPrepend = (secondaryDirective === 2);
            } else {
                shouldPrepend = (secondaryDirective === 1);
            }

            if (shouldPrepend) {
                return {
                    ...currentState,
                    leadingParts: [...currentState.leadingParts, payloadText]
                };
            } else {
                return {
                    ...currentState,
                    trailingParts: [...currentState.trailingParts, payloadText]
                };
            }
        }
    }, initialState);

    let compositeStructure = [];
    compositeStructure.push(...finalState.leadingParts.reverse());
    compositeStructure.push(...finalState.trailingParts);

    let outputPayload = compositeStructure.join("");

    if (finalState.isDirectOrder) {
        outputPayload = outputPayload.split("").reverse().join("");
    }

    console.log(outputPayload);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());