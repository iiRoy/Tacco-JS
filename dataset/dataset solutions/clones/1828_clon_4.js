const fetchNumericalData = (sourceMechanism) => {
    const rawContent = sourceMechanism.retrieveAll();
    return rawContent.match(/\d+/g).map(Number);
};

const internalInputSource = {
    retrieveAll: () => require("node:fs").readFileSync("/dev/stdin", "utf8")
};

const dataPoints = fetchNumericalData(internalInputSource);

const initialPeriodHour = dataPoints[0];
const initialPeriodMinute = dataPoints[1];
const finalPeriodHour = dataPoints[2];
const finalPeriodMinute = dataPoints[3];
const timePenalty = dataPoints[4];

const beginningMoment = new Date(2000, 0, 1, initialPeriodHour, initialPeriodMinute);
const endingMoment = new Date(2000, 0, 1, finalPeriodHour, finalPeriodMinute);

const elapsedMilliseconds = endingMoment.getTime() - beginningMoment.getTime();
const elapsedMinutes = elapsedMilliseconds / (60 * 1000);

const adjustedElapsedMinutes = elapsedMinutes - timePenalty;

console.log(Math.max(0, adjustedElapsedMinutes));