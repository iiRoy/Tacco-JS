function performAnalysis(rawData) {
    const lineParts = rawData.split('\n');
    const seriesSize = Number(lineParts[0]);
    const numericalSeries = lineParts[1].split(' ').slice(0, seriesSize).map(Number);

    const obtainSections = (sourceData) => {
        return sourceData.flatMap((_, idx) =>
            sourceData.slice(idx).map((_, subIdx) =>
                sourceData.slice(idx, idx + subIdx + 1)
            )
        );
    };

    const calculateXOR = (segment) => {
        return segment.reduce((accumulator, currentValue) => accumulator ^ currentValue, 0);
    };

    const calculateSum = (segment) => {
        return segment.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    };

    const matchingConfigurations = obtainSections(numericalSeries).filter(currentSection =>
        calculateXOR(currentSection) === calculateSum(currentSection)
    ).length;

    console.log(matchingConfigurations);
}

performAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));