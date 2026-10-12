function determineMinimumTextChanges(originalText, finalText) {
    const storedResults = new Map();

    function solveFromPositions(
        originalPosition,
        finalPosition
    ) {
        if (originalPosition === originalText.length) {
            return finalText.length - finalPosition;
        }

        if (finalPosition === finalText.length) {
            return originalText.length - originalPosition;
        }

        const stateIdentifier =
            originalPosition + ":" + finalPosition;

        if (storedResults.has(stateIdentifier)) {
            return storedResults.get(stateIdentifier);
        }

        let minimumCost;

        if (
            originalText[originalPosition] ===
            finalText[finalPosition]
        ) {
            minimumCost = solveFromPositions(
                originalPosition + 1,
                finalPosition + 1
            );
        } else {
            const removeCharacter = solveFromPositions(
                originalPosition + 1,
                finalPosition
            );

            const insertCharacter = solveFromPositions(
                originalPosition,
                finalPosition + 1
            );

            const replaceCharacter = solveFromPositions(
                originalPosition + 1,
                finalPosition + 1
            );

            minimumCost = 1 + Math.min(
                removeCharacter,
                insertCharacter,
                replaceCharacter
            );
        }

        storedResults.set(
            stateIdentifier,
            minimumCost
        );

        return minimumCost;
    }

    return solveFromPositions(0, 0);
}