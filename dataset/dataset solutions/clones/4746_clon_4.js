const obtainContent = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const presentOutcome = (value) => console.log(value);

const computeResult = (inputData) => {
    const contentSegments = inputData.split("\n");
    const itemQuantity = Number(contentSegments[0]);
    const numberSequence = contentSegments[1].split(" ").map(Number);

    const tallyMap = numberSequence.reduce((accumulator, currentNumber) => {
        accumulator.set(currentNumber, (accumulator.get(currentNumber) || 0) + 1);
        return accumulator;
    }, new Map());

    const orderedKeys = Array.from(tallyMap.keys()).sort((a, b) => a - b);

    let initialSingles = 0;
    let countsToReduce = [];

    for (const key of orderedKeys) {
        const currentTally = tallyMap.get(key);
        if (currentTally === 1) {
            initialSingles++;
        } else {
            countsToReduce.push([key, currentTally]);
        }
    }

    const applyReduction = (leftPtr, rightPtr, currentCounts) => {
        if (leftPtr > rightPtr) {
            return currentCounts;
        }

        const leftEntry = currentCounts[leftPtr];
        const rightEntry = currentCounts[rightPtr];

        if (leftEntry[1] <= 1) {
            return applyReduction(leftPtr + 1, rightPtr, currentCounts);
        }

        if (rightEntry[1] <= 1) {
            return applyReduction(leftPtr, rightPtr - 1, currentCounts);
        }

        if (leftPtr === rightPtr) {
            leftEntry[1] = leftEntry[1] % 2;
            return currentCounts;
        }

        leftEntry[1]--;
        rightEntry[1]--;
        return applyReduction(leftPtr, rightPtr, currentCounts);
    };

    const reducedCounts = applyReduction(0, countsToReduce.length - 1, countsToReduce);

    let remainingReduced = 0;
    for (const entry of reducedCounts) {
        if (entry[1] === 1) {
            remainingReduced++;
        }
    }

    const finalSum = initialSingles + remainingReduced;
    presentOutcome(finalSum);
};

computeResult(obtainContent());