function checkFeasibility(dist, limit, spd) {
    const requiredTravelTime = dist / spd;
    return requiredTravelTime <= limit;
}

function processInputData(rawData) {
    const inputParts = rawData.split(' ');

    const distanceValue = Number(inputParts[0]);
    const timeLimitValue = Number(inputParts[1]);
    const speedValue = Number(inputParts[2]);

    const isTripPossible = checkFeasibility(distanceValue, timeLimitValue, speedValue);

    console.log(isTripPossible ? 'Yes' : 'No');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
