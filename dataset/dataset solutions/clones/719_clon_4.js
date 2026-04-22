const UNREACHABLE_COUNT = 1000000000;

function produceNumberSequence(upperBound, isOddFiltered) {
    const sequence = [];
    sequence.push(0);

    let current_val = 1;
    let next_increment_base = 1;
    let increment_step = 1;

    while (current_val <= upperBound) {
        if (!isOddFiltered || (current_val % 2 !== 0)) {
            sequence.push(current_val);
        }
        increment_step++;
        next_increment_base += increment_step;
        current_val += next_increment_base;
    }
    return sequence;
}

function calculateMinimumRepresentations(targetSum, availableNumbers) {
    const iterationTotal = availableNumbers.length - 1;

    const representationTables = Array.from({ length: 5 }, () => new Map());

    representationTables[0].set(0, 0);
    for (let k = 1; k <= targetSum; k++) {
        representationTables[0].set(k, UNREACHABLE_COUNT);
    }

    for (let step = 1; step <= iterationTotal; step++) {
        const currentTableKey = step % 5;
        const previousTableKey = (currentTableKey - 1 + 5) % 5;

        const selectedValue = availableNumbers[currentTableKey];

        const currentTable = representationTables[currentTableKey];
        const previousTable = representationTables[previousTableKey];

        currentTable.set(0, 0);

        for (let val = 1; val <= targetSum; val++) {
            let withoutCurrent = previousTable.get(val) || UNREACHABLE_COUNT;
            let withCurrent = UNREACHABLE_COUNT;

            if (val >= selectedValue) {
                let countForRemaining = currentTable.get(val - selectedValue);
                if (countForRemaining === undefined) countForRemaining = UNREACHABLE_COUNT;

                if (countForRemaining !== UNREACHABLE_COUNT) {
                    withCurrent = countForRemaining + 1;
                }
            }
            currentTable.set(val, Math.min(withoutCurrent, withCurrent));
        }
    }

    const finalTableKey = iterationTotal % 5;
    return representationTables[finalTableKey].get(targetSum);
}

function processA(targetN) {
    const allTetrahedrals = produceNumberSequence(targetN, false);
    return calculateMinimumRepresentations(targetN, allTetrahedrals);
}

function processB(targetN) {
    const oddTetrahedrals = produceNumberSequence(targetN, true);
    return calculateMinimumRepresentations(targetN, oddTetrahedrals);
}

function entryPoint(inputData) {
    const lines = inputData.split("\n");
    let lineIndex = 0;
    while (true) {
        const valueN = parseInt(lines[lineIndex], 10);
        if (valueN === 0) break;
        
        const resultA = processA(valueN);
        const resultB = processB(valueN);
        console.log(resultA, resultB);
        
        lineIndex++;
    }
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));