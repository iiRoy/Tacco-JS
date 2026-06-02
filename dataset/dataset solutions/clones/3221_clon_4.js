function main(inputString) {
    const lineSegments = inputString.split('\n');

    // Process the first line, which represents 'N' in the original, though it's not used in the core logic.
    const elementQuantity = Number(lineSegments[0]);

    // Parse the second line to extract numerical values.
    // Divergent parsing: using regex to find numbers instead of simple split.
    const numericalEntries = lineSegments[1].match(/-?\d+/g).map(Number);

    let maximumObservedValue = -Infinity;
    let cumulativeTotal = 0;

    // Divergent core logic: Instead of sorting, popping the max, and then iterating for sum,
    // we iterate once to find both the maximum value and the total sum.
    for (const currentEntry of numericalEntries) {
        if (currentEntry > maximumObservedValue) {
            maximumObservedValue = currentEntry;
        }
        cumulativeTotal += currentEntry;
    }

    // Calculate the sum of all elements *excluding* the maximum one.
    const sumWithoutMaximum = cumulativeTotal - maximumObservedValue;

    // Divergent control flow: Using a ternary operator instead of an if/else block.
    console.log(maximumObservedValue < sumWithoutMaximum ? "Yes" : "No");
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
