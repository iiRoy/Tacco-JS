const matchstickCostTable = new Map([
    [1, 2], [2, 5], [3, 5], [4, 4], [5, 5], [6, 6], [7, 3], [8, 7], [9, 6]
]);

function extractProblemData(sourceContent) {
    const dataLines = sourceContent.trim().split('\n');
    const firstTokens = dataLines[0].split(' ').map(Number);
    const digitsProvided = dataLines[1].split(' ').map(Number);
    return {
        totalMatchsticks: firstTokens[0],
        countOfDigits: firstTokens[1],
        availableNumeralChoices: digitsProvided
    };
}

function calculateOptimalNumber(totalMatchsticks, availableNumeralChoices) {
    // Filter and prioritize available digits: keep only the largest digit for each cost.
    const preferredDigitsByCost = new Map();
    // Sort available numerals in descending order to ensure the largest digit
    // is picked if multiple share the same cost.
    const sortedAvailableNumerals = [...availableNumeralChoices].sort((n1, n2) => n2 - n1);

    for (const currentNumeral of sortedAvailableNumerals) {
        const numeralCost = matchstickCostTable.get(currentNumeral);
        if (numeralCost !== undefined) {
            preferredDigitsByCost.set(numeralCost, currentNumeral);
        }
    }

    // Prepare the list of unique [digit, cost] pairs for DP, sorted by digit descending
    const viableOptions = Array.from(preferredDigitsByCost.entries())
                               .map(([cost, numeral]) => ({ numeral, cost }))
                               .sort((optA, optB) => optB.numeral - optA.numeral);

    // Dynamic Programming approach
    // optimalNumberStrings[k] will hold the largest number string achievable with k matchsticks.
    // Sentinel value '!' indicates an impossible state (lexicographically smaller than any digit).
    const optimalNumberStrings = Array(totalMatchsticks + 1).fill('!');
    optimalNumberStrings[0] = ''; // 0 matchsticks can form an empty number.

    // Helper function to determine if one number string represents a 'larger' value
    const isCandidateSuperior = (candidateStr, currentBestStr) => {
        if (candidateStr === '!') return false; // Candidate is impossible
        if (currentBestStr === '!') return true;  // Current best is impossible, candidate is possible
        if (candidateStr.length > currentBestStr.length) return true;
        if (candidateStr.length < currentBestStr.length) return false;
        return candidateStr > currentBestStr; // Lexicographical comparison for equal length
    };

    for (let currentStickTally = 0; currentStickTally < totalMatchsticks; currentStickTally++) {
        if (optimalNumberStrings[currentStickTally] === '!') {
            continue; // Cannot form a number with this many sticks
        }

        for (const { numeral: digitVal, cost: digitCost } of viableOptions) {
            const nextStickTally = currentStickTally + digitCost;
            if (nextStickTally <= totalMatchsticks) {
                const proposedNumber = optimalNumberStrings[currentStickTally] + String(digitVal);
                if (isCandidateSuperior(proposedNumber, optimalNumberStrings[nextStickTally])) {
                    optimalNumberStrings[nextStickTally] = proposedNumber;
                }
            }
        }
    }

    const finalOptimalResult = optimalNumberStrings[totalMatchsticks];
    return finalOptimalResult === '!' ? '' : finalOptimalResult;
}

// Entry point for the program
(function executeChallenge() {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const { totalMatchsticks, availableNumeralChoices } = extractProblemData(inputContent);
    const generatedNumber = calculateOptimalNumber(totalMatchsticks, availableNumeralChoices);
    console.log(generatedNumber);
})();