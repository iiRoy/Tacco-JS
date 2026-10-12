function processInput(rawText) {
    const dimensionsLine = rawText.split('\n')[0];
    const [heightValue, widthValue] = dimensionsLine.split(' ').map(Number);

    if (widthValue === 1) {
        return 'Yes';
    }

    const characterData = rawText.split('\n').slice(1).join('');
    const frequencyRegistry = new Map();

    for (const charUnit of characterData) {
        frequencyRegistry.set(charUnit, (frequencyRegistry.get(charUnit) || 0) + 1);
    }

    const hParityState = heightValue % 2;
    const wParityState = widthValue % 2;

    const outcomeDispatch = {
        '00': (counts) => { // Height Even, Width Even
            const nonQuadrupleFrequencies = Array.from(counts.values()).filter(val => val % 4 !== 0);
            return (nonQuadrupleFrequencies.length === 0) ? 'Yes' : 'No';
        },
        '11': (counts) => { // Height Odd, Width Odd
            const sumOfNonQuadrupleFrequencies = Array.from(counts.values())
                                                    .filter(val => val % 4 !== 0)
                                                    .reduce((accumulator, val) => accumulator + val, 0);
            return (sumOfNonQuadrupleFrequencies % 2 !== 0) ? 'Yes' : 'No';
        },
        '01': () => 'No', // Height Even, Width Odd
        '10': () => 'No'  // Height Odd, Width Even
    };

    const currentParityKey = `${hParityState}${wParityState}`;
    return outcomeDispatch[currentParityKey](frequencyRegistry);
}

console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
