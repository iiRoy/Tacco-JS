"use strict";

const performAnalysis = (rawInput) => {
    const allTokens = rawInput.split(/\s+/).filter(Boolean);
    const numericValues = allTokens.slice(1).map(Number);

    const initialAccumulation = { categoriesPresent: 0, excessItems: 0 };

    const finalResult = numericValues.reduce((accumulator, currentDatum) => {
        const zoneIdentifier = Math.floor(currentDatum / 400);

        if (zoneIdentifier >= 0 && zoneIdentifier < 8) {
            accumulator.categoriesPresent |= (1 << zoneIdentifier);
        } else if (currentDatum >= 3200) { // Explicitly check original condition for values >= 3200
            accumulator.excessItems++;
        }
        return accumulator;
    }, initialAccumulation);

    let distinctCategoryCount = 0;
    let tempBitmask = finalResult.categoriesPresent;
    while (tempBitmask > 0) {
        tempBitmask &= (tempBitmask - 1);
        distinctCategoryCount++;
    }

    const minimumPossible = distinctCategoryCount === 0 ? 1 : distinctCategoryCount;
    const maximumPossible = distinctCategoryCount + finalResult.excessItems;

    console.log(minimumPossible + " " + maximumPossible);
};

performAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));