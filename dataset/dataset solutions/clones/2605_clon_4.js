let inputBuffer = '';
process.stdin.on('data', chunk => { inputBuffer += chunk; });
process.stdin.on('end', () => {
    const inputLines = inputBuffer.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const inputHandler = createInputHandler(inputLines);
    
    console.error("\n");
    const startTime = Date.now();
    executeMainLogic(inputHandler);
    const endTime = Date.now() - startTime;
    logDebug("time : " + (endTime) + "ms");
    logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createInputHandler(lines) {
    let currentLinePointer = 0;
    const retrieveNextLine = () => {
        if (currentLinePointer >= lines.length) {
            throw new Error("Input source exhausted.");
        }
        return lines[currentLinePointer++];
    };

    return {
        fetchInteger: () => parseInt(retrieveNextLine(), 10),
        fetchStringArray: () => retrieveNextLine().split(" "),
        fetchIntegerArray: () => retrieveNextLine().split(" ").map(Number),
        fetchCharacterArray: () => retrieveNextLine().split(""),
    };
}

function outputResult(content) { console.log(content); }
function logDebug(content) { console.error("debug:" + require("util").inspect(content, false, null)); }

class PlayerMatchRecord {
    constructor(playerIdentifier, opponentSequenceData) {
        this.playerIdentifier = playerIdentifier;
        this.opponentSequenceData = opponentSequenceData;
        this.currentMatchIndex = 0;
        this.isCompletionAchieved = false;
    }

    get nextScheduledOpponent() {
        return this.opponentSequenceData[this.currentMatchIndex];
    }

    advanceMatchProgress() {
        this.currentMatchIndex++;
        if (this.currentMatchIndex >= this.opponentSequenceData.length) {
            this.isCompletionAchieved = true;
        }
    }
}

function executeMainLogic(inputSource) {
    const totalParticipants = inputSource.fetchInteger();
    const participantRecords = new Map();

    for (let pIndex = 1; pIndex <= totalParticipants; pIndex++) {
        const opponentList = inputSource.fetchIntegerArray();
        participantRecords.set(pIndex, new PlayerMatchRecord(pIndex, opponentList));
    }

    let elapsedDays = 0;
    let remainingParticipants = Array.from({ length: totalParticipants }, (_, i) => i + 1);

    while (true) {
        elapsedDays++;
        const participantsBattledToday = new Set();
        const dailyEngagements = [];

        const currentlyAvailableParticipants = remainingParticipants.filter(id => !participantRecords.get(id).isCompletionAchieved);

        if (currentlyAvailableParticipants.length === 0) {
            outputResult(elapsedDays - 1);
            return;
        }

        let anyEngagementOccurred = false;

        for (const currentParticipantId of currentlyAvailableParticipants) {
            const participantA = participantRecords.get(currentParticipantId);

            if (participantA.isCompletionAchieved || participantsBattledToday.has(currentParticipantId)) {
                continue;
            }

            const intendedOpponentId = participantA.nextScheduledOpponent;
            const participantB = participantRecords.get(intendedOpponentId);

            if (participantB && !participantB.isCompletionAchieved && !participantsBattledToday.has(intendedOpponentId) &&
                participantB.nextScheduledOpponent === currentParticipantId) {

                dailyEngagements.push([currentParticipantId, intendedOpponentId]);
                participantsBattledToday.add(currentParticipantId);
                participantsBattledToday.add(intendedOpponentId);
                anyEngagementOccurred = true;
            }
        }

        if (!anyEngagementOccurred) {
            outputResult(-1);
            return;
        }

        for (const [p1Id, p2Id] of dailyEngagements) {
            participantRecords.get(p1Id).advanceMatchProgress();
            participantRecords.get(p2Id).advanceMatchProgress();
        }

        remainingParticipants = Array.from(participantRecords.keys()).filter(id => !participantRecords.get(id).isCompletionAchieved);

        if (remainingParticipants.length === 0) {
            outputResult(elapsedDays);
            return;
        }
    }
}
