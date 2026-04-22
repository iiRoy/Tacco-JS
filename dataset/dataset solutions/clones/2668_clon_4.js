function executeProcessing(sourceData) {
    const collection = sourceData.split('\n');
    const metadata = collection[0].split(' ');
    const maximumDuration = Number(metadata[1]);

    const initialWorkUnits = collection.slice(1)
        .filter(entry => entry.trim() !== '')
        .map(entry => {
            const components = entry.split(' ');
            return {
                completionLimit: Number(components[0]),
                rewardValue: Number(components[1])
            };
        });

    const finalResult = Array.from({ length: maximumDuration }, (_, idx) => maximumDuration - idx)
        .reduce((accumulator, currentIterationDay) => {
            const eligibleUnits = accumulator.remainingUnits.filter(unit =>
                unit.completionLimit <= currentIterationDay
            );

            if (eligibleUnits.length === 0) {
                return accumulator;
            }

            const topUnit = eligibleUnits.reduce((best, current) => {
                return (current.rewardValue > best.rewardValue) ? current : best;
            }, { rewardValue: -1 });

            return {
                currentSum: accumulator.currentSum + topUnit.rewardValue,
                remainingUnits: accumulator.remainingUnits.filter(unit => unit !== topUnit)
            };
        }, { currentSum: 0, remainingUnits: initialWorkUnits });

    return finalResult.currentSum;
}

console.log(executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8")));