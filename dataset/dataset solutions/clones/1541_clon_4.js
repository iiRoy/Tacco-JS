const acquireInputData = (rawTextLines) => {
    let currentLinePointer = 0;
    const processLineToNumbers = (lineString) => lineString.split(' ').map(Number);

    return {
        fetchNextNumericRow: () => {
            if (currentLinePointer >= rawTextLines.length) {
                throw new Error("Input exhausted.");
            }
            return processLineToNumbers(rawTextLines[currentLinePointer++]);
        }
    };
};

class ElementGroupManager {
    constructor(capacity) {
        this.parentReferences = new Array(capacity);
        this.groupSizes = new Array(capacity);
        for (let i = 0; i < capacity; i++) {
            this.parentReferences[i] = i;
            this.groupSizes[i] = 1;
        }
    }

    identifyLeader(member) {
        let currentMember = member;
        while (this.parentReferences[currentMember] !== currentMember) {
            this.parentReferences[currentMember] = this.parentReferences[this.parentReferences[currentMember]];
            currentMember = this.parentReferences[currentMember];
        }
        return currentMember;
    }

    combineGroups(memberA, memberB) {
        let leaderA = this.identifyLeader(memberA);
        let leaderB = this.identifyLeader(memberB);

        if (leaderA === leaderB) {
            return;
        }

        if (this.groupSizes[leaderA] < this.groupSizes[leaderB]) {
            [leaderA, leaderB] = [leaderB, leaderA];
        }

        this.parentReferences[leaderB] = leaderA;
        this.groupSizes[leaderA] += this.groupSizes[leaderB];
    }

    areMembersConnected(memberX, memberY) {
        return this.identifyLeader(memberX) === this.identifyLeader(memberY);
    }
}

const performCalculations = (inputLines) => {
    const dataReader = acquireInputData(inputLines);
    const outputBuffer = [];

    const initialParameters = dataReader.fetchNextNumericRow();
    const totalEntities = initialParameters[0];
    const totalOperations = initialParameters[1];

    const manager = new ElementGroupManager(totalEntities);

    for (let operationIndex = 0; operationIndex < totalOperations; operationIndex++) {
        const operationDetails = dataReader.fetchNextNumericRow();
        const operationTypeIndicator = operationDetails[0];
        const firstOperand = operationDetails[1];
        const secondOperand = operationDetails[2];

        if (operationTypeIndicator === 0) {
            manager.combineGroups(firstOperand, secondOperand);
        } else {
            outputBuffer.push(manager.areMembersConnected(firstOperand, secondOperand) ? 1 : 0);
        }
    }

    console.log(outputBuffer.join('\n'));
};

// Example usage if this were the main script entry:
// const sampleInput = [
//     "5 3",
//     "0 0 1",
//     "0 1 2",
//     "1 0 2"
// ];
// performCalculations(sampleInput);