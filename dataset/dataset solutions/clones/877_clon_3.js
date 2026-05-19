const srcData = require('fs').readFileSync('/dev/stdin', 'utf8');
const trimmedInput = srcData.trim();
let dataLines = trimmedInput.split("\n");

// Helper function to break down HH:MM string into numeric components [HH, MM]
const extractTimeParts = (timeString) => {
    return timeString.split(":").map(partStr => parseInt(partStr, 10));
};

// Helper function to convert time components [HH, MM] into total minutes from midnight
const convertToAbsoluteMinutes = (timeParts) => {
    const hours = timeParts[0];
    const minutes = timeParts[1];
    return hours * 60 + minutes;
};

while (dataLines.length > 0) {
    const findings = [];
    const currentConfigLine = dataLines.shift();
    const configParameters = currentConfigLine.split(" ").map(Number);
    
    const numberOfRecords = configParameters[0];
    const requiredMinimumGap = configParameters[1];

    let previousRecordEndTimeInMinutes;
    let currentRecordIdentifier;

    for (let recordIndex = 0; recordIndex < numberOfRecords; recordIndex++) {
        const recordDetails = (dataLines.shift()).split(" ");
        
        const currentRecordStartTimeParts = extractTimeParts(recordDetails[0]);
        const currentRecordEndTimeParts = extractTimeParts(recordDetails[2]);
        currentRecordIdentifier = recordDetails[3];

        if (recordIndex > 0) {
            const currentRecordStartTimeInMinutes = convertToAbsoluteMinutes(currentRecordStartTimeParts);
            const observedGap = currentRecordStartTimeInMinutes - previousRecordEndTimeInMinutes;
            
            if (observedGap >= requiredMinimumGap) {
                findings.push(currentRecordIdentifier + " " + observedGap);
            }
        }
        previousRecordEndTimeInMinutes = convertToAbsoluteMinutes(currentRecordEndTimeParts);
    }

    if (findings.length === 0) {
        console.log(0);
    } else {
        console.log(findings.length);
        findings.forEach(function(foundItem) {
            console.log(foundItem);
        });
    }
}
