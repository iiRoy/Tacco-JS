const processInput = (sourceData) => {
    const numericSequence = sourceData.split('\n').at(1).split(' ').map(Number);

    const computeDivisions = (currentSet, currentTally) => {
        const hasOddElement = currentSet.some(element => (element & 1) !== 0);

        if (hasOddElement) {
            return currentTally;
        } else {
            const nextSet = currentSet.map(element => element >> 1);
            return computeDivisions(nextSet, currentTally + 1);
        }
    };

    return computeDivisions(numericSequence, 0);
};

const result = processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(result);
