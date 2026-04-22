const fileSystem = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';

const parseNumericLine = (lineContent) => {
    return lineContent.trim().split(" ").map(Number);
};

const identifyCurrentLeader = (allPlayerScores) => {
    return allPlayerScores.reduce((leaderInfo, individualScore, playerIdx) => {
        if (individualScore > leaderInfo.topScoreValue) {
            return {
                topScoreValue: individualScore,
                leaderPlayerIndex: playerIdx
            };
        } else if (individualScore === leaderInfo.topScoreValue) {
            if (playerIdx < leaderInfo.leaderPlayerIndex) {
                return {
                    topScoreValue: individualScore,
                    leaderPlayerIndex: playerIdx
                };
            }
        }
        return leaderInfo;
    }, { topScoreValue: -Infinity, leaderPlayerIndex: -1 });
};

const rawInputData = fileSystem.readFileSync(STANDARD_INPUT_PATH, 'utf8');

const processedInputLines = rawInputData.split('\n').filter(line => line.trim() !== '');

const gameConfigurationDetails = parseNumericLine(processedInputLines.shift());
const numberOfParticipants = gameConfigurationDetails[0];

let participantScores = Array.from({ length: numberOfParticipants }, () => 0);

let currentLeaderStatus = identifyCurrentLeader(participantScores);
let currentTopScore = currentLeaderStatus.topScoreValue;
let currentLeaderIndex = currentLeaderStatus.leaderPlayerIndex;

processedInputLines.forEach(queryDataString => {
    const [participantIdOneBased, scoreModificationAmount] = parseNumericLine(queryDataString);
    const targetParticipantIndex = participantIdOneBased - 1;

    participantScores[targetParticipantIndex] += scoreModificationAmount;

    let requiresFullLeaderRecalculation = false;

    if (targetParticipantIndex === currentLeaderIndex) {
        if (scoreModificationAmount < 0) {
            requiresFullLeaderRecalculation = true;
        } else {
            currentTopScore = participantScores[currentLeaderIndex];
        }
    } else {
        if (participantScores[targetParticipantIndex] >= currentTopScore) {
            requiresFullLeaderRecalculation = true;
        }
    }

    if (requiresFullLeaderRecalculation) {
        currentLeaderStatus = identifyCurrentLeader(participantScores);
        currentTopScore = currentLeaderStatus.topScoreValue;
        currentLeaderIndex = currentLeaderStatus.leaderPlayerIndex;
    }

    console.log(`${currentLeaderIndex + 1} ${currentTopScore}`);
});