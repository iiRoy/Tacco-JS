function processInput(rawText) {
    const lines = rawText.split('\n');
    const iterCount = Number(lines[0]);
    const initialNumericList = lines.slice(1).map(Number);

    const transformPair = (alpha, beta) => {
        return alpha === beta ? alpha : Math.abs(alpha - beta);
    };

    const processPairsFunctional = (sourceCollection) => {
        return Array.from({ length: sourceCollection.length / 2 }, (_, index) => {
            const firstElement = sourceCollection[index * 2];
            const secondElement = sourceCollection[index * 2 + 1];
            return transformPair(firstElement, secondElement);
        });
    };

    const performTransformations = (remainingIterations, currentValues) => {
        if (remainingIterations === 0) {
            return currentValues;
        }
        const nextValues = processPairsFunctional(currentValues);
        return performTransformations(remainingIterations - 1, nextValues);
    };

    const finalResultList = performTransformations(iterCount, initialNumericList);

    console.log(finalResultList[0]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));