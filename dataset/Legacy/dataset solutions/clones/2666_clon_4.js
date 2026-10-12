function processJobData(rawData) {
    const lineSegments = rawData.split('\n');

    const [jobCountStr, totalDaysStr] = lineSegments[0].split(' ');
    const jobCount = parseInt(jobCountStr, 10);
    const totalDays = parseInt(totalDaysStr, 10);

    const jobOfferings = lineSegments.slice(1, jobCount + 1).map(line => {
        const [deadlineValue, rewardValue] = line.split(' ');
        return [parseInt(deadlineValue, 10), parseInt(rewardValue, 10)];
    });

    jobOfferings.sort((offerA, offerB) => offerB[1] - offerA[1]);

    let accumulatedValue = 0;
    const scheduledSlots = new Array(totalDays).fill(false);

    jobOfferings.forEach(currentOffer => {
        const [offerDeadline, offerReward] = currentOffer;
        const completionDayIndex = offerDeadline - 1;

        let potentialScheduleDay = Math.min(totalDays - 1, completionDayIndex);

        while (potentialScheduleDay >= 0) {
            if (!scheduledSlots[potentialScheduleDay]) {
                scheduledSlots[potentialScheduleDay] = true;
                accumulatedValue += offerReward;
                break;
            }
            potentialScheduleDay--;
        }
    });

    console.log(accumulatedValue);
}

processJobData(require("fs").readFileSync("/dev/stdin", "utf8"));
