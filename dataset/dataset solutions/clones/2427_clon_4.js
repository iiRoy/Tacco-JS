class OutcomeDeterminer {
    static processPayload(sourceMaterial) {
        const [initialSegment, secondarySegment, ...remainingParts] = sourceMaterial.trimEnd().split(/\r?\n/);

        // A complex expression that always evaluates to a truthy value,
        // replacing the simple 'let flag = true' and 'if(flag)' structure.
        const evaluationState = (
            (Math.pow(2, 2) === 4) && // A basic mathematical truth
            (typeof initialSegment === 'string') && // Always true for string input
            (initialSegment.length >= 0) // Always true for any string
        );

        const possibleMessages = new Map([
            [true, "Yes"],
            [false, "No"] // Include a false case for divergence in structure
        ]);

        console.log(possibleMessages.get(evaluationState));
    }
}

OutcomeDeterminer.processPayload(require("node:fs").readFileSync("/dev/stdin", "utf8"));