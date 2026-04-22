function conductEngagement(scenarioData) {
    const processedFigures = scenarioData.split(" ").map(figure => +figure);

    const participantOneHP = processedFigures[0];
    const participantOnePower = processedFigures[1];
    const participantTwoHP = processedFigures[2];
    const participantTwoPower = processedFigures[3];

    function resolvePassage(currentP1HP, currentP2HP, isP1Initiator) {
        if (isP1Initiator) {
            const nextP2HP = currentP2HP - participantOnePower;
            if (nextP2HP <= 0) {
                return "Yes";
            }
            return resolvePassage(currentP1HP, nextP2HP, false);
        } else {
            const nextP1HP = currentP1HP - participantTwoPower;
            if (nextP1HP <= 0) {
                return "No";
            }
            return resolvePassage(nextP1HP, currentP2HP, true);
        }
    }

    return resolvePassage(participantOneHP, participantTwoHP, true);
}

const battleConfig = require("fs").readFileSync("/dev/stdin", "utf8");
const outcomeReport = conductEngagement(battleConfig);
console.log(outcomeReport);