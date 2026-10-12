const fileSystem = require("fs");

const inputLines = fileSystem.readFileSync("/dev/stdin", "UTF-8").split("\n");

const [totalItems, maxGroupCapacity, maxAllowedDifference] = inputLines[0].split(" ").map(Number);

const numericDataPoints = inputLines.slice(1, totalItems + 1).map(Number);

const sortedDataPoints = numericDataPoints.sort((first, second) => first - second);

if (totalItems === 0) {
    console.log(1);
} else {
    const finalState = sortedDataPoints.slice(1).reduce(
        (currentAccumulator, currentItemValue) => {
            const { groupCounter, availableSlots, groupStartValue } = currentAccumulator;

            const canFitInCurrentGroup = currentItemValue <= groupStartValue + maxAllowedDifference && availableSlots > 0;

            return canFitInCurrentGroup
                ? {
                      groupCounter,
                      availableSlots: availableSlots - 1,
                      groupStartValue,
                  }
                : {
                      groupCounter: groupCounter + 1,
                      availableSlots: maxGroupCapacity - 1,
                      groupStartValue: currentItemValue,
                  };
        },
        {
            groupCounter: 1,
            availableSlots: maxGroupCapacity - 1,
            groupStartValue: sortedDataPoints[0],
        }
    );

    console.log(finalState.groupCounter);
}
