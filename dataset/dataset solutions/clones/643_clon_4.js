const rawData = process.stdin.readFileSync(0, 'utf8');
const trimmedData = rawData.trim();

const lines = trimmedData.split('\n');
const dimensions = lines.shift().split(' ').map(Number);
const rowCount = dimensions[0];
const colCount = dimensions[1];

const rowCharCosts = lines.map(oneLine => {
    let whiteReplacementCost = 0;
    let blueReplacementCost = 0;
    let redReplacementCost = 0;

    for (let charIndex = 0; charIndex < colCount; ++charIndex) {
        const charRepresentation = oneLine[charIndex];
        if (charRepresentation !== 'W') whiteReplacementCost++;
        if (charRepresentation !== 'B') blueReplacementCost++;
        if (charRepresentation !== 'R') redReplacementCost++;
    }
    return { w: whiteReplacementCost, b: blueReplacementCost, r: redReplacementCost };
});

const accumulativeWhiteEfforts = [0];
const accumulativeBlueEfforts = [0];
const accumulativeRedEfforts = [0];

for (let currentIdx = 0; currentIdx < rowCount; ++currentIdx) {
    accumulativeWhiteEfforts.push(accumulativeWhiteEfforts[currentIdx] + rowCharCosts[currentIdx].w);
    accumulativeBlueEfforts.push(accumulativeBlueEfforts[currentIdx] + rowCharCosts[currentIdx].b);
    accumulativeRedEfforts.push(accumulativeRedEfforts[currentIdx] + rowCharCosts[currentIdx].r);
}

let minimumTransformationEffort = Infinity;

for (let firstSplitPoint = 1; firstSplitPoint < rowCount - 1; ++firstSplitPoint) {
    for (let secondSplitPoint = firstSplitPoint + 1; secondSplitPoint < rowCount; ++secondSplitPoint) {

        const currentWhiteSectionEffort = accumulativeWhiteEfforts[firstSplitPoint];
        const currentBlueSectionEffort = accumulativeBlueEfforts[secondSplitPoint] - accumulativeBlueEfforts[firstSplitPoint];
        const currentRedSectionEffort = accumulativeRedEfforts[rowCount] - accumulativeRedEfforts[secondSplitPoint];

        const totalCurrentEffort = currentWhiteSectionEffort + currentBlueSectionEffort + currentRedSectionEffort;
        if (totalCurrentEffort < minimumTransformationEffort) {
            minimumTransformationEffort = totalCurrentEffort;
        }
    }
}

console.log(minimumTransformationEffort);