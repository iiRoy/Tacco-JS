function computeFactorial(value) {
    let factorialResult = 1;
    for (let loopIndex = 1; loopIndex <= value; loopIndex++) {
        factorialResult *= loopIndex;
    }
    return factorialResult;
}

function calculateCombinations(nElements, kChosen) {
    if (kChosen < 0 || kChosen > nElements) {
        return 0;
    }
    if (kChosen === 0 || kChosen === nElements) {
        return 1;
    }
    if (kChosen > nElements / 2) {
        kChosen = nElements - kChosen;
    }
    return Math.round(computeFactorial(nElements) / (computeFactorial(kChosen) * computeFactorial(nElements - kChosen)));
}

function calculateOddCombinations(oddNumberCount, targetRemainder) {
    let totalOddSubsets = 0;
    let startLoopIndex;

    if (targetRemainder === 0) {
        startLoopIndex = 0;
    } else {
        startLoopIndex = 1;
    }

    for (let loopIndex = startLoopIndex; loopIndex <= oddNumberCount; loopIndex += 2) {
        totalOddSubsets += calculateCombinations(oddNumberCount, loopIndex);
    }
    return totalOddSubsets;
}

function solveProblem(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const configLineParts = inputLines[0].split(" ");
    const initialNValue = parseInt(configLineParts[0], 10);
    const targetRemainder = parseInt(configLineParts[1], 10);

    const numberTokens = inputLines[1].split(" ");
    const parsedNumbersArray = numberTokens.map(Number);

    let evenNumberCount = 0;
    let oddNumberCount = 0;

    parsedNumbersArray.forEach(currentNumber => {
        if (currentNumber % 2 === 0) {
            evenNumberCount++;
        } else {
            oddNumberCount++;
        }
    });

    const totalEvenSubsets = Math.pow(2, evenNumberCount);

    const totalOddSubsets = calculateOddCombinations(oddNumberCount, targetRemainder);

    const finalResultProduct = totalEvenSubsets * totalOddSubsets;

    console.log(finalResultProduct);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
