class StreamProcessor {
    #sourceLines;
    #linePointer;

    constructor() {
        this.#sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.#linePointer = 0;
    }

    checkAvailability() {
        return this.#linePointer < this.#sourceLines.length;
    }

    pullLine() {
        if (!this.checkAvailability()) {
            throw new Error("Input exhaustion: No more data lines.");
        }
        const lineContent = this.#sourceLines[this.#linePointer];
        this.#linePointer++;
        return lineContent;
    }

    extractNumbers() {
        return this.pullLine().split(" ").map(Number);
    }
}

const publishResult = (value) => {
    console.log(value);
};

const commenceOperation = () => {
    const inputService = new StreamProcessor();

    const initialConfiguration = inputService.extractNumbers();
    const desiredDamageThreshold = initialConfiguration[0];
    const totalSpellCount = initialConfiguration[1];

    const magicalAbilities = [];
    for (let i = 0; i < totalSpellCount; ++i) {
        const abilityData = inputService.extractNumbers();
        magicalAbilities.push({
            power: abilityData[0],
            energyCost: abilityData[1]
        });
    }

    const maximumCalculableDamage = 100000;
    const memoizedCosts = new Map();

    const calculateExactDamageCost = (currentDamage) => {
        if (currentDamage <= 0) {
            return 0;
        }
        if (memoizedCosts.has(currentDamage)) {
            return memoizedCosts.get(currentDamage);
        }

        let minimumEnergy = Infinity;
        for (const ability of magicalAbilities) {
            if (currentDamage - ability.power >= 0) {
                const previousDamageCost = calculateExactDamageCost(currentDamage - ability.power);
                if (previousDamageCost !== Infinity) {
                    minimumEnergy = Math.min(minimumEnergy, previousDamageCost + ability.energyCost);
                }
            }
        }
        memoizedCosts.set(currentDamage, minimumEnergy);
        return minimumEnergy;
    };

    for (let d = 1; d <= maximumCalculableDamage; ++d) {
        calculateExactDamageCost(d);
    }

    const cumulativeMinimumEnergy = new Array(maximumCalculableDamage + 1).fill(Infinity);
    cumulativeMinimumEnergy[0] = 0;

    for (let d = 1; d <= maximumCalculableDamage; ++d) {
        if (memoizedCosts.has(d)) {
            cumulativeMinimumEnergy[d] = memoizedCosts.get(d);
        }
    }

    for (let d = maximumCalculableDamage - 1; d >= 0; --d) {
        cumulativeMinimumEnergy[d] = Math.min(cumulativeMinimumEnergy[d], cumulativeMinimumEnergy[d + 1]);
    }

    publishResult(cumulativeMinimumEnergy[desiredDamageThreshold]);
};

commenceOperation();