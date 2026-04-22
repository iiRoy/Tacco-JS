const calculateMinimumRounds = (battleLog) => {
    const logEntries = battleLog.split('\n');
    const [unitCount, heavyStrikePower, lightStrikePower] = logEntries[0].split(' ').map(Number);
    const threatHealthPool = logEntries.slice(1, unitCount + 1).map(Number);

    const peakThreatHealth = threatHealthPool.length > 0 ? Math.max(...threatHealthPool) : 0;

    // Handle the special case where heavy and light strikes deal the same damage or less.
    // In this scenario, no 'extra' damage can be dealt per attack,
    // so all damage must come from the base 'lightStrikePower'.
    if (heavyStrikePower <= lightStrikePower) {
        if (peakThreatHealth === 0) {
            return 0; // No threats, no rounds needed.
        }
        // If lightStrikePower is 0 and there are threats, it's impossible to defeat them.
        if (lightStrikePower === 0) {
            return Infinity; // Represents an impossible scenario.
        }
        // Otherwise, the minimum rounds needed is determined solely by the strongest threat.
        return Math.ceil(peakThreatHealth / lightStrikePower);
    }

    // This function checks if a given number of total combat actions is sufficient to neutralize all threats.
    const isActionCountSufficient = (totalActions) => {
        if (totalActions < 0) return false; // Action count cannot be negative.
        if (totalActions === 0) {
            // With zero actions, all threats must have zero or negative health already.
            return threatHealthPool.every(hp => hp <= 0);
        }

        const baseDamagePerUnit = totalActions * lightStrikePower;
        let auxiliaryStrikesNeeded = 0;
        const effectiveBonusDamage = heavyStrikePower - lightStrikePower; // Guaranteed > 0 here.

        for (const currentHP of threatHealthPool) {
            if (currentHP > baseDamagePerUnit) {
                // Calculate additional strikes required for this specific threat.
                auxiliaryStrikesNeeded += Math.ceil((currentHP - baseDamagePerUnit) / effectiveBonusDamage);
            }
            // Early exit: if required auxiliary strikes exceed total actions, it's insufficient.
            if (auxiliaryStrikesNeeded > totalActions) {
                return false;
            }
        }
        // The total auxiliary strikes across all threats must not exceed the total available actions.
        return auxiliaryStrikesNeeded <= totalActions;
    };

    let lowBoundary = 0;
    // A robust upper bound for the binary search. 2 * 10^9 is sufficiently large given typical constraints
    // (max HP 10^9, min damage 1, N 10^5).
    let highBoundary = 2_000_000_000; 

    let optimalActionCount = highBoundary; // Initialize with an upper bound that is known to be sufficient.

    // Perform binary search to find the minimal sufficient number of actions.
    while (lowBoundary <= highBoundary) {
        const currentProbe = Math.floor((lowBoundary + highBoundary) / 2);

        if (isActionCountSufficient(currentProbe)) {
            // If currentProbe is sufficient, it could be the answer or we might find a smaller one.
            optimalActionCount = currentProbe;
            highBoundary = currentProbe - 1; // Try searching in the lower half.
        } else {
            // If currentProbe is not sufficient, we need more actions.
            lowBoundary = currentProbe + 1; // Search in the upper half.
        }
    }

    return optimalActionCount;
};

console.log(calculateMinimumRounds(require("fs").readFileSync("/dev/stdin", "utf8")));