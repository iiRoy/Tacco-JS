function processData(rawData) {
    const inputLines = rawData.trim().split('\n');
    const seriesLength = Number(inputLines[0]);
    const numberSequence = inputLines[1].split(' ').map(Number);

    const totalSatisfyingSubarrays = Array.from({ length: seriesLength }, (_, initialIndex) => {
        let currentXorAggregate = 0;
        let currentArithmeticAggregate = 0;
        return Array.from({ length: seriesLength - initialIndex }, (_, segmentOffset) => {
            const finalIndex = initialIndex + segmentOffset;
            const elementValue = numberSequence[finalIndex];

            currentXorAggregate ^= elementValue;
            currentArithmeticAggregate += elementValue;

            return currentXorAggregate === currentArithmeticAggregate ? 1 : 0;
        });
    }).flat().reduce((accumulator, value) => accumulator + value, 0);

    console.log(totalSatisfyingSubarrays);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
