const calculateAccumulatedValue = (inputString) => {
    const inputParts = inputString.split(" ").map(Number);
    const maximumTerms = inputParts[0];
    const seedValue = inputParts[1];
    const modulusBase = inputParts[2];

    const numericSequence = new Array(modulusBase);
    const valueToAppearanceIndex = new Uint32Array(modulusBase);

    numericSequence[0] = seedValue;
    valueToAppearanceIndex[0] = seedValue;

    let currentGenerationIndex = 0;
    let cycleStartPoint = -1;
    let cycleEndPoint = -1;

    const deriveNextElement = (previousElement) => (previousElement * previousElement) % modulusBase;

    let idx = 1;
    while (idx < modulusBase) {
        const priorElement = numericSequence[idx - 1];
        const currentElement = deriveNextElement(priorElement);
        numericSequence[idx] = currentElement;

        if (valueToAppearanceIndex[currentElement] !== 0) {
            cycleStartPoint = valueToAppearanceIndex[currentElement];
            cycleEndPoint = idx;
            break;
        } else {
            valueToAppearanceIndex[currentElement] = idx;
        }
        currentGenerationIndex = idx;
        idx++;
    }

    if (cycleStartPoint === -1) {
        cycleStartPoint = 0;
        cycleEndPoint = modulusBase;
    }

    let totalAccumulation = 0;

    const preCycleSegmentLength = cycleStartPoint;
    const cycleDuration = cycleEndPoint - cycleStartPoint;

    const sumOfPreCycle = numericSequence.slice(0, preCycleSegmentLength)
                                      .reduce((accumulator, value) => accumulator + value, 0);

    const sumOfOneCycle = numericSequence.slice(cycleStartPoint, cycleEndPoint)
                                     .reduce((accumulator, value) => accumulator + value, 0);

    const numberOfFullCycles = Math.floor(maximumTerms / cycleDuration);

    const remainingContributionCount = maximumTerms - preCycleSegmentLength - cycleDuration * numberOfFullCycles;

    totalAccumulation += sumOfOneCycle * numberOfFullCycles;
    totalAccumulation += sumOfPreCycle;

    const actualRemainingToAdd = Math.max(0, remainingContributionCount);
    const sumOfRemaining = numericSequence.slice(cycleStartPoint, cycleStartPoint + actualRemainingToAdd)
                                        .reduce((accumulator, value) => accumulator + value, 0);
    totalAccumulation += sumOfRemaining;

    console.log(totalAccumulation);
};

calculateAccumulatedValue(require("fs").readFileSync("/dev/stdin", "utf8"));