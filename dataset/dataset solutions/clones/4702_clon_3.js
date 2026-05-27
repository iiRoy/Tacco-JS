function ProcessInput (rawData) {
    var parsedData = rawData.split(' ');

    var sComponentCount = Number(parsedData[0]);
    var cComponentCount = Number(parsedData[1]);

    var finalCount = 0;

    const S_UNIT_S_COST = 1;
    const S_UNIT_C_COST = 2;
    const C_UNIT_C_COST = 4;

    // Process combinations that use S components first
    while (true) {
        const hasEnoughSForCombination = sComponentCount >= S_UNIT_S_COST;
        const hasEnoughCForSCombination = cComponentCount >= S_UNIT_C_COST;
        const canFormSBasedCombination = hasEnoughSForCombination && hasEnoughCForSCombination;

        if (!canFormSBasedCombination) {
            break;
        }

        sComponentCount = sComponentCount - S_UNIT_S_COST;
        cComponentCount = cComponentCount - S_UNIT_C_COST;
        finalCount = finalCount + 1;
    }

    // Process combinations that use only C components
    while (true) {
        const hasEnoughCForCCombination = cComponentCount >= C_UNIT_C_COST;

        if (!hasEnoughCForCCombination) {
            break;
        }

        cComponentCount = cComponentCount - C_UNIT_C_COST;
        finalCount = finalCount + 1;
    }

    console.log(finalCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
