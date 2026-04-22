const dataAcquirer = (sourceContent) => {
    let contentLines = sourceContent.trim().split('\n');
    let currentLineLocator = 0;
    let cachedLineValues = [];
    let cachedValuePointer = -1;

    const ensureLineLoadedForExtraction = () => {
        if (cachedValuePointer === -1 || cachedValuePointer >= cachedLineValues.length) {
            if (currentLineLocator >= contentLines.length) {
                return false;
            }
            cachedLineValues = contentLines[currentLineLocator].split(' ').reverse();
            cachedValuePointer = 0;
        }
        return true;
    };

    const extractNextValue = (asString) => {
        if (!ensureLineLoadedForExtraction()) {
            return undefined;
        }
        const extracted = cachedLineValues[cachedValuePointer++];
        if (cachedValuePointer >= cachedLineValues.length) {
            currentLineLocator++;
            cachedValuePointer = -1;
            cachedLineValues = [];
        }
        return asString ? extracted : Number(extracted);
    };

    const fetchCurrentLine = (asStrings) => {
        if (currentLineLocator >= contentLines.length) {
            return undefined;
        }
        cachedLineValues = [];
        cachedValuePointer = -1;

        const lineData = contentLines[currentLineLocator++].split(' ');
        return asStrings ? lineData : lineData.map(Number);
    };

    const fetchMultipleLinesAsMatrix = (count, asStrings) => {
        const collected = [];
        cachedLineValues = [];
        cachedValuePointer = -1;

        for (let i = 0; i < count; i++) {
            if (currentLineLocator >= contentLines.length) {
                break;
            }
            collected.push(fetchCurrentLine(asStrings));
        }
        return collected;
    };

    const fetchMultipleLinesAsColumn = (count, asString) => {
        const collected = [];
        cachedLineValues = [];
        cachedValuePointer = -1;

        for (let i = 0; i < count; i++) {
            if (currentLineLocator >= contentLines.length) {
                break;
            }
            const lineItem = contentLines[currentLineLocator++].trim();
            collected.push(asString ? lineItem : Number(lineItem));
        }
        return collected;
    };

    return {
        pullSingle: extractNextValue,
        getLineTokens: fetchCurrentLine,
        getMatrix: fetchMultipleLinesAsMatrix,
        getColumn: fetchMultipleLinesAsColumn,
    };
};

const acquiredData = dataAcquirer(require("fs").readFileSync("/dev/stdin","utf8"));
const largePrimeConstant = 1000000007;

console.log(calculateResult());

function calculateResult(){
  const elementCount = acquiredData.pullSingle();
  const elementClassifications = acquiredData.getColumn(elementCount);

  const nextOccurrenceMap = new Array(elementCount);
  const lastKnownPositionOfClass = new Map();

  for (let currentElementIdx = elementCount - 1; currentElementIdx >= 0; currentElementIdx--) {
    const currentClassification = elementClassifications[currentElementIdx];
    if (lastKnownPositionOfClass.has(currentClassification)) {
      nextOccurrenceMap[currentElementIdx] = lastKnownPositionOfClass.get(currentClassification);
    }
    lastKnownPositionOfClass.set(currentClassification, currentElementIdx);
  }

  const sequencePathCounts = new Map();
  sequencePathCounts.set(0, 1);

  const initialJumpTarget = nextOccurrenceMap[0];
  if (initialJumpTarget !== undefined && initialJumpTarget > 1) {
    sequencePathCounts.set(initialJumpTarget, 1);
  }

  Array.from({ length: elementCount - 1 }, (_, offset) => offset + 1)
    .forEach((currentPathPoint) => {
      const priorPointCount = sequencePathCounts.get(currentPathPoint - 1) || 0;
      const currentPointExistingCount = sequencePathCounts.get(currentPathPoint) || 0;

      let combinedCount = (currentPointExistingCount + priorPointCount) % largePrimeConstant;
      sequencePathCounts.set(currentPathPoint, combinedCount);

      const subsequentClassPosition = nextOccurrenceMap[currentPathPoint];
      if (subsequentClassPosition !== undefined && subsequentClassPosition > currentPathPoint + 1) {
        sequencePathCounts.set(subsequentClassPosition, combinedCount);
      }
    });

  return sequencePathCounts.get(elementCount - 1) || 0;
}