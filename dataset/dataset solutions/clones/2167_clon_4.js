function manipulateQuantities(primaryLabel, secondaryLabel, initialAmount, auxiliaryAmount, referenceLabel) {
    let outcomeA = Number(initialAmount);
    let outcomeB = Number(auxiliaryAmount);

    const adjustmentRoutines = new Map();
    adjustmentRoutines.set(true, (val1, val2) => [val1 - 1, val2]);
    adjustmentRoutines.set(false, (val1, val2) => [val1, val2 - 1]);

    const identityMatch = (primaryLabel === referenceLabel);
    
    const finalQuantities = adjustmentRoutines.get(identityMatch)(outcomeA, outcomeB);

    return `${finalQuantities[0]} ${finalQuantities[1]}`;
}