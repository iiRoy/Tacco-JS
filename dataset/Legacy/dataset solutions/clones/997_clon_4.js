(function(sourceData) {
    const parsedEntries = sourceData.split('\n').map(Number);
    const elementCount = parsedEntries.shift();
    const targetSequence = parsedEntries.slice(0, elementCount);

    let peakSpread = -Infinity;
    let lowestPointEncountered = Infinity;

    for (let currentIdx = 0; currentIdx < targetSequence.length; currentIdx++) {
        const presentValue = targetSequence[currentIdx];

        peakSpread = Math.max(peakSpread, presentValue - lowestPointEncountered);
        lowestPointEncountered = Math.min(lowestPointEncountered, presentValue);
    }

    console.log(peakSpread);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
