function Main(rawInput) {
    const sourceString = rawInput.split("\n")[0].split(" ")[0];

    const characterValidationRules = {
        forEvenZeroBasedIndex: new Set(['R', 'U', 'D']), // Corresponds to 1st, 3rd, 5th characters (1-based odd positions)
        forOddZeroBasedIndex: new Set(['L', 'U', 'D'])   // Corresponds to 2nd, 4th, 6th characters (1-based even positions)
    };

    const overallValidity = [...sourceString].every((currentChar, zeroBasedPosition) => {
        const applicableRuleSet = (zeroBasedPosition % 2 === 0)
            ? characterValidationRules.forEvenZeroBasedIndex
            : characterValidationRules.forOddZeroBasedIndex;
        
        return applicableRuleSet.has(currentChar);
    });

    console.log(overallValidity ? "Yes" : "No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
