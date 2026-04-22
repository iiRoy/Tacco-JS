const fileInterface = require('fs');

const establishmentCapacity = 17;
const patronGroupDimensions = [2, 5, 2, 2, 2];
const consumptionPeriods = [19, 39, 25, 36, 22, 42];
const totalPatronGroups = 100;
const groupEntryInterval = 5;

const allocateAreas = (currentAreaStatus, requiredSpace, durationValue) => {
    let contiguousFreeSpace = 0;
    let startingPosition = -1;

    for (let areaIdx = 0; areaIdx < establishmentCapacity; areaIdx++) {
        if (currentAreaStatus[areaIdx] === 0) {
            contiguousFreeSpace++;
            if (contiguousFreeSpace === requiredSpace) {
                startingPosition = areaIdx - (requiredSpace - 1);
                const nextAreaStatus = [...currentAreaStatus];
                for (let k = 0; k < requiredSpace; k++) {
                    nextAreaStatus[startingPosition + k] = durationValue;
                }
                return { successFlag: true, updatedAreaStatus: nextAreaStatus };
            }
        } else {
            contiguousFreeSpace = 0;
        }
    }
    return { successFlag: false, updatedAreaStatus: currentAreaStatus };
};

const advanceTimePoint = (
    currentClock,
    currentAreaArrangement,
    currentPendingGroup,
    groupsCompletedSeating,
    recordedWaitDurationMap
) => {
    if (groupsCompletedSeating === totalPatronGroups) {
        return recordedWaitDurationMap;
    }

    let nextAreaArrangement = currentAreaArrangement.map(timeRemaining => Math.max(0, timeRemaining - 1));
    let nextPendingGroup = currentPendingGroup;
    let nextGroupsCompletedSeating = groupsCompletedSeating;
    let nextRecordedWaitDurationMap = new Map(recordedWaitDurationMap);

    if (nextPendingGroup === null &&
        currentClock % groupEntryInterval === 0 &&
        (currentClock / groupEntryInterval) < totalPatronGroups) {
        
        nextPendingGroup = currentClock / groupEntryInterval;
    }

    let groupSeatedThisCycle = true;
    while (groupSeatedThisCycle && nextPendingGroup !== null) {
        const requiredSpace = patronGroupDimensions[nextPendingGroup % patronGroupDimensions.length];
        const mealDuration = consumptionPeriods[nextPendingGroup % consumptionPeriods.length];

        const seatingOutcome = allocateAreas(nextAreaArrangement, requiredSpace, mealDuration);

        if (seatingOutcome.successFlag) {
            nextAreaArrangement = seatingOutcome.updatedAreaStatus;
            const arrivalMoment = nextPendingGroup * groupEntryInterval;
            nextRecordedWaitDurationMap.set(nextPendingGroup, currentClock - arrivalMoment);
            nextGroupsCompletedSeating++;

            const subsequentGroupCandidate = nextPendingGroup + 1;
            if (subsequentGroupCandidate < totalPatronGroups &&
                (subsequentGroupCandidate * groupEntryInterval) <= currentClock) {
                nextPendingGroup = subsequentGroupCandidate;
            } else {
                nextPendingGroup = null;
            }
            groupSeatedThisCycle = true;
        } else {
            groupSeatedThisCycle = false;
        }
    }

    return advanceTimePoint(
        currentClock + 1,
        nextAreaArrangement,
        nextPendingGroup,
        nextGroupsCompletedSeating,
        nextRecordedWaitDurationMap
    );
};

const processDinerQueries = () => {
    const initialArrangement = Array(establishmentCapacity).fill(0);
    const initialWaitMap = new Map();

    const finalWaitDurations = advanceTimePoint(
        0,
        initialArrangement,
        null,
        0,
        initialWaitMap
    );

    const queryData = fileInterface.readFileSync('/dev/stdin', 'utf8');
    const queryLines = queryData.trim().split('\n');

    const results = queryLines.map(line => {
        const groupId = parseInt(line, 10);
        return finalWaitDurations.get(groupId);
    });

    console.log(results.join('\n'));
};

processDinerQueries();