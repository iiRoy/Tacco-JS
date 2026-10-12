const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericInputs = stdinContent.trim().split("\n").map(Number).filter(val => val !== 0);

for (const currentN of numericInputs) {
    const residueSet = new Set();
    for (let k = 1; k < currentN; k++) {
        residueSet.add((k * k) % currentN);
    }
    const residuesArray = Array.from(residueSet).sort((a, b) => a - b);

    const differenceCounts = new Map();
    const maxSymmetricDiff = Math.floor((currentN - 1) / 2);

    residuesArray.forEach((firstVal, firstIdx) => {
        residuesArray.forEach((secondVal, secondIdx) => {
            if (firstIdx === secondIdx) {
                return;
            }

            let rawDifference = (firstVal - secondVal + currentN) % currentN;

            if (rawDifference > 0 && rawDifference <= maxSymmetricDiff) {
                differenceCounts.set(rawDifference, (differenceCounts.get(rawDifference) || 0) + 1);
            }
        });
    });

    const finalOutputValues = Array.from({ length: maxSymmetricDiff }, (_, index) => {
        const diffKey = index + 1;
        return (differenceCounts.get(diffKey) || 0) * 2;
    });

    finalOutputValues.forEach(val => console.log(val));
}
