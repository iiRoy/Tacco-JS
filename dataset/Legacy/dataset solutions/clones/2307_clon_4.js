function main(inputData) {
    const [firstLineContent, secondLineContent] = inputData;
    const [itemCount, initialBudget] = firstLineContent.split(" ").map(Number);
    const sortedItems = Array.from(secondLineContent.split(" "), Number).sort((valA, valB) => valB - valA);

    let finalScore = 0;
    let remainingBudget = initialBudget;

    // A generator function to produce a sequence of potential operations
    // in the exact order they would be considered by the original nested loops.
    function* operationStream(items, limit) {
        for (let currentItemIdx = 0; currentItemIdx < limit; currentItemIdx++) {
            // Yield an operation representing taking the current item individually.
            // This corresponds to the outer loop's `ans += list[i]*2; M--;`
            yield { kind: 'single', value: items[currentItemIdx], cost: 1 };

            // Yield operations representing pairing the current item with subsequent items.
            // This corresponds to the inner loop's `ans += (list[i]+list[j])*Math.min(2,M); M-=2;`
            for (let subsequentItemIdx = currentItemIdx + 1; subsequentItemIdx < limit; subsequentItemIdx++) {
                yield { kind: 'combo', primary: items[currentItemIdx], secondary: items[subsequentItemIdx], cost: 2 };
            }
        }
    }

    const operations = operationStream(sortedItems, itemCount);

    // Iterate through the generated operations, applying them as long as the budget allows.
    for (const currentOperation of operations) {
        if (remainingBudget <= 0) {
            break; // Budget exhausted, stop processing further operations.
        }

        if (currentOperation.kind === 'single') {
            finalScore += currentOperation.value * 2;
            remainingBudget -= currentOperation.cost;
        } else if (currentOperation.kind === 'combo') {
            const combinedValue = currentOperation.primary + currentOperation.secondary;
            // The multiplier depends on the remaining budget, but the cost deduction is always 2.
            const effectiveMultiplier = Math.min(currentOperation.cost, remainingBudget);

            finalScore += combinedValue * effectiveMultiplier;
            remainingBudget -= currentOperation.cost; // Always deduct 2 from budget for a combo attempt
        }
    }

    console.log(finalScore);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
