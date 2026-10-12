const config = {
    input: '/dev/stdin',
    newline: '\n'
};

const rawInputLines = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

const charSequence = rawInputLines[0];

let backSlantIndices = []; // Stores indices of '\' characters
let lakeRecords = [];     // Stores [start_index, area] for completed lakes

for (let charIndex = 0; charIndex < charSequence.length; charIndex++) {
    const currentSymbol = charSequence[charIndex];

    if (currentSymbol === '\\') {
        backSlantIndices.push(charIndex);
    } else if (currentSymbol === '/' && backSlantIndices.length > 0) {
        const startIdx = backSlantIndices.pop();
        let currentLakeArea = charIndex - startIdx;

        let updatedLakeRecords = [];
        for (let k = 0; k < lakeRecords.length; k++) {
            if (lakeRecords[k][0] < startIdx) {
                // This existing lake starts before the current one, so it's not absorbed. Keep it.
                updatedLakeRecords.push(lakeRecords[k]);
            } else {
                // This existing lake starts at or after the current one's start, so it's absorbed.
                // Add its area to the current lake's area.
                currentLakeArea += lakeRecords[k][1];
            }
        }
        // Add the newly formed (or expanded) lake to the updated list.
        updatedLakeRecords.push([startIdx, currentLakeArea]);
        lakeRecords = updatedLakeRecords; // Replace the old list with the new one.
    }
}

let totalWaterVolume = 0;
let individualLakeVolumes = [];

for (let i = 0; i < lakeRecords.length; i++) {
    totalWaterVolume += lakeRecords[i][1];
    individualLakeVolumes.push(lakeRecords[i][1]);
}

console.log(totalWaterVolume);
console.log(`${individualLakeVolumes.length}${individualLakeVolumes.length > 0 ? ' ' + individualLakeVolumes.map(vol => vol.toString()).join(' ') : ''}`);
