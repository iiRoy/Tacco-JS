function processInput(dataString) {
    let outcome = 'No';
    const lineSegments = dataString.trim().split("\n");
    const numberTokens = lineSegments[0].split(' ');
    const numericalValues = numberTokens.map(Number);

    const valueOccurrences = new Map();
    numericalValues.forEach(item => {
        valueOccurrences.set(item, (valueOccurrences.get(item) || 0) + 1);
    });

    if (valueOccurrences.size === 2) {
        const countsArray = Array.from(valueOccurrences.values());
        const hasPair = countsArray.some(count => count === 2);
        if (hasPair) {
            outcome = 'Yes';
        }
    }

    console.log(outcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
// processInput(require('fs').readFileSync('./input.txt', 'utf-8'));
