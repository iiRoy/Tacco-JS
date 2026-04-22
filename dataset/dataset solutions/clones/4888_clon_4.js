function analyzeMarketData(dataString) {
    const marketInsights = dataString.trim().split('\n');
    const configurationValues = marketInsights[0].split(' ').map(Number);
    const elementCount = configurationValues[0];
    const timeParameter = configurationValues[1];
    const priceSeries = marketInsights[1].split(' ').map(Number);

    if (elementCount === 0) {
        console.log("0");
        return;
    }

    const initialAnalysisState = {
        maximumYield: 0,
        yieldOccurrences: 0,
        lowestObservedPrice: priceSeries[0]
    };

    const finalAnalysisResult = priceSeries.reduce((currentAnalysis, currentPrice) => {
        const potentialYield = currentPrice - currentAnalysis.lowestObservedPrice;

        if (potentialYield > currentAnalysis.maximumYield) {
            currentAnalysis.maximumYield = potentialYield;
            currentAnalysis.yieldOccurrences = 1;
        } else if (potentialYield === currentAnalysis.maximumYield && currentAnalysis.maximumYield !== 0) {
            currentAnalysis.yieldOccurrences++;
        }

        currentAnalysis.lowestObservedPrice = Math.min(currentAnalysis.lowestObservedPrice, currentPrice);

        return currentAnalysis;
    }, initialAnalysisState);

    const finalOutputValue = Math.min(finalAnalysisResult.yieldOccurrences, Math.floor(timeParameter / 2));
    console.log(finalOutputValue);
}

analyzeMarketData(require("fs").readFileSync("/dev/stdin", "utf8"));