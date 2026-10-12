function calculateEditDistance(source, target) {
    if (source.length === 0) {
        return target.length;
    }

    if (target.length === 0) {
        return source.length;
    }

    let previousRow = Array.from(
        { length: target.length + 1 },
        (_, position) => position
    );

    for (
        let sourcePosition = 1;
        sourcePosition <= source.length;
        sourcePosition++
    ) {
        const currentRow = new Array(
            target.length + 1
        );

        currentRow[0] = sourcePosition;

        for (
            let targetPosition = 1;
            targetPosition <= target.length;
            targetPosition++
        ) {
            const charactersAreEqual =
                source[sourcePosition - 1] ===
                target[targetPosition - 1];

            const replacementIncrement =
                charactersAreEqual ? 0 : 1;

            const deletionCost =
                previousRow[targetPosition] + 1;

            const insertionCost =
                currentRow[targetPosition - 1] + 1;

            const replacementCost =
                previousRow[targetPosition - 1] +
                replacementIncrement;

            currentRow[targetPosition] = Math.min(
                deletionCost,
                insertionCost,
                replacementCost
            );
        }

        previousRow = currentRow;
    }

    return previousRow[target.length];
}