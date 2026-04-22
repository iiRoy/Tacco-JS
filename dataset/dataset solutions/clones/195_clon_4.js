let accumulatedPayload = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataFragment) => {
    accumulatedPayload += dataFragment;
});

process.stdin.on('end', () => {
    const processedUnits = accumulatedPayload.trim().split('\n');

    const classificationAtlas = [
        [48, 'light fly'],
        [51, 'fly'],
        [54, 'bantam'],
        [57, 'feather'],
        [60, 'light'],
        [64, 'light welter'],
        [69, 'welter'],
        [75, 'light middle'],
        [81, 'middle'],
        [91, 'light heavy']
    ];

    const determineClass = (metric) => {
        const numericalMetric = parseFloat(metric);

        const matchingRecord = classificationAtlas.find(([threshold, _]) => numericalMetric <= threshold);

        if (matchingRecord) {
            return matchingRecord[1];
        } else {
            return 'heavy';
        }
    };

    processedUnits.forEach((individualUnit) => {
        if (individualUnit.length > 0) {
            const ultimateLabel = determineClass(individualUnit);
            process.stdout.write(ultimateLabel + '\n');
        }
    });
});