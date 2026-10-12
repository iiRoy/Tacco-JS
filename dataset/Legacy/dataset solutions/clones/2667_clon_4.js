function processSchedule(inputData) {
    const lines = inputData.trim().split('\n');
    const [firstLine, ...jobDescriptions] = lines;

    const [totalJobsCount, maxAvailableDays] = firstLine.split(' ').map(Number);

    const allJobOpportunities = jobDescriptions.map(description => description.split(' ').map(Number));

    const orderedOpportunities = allJobOpportunities.slice().sort((opportunityA, opportunityB) => {
        const rewardA = opportunityA[1];
        const rewardB = opportunityB[1];
        const deadlineA = opportunityA[0];
        const deadlineB = opportunityB[0];

        if (rewardA > rewardB) {
            if (deadlineA > deadlineB) {
                return 1;
            }
            return -1;
        }
        return 1;
    });

    const dailyIterations = Array.from({ length: maxAvailableDays }, (_, i) => i + 1);

    const finalSchedulingResult = dailyIterations.reduce((accumulator, currentDay) => {
        const { accumulatedProfit, remainingOpportunities } = accumulator;

        let selectedOpportunityIndex = -1;
        for (let i = 0; i < remainingOpportunities.length; i++) {
            if (remainingOpportunities[i][0] <= currentDay) {
                selectedOpportunityIndex = i;
                break;
            }
        }

        if (selectedOpportunityIndex !== -1) {
            const chosenOpportunity = remainingOpportunities[selectedOpportunityIndex];
            const updatedProfit = accumulatedProfit + chosenOpportunity[1];
            const updatedOpportunities = remainingOpportunities.filter((_, idx) => idx !== selectedOpportunityIndex);
            return { accumulatedProfit: updatedProfit, remainingOpportunities: updatedOpportunities };
        } else {
            return accumulator;
        }
    }, { accumulatedProfit: 0, remainingOpportunities: orderedOpportunities });

    console.log(finalSchedulingResult.accumulatedProfit);
}

processSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
