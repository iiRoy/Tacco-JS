const utilityModule = require('node:fs');
const rawInputContent = utilityModule.readFileSync('/dev/stdin', 'utf8');

const segmentedData = rawInputContent.split(/\s|,/);

const outcomeCounters = [0, 0, 0, 0]; // Designates counts for [Category A, Category B, Category Other, Category O]

segmentedData.forEach((elementValue, indexPosition) => {
    if (indexPosition % 2 !== 0) { // Processes only elements residing at odd positions (1st, 3rd, 5th, etc.)
        switch (elementValue) {
            case 'A':
                outcomeCounters[0]++; // Corresponds to original 'w'
                break;
            case 'B':
                outcomeCounters[1]++; // Corresponds to original 'x'
                break;
            case 'O':
                outcomeCounters[3]++; // Corresponds to original 'z'
                break;
            default:
                outcomeCounters[2]++; // Corresponds to original 'y' (captures 'AB' or any other string, including empty ones)
                break;
        }
    }
});

console.log(outcomeCounters[0] + '\n' + outcomeCounters[1] + '\n' + outcomeCounters[2] + '\n' + outcomeCounters[3]);