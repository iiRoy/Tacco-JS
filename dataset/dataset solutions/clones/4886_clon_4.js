function processDataStream(rawData) {
    const [firstSegment, secondSegment] = rawData.trim().split(/\r?\n/);
    
    const [paramCount, durationThreshold] = firstSegment.split(/\s+/).map(Number);
    
    const pricePoints = secondSegment.split(/\s+/).map(Number);

    const initialAnalysisState = {
        minimumEncountered: pricePoints[0],
        maximalYield: 0,
        maximalYieldOccurrences: 0
    };

    const finalAnalysisResult = pricePoints.reduce((currentAnalysis, currentPricePoint) => {
        const potentialYield = currentPricePoint - currentAnalysis.minimumEncountered;

        let newMaximalYield = currentAnalysis.maximalYield;
        let newMaximalYieldOccurrences = currentAnalysis.maximalYieldOccurrences;

        if (potentialYield > currentAnalysis.maximalYield) {
            newMaximalYield = potentialYield;
            newMaximalYieldOccurrences = 1;
        } else if (potentialYield === currentAnalysis.maximalYield) {
            newMaximalYieldOccurrences = currentAnalysis.maximalYieldOccurrences + 1;
        }

        const newMinimumEncountered = Math.min(currentAnalysis.minimumEncountered, currentPricePoint);

        return {
            minimumEncountered: newMinimumEncountered,
            maximalYield: newMaximalYield,
            maximalYieldOccurrences: newMaximalYieldOccurrences
        };
    }, initialAnalysisState);

    const resultantCount = finalAnalysisResult.maximalYieldOccurrences;
    const halvedThreshold = Math.floor(durationThreshold / 2);

    console.log(Math.min(resultantCount, halvedThreshold));
}

processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));