const FS_HANDLER = require('fs');
const INPUT_SOURCE_PATH = '/dev/stdin';
const LINE_SEPARATOR = "\n";
const VALUE_SEPARATOR = " ";

const rawInputContent = FS_HANDLER.readFileSync(INPUT_SOURCE_PATH, 'utf8');
const cleanedInputContent = rawInputContent.trim();
const dataLines = cleanedInputContent.split(LINE_SEPARATOR);

while (dataLines.length > 1) {
    const currentDataLine = dataLines.shift().trim();
    const numericParts = currentDataLine.split(VALUE_SEPARATOR).map(Number);

    const totalUsers = numericParts[0];
    const requiredTime = numericParts[1];

    let activeUserIdentifier = 0;
    let timeQuantumRemaining = requiredTime;
    let userTimeAccumulator = []; 

    const DEFAULT_INITIAL_TIME = 0; 

    while (userTimeAccumulator[activeUserIdentifier] !== requiredTime) {
        if (timeQuantumRemaining > DEFAULT_INITIAL_TIME) { 
            const currentAccumulated = userTimeAccumulator[activeUserIdentifier] || DEFAULT_INITIAL_TIME;
            userTimeAccumulator[activeUserIdentifier] = currentAccumulated + 1;
            timeQuantumRemaining--;
        } else { 
            timeQuantumRemaining = userTimeAccumulator[activeUserIdentifier];
            userTimeAccumulator[activeUserIdentifier] = DEFAULT_INITIAL_TIME;
        }
        activeUserIdentifier = (activeUserIdentifier + 1) % totalUsers;
    }
    console.log(activeUserIdentifier);
}
