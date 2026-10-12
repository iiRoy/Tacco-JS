function determineBestSingleTrade(dailyPrices) {
    if (dailyPrices.length < 2) {
        return 0;
    }

    let currentGrowthSequence = 0;
    let bestGrowthSequence = 0;

    for (
        let currentDay = 1;
        currentDay < dailyPrices.length;
        currentDay++
    ) {
        const dailyChange =
            dailyPrices[currentDay] -
            dailyPrices[currentDay - 1];

        currentGrowthSequence = Math.max(
            0,
            currentGrowthSequence + dailyChange
        );

        bestGrowthSequence = Math.max(
            bestGrowthSequence,
            currentGrowthSequence
        );
    }

    return bestGrowthSequence;
}