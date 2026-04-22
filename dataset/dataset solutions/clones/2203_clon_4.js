class DataStreamProcessor {
    #bufferedLines;
    #currentPosition;

    constructor(sourceContent) {
        this.#bufferedLines = sourceContent.trim().split("\n");
        this.#currentPosition = 0;
    }

    hasMoreEntries() {
        return this.#currentPosition < this.#bufferedLines.length;
    }

    retrieveNextEntry() {
        if (!this.hasMoreEntries()) {
            throw new Error("Input source exhausted: No further entries available.");
        }
        return this.#bufferedLines[this.#currentPosition++];
    }

    static #typeConversionRegistry = new Map([
        ["integer", (text) => Number.parseInt(text)],
        ["stringTokens", (text) => text.split(" ")],
        ["integerTokens", (text) => text.split(" ").map(Number)],
        ["characterArray", (text) => text.split("")],
    ]);

    convertEntry(entryText, conversionKey) {
        const conversionFunction = DataStreamProcessor.#typeConversionRegistry.get(conversionKey);
        return conversionFunction ? conversionFunction(entryText) : entryText;
    }

    fetchNumericValue() {
        return this.convertEntry(this.retrieveNextEntry(), "integer");
    }

    fetchStringTokens() {
        return this.convertEntry(this.retrieveNextEntry(), "stringTokens");
    }

    fetchNumericTokenArray() {
        return this.convertEntry(this.retrieveNextEntry(), "integerTokens");
    }

    fetchCharacterArray() {
        return this.convertEntry(this.retrieveNextEntry(), "characterArray");
    }
}

// Global input/output utilities
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const streamHandler = new DataStreamProcessor(rawInputContent);

const publishResult = (message) => console.log(message);
const outputDiagnostic = (message) => console.error(message);

// Spell entity definition
class MagicAttack {
    constructor(power, essenceCost) {
        this.power = power;
        this.essenceCost = essenceCost;
    }
}

// Core application logic
const orchestrateCombatSimulation = () => {
    const initialConfiguration = streamHandler.fetchNumericTokenArray();
    const desiredDamageThreshold = initialConfiguration[0];
    const numberOfAvailableSpells = initialConfiguration[1];

    const availableMagicAttacks = [];
    for (let spellIdx = 0; spellIdx < numberOfAvailableSpells; spellIdx++) {
        const attackDetails = streamHandler.fetchNumericTokenArray();
        availableMagicAttacks.push(new MagicAttack(attackDetails[0], attackDetails[1]));
    }

    // Determine the maximum damage index for the dynamic programming table.
    // The original code uses (H+1)*2 as array size, allowing indices up to 2H+1.
    const maximumDamageIndex = desiredDamageThreshold * 2 + 1;

    // Memoization table for recursive DP
    const memoizationCache = new Map();

    // Recursive function to calculate the minimum essence cost for a given damage level
    const calculateMinEssenceCost = (currentDamageLevel) => {
        if (currentDamageLevel < 0) {
            return Infinity; // Cannot achieve negative damage, or invalid state
        }
        if (currentDamageLevel === 0) {
            return 0; // 0 damage costs 0 essence
        }
        if (memoizationCache.has(currentDamageLevel)) {
            return memoizationCache.get(currentDamageLevel); // Return memoized result
        }

        let minimumCostForThisLevel = Infinity;

        for (const attack of availableMagicAttacks) {
            const previousDamageLevel = currentDamageLevel - attack.power;
            
            // Crucial constraint from the original algorithm:
            // Only previous damage levels strictly less than 'desiredDamageThreshold' (H)
            // are considered as valid starting points for applying new spells.
            if (previousDamageLevel >= 0 && previousDamageLevel < desiredDamageThreshold) {
                const costFromPreviousState = calculateMinEssenceCost(previousDamageLevel);
                if (costFromPreviousState !== Infinity) {
                    minimumCostForThisLevel = Math.min(
                        minimumCostForThisLevel,
                        costFromPreviousState + attack.essenceCost
                    );
                }
            }
        }
        
        memoizationCache.set(currentDamageLevel, minimumCostForThisLevel);
        return minimumCostForThisLevel;
    };

    // Populate the final cost array by computing all necessary states
    // The array needs to be one element larger than maximumDamageIndex to handle `k+1` in suffix min.
    const finalEssenceCosts = new Array(maximumDamageIndex + 2).fill(Infinity);
    for (let d = 0; d <= maximumDamageIndex; d++) {
        finalEssenceCosts[d] = calculateMinEssenceCost(d);
    }

    // Apply suffix minimums to ensure finalEssenceCosts[k] represents
    // the minimum cost to achieve *at least* k damage.
    // Loop from maximum index down to 0.
    for (let k = maximumDamageIndex; k >= 0; k--) {
        finalEssenceCosts[k] = Math.min(finalEssenceCosts[k], finalEssenceCosts[k + 1]);
    }
    
    publishResult(finalEssenceCosts[desiredDamageThreshold]);
};

orchestrateCombatSimulation();