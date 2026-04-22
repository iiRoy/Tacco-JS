const processRawData = (sourceString) => {
    const numericElements = sourceString.match(/-?\d+/g).map(Number);
    const pointOneLoc = numericElements[0];
    const pointOneSpeed = numericElements[1];
    const pointTwoLoc = numericElements[2];
    const pointTwoSpeed = numericElements[3];
    const maxTravelDuration = numericElements[4];
    return { pointOneLoc, pointOneSpeed, pointTwoLoc, pointTwoSpeed, maxTravelDuration };
};

const assessEncounterPossibility = (dataBundle) => {
    const locA = dataBundle.pointOneLoc;
    const spdA = dataBundle.pointOneSpeed;
    const locB = dataBundle.pointTwoLoc;
    const spdB = dataBundle.pointTwoSpeed;
    const durMax = dataBundle.maxTravelDuration;

    const relativeSpeedDelta = spdA - spdB;
    const initialLocationDelta = locB - locA;

    const scenarioOneCondition = +!!(relativeSpeedDelta <= 0) * +!!(initialLocationDelta === 0);

    const scenarioTwoCondition = +!!(relativeSpeedDelta > 0) * +!!(Math.abs(initialLocationDelta) <= durMax * relativeSpeedDelta);

    const overallMeetingOutcome = +!!(scenarioOneCondition + scenarioTwoCondition);

    return overallMeetingOutcome;
};

const performEvaluation = (inputContent) => {
    const parsedData = processRawData(inputContent);
    const resultNumeric = assessEncounterPossibility(parsedData);
    return resultNumeric === 1 ? "YES" : "NO";
};

console.log(performEvaluation(require("fs").readFileSync("/dev/stdin", "utf8")));