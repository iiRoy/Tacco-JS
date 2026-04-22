const obtainContent = require('fs').readFileSync;

class LineProcessor {
    constructor(textData) {
        this.allLines = textData.trim().split("\n");
        this.pointer = 0;
    }

    retrieveNextLine() {
        if (this.pointer < this.allLines.length) {
            return this.allLines[this.pointer++];
        }
        return null;
    }
}

const determinePhrase = (numericalValue) => {
    const isDivisibleBy = (val, divisor) => val % divisor === 0;
    const ruleSet = [
        { condition: (val) => isDivisibleBy(val, 15), output: "FizzBuzz" },
        { condition: (val) => isDivisibleBy(val, 3), output: "Fizz" },
        { condition: (val) => isDivisibleBy(val, 5), output: "Buzz" }
    ];

    for (const rule of ruleSet) {
        if (rule.condition(numericalValue)) {
            return rule.output;
        }
    }
    return String(numericalValue);
};

const processGameSegments = (processorInstance) => {
    const controlSegment = processorInstance.retrieveNextLine();
    if (controlSegment === null) return;

    const [participantCountStr, roundCountStr] = controlSegment.split(" ");
    const participantCount = Number(participantCountStr);
    const roundCount = Number(roundCountStr);

    if (participantCount === 0 && roundCount === 0) {
        return;
    }

    let activeParticipants = new Set(
        Array.from({ length: participantCount }, (_, k) => k + 1)
    );
    let currentParticipantIdx = 0;

    for (let roundNumber = 1; roundNumber <= roundCount; roundNumber++) {
        let selectedPlayerIdx = currentParticipantIdx;
        let selectedPlayerID = selectedPlayerIdx + 1;
        let cycleCounter = 0;

        while (!activeParticipants.has(selectedPlayerID)) {
            selectedPlayerIdx = (selectedPlayerIdx + 1) % participantCount;
            selectedPlayerID = selectedPlayerIdx + 1;
            cycleCounter++;
            if (cycleCounter > participantCount) {
                break;
            }
        }

        const actualResponse = processorInstance.retrieveNextLine();
        const expectedResponse = determinePhrase(roundNumber);

        if (activeParticipants.has(selectedPlayerID) && actualResponse !== expectedResponse) {
            activeParticipants.delete(selectedPlayerID);
        }

        if (roundNumber === roundCount) {
            break;
        }

        currentParticipantIdx = (selectedPlayerIdx + 1) % participantCount;
        cycleCounter = 0;
        while (!activeParticipants.has(currentParticipantIdx + 1)) {
            currentParticipantIdx = (currentParticipantIdx + 1) % participantCount;
            cycleCounter++;
            if (cycleCounter > participantCount) {
                break;
            }
        }
    }

    const finalists = Array.from(activeParticipants)
        .sort((valA, valB) => valA - valB)
        .join(" ");

    console.log(finalists);

    processGameSegments(processorInstance);
};

const rawContent = obtainContent('/dev/stdin', 'utf8');
const inputLineProcessor = new LineProcessor(rawContent);
processGameSegments(inputLineProcessor);