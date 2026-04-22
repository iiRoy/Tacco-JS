const analyzeInput = (sourceMaterial) => {
    const entireDocument = sourceMaterial.split('\n');

    const initialParameters = entireDocument[0].split(' ');
    const paramA = Number(initialParameters[1]);
    const paramB = Number(initialParameters[2]);

    const workingSet = entireDocument.slice(1);

    const qualifiedEntries = workingSet.filter(candidateEntry => {
        const entryParts = candidateEntry.split(' ');
        const firstPoint = Number(entryParts[0]);
        const secondPoint = Number(entryParts[1]);

        return firstPoint >= paramA && secondPoint >= paramB;
    });

    const resultCount = qualifiedEntries.length;
    console.log(resultCount);
};

const processExternalData = (processorFunction) => {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    processorFunction(rawData);
};

processExternalData(analyzeInput);