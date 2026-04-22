const systemIO = require('node:fs');

function* inputLineProvider() {
    const rawContent = systemIO.readFileSync(0, 'utf8');
    const lines = rawContent.split('\n');
    let currentIndex = 0;

    while (currentIndex < lines.length) {
        const line = lines[currentIndex++].trim();
        if (line === '') continue;

        if (line.includes(',')) {
            const parts = line.split(',').map(Number);
            yield { benefit: parts[0], mass: parts[1] };
        } else {
            yield Number(line);
        }
    }
}

function processCases() {
    const lineSource = inputLineProvider();
    let caseCounter = 1;

    for (;;) {
        const capacityEntry = lineSource.next();
        if (capacityEntry.done) break;
        const currentCapacity = capacityEntry.value;

        if (currentCapacity === 0) {
            break;
        }

        const itemsCountEntry = lineSource.next();
        if (itemsCountEntry.done) break;
        const totalItems = itemsCountEntry.value;

        const valueAccumulator = new Array(currentCapacity + 1).fill(0);

        for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
            const itemDataEntry = lineSource.next();
            if (itemDataEntry.done) break;
            const { benefit: itemBenefit, mass: itemMass } = itemDataEntry.value;

            for (let currentMass = currentCapacity; currentMass >= itemMass; currentMass--) {
                valueAccumulator[currentMass] = Math.max(
                    valueAccumulator[currentMass],
                    valueAccumulator[currentMass - itemMass] + itemBenefit
                );
            }
        }

        let maxAchievedValue = 0;
        let correspondingMass = 0;
        
        for (let m = 0; m <= currentCapacity; m++) {
            if (valueAccumulator[m] > maxAchievedValue) {
                maxAchievedValue = valueAccumulator[m];
                correspondingMass = m;
            }
        }

        console.log(`Case ${caseCounter++}:\n${maxAchievedValue}\n${correspondingMass}`);
    }
}

processCases();