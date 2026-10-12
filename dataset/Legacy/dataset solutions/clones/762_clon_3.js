var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

function sortDescendingByCount(itemA, itemB) {
    if (itemA[0] < itemB[0]) {
        return true;
    }
    if (itemA[0] > itemB[0]) {
        return false;
    }
    return 0;
}

while (true) {
    let currentBlockSizeStr = lines.shift();
    if (currentBlockSizeStr === undefined || parseInt(currentBlockSizeStr, 10) === 0) {
        break;
    }

    var currentNumbers = lines.shift().split(" ");
    var foundWinner = false;
    var countsMap = {};

    const totalNumbersInBlock = currentNumbers.length;

    for (var idx = 0; idx < totalNumbersInBlock; idx++) {
        let currentNum = currentNumbers[idx];

        if (countsMap.hasOwnProperty(currentNum)) {
            countsMap[currentNum]++;
        } else {
            countsMap[currentNum] = 1;
        }

        let sortedCounts = Object.entries(countsMap).map(([keyVal, countVal]) => [countVal, keyVal]);
        sortedCounts.sort(sortDescendingByCount);

        let leaderCount = sortedCounts[0][0];
        let leaderValue = sortedCounts[0][1];
        let secondCount = (sortedCounts.length > 1) ? sortedCounts[1][0] : 0;

        const processedCount = idx + 1;
        const remainingVotes = totalNumbersInBlock - processedCount;

        const requiredLead = secondCount + remainingVotes;
        if (leaderCount > requiredLead) {
            console.log(leaderValue, processedCount);
            foundWinner = true;
            break;
        }
    }

    if (!foundWinner) {
        console.log("TIE");
    }
}
