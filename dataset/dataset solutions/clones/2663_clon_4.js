const fetchData = () => process.stdin.readFileSync(0, 'utf8');

const processInputAndCalculateCombinations = (rawData) => {
    const dataFragments = rawData.split('\n');

    const significantFragments = dataFragments.slice(1).filter(frag => frag.length > 0);

    const normalizedUnits = significantFragments.map(item =>
        Array.from(item).sort().join('')
    );

    const unitCounts = {};
    for (const unit of normalizedUnits) {
        unitCounts[unit] = (unitCounts[unit] || 0) + 1;
    }

    let totalPairings = 0;
    for (const unitKey in unitCounts) {
        const currentUnitFrequency = unitCounts[unitKey];
        if (currentUnitFrequency > 1) {
            totalPairings += (currentUnitFrequency * (currentUnitFrequency - 1)) / 2;
        }
    }

    process.stdout.write(totalPairings.toString() + '\n');
};

processInputAndCalculateCombinations(fetchData());