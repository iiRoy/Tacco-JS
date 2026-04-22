const processInputBatches = (streamContent) => {
    const dataSegments = streamContent.trim().split(/\n+/);
    let currentPosition = 0;
    const compiledBatches = [];

    while (currentPosition < dataSegments.length) {
        const itemQuantity = Number(dataSegments[currentPosition].split(' ')[0]);
        if (isNaN(itemQuantity) || itemQuantity === 0) break;

        const currentDataSet = {
            total: itemQuantity,
            elements: []
        };

        for (let i = 1; i <= itemQuantity; ++i) {
            const [valA, valB, valC] = dataSegments[currentPosition + i].split(' ').map(Number);
            currentDataSet.elements.push({ primaryKey: valA, leftVal: valB, rightVal: valC });
        }
        compiledBatches.push(currentDataSet);
        currentPosition += itemQuantity + 1;
    }
    return compiledBatches;
};

const formOpportunisticReservoir = () => {
    const slotQuantities = new Map(); // Constraint point K -> { total: number, taken: number }
    const pathConnectors = new Map(); // K (any integer) -> actual_available_K_below_or_at_K (DSU parent)

    const locateOptimalPoint = (currentConstraint) => {
        if (currentConstraint < 0) return -1;

        // Initialize pathConnectors for currentConstraint if not seen
        if (!pathConnectors.has(currentConstraint)) {
            pathConnectors.set(currentConstraint, currentConstraint);
        }

        let linkedConstraint = pathConnectors.get(currentConstraint);

        if (linkedConstraint === currentConstraint) {
            // If currentConstraint is its own root, check its capacity
            if (slotQuantities.has(currentConstraint) && slotQuantities.get(currentConstraint).taken < slotQuantities.get(currentConstraint).total) {
                return currentConstraint; // Found an available slot at this constraint point
            } else {
                // This constraint point is full or has no capacity, try the one immediately before it
                const nextLowerPoint = locateOptimalPoint(currentConstraint - 1);
                pathConnectors.set(currentConstraint, nextLowerPoint); // Path compression
                return nextLowerPoint;
            }
        } else {
            // Path compression: currentConstraint already points to an earlier candidate
            const ultimatePoint = locateOptimalPoint(linkedConstraint);
            pathConnectors.set(currentConstraint, ultimatePoint); // Further path compression
            return ultimatePoint;
        }
    };

    const establishCapacity = (constraintPoint, amount) => {
        if (!slotQuantities.has(constraintPoint)) {
            slotQuantities.set(constraintPoint, { total: 0, taken: 0 });
        }
        slotQuantities.get(constraintPoint).total += amount;
        // When capacity is added, ensure this constraint point is its own root in DSU
        pathConnectors.set(constraintPoint, constraintPoint);
    };

    const attemptUtilisation = (targetConstraint) => {
        const actualPoint = locateOptimalPoint(targetConstraint);
        if (actualPoint >= 0) {
            const bucket = slotQuantities.get(actualPoint);
            bucket.taken++;
            // If this bucket is now full, update its DSU parent to point to the next available slot below it
            if (bucket.taken === bucket.total) {
                pathConnectors.set(actualPoint, locateOptimalPoint(actualPoint - 1));
            }
            return true;
        }
        return false;
    };

    return { establishCapacity, attemptUtilisation };
};

const calculateOptimalValue = (dataBatch) => {
    const totalEntities = dataBatch.total;
    let initialAccumulation = 0;
    const firstTierOpportunities = [];
    const secondTierOpportunities = [];

    dataBatch.elements.forEach(element => {
        if (element.primaryKey === totalEntities || element.leftVal === element.rightVal) {
            initialAccumulation += element.leftVal;
        } else if (element.leftVal > element.rightVal) {
            firstTierOpportunities.push({ limitPoint: element.primaryKey - 1, potentialGain: element.leftVal - element.rightVal });
            initialAccumulation += element.rightVal;
        } else { // element.rightVal > element.leftVal
            secondTierOpportunities.push({ limitPoint: totalEntities - element.primaryKey - 1, potentialGain: element.rightVal - element.leftVal });
            initialAccumulation += element.leftVal;
        }
    });

    firstTierOpportunities.sort((a, b) => a.limitPoint - b.limitPoint);
    secondTierOpportunities.sort((a, b) => a.limitPoint - b.limitPoint);

    const distinctLimits1 = Array.from(new Set(firstTierOpportunities.map(o => o.limitPoint))).sort((a, b) => a - b);
    const distinctLimits2 = Array.from(new Set(secondTierOpportunities.map(o => o.limitPoint))).sort((a, b) => a - b);

    const managerA = formOpportunisticReservoir();
    const managerB = formOpportunisticReservoir();

    let previousLimit1 = -1;
    distinctLimits1.forEach(currentLimit => {
        managerA.establishCapacity(currentLimit, currentLimit - previousLimit1);
        previousLimit1 = currentLimit;
    });

    let previousLimit2 = -1;
    distinctLimits2.forEach(currentLimit => {
        managerB.establishCapacity(currentLimit, currentLimit - previousLimit2);
        previousLimit2 = currentLimit;
    });

    firstTierOpportunities.forEach(opp => {
        if (managerA.attemptUtilisation(opp.limitPoint)) {
            initialAccumulation += opp.potentialGain;
        }
    });

    secondTierOpportunities.forEach(opp => {
        if (managerB.attemptUtilisation(opp.limitPoint)) {
            initialAccumulation += opp.potentialGain;
        }
    });

    return initialAccumulation;
};

const executeProcessing = (sourceData) => {
    const allProcessedBatches = processInputBatches(sourceData);
    const calculatedOutcomes = allProcessedBatches.map(calculateOptimalValue);
    calculatedOutcomes.forEach(o => console.log(o));
};

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));