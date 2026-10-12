function hasBalancedBrackets(sequence) {
    const matchingBrackets = {
        ")": "(",
        "]": "[",
        "}": "{"
    };

    const bracketStack = [];

    for (let i = 0; i < sequence.length; i++) {
        const currentBracket = sequence[i];

        if (
            currentBracket === "(" ||
            currentBracket === "[" ||
            currentBracket === "{"
        ) {
            bracketStack.push(currentBracket);
            continue;
        }

        if (
            bracketStack.length === 0 ||
            bracketStack.pop() !== matchingBrackets[currentBracket]
        ) {
            return false;
        }
    }

    return bracketStack.length === 0;
}