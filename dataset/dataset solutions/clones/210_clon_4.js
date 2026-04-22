const fileSystemUtility = require('fs');
const maximumValue = 20000;

const determineFivePower = (numericalInput) => {
    let powerCount = 0;
    while (numericalInput > 0 && numericalInput % 5 === 0) {
        powerCount++;
        numericalInput /= 5;
    }
    return powerCount;
};

const generateAccumulatedZeroes = () => {
    const zeroesStorage = new Array(maximumValue + 1).fill(0);

    for (let currentInteger = 1; currentInteger <= maximumValue; currentInteger++) {
        zeroesStorage[currentInteger] = zeroesStorage[currentInteger - 1] + determineFivePower(currentInteger);
    }
    return zeroesStorage;
};

(function() {
    const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

    const numericalQueries = rawInputContent
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(Number);

    const precomputedZeroes = generateAccumulatedZeroes();

    const outputLines = numericalQueries.map(queryVal => precomputedZeroes[queryVal]);

    process.stdout.write(outputLines.join('\n') + '\n');
})();