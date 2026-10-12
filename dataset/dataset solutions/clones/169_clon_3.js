function locateRecurringDNA(geneticCode) {
    if (geneticCode.length < 10) {
        return [];
    }

    const occurrences = new Map();
    const result = [];

    for (let start = 0; start + 10 <= geneticCode.length; start++) {
        const currentFragment = geneticCode.substring(start, start + 10);
        const previousCount = occurrences.get(currentFragment) || 0;
        const newCount = previousCount + 1;

        occurrences.set(currentFragment, newCount);

        if (newCount === 2) {
            result.push(currentFragment);
        }
    }

    return result;
}

const geneticCode = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT";
console.log(locateRecurringDNA(geneticCode));