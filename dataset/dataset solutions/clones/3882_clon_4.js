'use strict';

function processSushiRoute(rawData) {
    const numericData = rawData.trim().split(/\s+/).map(Number);

    const sushiCount = numericData[0];
    const trackLength = numericData[1];

    const sushiLocations = [];
    for (let i = 0; i < sushiCount; i++) {
        sushiLocations.push({
            position: numericData[2 + 2 * i],
            value: numericData[2 + 2 * i + 1]
        });
    }

    const forwardAccumulations = sushiLocations.reduce((accumulator, currentPoint, index) => {
        const previousState = accumulator.length > 0 ? accumulator[index - 1] : { totalValue: 0, maxNetProfit: 0 };
        const currentTotalValue = previousState.totalValue + currentPoint.value;
        const currentNetProfit = currentTotalValue - currentPoint.position;
        const currentMaxNetProfit = Math.max(previousState.maxNetProfit, currentNetProfit);
        
        accumulator.push({
            position: currentPoint.position,
            value: currentPoint.value,
            totalValue: currentTotalValue,
            netProfit: currentNetProfit,
            maxNetProfit: currentMaxNetProfit
        });
        return accumulator;
    }, []);

    const backwardAccumulations = sushiLocations.reduceRight((accumulator, currentPoint, index) => {
        const nextState = accumulator.length > 0 ? accumulator[0] : { totalValue: 0, maxNetProfit: 0 };
        const currentTotalValue = nextState.totalValue + currentPoint.value;
        const currentDistanceCCW = trackLength - currentPoint.position;
        const currentNetProfit = currentTotalValue - currentDistanceCCW;
        const currentMaxNetProfit = Math.max(nextState.maxNetProfit, currentNetProfit);

        accumulator.unshift({
            position: currentPoint.position,
            value: currentPoint.value,
            totalValue: currentTotalValue,
            netProfit: currentNetProfit,
            maxNetProfit: currentMaxNetProfit
        });
        return accumulator;
    }, []);

    let overallMaxProfit = 0;

    if (sushiCount > 0) {
        overallMaxProfit = Math.max(overallMaxProfit, forwardAccumulations[sushiCount - 1].maxNetProfit);
        overallMaxProfit = Math.max(overallMaxProfit, backwardAccumulations[0].maxNetProfit);
    }

    for (let i = 0; i < sushiCount; i++) {
        const profitCWAndReturn = forwardAccumulations[i].totalValue - (2 * forwardAccumulations[i].position);
        let additionalCCWProfit = 0;
        if (i + 1 < sushiCount) {
            additionalCCWProfit = backwardAccumulations[i + 1].maxNetProfit;
        }
        overallMaxProfit = Math.max(overallMaxProfit, profitCWAndReturn + additionalCCWProfit);
    }

    for (let i = 1; i < sushiCount; i++) {
        const profitCCWAndReturn = backwardAccumulations[i].totalValue - (2 * (trackLength - backwardAccumulations[i].position));
        let additionalCWProfit = forwardAccumulations[i - 1].maxNetProfit;
        overallMaxProfit = Math.max(overallMaxProfit, profitCCWAndReturn + additionalCWProfit);
    }

    console.log(overallMaxProfit);
}

processSushiRoute(require('fs').readFileSync('/dev/stdin', 'utf8'));
