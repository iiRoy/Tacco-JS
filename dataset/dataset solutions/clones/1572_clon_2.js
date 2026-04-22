// This module handles input processing and calculation.
function ProcessInput(rawData) {
    let parsedLines = rawData.split("\n");

    const totalItems = parsedLines[0].split(' ')[0] - 0;
    const capacityPerTrip = parsedLines[0].split(' ')[1] - 0;
    const timePerTrip = parsedLines[0].split(' ')[2] - 0;

    // Calculate the total time required based on items, capacity, and trip duration.
    console.log(Math.ceil(totalItems / capacityPerTrip) * timePerTrip);
}

// Do not modify the following line; it reads from standard input and invokes the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));