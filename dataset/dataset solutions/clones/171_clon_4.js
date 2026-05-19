const fileSystem = require('fs');

const allInputContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const inputLines = allInputContent.split('\n');

function processInput() {
    let linePointer = 0;
    let caseNumber = 1;

    while (true) {
        const capacityLimit = Number(inputLines[linePointer++]);
        if (!capacityLimit) {
            break;
        }

        const itemCount = Number(inputLines[linePointer++]);
        let valueAccumulator = Array(capacityLimit + 1).fill(0);

        for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
            const [itemValue, itemWeight] = inputLines[linePointer++].split(',').map(Number);

            for (let currentWt = capacityLimit; currentWt >= itemWeight; currentWt--) {
                valueAccumulator[currentWt] = Math.max(
                    valueAccumulator[currentWt],
                    valueAccumulator[currentWt - itemWeight] + itemValue
                );
            }
        }

        const maximumAchievableValue = Math.max(...valueAccumulator);

        let minimumWeightForMax = 1001;

        if (maximumAchievableValue > 0) {
            for (let currentIdx = 0; currentIdx <= capacityLimit; currentIdx++) {
                if (valueAccumulator[currentIdx] === maximumAchievableValue) {
                    minimumWeightForMax = currentIdx;
                    break;
                }
            }
        }

        console.log(`Case ${caseNumber++}:\n${maximumAchievableValue}\n${minimumWeightForMax}`);
    }
}

processInput();
