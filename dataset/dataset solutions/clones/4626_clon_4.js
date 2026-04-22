const processDataStream = (rawInputText) => {
    const dataSegments = rawInputText.split('\n');
    const totalItems = parseInt(dataSegments[0], 10);
    const numericalElements = dataSegments[1].split(' ').map(Number);

    const initialAccumulatorState = {
        currentSum: 0,
        adjustments: 0,
        lastStateSum: 0
    };

    const transformReducer = (accumulator, currentElement, index) => {
        let { currentSum, adjustments, lastStateSum } = accumulator;

        let newSum = currentSum + currentElement;
        let newAdjustments = adjustments;

        if (index === 0) {
            if (newSum === 0) {
                const nextElement = numericalElements[index + 1];

                if (nextElement >= 0) {
                    newSum -= (nextElement - 1);
                    if (newSum === 0) {
                        newSum--;
                    }
                    newAdjustments += Math.abs(newSum);
                } else {
                    newSum += (Math.abs(nextElement) - 1);
                    if (newSum === 0) {
                        newSum++;
                    }
                    newAdjustments += newSum;
                }
            }
        } else {
            if (lastStateSum > 0) {
                if (newSum >= 0) {
                    newAdjustments += (newSum + 1);
                    newSum = -1;
                }
            } else {
                if (newSum <= 0) {
                    newAdjustments += (Math.abs(newSum) + 1);
                    newSum = 1;
                }
            }
        }

        return {
            currentSum: newSum,
            adjustments: newAdjustments,
            lastStateSum: newSum
        };
    };

    const finalState = numericalElements.reduce(transformReducer, initialAccumulatorState);

    return finalState.adjustments;
};

console.log(processDataStream(require("fs").readFileSync("/dev/stdin", "utf8")));