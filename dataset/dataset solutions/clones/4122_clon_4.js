const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");

const rawSegments = systemInput.trim().split("\n");
const totalStations = parseInt(rawSegments[0], 10);

const travelTimes = [];
const initialDepartures = [];
const frequencySpans = [];

for (let k = 1; k < totalStations; k++) {
    const segmentData = rawSegments[k].split(" ");
    travelTimes.push(parseInt(segmentData[0], 10));
    initialDepartures.push(parseInt(segmentData[1], 10));
    frequencySpans.push(parseInt(segmentData[2], 10));
}

const travelSimulator = (startPoint) => {
    const traverseRoute = (presentLoc, momentOfArrival) => {
        if (presentLoc === totalStations - 1) {
            return momentOfArrival;
        }

        const earliestConsideration = Math.max(momentOfArrival, initialDepartures[presentLoc]);
        const intervalOffset = earliestConsideration % frequencySpans[presentLoc];
        
        let actualDepartureMoment;
        if (intervalOffset === 0) {
            actualDepartureMoment = earliestConsideration;
        } else {
            actualDepartureMoment = earliestConsideration + (frequencySpans[presentLoc] - intervalOffset);
        }

        const arrivalAtNext = actualDepartureMoment + travelTimes[presentLoc];

        return traverseRoute(presentLoc + 1, arrivalAtNext);
    };

    return traverseRoute(startPoint, 0);
};

const outputBuffer = [];
for (let j = 0; j < totalStations; j++) {
    outputBuffer.push(travelSimulator(j));
}

console.log(outputBuffer.join("\n"));