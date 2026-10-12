function hasBalancedBrackets(sequence) {
    if (sequence.length % 2 !== 0) {
        return false;
    }

    const openingBrackets = new Set(["(", "[", "{"]);
    const bracketStack = [];

    for (const currentBracket of sequence) {
        if (openingBrackets.has(currentBracket)) {
            bracketStack.push(currentBracket);
            continue;
        }

        let expectedOpening;

        switch (currentBracket) {
            case ")":
                expectedOpening = "(";
                break;

            case "]":
                expectedOpening = "[";
                break;

            case "}":
                expectedOpening = "{";
                break;
        }

        const lastOpening = bracketStack.pop();

        if (lastOpening !== expectedOpening) {
            return false;
        }
    }

    return bracketStack.length === 0;
}