function ProcessInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const characterCount = parseInt(inputLines[0], 10);
    const sourceCharacters = inputLines[1].split("");
    return { characterCount, sourceCharacters };
}

function CreateRunLengthSequence(characters, totalLength) {
    if (characters.length === 0) {
        return new Array(totalLength + 1).fill(0);
    }

    const characterRuns = characters.reduce((accumulator, currentCharacter, index) => {
        if (index === 0 || currentCharacter !== accumulator[accumulator.length - 1].char) {
            accumulator.push({ char: currentCharacter, count: 1 });
        } else {
            accumulator[accumulator.length - 1].count++;
        }
        return accumulator;
    }, []);

    const normalizedRunLengths = new Array(totalLength + 1).fill(0);
    const initialRunOffset = (characterRuns[0].char === '(') ? 0 : 1;

    characterRuns.forEach((runSegment, segmentIndex) => {
        normalizedRunLengths[initialRunOffset + segmentIndex] = runSegment.count;
    });

    return normalizedRunLengths;
}

function CalculateNetBalance(runCounts) {
    let currentBalance = 0;
    for (let i = 0; i < runCounts.length - 1; i += 2) {
        currentBalance += runCounts[i] - runCounts[i + 1];
    }
    return currentBalance;
}

function FindLastNonZeroIndex(arr) {
    let searchIndex = arr.length - 1;
    while (searchIndex >= 0 && arr[searchIndex] === 0) {
        searchIndex--;
    }
    return searchIndex;
}

function AdjustParenthesisBalance(initialRunCounts) {
    const modifiedRunCounts = [...initialRunCounts];
    let netBalance = CalculateNetBalance(initialRunCounts);

    // Handle initial imbalance where the first '(' run is shorter than the first ')' run
    if (modifiedRunCounts[0] < modifiedRunCounts[1]) {
        const initialDifference = modifiedRunCounts[1] - modifiedRunCounts[0];
        modifiedRunCounts[0] = modifiedRunCounts[1]; // Equalize the first '(' run to the first ')' run
        netBalance += initialDifference; // This difference must be compensated by adding ')' later
    }

    if (netBalance < 0) {
        // If netBalance is negative, we need to add more '(' characters.
        // Add the absolute value of netBalance to the first '(' run.
        modifiedRunCounts[0] -= netBalance;
    } else if (netBalance > 0) {
        // If netBalance is positive, we need to add more ')' characters.
        const lastActiveSegmentIndex = FindLastNonZeroIndex(modifiedRunCounts);

        if (lastActiveSegmentIndex >= 0) { // Ensure there's at least one active run
            if (lastActiveSegmentIndex % 2 === 0) { // Last active run was '('
                // Add ')' to the run immediately following the last '(' run
                modifiedRunCounts[lastActiveSegmentIndex + 1] += netBalance;
            } else { // Last active run was ')'
                // Add ')' to the last ')' run itself
                modifiedRunCounts[lastActiveSegmentIndex] += netBalance;
            }
        } else {
            // Edge case: if all runs are zero (e.g., empty input or all balanced out to zero)
            // and netBalance is still positive, add ')' to the first ')' run (index 1)
            modifiedRunCounts[1] += netBalance;
        }
    }
    // If netBalance is 0, no further adjustments are needed.

    return modifiedRunCounts;
}

function GenerateOutputString(finalRunCounts) {
    return finalRunCounts.map((count, index) => {
        if (count === 0) return '';
        return (index % 2 === 0) ? '('.repeat(count) : ')'.repeat(count);
    }).join('');
}

function Main(inputContent) {
    const { characterCount, sourceCharacters } = ProcessInputData(inputContent);
    const initialRunLengthSequence = CreateRunLengthSequence(sourceCharacters, characterCount);
    const finalRunLengthSequence = AdjustParenthesisBalance(initialRunLengthSequence);
    const balancedOutputString = GenerateOutputString(finalRunLengthSequence);
    console.log(balancedOutputString);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
