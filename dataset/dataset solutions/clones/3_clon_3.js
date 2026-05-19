const MIN_MULTIPLIER = 1;
const MAX_MULTIPLIER = 9;

for (let rowMultiplier = MIN_MULTIPLIER; rowMultiplier <= MAX_MULTIPLIER; rowMultiplier++) {
    for (let colMultiplier = MIN_MULTIPLIER; colMultiplier <= MAX_MULTIPLIER; colMultiplier++) {
        const productValue = rowMultiplier * colMultiplier;
        const expressionPart = rowMultiplier + "x" + colMultiplier;
        const finalOutputString = expressionPart + "=" + productValue;
        console.log(finalOutputString);
    }
}
