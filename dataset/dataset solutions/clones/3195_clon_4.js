let accumulatedInput = '';

process.stdin.on('data', function (chunk) {
    accumulatedInput += chunk.toString();
});

process.stdin.on('end', function () {
    const allLines = accumulatedInput.trim().split('\n');

    const matchstickQuantities = new Map([
        ['0', 0], // Adhering to the original code's number[0] = 0
        ['1', 2],
        ['2', 5],
        ['3', 5],
        ['4', 4],
        ['5', 5],
        ['6', 6],
        ['7', 3],
        ['8', 7],
        ['9', 6]
    ]);

    const firstLineData = allLines[0].split(' ');
    const totalMatchsticks = Number(firstLineData[0]);
    const eligibleNumeralCount = Number(firstLineData[1]);

    const permittedNumerals = allLines[1].split(' ');

    const sequenceSolutions = Array(totalMatchsticks + 1).fill(null);
    sequenceSolutions[0] = '';

    function compareNumeralStrings(candidateA, currentOptimalB) {
        if (candidateA === null) return false;
        if (currentOptimalB === null) return true;

        if (candidateA.length > currentOptimalB.length) return true;
        if (candidateA.length < currentOptimalB.length) return false;
        return candidateA > currentOptimalB;
    }

    for (let currentStickBudget = 1; currentStickBudget <= totalMatchsticks; currentStickBudget++) {
        for (let numeralIndex = 0; numeralIndex < eligibleNumeralCount; numeralIndex++) {
            const activeDigit = permittedNumerals[numeralIndex];
            const requiredSticks = matchstickQuantities.get(activeDigit);

            const previousBudget = currentStickBudget - requiredSticks;

            if (previousBudget < 0) {
                continue;
            }

            let potentialNumber = null;

            if (previousBudget === 0) {
                potentialNumber = activeDigit;
            } else if (sequenceSolutions[previousBudget] !== null) {
                potentialNumber = sequenceSolutions[previousBudget] + activeDigit;
            } else {
                continue;
            }

            if (compareNumeralStrings(potentialNumber, sequenceSolutions[currentStickBudget])) {
                sequenceSolutions[currentStickBudget] = potentialNumber;
            }
        }
    }

    console.log(sequenceSolutions[totalMatchsticks] || '');
});