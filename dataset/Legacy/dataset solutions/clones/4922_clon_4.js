const calculateCombinedSchedule = (rawData) => {
    const processedLines = rawData.trim().split("\n");
    const scheduleEntries = processedLines.slice(1).map(line => line.split(" ").map(Number));

    const finalSchedulePair = scheduleEntries.reduce((currentOptimal, currentEntry) => {
        const [previousT, previousA] = currentOptimal;
        const [currentT, currentA] = currentEntry;

        if (previousT === 0 && previousA === 0) {
            return [currentT, currentA];
        }

        const scaleRequiredForT = Math.ceil(previousT / currentT);
        const scaleRequiredForA = Math.ceil(previousA / currentA);

        const overallScalingFactor = Math.max(scaleRequiredForT, scaleRequiredForA);

        return [currentT * overallScalingFactor, currentA * overallScalingFactor];
    }, [0, 0]);

    console.log(finalSchedulePair[0] + finalSchedulePair[1]);
};

calculateCombinedSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
