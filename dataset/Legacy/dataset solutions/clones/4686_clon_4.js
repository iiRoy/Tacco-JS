"use strict"

function calculateBusCount(rawInput) {
    const lines = rawInput.trim().split('\n');

    const [passengerCount, busCapacity, timeAllowance] = lines[0].split(' ').map(Number);
    const arrivalTimes = lines.slice(1).map(Number);

    arrivalTimes.sort((first, second) => first - second);

    let currentPassengerPointer = 0;
    let totalBusesDispatched = 0;
    const totalArrivals = arrivalTimes.length;

    while (currentPassengerPointer < totalArrivals) {
        totalBusesDispatched++;
        const busDepartureWindowStart = arrivalTimes[currentPassengerPointer];
        let currentBusOccupancy = 0;

        while (
            currentPassengerPointer < totalArrivals &&
            currentBusOccupancy < busCapacity &&
            arrivalTimes[currentPassengerPointer] <= busDepartureWindowStart + timeAllowance
        ) {
            currentBusOccupancy++;
            currentPassengerPointer++;
        }
    }
    console.log(totalBusesDispatched);
}

const processInputAndOutput = (inputData) => {
    calculateBusCount(inputData);
};

processInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
