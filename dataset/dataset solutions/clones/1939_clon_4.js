const integerCeilingDivision = (dividend, divisor) => {
    return Math.floor((dividend + divisor - 1) / divisor);
};

const analyzeCombatOutcome = (rawText) => {
    const numericalValues = rawText.split(" ").map(Number);
    
    const firstCombatantHP = numericalValues[0];
    const firstCombatantDMG = numericalValues[1];
    const secondCombatantHP = numericalValues[2];
    const secondCombatantDMG = numericalValues[3];

    const strikesRequiredByFirst = integerCeilingDivision(secondCombatantHP, firstCombatantDMG);
    const strikesEnduredByFirst = integerCeilingDivision(firstCombatantHP, secondCombatantDMG);

    const outcome = (strikesRequiredByFirst <= strikesEnduredByFirst) ? 'Yes' : 'No';
    
    return outcome;
};

console.log(analyzeCombatOutcome(require("fs").readFileSync("/dev/stdin", "utf8")));