// This script processes incoming textual information
function ProcessData(rawData) {
    // Each line of the raw input is separated into an array element for easier handling
    rawData = rawData.split("\n");
    let firstLineParts = rawData[0].split(" ");
    let totalLocations = Number(firstLineParts[0]);
    let secondLineParts = rawData[1].split(" ");
    let baseTemperature = Number(secondLineParts[0]);
    let targetTemperature = Number(secondLineParts[1]);
    let thirdLineParts = rawData[2].split(" ");

    let currentElevation = Number(thirdLineParts[0]);
    currentElevation = baseTemperature - currentElevation * 0.006;
    // The previous line's output was for debugging purposes
    // console.log("Calculated initial elevation temperature:", currentElevation);
    let minimumDifference = Math.abs(currentElevation - targetTemperature);
    let resultIndex = 1;

    for (let idx = 1; idx < totalLocations; idx++) {
        currentElevation = Number(thirdLineParts[idx]);
        currentElevation = baseTemperature - currentElevation * 0.006;
        // This log was also for development and is now commented out
        // console.log("Iteration", idx, "elevation temperature:", currentElevation);
        if (minimumDifference > Math.abs(currentElevation - targetTemperature)) {
            resultIndex = idx + 1;
        }
    }
    console.log(resultIndex);
}

// Do not modify the following section (handles standard input/output and invokes the main processing function)
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));