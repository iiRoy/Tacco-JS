const processSchedule = (sourceText) => {
    const lines = sourceText.split('\n');
    const headerParts = lines[0].split(' ');
    const activityCount = Number(headerParts[0]);
    const overallPeriod = Number(headerParts[1]);

    const taskEntries = lines.slice(1, activityCount + 1).map(line => {
        const [timeCost, monetaryGain] = line.split(' ').map(Number);
        return { timeCost, monetaryGain };
    });

    taskEntries.sort((a, b) => b.monetaryGain - a.monetaryGain);

    const scheduleSlots = new Array(overallPeriod).fill(0);

    let totalAccumulatedGain = 0;

    for (const currentTask of taskEntries) {
        const latestPossibleSlotIndex = overallPeriod - currentTask.timeCost;

        for (let slotCandidate = latestPossibleSlotIndex; slotCandidate >= 0; slotCandidate--) {
            if (scheduleSlots[slotCandidate] === 0) {
                scheduleSlots[slotCandidate] = currentTask.monetaryGain;
                totalAccumulatedGain += currentTask.monetaryGain;
                break;
            }
        }
    }

    console.log(totalAccumulatedGain);
};

processSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));