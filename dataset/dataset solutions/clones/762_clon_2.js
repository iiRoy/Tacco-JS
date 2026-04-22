const initialData = require('fs').readFileSync('/dev/stdin', 'utf8');

let processingQueue = initialData
    .trim()
    .split("\n");

while (Number(processingQueue.shift()) !== 0) {
    const currentChoices = processingQueue.shift().split(" ");
    let winnerIdentified = false;
    const tallyOfVotes = {};

    for (let voteIdx = 0; voteIdx < currentChoices.length; voteIdx++) {
        tallyOfVotes[currentChoices[voteIdx]] = (tallyOfVotes[currentChoices[voteIdx]] || 0) + 1;
        const currentRanked = [];

        for (const candidateKey in tallyOfVotes) {
            currentRanked.push([tallyOfVotes[candidateKey], candidateKey]);
        }

        currentRanked.sort(function(itemA, itemB) {
            return itemA[0] < itemB[0];
        });

        if (currentRanked.length === 1) {
            currentRanked[1] = [0];
        }

        if (currentRanked[0][0] > currentRanked[1][0] + currentChoices.length - (voteIdx + 1)) {
            console.log(currentRanked[0][1], voteIdx + 1);
            winnerIdentified = true;
            break;
        }
    }
    if (!winnerIdentified) {
        console.log("TIE");
    }
}