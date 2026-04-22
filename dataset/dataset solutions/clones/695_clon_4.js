function orchestrateCardGames(inputFeedUnits) {
    const inputSegments = inputFeedUnits.trim().split('\n');
    let feedPointer = 0;
    const aggregatedResults = [];

    const processNextScenario = () => {
        if (feedPointer >= inputSegments.length) {
            return;
        }

        const [scenarioCardCount] = inputSegments[feedPointer++].split(' ').map(Number);
        const [scenarioOperationCount] = inputSegments[feedPointer++].split(' ').map(Number);

        if (scenarioCardCount === 0 && scenarioOperationCount === 0) {
            return;
        }

        const initialLayout = Array.from({ length: scenarioCardCount }, (_, cardIndex) => scenarioCardCount - cardIndex);

        const scenarioTransforms = Array.from({ length: scenarioOperationCount }, () => {
            const [operationStart, operationLength] = inputSegments[feedPointer++].split(' ').map(Number);
            return {
                designation: operationStart,
                span: operationLength
            };
        });

        const applyTransformation = (currentLayout, { designation, span }) => {
            const effectivePosition = designation - 1;

            const prefixSegment = currentLayout.slice(0, effectivePosition);
            const coreBlock = currentLayout.slice(effectivePosition, effectivePosition + span);
            const suffixSegment = currentLayout.slice(effectivePosition + span);

            return [...coreBlock, ...prefixSegment, ...suffixSegment];
        };

        const resultantLayout = scenarioTransforms.reduce(applyTransformation, initialLayout);

        aggregatedResults.push(resultantLayout[0]);

        processNextScenario();
    };

    processNextScenario();

    return aggregatedResults.join('\n');
}