class DataStreamReader {
    constructor(sourceText) {
        this.dataElements = sourceText.split(/ |\n/).filter(s => s.length > 0);
        this.nextIndex = 0;
    }

    fetchScalar() {
        return Number(this.dataElements[this.nextIndex++]);
    }

    fetchCollection(count) {
        const collection = [];
        for (let i = 0; i < count; ++i) {
            collection.push(Number(this.dataElements[this.nextIndex++]));
        }
        return collection;
    }
}

const createDynamicArray = (size, initializer = null) => {
    return Array.from({ length: size }, () => initializer);
};

const processSystem = (dataSource) => {
    const switchCount = dataSource.fetchScalar();
    const bulbCount = dataSource.fetchScalar();

    const bulbConfigurations = createDynamicArray(bulbCount);

    for (let i = 0; i < bulbCount; ++i) {
        const connectedSwitchCount = dataSource.fetchScalar();
        const connectedSwitchIndices = dataSource.fetchCollection(connectedSwitchCount).map(idx => idx - 1);
        bulbConfigurations[i] = {
            connections: connectedSwitchIndices,
            expectedParity: 0
        };
    }

    const requiredParities = dataSource.fetchCollection(bulbCount);

    for (let i = 0; i < bulbCount; ++i) {
        bulbConfigurations[i].expectedParity = requiredParities[i];
    }

    let successfulArrangements = 0;

    const exploreStates = (currentSwitchPosition, currentSwitchStatesRegistry) => {
        if (currentSwitchPosition === switchCount) {
            let allConditionsMet = true;
            for (const bulb of bulbConfigurations) {
                let activeConnectionSum = 0;
                for (const connectedIdx of bulb.connections) {
                    activeConnectionSum += currentSwitchStatesRegistry[connectedIdx];
                }
                if (activeConnectionSum % 2 !== bulb.expectedParity) {
                    allConditionsMet = false;
                    break;
                }
            }
            if (allConditionsMet) {
                successfulArrangements++;
            }
            return;
        }

        currentSwitchStatesRegistry[currentSwitchPosition] = 0;
        exploreStates(currentSwitchPosition + 1, currentSwitchStatesRegistry);

        currentSwitchStatesRegistry[currentSwitchPosition] = 1;
        exploreStates(currentSwitchPosition + 1, currentSwitchStatesRegistry);
    };

    const initialStates = createDynamicArray(switchCount, 0);
    exploreStates(0, initialStates);

    return successfulArrangements;
};

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const interpreter = new DataStreamReader(rawInput);
const finalResult = processSystem(interpreter);
console.log(finalResult.toString());