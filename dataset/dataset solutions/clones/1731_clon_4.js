const processArguments = process.argv;
const numericalCeiling = parseInt(processArguments[2], 10);

console.log('start');

const divisorTally = new Array(numericalCeiling + 1).fill(0);

for (let currentFactor = 1; currentFactor <= numericalCeiling; currentFactor++) {
    for (let currentMultiple = currentFactor; currentMultiple <= numericalCeiling; currentMultiple += currentFactor) {
        divisorTally[currentMultiple]++;
    }
}

const finalAccumulation = Array.from({ length: numericalCeiling }, (_, idx) => idx + 1)
    .reduce((currentTotal, currentElement) => {
        return currentTotal + (currentElement * divisorTally[currentElement]);
    }, 0);

console.log(finalAccumulation);