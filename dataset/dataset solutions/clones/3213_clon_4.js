const processExternalData = (rawDataSegment) => {
    const numericalTokens = rawDataSegment.trim().match(/\d+/g).map(Number);
    const vectorSpan = numericalTokens.shift();
    const elementCount = numericalTokens.shift();
    const initialBinaryStructures = [];
    for (let currentStructureIndex = 0; currentStructureIndex < vectorSpan; currentStructureIndex++) {
        initialBinaryStructures.push(numericalTokens.splice(0, elementCount));
    }
    return {
        structureCount: vectorSpan,
        componentCount: elementCount,
        structures: initialBinaryStructures
    };
};

const crossReferencedBinaryArrays = (firstArray, secondArray) => firstArray.map((valueA, position) => valueA ^ secondArray[position]);

const determineLinearIndependenceDimension = (activeStructureCollection, currentComponentPosition) => {
    if (activeStructureCollection.length === 0 || currentComponentPosition >= activeStructureCollection[0].length) {
        return 0;
    }

    const leadElementIndex = activeStructureCollection.findIndex(structure => structure[currentComponentPosition] === 1);

    if (leadElementIndex === -1) {
        return determineLinearIndependenceDimension(activeStructureCollection, currentComponentPosition + 1);
    } else {
        const leadStructure = activeStructureCollection[leadElementIndex];
        const subsequentStructures = [];

        for (let s = 0; s < activeStructureCollection.length; s++) {
            if (s === leadElementIndex) {
                continue;
            }
            let modifiedStructure = activeStructureCollection[s];
            if (modifiedStructure[currentComponentPosition] === 1) {
                modifiedStructure = crossReferencedBinaryArrays(modifiedStructure, leadStructure);
            }
            subsequentStructures.push(modifiedStructure);
        }
        return 1 + determineLinearIndependenceDimension(subsequentStructures, currentComponentPosition + 1);
    }
};

const executeComputation = (payloadContent) => {
    const processedDataSet = processExternalData(payloadContent);
    const totalStructures = processedDataSet.structureCount;
    const totalComponents = processedDataSet.componentCount;
    const originalMatrix = processedDataSet.structures;

    const calculatedRank = determineLinearIndependenceDimension(originalMatrix, 0);

    const combinedSizes = totalStructures + totalComponents;
    const firstPowerExponent = combinedSizes - 1;
    const secondPowerExponent = combinedSizes - calculatedRank - 1;

    const finalResultValue = (2 ** firstPowerExponent) - (2 ** secondPowerExponent);
    console.log(finalResultValue);
};

executeComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));