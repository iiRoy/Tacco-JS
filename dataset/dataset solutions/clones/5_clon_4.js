let elevationMeasures = [1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922];

let firstPeak = Number.MIN_SAFE_INTEGER;
let secondPeak = Number.MIN_SAFE_INTEGER;
let thirdPeak = Number.MIN_SAFE_INTEGER;

for (let currentMeasure of elevationMeasures) {
    if (currentMeasure > firstPeak) {
        thirdPeak = secondPeak;
        secondPeak = firstPeak;
        firstPeak = currentMeasure;
    } else if (currentMeasure > secondPeak) {
        thirdPeak = secondPeak;
        secondPeak = currentMeasure;
    } else if (currentMeasure > thirdPeak) {
        thirdPeak = currentMeasure;
    }
}

console.log(firstPeak);
console.log(secondPeak);
console.log(thirdPeak);