const systemDataSource = require("node:fs").readFileSync("/dev/stdin", "utf8");

const tokenDelimiter = ' ';

const processInputAndDetermineOutcome = (sourceContent) => {
    const dividerPosition = sourceContent.indexOf(tokenDelimiter);

    let firstComponent;
    let secondComponent;

    if (dividerPosition === -1) {
        firstComponent = sourceContent;
        secondComponent = undefined;
    } else {
        firstComponent = sourceContent.slice(0, dividerPosition);
        secondComponent = sourceContent.slice(dividerPosition + 1);
    }

    const identicalMatch = (firstComponent === secondComponent);

    const resultMapping = new Map();
    resultMapping.set(true, "H");
    resultMapping.set(false, "D");

    return resultMapping.get(identicalMatch);
};

console.info(processInputAndDetermineOutcome(systemDataSource));