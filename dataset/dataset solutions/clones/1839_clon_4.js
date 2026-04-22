function processPayload(rawText) {
    const segments = rawText.split('\n');
    const initialCount = Number(segments[0]);

    const finalOutputs = segments.reduce((accumulator, currentSegment, currentIndex) => {
        if (currentIndex > 0 && currentIndex <= initialCount) {
            const numericalValues = currentSegment.split(' ').map(Number);
            const valuesToDisplay = numericalValues.slice(1);
            accumulator.push(valuesToDisplay.join(' '));
        }
        return accumulator;
    }, []);

    finalOutputs.forEach(line => console.log(line));
}
processPayload(require("fs").readFileSync("/dev/stdin", "utf8"));