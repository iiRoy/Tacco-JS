const ElementInfo = function (identityValue) {
  this.identity = identityValue;
  this.superior = this;
  this.depth = 1;
  this.relativeShift = 0;
};

const DifferentialUnionFind = function () {
  this.elementMap = new Map();
};

DifferentialUnionFind.prototype.registerElement = function (identifier) {
  if (this.elementMap.has(identifier)) {
    return;
  }
  this.elementMap.set(identifier, new ElementInfo(identifier));
};

DifferentialUnionFind.prototype.uniteSets = function (firstId, secondId, linkMagnitude) {
  if (!this.elementMap.has(firstId) || !this.elementMap.has(secondId)) {
    throw new Error("One or both elements not registered for union operation.");
  }

  const rootA = this.resolveRepresentative(firstId);
  const rootB = this.resolveRepresentative(secondId);

  const shiftA = this.elementMap.get(firstId).relativeShift;
  const shiftB = this.elementMap.get(secondId).relativeShift;

  if (rootA === rootB) {
    if (shiftB - shiftA !== linkMagnitude) {
      throw new Error("Inconsistent relative shift detected during union.");
    }
    return;
  }

  // Apply union by depth heuristic
  if (rootA.depth <= rootB.depth) {
    if (rootA.depth === rootB.depth) {
      rootB.depth++;
    }
    rootA.superior = rootB;
    // Calculate the weight from rootA to rootB
    rootA.relativeShift = -linkMagnitude + shiftA - shiftB;
  } else {
    rootB.superior = rootA;
    // Calculate the weight from rootB to rootA
    rootB.relativeShift = linkMagnitude - shiftA + shiftB;
  }
};

DifferentialUnionFind.prototype.resolveRepresentative = function (elementId) {
  if (!this.elementMap.has(elementId)) {
    throw new Error(`Element with ID ${elementId} not found in structure.`);
  }

  let currentElement = this.elementMap.get(elementId);

  if (currentElement.superior !== currentElement) {
    const finalRoot = this.resolveRepresentative(currentElement.superior.identity);
    currentElement.relativeShift += currentElement.superior.relativeShift;
    currentElement.superior = finalRoot;
  }
  return currentElement.superior;
};

DifferentialUnionFind.prototype.calculateDisplacement = function (itemAId, itemBId) {
  if (!this.elementMap.has(itemAId) || !this.elementMap.has(itemBId)) {
    return null;
  }

  const rootA = this.resolveRepresentative(itemAId);
  const rootB = this.resolveRepresentative(itemBId);

  if (rootA !== rootB) {
    return null;
  }

  // After path compression and weight updates, relativeShift holds W(element, root).
  const shiftB = this.elementMap.get(itemBId).relativeShift;
  const shiftA = this.elementMap.get(itemAId).relativeShift;
  return shiftB - shiftA;
};

const parseNumericInput = (valueString) => {
  const numericValue = parseInt(valueString, 10);
  if (isNaN(numericValue)) {
    throw new Error(`Invalid numeric input encountered: "${valueString}"`);
  }
  return numericValue;
};

let rawInputData;
try {
  rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
} catch (fileReadError) {
  console.error("Failed to read input from /dev/stdin:", fileReadError.message);
  return;
}

const inputLines = rawInputData.trim().split("\n");
let totalElementsCount, operationCount;
let differentialStructure;

let isInitialConfigurationProcessed = false;

try {
  for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentLine = inputLines[lineIndex].trim();
    if (!currentLine) continue;

    if (!isInitialConfigurationProcessed) {
      const configurationParams = currentLine.split(" ");
      if (configurationParams.length < 2) {
        throw new Error("The first line must specify total elements (N) and number of operations (M).");
      }
      totalElementsCount = parseNumericInput(configurationParams[0]);
      operationCount = parseNumericInput(configurationParams[1]);

      differentialStructure = new DifferentialUnionFind();
      for (let elementIndex = 0; elementIndex < totalElementsCount; elementIndex++) {
        differentialStructure.registerElement(elementIndex);
      }
      isInitialConfigurationProcessed = true;
    } else {
      const [firstIdStr, secondIdStr, linkMagnitudeStr] = currentLine.split(" ");
      const firstIdAdjusted = parseNumericInput(firstIdStr) - 1;
      const secondIdAdjusted = parseNumericInput(secondIdStr) - 1;
      const connectionMagnitude = parseNumericInput(linkMagnitudeStr);

      differentialStructure.uniteSets(firstIdAdjusted, secondIdAdjusted, connectionMagnitude);
    }
  }
  console.log("Yes");
} catch (processingError) {
  console.log("No");
  // For debugging, uncomment the following line:
  // console.error("Processing failed:", processingError.message);
}