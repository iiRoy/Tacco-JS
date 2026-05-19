const processBattleScenario = (scenarioData) => {
    const parseNumericLine = (lineString) => lineString.split(" ").map(Number);

    const lines = scenarioData.split("\n");
    const [enemyCount, highAttackDamage, lowAttackDamage] = parseNumericLine(lines[0]);
    const foeHealths = lines.slice(1, 1 + enemyCount).map(Number);

    // Helper function to determine if a given number of total turns (k) is feasible.
    // A turn is feasible if the number of additional high-damage attacks required
    // across all enemies does not exceed the total turns (k).
    const checkFeasibility = (totalTurns, healths, highDmg, lowDmg) => {
        if (totalTurns < 0) return false; // Number of turns cannot be negative.
        
        let neededHighDmgAttacks = 0;
        const baseDamagePerTurn = totalTurns * lowDmg;
        const damageDifferential = highDmg - lowDmg; // Assumed to be > 0 based on problem context (hi > lo)

        for (const currentHealth of healths) {
            if (currentHealth > baseDamagePerTurn) {
                const remainingHealth = currentHealth - baseDamagePerTurn;
                neededHighDmgAttacks += Math.ceil(remainingHealth / damageDifferential);
            }
        }
        return neededHighDmgAttacks <= totalTurns;
    };

    let lowerBound = 0;
    // A sufficiently large upper bound for the number of attacks.
    // This constant is chosen to cover typical competitive programming constraints
    // where the maximum number of turns 'k' could be up to 10^9 or more.
    let upperBound = 2_000_000_000; 
    
    let optimalTurns = upperBound; // Initialize with a value that is definitely a valid upper bound.

    // Perform a binary search to find the minimum number of turns (k)
    // for which the 'checkFeasibility' condition holds true.
    while (lowerBound <= upperBound) {
        const midTurns = Math.floor((lowerBound + upperBound) / 2);
        
        if (checkFeasibility(midTurns, foeHealths, highAttackDamage, lowAttackDamage)) {
            optimalTurns = midTurns; // This 'midTurns' is a possible answer, try for a smaller one.
            upperBound = midTurns - 1;
        } else {
            lowerBound = midTurns + 1; // 'midTurns' is too low, need more turns.
        }
    }

    console.log(optimalTurns);
};

processBattleScenario(require("fs").readFileSync("/dev/stdin", "utf8"));
