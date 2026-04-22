(function(scriptSource){
    const collectionOfPiles = new Map();

    const commandProcessors = {
        deposit: function(pileIdentifier, itemValue) {
            if (!collectionOfPiles.has(pileIdentifier)) {
                collectionOfPiles.set(pileIdentifier, []);
            }
            collectionOfPiles.get(pileIdentifier).push(itemValue);
        },

        extract: function(pileIdentifier) {
            const currentPile = collectionOfPiles.get(pileIdentifier);
            if (currentPile && currentPile.length > 0) {
                const retrievedItem = currentPile.pop();
                console.log(retrievedItem);
            }
        },

        relocate: function(sourceIdentifier, targetIdentifier) {
            const sourcePile = collectionOfPiles.get(sourceIdentifier);
            if (sourcePile && sourcePile.length > 0) {
                const transferredItem = sourcePile.pop();
                if (!collectionOfPiles.has(targetIdentifier)) {
                    collectionOfPiles.set(targetIdentifier, []);
                }
                collectionOfPiles.get(targetIdentifier).push(transferredItem);
            }
        }
    };

    const parseInstructionLine = (lineContent) => {
        const parts = lineContent.trim().split(" ");
        const directive = parts[0];
        const parameters = parts.slice(1);
        return { directive, parameters };
    };

    const processInstructionStream = (instructionSet, currentPoint) => {
        if (currentPoint >= instructionSet.length) {
            return;
        }

        const currentLineText = instructionSet[currentPoint];
        const { directive, parameters } = parseInstructionLine(currentLineText);

        if (directive === "cease") {
            return;
        }

        const handlerFunction = commandProcessors[directive];
        if (handlerFunction) {
            handlerFunction(...parameters);
        }

        processInstructionStream(instructionSet, currentPoint + 1);
    };

    const entireInstructionSet = scriptSource.split("\n");
    processInstructionStream(entireInstructionSet, 1);

})(require("fs").readFileSync("/dev/stdin", "utf8"));