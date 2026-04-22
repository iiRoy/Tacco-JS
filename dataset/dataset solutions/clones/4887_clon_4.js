const processMarketData = (rawData) => {
    const textSegments = rawData.split('\n');
    const [itemCount, limitFactor] = textSegments[0].split(' ').map(Number);

    if (itemCount === 1) {
        return 0;
    }

    const pricePoints = textSegments[1].split(' ').map(Number);

    const initialAnalysis = {
        floorPrice: pricePoints[0],
        peakBenefit: 0,
        benefitOccurrences: 1
    };

    const finalAnalysis = pricePoints.slice(1).reduce((accumulator, currentAssetValue) => {
        const potentialBenefit = currentAssetValue - accumulator.floorPrice;
        
        let nextPeakBenefit = accumulator.peakBenefit;
        let nextBenefitOccurrences = accumulator.benefitOccurrences;

        if (potentialBenefit > accumulator.peakBenefit) {
            nextPeakBenefit = potentialBenefit;
            nextBenefitOccurrences = 1;
        } else if (potentialBenefit === accumulator.peakBenefit) {
            nextBenefitOccurrences++;
        }

        const nextFloorPrice = Math.min(accumulator.floorPrice, currentAssetValue);

        return {
            floorPrice: nextFloorPrice,
            peakBenefit: nextPeakBenefit,
            benefitOccurrences: nextBenefitOccurrences
        };
    }, initialAnalysis);

    const thresholdDividend = Math.floor(limitFactor / 2);
    return Math.min(finalAnalysis.benefitOccurrences, thresholdDividend);
};

const commenceTradingSimulation = (externalData) => {
    console.log(processMarketData(externalData));
};

commenceTradingSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));