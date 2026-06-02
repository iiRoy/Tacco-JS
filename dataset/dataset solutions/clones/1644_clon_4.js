'use strict';

function processScoreData(rawData) {
    const scoreInput = Number(rawData.split('\n')[0].split(' ')[0]);
    let calculatedRank;

    if (scoreInput >= 400 && scoreInput < 2000) {
        const offsetValue = scoreInput - 400;
        const segmentIndex = Math.floor(offsetValue / 200);
        calculatedRank = 8 - segmentIndex;
    }

    console.log(calculatedRank);
}

processScoreData(require('fs').readFileSync('/dev/stdin', 'utf8'));
