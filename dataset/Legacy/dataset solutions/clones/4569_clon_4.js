const processAndOutput = (rawData) => {
    const [heightDimension, widthDimension] = rawData
        .trim()
        .split('\n')[0]
        .split(' ')
        .map(Number);

    const finalResult = calculateAreaDifference(heightDimension, widthDimension);
    console.log(finalResult);
};

const calculateAreaDifference = (primaryHeight, primaryWidth) => {
    if (primaryHeight % 3 === 0 || primaryWidth % 3 === 0) {
        return 0;
    }

    let overallMinimalDifference = primaryHeight * primaryWidth;

    const evaluateCuttingScheme = (hDimension, wDimension) => {
        let currentSchemeMin = hDimension * wDimension;
        let lastObservedDifference = Infinity;

        function* cutPositionGenerator(maxCutValue) {
            for (let currentCut = 0; currentCut <= maxCutValue; currentCut++) {
                const feedbackDifference = yield currentCut;
                if (feedbackDifference !== undefined && feedbackDifference > lastObservedDifference) {
                    return;
                }
                lastObservedDifference = feedbackDifference;
            }
        }

        const cutIterator = cutPositionGenerator(wDimension);
        let iterationState = cutIterator.next();

        while (!iterationState.done) {
            const currentCutPoint = iterationState.value;

            const pieceOneArea = currentCutPoint * hDimension;
            const remainingSegmentWidth = wDimension - currentCutPoint;
            const pieceTwoArea = remainingSegmentWidth * Math.ceil(hDimension / 2);
            const pieceThreeArea = remainingSegmentWidth * Math.floor(hDimension / 2);

            const currentSchemeDifference = Math.max(
                Math.abs(pieceOneArea - pieceTwoArea),
                Math.abs(pieceOneArea - pieceThreeArea),
                Math.abs(pieceTwoArea - pieceThreeArea)
            );

            currentSchemeMin = Math.min(currentSchemeMin, currentSchemeDifference);

            iterationState = cutIterator.next(currentSchemeDifference);
        }
        return currentSchemeMin;
    };

    overallMinimalDifference = Math.min(overallMinimalDifference, evaluateCuttingScheme(primaryHeight, primaryWidth));
    overallMinimalDifference = Math.min(overallMinimalDifference, evaluateCuttingScheme(primaryWidth, primaryHeight));

    overallMinimalDifference = Math.min(overallMinimalDifference, primaryHeight, primaryWidth);

    return overallMinimalDifference;
};

processAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
