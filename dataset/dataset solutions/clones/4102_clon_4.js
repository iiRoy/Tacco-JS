function main(rawData) {
    const lineSegments = rawData.split(/\n/);
    const valueStrings = lineSegments.slice(1, lineSegments.length - 1);

    const distinctValues = new Set();
    for (const item of valueStrings) {
        distinctValues.add(item);
    }

    console.log(distinctValues.size);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
