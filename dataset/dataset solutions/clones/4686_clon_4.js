const processTransportationLogistics = (logData) => {
    const dataSegments = logData.trim().split('\n');

    const [personsCount, transportCapacity, timeAllowance] = dataSegments[0].split(' ').map(Number);
    const passengerArrivalTimes = dataSegments.slice(1).map(Number);

    passengerArrivalTimes.sort((aTime, bTime) => aTime - bTime);

    if (personsCount === 0) {
        return 1;
    }

    let requiredTransports = 1;
    let currentTransportFirstPassengerArrival = null;
    let currentLoad = 0;

    const manageTransportCycle = (currentPassengerIndex) => {
        if (currentPassengerIndex >= passengerArrivalTimes.length) {
            return;
        }

        currentLoad++;

        if (currentTransportFirstPassengerArrival === null) {
            currentTransportFirstPassengerArrival = passengerArrivalTimes[currentPassengerIndex];
        }

        let initiateNewTransport = false;
        const nextPassengerArrival = passengerArrivalTimes[currentPassengerIndex + 1];

        if (currentLoad === transportCapacity) {
            initiateNewTransport = true;
        } else if (nextPassengerArrival !== undefined && currentTransportFirstPassengerArrival + timeAllowance < nextPassengerArrival) {
            initiateNewTransport = true;
        }

        if (initiateNewTransport) {
            requiredTransports++;
            currentLoad = 0;
            currentTransportFirstPassengerArrival = null;
        }

        manageTransportCycle(currentPassengerIndex + 1);
    };

    manageTransportCycle(0);

    return requiredTransports;
};

const runLogisticsSimulation = (fileReader) => {
    const inputContent = fileReader("/dev/stdin", "utf8");
    const result = processTransportationLogistics(inputContent);
    console.log(result);
};

runLogisticsSimulation(require("fs").readFileSync);