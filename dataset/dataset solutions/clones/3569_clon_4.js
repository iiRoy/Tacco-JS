const processInputData = (rawText) => {
    const [limitValue, divisorTerm] = rawText.split(' ').map(Number);

    let ultimateTally = 0;

    const remainderOccurrenceCounts = new Array(divisorTerm).fill(0);

    // Calculate how many numbers up to 'limitValue' fall into each remainder category
    // For remainder 0 (multiples of divisorTerm):
    remainderOccurrenceCounts[0] = Math.floor(limitValue / divisorTerm);
    // For other remainders (1 to divisorTerm - 1):
    for (let currentRemainderKey = 1; currentRemainderKey < divisorTerm; ++currentRemainderKey) {
        remainderOccurrenceCounts[currentRemainderKey] = Math.floor((limitValue - currentRemainderKey) / divisorTerm) + 1;
    }

    // Iterate through each possible value for the first element 'valA'
    // from 1 up to 'limitValue'
    for (let valA = 1; valA <= limitValue; ++valA) {
        // Determine the standard mathematical remainder of 'valA'
        const valARemainder = valA % divisorTerm;

        // The original code implies that the second (valB) and third (valC) elements
        // are constrained to have the same "effective" remainder as 'valA'.
        // This means (valB % divisorTerm) == (valA % divisorTerm)
        // and (valC % divisorTerm) == (valA % divisorTerm).
        // With this constraint, the conditions (valA+valB)%divisorTerm==0, (valA+valC)%divisorTerm==0,
        // and (valB+valC)%divisorTerm==0 all simplify to a single check:
        // (valARemainder + valARemainder) % divisorTerm == 0.
        if ((valARemainder * 2) % divisorTerm === 0) {
            // If this condition is met, then for the current 'valA',
            // any 'valB' and 'valC' that share 'valARemainder' will satisfy the conditions.
            // The number of such 'valB' values is 'remainderOccurrenceCounts[valARemainder]'.
            // The number of such 'valC' values is 'remainderOccurrenceCounts[valARemainder]'.
            ultimateTally += remainderOccurrenceCounts[valARemainder] * remainderOccurrenceCounts[valARemainder];
        }
    }

    console.log(ultimateTally);
};

const fileSystemHandler = require('fs');
const sourcePath = '/dev/stdin';
const fileContents = fileSystemHandler.readFileSync(sourcePath, 'utf8');

processInputData(fileContents);