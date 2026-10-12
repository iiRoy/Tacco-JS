"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');
let rawData = '';
process.stdin.on('data', function(chunk) {rawData += chunk;});
process.stdin.on('end', function() {processSimulation(rawData.split(/\r?\n/));});

function extractInitialParameters(lineContent) {
    const parameterParts = lineContent.split(' ');
    return {
        totalParticipants: Number(parameterParts[0]),
        timeQuantum: Number(parameterParts[1])
    };
}

function parseParticipantEntry(entryLine) {
    const entryParts = entryLine.split(' ');
    return {
        participantName: entryParts[0],
        remainingValue: Number(entryParts[1])
    };
}

function processSimulation(dataLines){
    const initialParams = extractInitialParameters(dataLines[0]);
    let totalParticipants = initialParams.totalParticipants;
    const timeQuantum = initialParams.timeQuantum;

    let currentProcess, previousProcess, newProcessNode;
    let headProcess = null;

    const firstEntryData = parseParticipantEntry(dataLines[1]);
    headProcess = {
        participantName: firstEntryData.participantName,
        remainingValue: firstEntryData.remainingValue,
        nextProcess: null
    };
    currentProcess = headProcess;
    
    for (let participantIndex = 1; participantIndex < totalParticipants; participantIndex++) {
        const currentEntryLine = dataLines[participantIndex + 1];
        const entryData = parseParticipantEntry(currentEntryLine);
        
        newProcessNode = {
            participantName: entryData.participantName,
            remainingValue: entryData.remainingValue,
            nextProcess: null
        };
        currentProcess.nextProcess = newProcessNode;
        currentProcess = newProcessNode;
    }
    
    currentProcess.nextProcess = headProcess;
    previousProcess = currentProcess;
    currentProcess = headProcess;
    
    headProcess = null;
    newProcessNode = null;

    let accumulatedTime = 0;
    while (totalParticipants > 0) {
        const valueBeforeQuantum = currentProcess.remainingValue;
        currentProcess.remainingValue -= timeQuantum;
        accumulatedTime += timeQuantum;

        if (currentProcess.remainingValue > 0) {
            currentProcess = currentProcess.nextProcess;
            previousProcess = previousProcess.nextProcess;
        } else {
            accumulatedTime += currentProcess.remainingValue;
            console.log(`${currentProcess.participantName} ${accumulatedTime}`);
            currentProcess = currentProcess.nextProcess;
            previousProcess.nextProcess = currentProcess;
            totalParticipants--;
        }
    }
    
    currentProcess = null;
    previousProcess = null;
}
