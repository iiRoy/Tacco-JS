const retrieveSource = (loc) => {
    const fileSystemModule = require("node:fs");
    return fileSystemModule.readFileSync(loc, "utf8");
};

const determineSuperiority = (elementA, elementB) => {
    const sizeA = elementA.length;
    const sizeB = elementB.length;
    const smallestSize = Math.min(sizeA, sizeB);

    for (let currentIdx = 0; currentIdx < smallestSize; currentIdx++) {
        const charValA = elementA.charCodeAt(currentIdx);
        const charValB = elementB.charCodeAt(currentIdx);
        if (charValB > charValA) {
            return true;
        }
        if (charValB < charValA) {
            return false;
        }
    }

    return sizeB > sizeA;
};

const processData = (rawData) => {
    const dividerPosition = rawData.indexOf(" ");
    const primaryComponent = rawData.slice(0, dividerPosition);
    const secondaryComponent = rawData.slice(dividerPosition + 1);

    const outcomeLabels = ["unsafe", "safe"];

    const isSecondComponentGreater = determineSuperiority(primaryComponent, secondaryComponent);

    console.log(outcomeLabels[isSecondComponentGreater ? 1 : 0]);
};

processData(retrieveSource("/dev/stdin"));