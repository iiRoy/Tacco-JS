'use strict';

function processScoreData(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const firstLineTokens = inputLines[0].split(' ');
    const parsedScore = Number(firstLineTokens[0]);

    const rankDefinitions = [
        { minVal: 400, maxValExclusive: 600, assignedRank: 8 },
        { minVal: 600, maxValExclusive: 800, assignedRank: 7 },
        { minVal: 800, maxValExclusive: 1000, assignedRank: 6 },
        { minVal: 1000, maxValExclusive: 1200, assignedRank: 5 },
        { minVal: 1200, maxValExclusive: 1400, assignedRank: 4 },
        { minVal: 1400, maxValExclusive: 1600, assignedRank: 3 },
        { minVal: 1600, maxValExclusive: 1800, assignedRank: 2 },
        { minVal: 1800, maxValExclusive: 2000, assignedRank: 1 }
    ];

    let finalRankResult;

    for (const rankEntry of rankDefinitions) {
        if (parsedScore >= rankEntry.minVal && parsedScore < rankEntry.maxValExclusive) {
            finalRankResult = rankEntry.assignedRank;
            break;
        }
    }

    console.log(finalRankResult);
}

processScoreData(require('fs').readFileSync('/dev/stdin', 'utf8'));
