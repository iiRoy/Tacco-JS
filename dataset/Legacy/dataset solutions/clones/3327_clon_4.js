'use strict';
(function(dependencyResolver) {
    const fileContent = dependencyResolver('fs').readFileSync('/dev/stdin', 'utf8');
    const numericTokens = fileContent.trim().split(/\s+/).map(Number);

    const mainItemCount = numericTokens.shift();
    const categoryTallies = numericTokens.reduce((accumulator, currentCategory) => {
        accumulator[currentCategory]++;
        return accumulator;
    }, Array.from({ length: 4 }, () => 0));

    const expectationMatrix = Object.fromEntries(
        Array.from({ length: mainItemCount + 3 }, (_, outerIndex) => outerIndex - 1)
            .map(firstDimensionKey => [
                firstDimensionKey,
                Object.fromEntries(
                    Array.from({ length: mainItemCount + 3 - firstDimensionKey }, (_, middleIndex) => middleIndex - 1)
                        .map(secondDimensionKey => {
                            const innermostContainer = Array.from({ length: mainItemCount + 2 - firstDimensionKey - secondDimensionKey }, () => 0);
                            Object.defineProperty(innermostContainer, '-1', { value: 0, writable: true, configurable: true });
                            return [secondDimensionKey, innermostContainer];
                        })
                )
            ])
    );

    Array.from({ length: mainItemCount }, (_, k) => k + 1)
        .forEach(currentIteration => {
            expectationMatrix[currentIteration][0][0] = expectationMatrix[currentIteration - 1][0][0] + (mainItemCount / currentIteration);
            Array.from({ length: currentIteration }, (_, k) => k + 1)
                .forEach(() => { /* No operation, preserving the original's empty inner loop structure */ });
        });

})(require);
