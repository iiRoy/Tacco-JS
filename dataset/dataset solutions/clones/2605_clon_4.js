function createPlayerProfile(idValue, opponentSequence, currentMatchIndex, completedAllGames) {
    return {
        id: idValue,
        designatedOpponents: opponentSequence,
        matchPointer: currentMatchIndex,
        allGamesFinished: completedAllGames,
        peekNextOpponent: function() {
            return (this.matchPointer < this.designatedOpponents.length) ? this.designatedOpponents[this.matchPointer] : null;
        },
        advanceMatch: function() {
            const nextPointer = this.matchPointer + 1;
            const newCompletionStatus = (nextPointer >= this.designatedOpponents.length);
            return createPlayerProfile(this.id, this.designatedOpponents, nextPointer, newCompletionStatus);
        }
    };
}

function originalNextValue() {
    return obj.next();
}

function originalConvert(value, type) {
    return myconv(value, type);
}

function acquireNumericScalar() {
    return originalConvert(originalNextValue(), 1);
}

function acquireNumericSeries() {
    return originalConvert(originalNextValue(), 4);
}

function emitResult(content) {
    myout(content);
}

function conductPeriodicContest(totalParticipantsCount, currentPeriodCount, participantRegistry) {
    const allParticipantsAreDone = Array.from(participantRegistry.values()).every(profile => profile.allGamesFinished);
    if (allParticipantsAreDone) {
        return currentPeriodCount;
    }

    let engagedParticipantsThisPeriod = new Set();
    let nextParticipantRegistry = new Map(participantRegistry);
    let anyActivityThisPeriod = false;

    const sortedParticipantIDs = Array.from(participantRegistry.keys()).sort((a, b) => a - b);

    for (const participantId of sortedParticipantIDs) {
        const currentProfile = nextParticipantRegistry.get(participantId);

        if (!currentProfile || currentProfile.allGamesFinished || engagedParticipantsThisPeriod.has(participantId)) {
            continue;
        }

        const potentialRivalId = currentProfile.peekNextOpponent();
        if (potentialRivalId === null) {
            if (!currentProfile.allGamesFinished) {
                nextParticipantRegistry.set(participantId, createPlayerProfile(participantId, currentProfile.designatedOpponents, currentProfile.matchPointer, true));
            }
            continue;
        }

        const rivalProfile = nextParticipantRegistry.get(potentialRivalId);

        if (rivalProfile && !rivalProfile.allGamesFinished && !engagedParticipantsThisPeriod.has(potentialRivalId)) {
            const mutualRivalCheck = rivalProfile.peekNextOpponent();
            if (mutualRivalCheck === participantId) {
                anyActivityThisPeriod = true;
                engagedParticipantsThisPeriod.add(participantId);
                engagedParticipantsThisPeriod.add(potentialRivalId);

                nextParticipantRegistry.set(participantId, currentProfile.advanceMatch());
                nextParticipantRegistry.set(potentialRivalId, rivalProfile.advanceMatch());
            }
        }
    }

    if (!anyActivityThisPeriod) {
        const remainingActiveParticipants = Array.from(nextParticipantRegistry.values()).filter(profile => !profile.allGamesFinished);
        return (remainingActiveParticipants.length === 0) ? currentPeriodCount : -1;
    }

    return conductPeriodicContest(totalParticipantsCount, currentPeriodCount + 1, nextParticipantRegistry);
}

function orchestrateTournament() {
    const totalPlayers = acquireNumericScalar();
    const playerScheduleData = [];
    for (let playerNum = 0; playerNum < totalPlayers; playerNum++) {
        playerScheduleData.push(acquireNumericSeries());
    }

    const initialPlayerStates = new Map();
    for (let p = 1; p <= totalPlayers; p++) {
        initialPlayerStates.set(p, createPlayerProfile(p, playerScheduleData[p - 1], 0, false));
    }

    const outcomeValue = conductPeriodicContest(totalPlayers, 0, initialPlayerStates);
    emitResult(outcomeValue);
}