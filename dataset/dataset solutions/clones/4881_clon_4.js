const processMarketData = (marketSnapshot) => {
    const dataLines = marketSnapshot.split('\n');
    const priceSeriesTokens = dataLines[1].trim().split(' ');

    const financialFigures = priceSeriesTokens.map(Number);

    const analyticsResult = financialFigures.reduce((currentMetrics, currentPricePoint) => {
        const lowestRecordedValue = Math.min(currentMetrics.lowestPointSeen, currentPricePoint);
        const calculatedGain = currentPricePoint - lowestRecordedValue;

        let subsequentPeakGain = currentMetrics.greatestGainAttained;
        let subsequentPeakGainCount = currentMetrics.attainmentCount;

        if (calculatedGain > currentMetrics.greatestGainAttained) {
            subsequentPeakGain = calculatedGain;
            subsequentPeakGainCount = 1;
        } else if (calculatedGain === currentMetrics.greatestGainAttained) {
            subsequentPeakGainCount++;
        }

        return {
            lowestPointSeen: lowestRecordedValue,
            greatestGainAttained: subsequentPeakGain,
            attainmentCount: subsequentPeakGainCount
        };
    }, { lowestPointSeen: Infinity, greatestGainAttained: 0, attainmentCount: 0 });

    return analyticsResult.attainmentCount;
};

const observedMarketInput = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutput = processMarketData(observedMarketInput);
console.log(finalOutput);