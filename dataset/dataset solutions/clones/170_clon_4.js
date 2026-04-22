const libIO = require('fs');
const sourceContent = libIO.readFileSync('/dev/stdin', 'utf8');
const sourceLines = sourceContent.split('\n');

let currentLineIndex = 0;

function fetchNextValue() {
    return Number(sourceLines[currentLineIndex++]);
}

function fetchItemSpecs() {
    const parts = sourceLines[currentLineIndex++].split(',');
    return {
        worth: Number(parts[0]),
        mass: Number(parts[1])
    };
}

function ascertainGreater(paramA, paramB) {
    return (paramA > paramB) ? paramA : paramB;
}

function initiateSystem() {
    let currentCaseIdentifier = 1;

    while (true) {
        const maximumCapacity = fetchNextValue();
        if (maximumCapacity === 0) {
            break;
        }

        const numberOfGoods = fetchNextValue();
        const availableGoods = [];
        for (let goodCounter = 0; goodCounter < numberOfGoods; goodCounter++) {
            availableGoods.push(fetchItemSpecs());
        }

        const worthAccumulator = new Array(maximumCapacity + 1).fill(0);

        for (let currentCapacityLimit = 1; currentCapacityLimit <= maximumCapacity; currentCapacityLimit++) {
            for (const currentGood of availableGoods) {
                if (currentCapacityLimit >= currentGood.mass) {
                    worthAccumulator[currentCapacityLimit] = ascertainGreater(
                        worthAccumulator[currentCapacityLimit],
                        worthAccumulator[currentCapacityLimit - currentGood.mass] + currentGood.worth
                    );
                }
            }
        }

        let highestWorthAttainable = 0;
        let massForHighestWorth = 0;

        for (let currentMass = 0; currentMass <= maximumCapacity; currentMass++) {
            const currentWorth = worthAccumulator[currentMass];
            if (currentWorth > highestWorthAttainable) {
                highestWorthAttainable = currentWorth;
                massForHighestWorth = currentMass;
            } else if (currentWorth === highestWorthAttainable && currentMass < massForHighestWorth) {
                massForHighestWorth = currentMass;
            }
        }
        
        console.log("Case " + currentCaseIdentifier++ + ":\n" + highestWorthAttainable + "\n" + massForHighestWorth);
    }
}

initiateSystem();