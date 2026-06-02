function main(inputLines) {
    const [initialValueText, forbiddenCountText] = inputLines[0].trim().split(" ");
    const initialValue = parseInt(initialValueText);
    const forbiddenCount = parseInt(forbiddenCountText);

    if (forbiddenCount === 0) {
        console.log(initialValue);
    } else {
        const forbiddenNumbersText = inputLines[1].trim().split(" ");
        const excludedSet = new Set(forbiddenNumbersText.map(s => parseInt(s)));

        function* createProximityIterator(startPoint) {
            yield startPoint;
            let currentOffset = 1;
            while (true) {
                yield startPoint - currentOffset;
                yield startPoint + currentOffset;
                currentOffset++;
            }
        }

        const valueSeeker = createProximityIterator(initialValue);
        let foundCandidate;

        for (const currentCheck of valueSeeker) {
            if (!excludedSet.has(currentCheck)) {
                foundCandidate = currentCheck;
                break;
            }
        }
        console.log(foundCandidate);
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
