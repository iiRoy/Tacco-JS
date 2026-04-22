const calculateOptimal = (inputLine) => {
    const [primaryElement, secondaryElement] = inputLine.trim().split(/\s+/).map(v => parseInt(v, 10));

    const initialAllocation = Math.min(primaryElement, secondaryElement >>> 1);

    const residualSecondary = secondaryElement - (initialAllocation << 1);

    const additionalAllocation = residualSecondary >>> 2;

    return initialAllocation + additionalAllocation;
};

const initiateProcess = (dataSource) => {
    console.log(calculateOptimal(dataSource));
};

initiateProcess(require("fs").readFileSync("/dev/stdin", "utf8"));