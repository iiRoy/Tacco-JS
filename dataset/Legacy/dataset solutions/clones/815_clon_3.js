process.stdin.resume();
process.stdin.setEncoding("utf8");

const parseDimensions = (lineStr) => {
    const parts = lineStr.split(/\s+/).map(Number);
    return { numComputers: parts[0], numPackets: parts[1] };
};

const parseTransmissionPacket = (lineStr) => {
    const packetData = lineStr.split(/\s+/).map(Number);
    return [packetData[0], packetData[1] - 1, packetData[2] - 1];
};

const initializeInfectionStatus = (countOfComputers) => {
    const statusArray = Array.from({ length: countOfComputers }, () => true);
    statusArray[0] = false;
    return statusArray;
};

const applyTransmissionEffect = (transmissionRecord, currentInfectionStatus) => {
    const sourceComputerIndex = transmissionRecord[1];
    const targetComputerIndex = transmissionRecord[2];

    if (!currentInfectionStatus[sourceComputerIndex]) {
        currentInfectionStatus[targetComputerIndex] = false;
    }
};

const processSingleTestCase = (allInputLines, startIndex) => {
    let currentReadIndex = startIndex;
    const { numComputers, numPackets } = parseDimensions(allInputLines[currentReadIndex]);
    currentReadIndex++;

    if (numComputers === 0 && numPackets === 0) {
        return { shouldTerminateProcessing: true, nextLineIndex: currentReadIndex };
    }

    let computerInfectionStatus = initializeInfectionStatus(numComputers);

    const transmissionRecords = [];
    for (let packetIdx = 0; packetIdx < numPackets; packetIdx++) {
        transmissionRecords.push(parseTransmissionPacket(allInputLines[currentReadIndex]));
        currentReadIndex++;
    }

    transmissionRecords.sort((recordA, recordB) => recordA - recordB);

    for (const record of transmissionRecords) {
        applyTransmissionEffect(record, computerInfectionStatus);
    }

    const cleanComputerCount = computerInfectionStatus.filter(status => !status).length;
    console.log(cleanComputerCount);

    return { shouldTerminateProcessing: false, nextLineIndex: currentReadIndex };
};


process.stdin.on("data", function (dataChunk) {
    const inputLines = dataChunk.toString().trim().split("\n");
    let currentLineIndex = 0;

    while (true) {
        const testCaseResult = processSingleTestCase(inputLines, currentLineIndex);
        currentLineIndex = testCaseResult.nextLineIndex;
        if (testCaseResult.shouldTerminateProcessing) {
            break;
        }
    }
});
