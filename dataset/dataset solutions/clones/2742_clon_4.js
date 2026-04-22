function ProcessData(rawData) {
    const dataLines = rawData.split("\n");
    const totalCount = parseInt(dataLines[0]);
    const numericalSequence = dataLines.slice(1).map(entry => parseInt(entry));

    const resultingPileHeads = numericalSequence.reduce((currentPileTops, currentValue) => {
        let optimalPilePosition = -1;
        let maximalPredecessorValue = -Infinity;

        currentPileTops.forEach((topValue, position) => {
            if (topValue < currentValue) {
                if (topValue > maximalPredecessorValue) {
                    maximalPredecessorValue = topValue;
                    optimalPilePosition = position;
                }
            }
        });

        if (optimalPilePosition === -1) {
            return [...currentPileTops, currentValue];
        } else {
            const updatedPileTops = [...currentPileTops];
            updatedPileTops[optimalPilePosition] = currentValue;
            return updatedPileTops;
        }
    }, []);

    return resultingPileHeads.length;
}

console.log(ProcessData(require("fs").readFileSync("/dev/stdin", "utf8")));