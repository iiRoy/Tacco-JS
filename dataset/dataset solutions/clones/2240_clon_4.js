const processInput = (dataInput) => {
    const dataLines = dataInput.trim().split('\n');
    const initialCounter = parseInt(dataLines[0], 10);
    const entityCollection = dataLines.slice(1).map(datum => {
        const numericParts = datum.split(' ').map(Number);
        return { coordinate: numericParts[0], extent: numericParts[1] };
    });

    const primaryEntity = entityCollection.reduce((currentMin, element) => {
        return (element.coordinate < currentMin.coordinate) ? element : currentMin;
    }, { coordinate: Infinity, extent: 0 });

    const derivedLowerLimit = primaryEntity.coordinate - primaryEntity.extent;

    const adjustmentFactor = (derivedLowerLimit <= 0) ? -1 : 0;

    return initialCounter + adjustmentFactor;
};

const executeProgram = (inputMechanism) => {
    const computedResult = processInput(inputMechanism);
    process.stdout.write(String(computedResult));
};

executeProgram(require("node:fs").readFileSync("/dev/stdin", "utf8"));