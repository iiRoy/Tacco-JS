function processScheduleData(rawInputString) {
    const LINE_SEPARATOR = '\n';
    const VALUE_SEPARATOR = ' ';

    const inputLines = rawInputString.split(LINE_SEPARATOR);
    const firstLineParts = inputLines[0].split(VALUE_SEPARATOR);

    const totalJobCount = parseInt(firstLineParts[0], 10);
    const totalDaysAvailable = parseInt(firstLineParts[1], 10);

    let accumulatedReward = 0;
    const availableJobs = [];

    for (let lineIndex = 0; lineIndex < totalJobCount; lineIndex++) {
        const jobDataParts = inputLines[lineIndex + 1].split(VALUE_SEPARATOR);
        const daysRequired = parseInt(jobDataParts[0], 10);
        const jobReward = parseInt(jobDataParts[1], 10);
        availableJobs.push([daysRequired, jobReward]);
    }

    const sortJobsByRewardDesc = (jobEntryA, jobEntryB) => {
        const rewardA = jobEntryA[1];
        const rewardB = jobEntryB[1];
        return rewardB - rewardA;
    };

    availableJobs.sort(sortJobsByRewardDesc);

    for (let currentDayIteration = 0; currentDayIteration < totalDaysAvailable; currentDayIteration++) {
        const remainingDaysForJob = totalDaysAvailable - currentDayIteration;
        for (let jobSearchIndex = 0; jobSearchIndex < availableJobs.length; jobSearchIndex++) {
            const currentJob = availableJobs[jobSearchIndex];
            const jobDuration = currentJob[0];
            const jobPayout = currentJob[1];

            if (remainingDaysForJob >= jobDuration) {
                accumulatedReward += jobPayout;
                availableJobs.splice(jobSearchIndex, 1);
                break;
            }
        }
    }
    console.log(accumulatedReward);
}

processScheduleData(require("fs").readFileSync("/dev/stdin", "utf8"));
