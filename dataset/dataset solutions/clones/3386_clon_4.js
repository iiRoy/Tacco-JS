const processData = (sourceContent) => {
    const numericCollection = sourceContent.split('\n').slice(1).map(Number);

    const fullSummation = numericCollection.reduce((currentTotal, element) => currentTotal + element, 0);
    const elementCount = numericCollection.length;
    const nonUnitTotal = numericCollection.reduce((currentTotal, element) => currentTotal + (element !== 1 ? element : 0), 0);

    const conditionOne = (fullSummation === elementCount);
    const conditionTwo = (nonUnitTotal % 2 === 1);
    const conditionThree = (fullSummation % 2 === 1);

    const resultantLabel = (conditionOne || conditionTwo) ? "first" : (conditionThree ? "first" : "second");

    process.stdout.write(resultantLabel + '\n');
};

const acquireSource = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

processData(acquireSource());