class ComponentLinker {
  constructor() {
    this.elementRecords = new Map();
  }

  enroll(identifier) {
    if (!this.elementRecords.has(identifier)) {
      this.elementRecords.set(identifier, {
        superior: identifier,
        depth: 1,
        delta: 0,
      });
    }
  }

  locate(identifier) {
    let record = this.elementRecords.get(identifier);
    if (!record) {
      throw new Error("Identifier not enrolled: " + identifier);
    }

    if (record.superior === identifier) {
      return { ultimateGuide: identifier, totalDifference: 0 };
    }

    const superiorResult = this.locate(record.superior);

    record.superior = superiorResult.ultimateGuide;
    record.delta += superiorResult.totalDifference;

    this.elementRecords.set(identifier, record);

    return { ultimateGuide: record.superior, totalDifference: record.delta };
  }

  unite(idA, idB, relativeDisparity) {
    const infoA = this.locate(idA);
    const infoB = this.locate(idB);

    const rootA = infoA.ultimateGuide;
    const offsetA = infoA.totalDifference;
    const rootB = infoB.ultimateGuide;
    const offsetB = infoB.totalDifference;

    if (rootA === rootB) {
      if (offsetB - offsetA !== relativeDisparity) {
        throw new Error("inconsistent disparity detected");
      }
      return;
    }

    let recordA = this.elementRecords.get(rootA);
    let recordB = this.elementRecords.get(rootB);

    if (recordA.depth <= recordB.depth) {
      recordA.superior = rootB;
      recordA.delta = -relativeDisparity + offsetB - offsetA;
      if (recordA.depth === recordB.depth) {
        recordB.depth++;
      }
      this.elementRecords.set(rootA, recordA);
      this.elementRecords.set(rootB, recordB);
    } else {
      recordB.superior = rootA;
      recordB.delta = relativeDisparity - offsetB + offsetA;
      this.elementRecords.set(rootA, recordA);
      this.elementRecords.set(rootB, recordB);
    }
  }

  queryDisparity(idA, idB) {
    const infoA = this.locate(idA);
    const infoB = this.locate(idB);

    if (infoA.ultimateGuide !== infoB.ultimateGuide) {
      return null;
    }

    return infoB.totalDifference - infoA.totalDifference;
  }

  retrieveMagnitude(identifier) {
    const info = this.locate(identifier);
    return info.totalDifference;
  }
}

let dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = dataStream.trim().split("\n");
let countNodes, countOps;
let linkerInstance;

try {
  let lineIndex = 0;
  [countNodes, countOps] = dataLines[lineIndex++].split(" ").map(Number);
  linkerInstance = new ComponentLinker();
  for (let nodeIdx = 0; nodeIdx < countNodes; nodeIdx++) {
    linkerInstance.enroll(nodeIdx);
  }

  while (lineIndex < dataLines.length) {
    const [coordX, coordY, valueZ] = dataLines[lineIndex++].split(" ").map(Number);
    linkerInstance.unite(coordX - 1, coordY - 1, valueZ);
  }
} catch (err) {
  console.log("No");
  process.exit(0);
}
console.log("Yes");