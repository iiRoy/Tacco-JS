const dimensionRecords = new Map();
const contentRecords = new Map();

function acquireDimension(lvl) {
    if (lvl === 0) return 1;
    if (dimensionRecords.has(lvl)) return dimensionRecords.get(lvl);
    const val = 2 * acquireDimension(lvl - 1) + 3;
    dimensionRecords.set(lvl, val);
    return val;
}

function acquireContent(lvl) {
    if (lvl === 0) return 1;
    if (contentRecords.has(lvl)) return contentRecords.get(lvl);
    const val = 2 * acquireContent(lvl - 1) + 1;
    contentRecords.set(lvl, val);
    return val;
}

function calculateContent(tierLevel, portionLimit) {
    if (tierLevel === 0) {
        return (portionLimit <= 0) ? 0 : 1;
    }
    if (portionLimit <= 0) {
        return 0;
    }

    const lowerTierDimension = acquireDimension(tierLevel - 1);
    const lowerTierContent = acquireContent(tierLevel - 1);

    const leftPartBoundary = 1 + lowerTierDimension; // Represents 'Bun' + 'H(level-1)'
    const centralItemPosition = leftPartBoundary + 1; // Represents the index of the middle 'Patty'

    // If only the first layer (a bun) is consumed
    if (portionLimit === 1) {
        return 0;
    }

    // If consumption ends within the left 'H(level-1)' section
    if (portionLimit <= leftPartBoundary) {
        // Skip the initial bun and recurse into the lower tier burger
        return calculateContent(tierLevel - 1, portionLimit - 1);
    }

    // If consumption reaches exactly the central patty
    if (portionLimit === centralItemPosition) {
        // Count all patties from the left H(level-1) plus the central patty
        return lowerTierContent + 1;
    }

    // If consumption extends beyond the central patty (into the right H(level-1) or final bun)
    // Add patties from the left H(level-1) and the central patty
    let currentTotal = lowerTierContent + 1;
    // Determine remaining layers to consume after the left H(level-1) and central patty
    let remainingConsumption = portionLimit - centralItemPosition;
    // Recurse for the remaining portion in the right H(level-1) section
    currentTotal += calculateContent(tierLevel - 1, remainingConsumption);
    return currentTotal;
}

function ProcessInput(rawInput) {
    const lines = rawInput.split("\n");
    const params = lines[0].split(" ").map(Number);
    const initialLevel = params[0];
    const consumptionLimit = params[1];

    const finalResult = calculateContent(initialLevel, consumptionLimit);
    console.log('%s', finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));