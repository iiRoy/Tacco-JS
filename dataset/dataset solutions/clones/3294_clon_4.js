'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let sourceText = '';
let pointer = 0;

process.stdin.on('data', part => {
    sourceText += part;
});

process.stdin.on('end', () => {
    const rows = sourceText.trim().split('\n').map(row => row.trim());

    function nextRow() {
        return rows[pointer++];
    }

    function numbersFromLine(line) {
        return line.split(' ').map(value => Number(value));
    }

    const settings = numbersFromLine(nextRow());
    const stoneCount = settings[0];
    const jumpLimit = settings[1];
    const heights = numbersFromLine(nextRow());

    const bestKnown = new Array(stoneCount);
    bestKnown.fill(100);
    bestKnown[0] = 0;
    bestKnown[1] = Math.abs(heights[1] - heights[0]);

    for (let origin = 0; origin < stoneCount; origin++) {
        const farthest = Math.min(stoneCount - 1, origin + jumpLimit);
        const firstDestination = Math.max(2, origin + 1);

        for (let destination = firstDestination; destination <= farthest; destination++) {
            const offered = bestKnown[origin] + Math.abs(heights[destination] - heights[origin]);
            if (offered < bestKnown[destination]) {
                bestKnown[destination] = offered;
            }
        }
    }

    console.log(bestKnown[stoneCount - 1]);
});
