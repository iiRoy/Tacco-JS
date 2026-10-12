const SetMember = function (keyData) {
  this.keyData = keyData;
  this.ancestor = this;
  this.level = 1;
  this.offset = 0; // Relative offset to its direct ancestor
};

const RelationalGroupSystem = function () {
  this.memberRegistry = [];
};

RelationalGroupSystem.prototype.incorporate = function (keyData) {
  this.memberRegistry[keyData] = new SetMember(keyData);
};

RelationalGroupSystem.prototype.joinFragments = function (firstToken, secondToken, connectionModifier) {
  const rootX = this.traceOrigin(firstToken);
  const rootY = this.traceOrigin(secondToken);
  const deltaX = this.determineRelativeValue(firstToken);
  const deltaY = this.determineRelativeValue(secondToken);

  if (rootX === rootY) {
    if (deltaY - deltaX !== connectionModifier) {
      throw new Error("inconsistent relational modifier");
    }
    return;
  }

  if (rootX.level <= rootY.level) {
    if (rootX.level === rootY.level) {
      rootY.level++;
    }
    rootX.ancestor = rootY;
    rootX.offset = -connectionModifier + deltaX - deltaY;
  } else {
    rootY.ancestor = rootX;
    rootY.offset = connectionModifier - deltaX + deltaY;
  }
};

RelationalGroupSystem.prototype.traceOrigin = function (keyData) {
  let activeItem = this.memberRegistry[keyData];
  if (activeItem.ancestor !== activeItem) {
    const ultimateParent = this.traceOrigin(activeItem.ancestor.keyData);
    activeItem.offset += activeItem.ancestor.offset;
    activeItem.ancestor = ultimateParent;
  }
  return activeItem.ancestor;
};

RelationalGroupSystem.prototype.measureDisparity = function (firstToken, secondToken) {
  const rootX = this.traceOrigin(firstToken);
  const rootY = this.traceOrigin(secondToken);
  if (rootX !== rootY) {
    return null;
  }
  return this.determineRelativeValue(secondToken) - this.determineRelativeValue(firstToken);
};

RelationalGroupSystem.prototype.determineRelativeValue = function (keyData) {
  let accumulatedOffset = 0;
  let activeItem = this.memberRegistry[keyData];
  while (activeItem.ancestor !== activeItem) {
    accumulatedOffset += activeItem.offset;
    activeItem = activeItem.ancestor;
  }
  return accumulatedOffset;
};

let streamInput = require("fs").readFileSync("/dev/stdin", "utf8");
const contentRows = streamInput.trim().split("\n");
let totalElements, operationCount, partitionSystem;

try {
  for (let idx = 0; idx < contentRows.length; idx++) {
    if (idx === 0) {
      [totalElements, operationCount] = contentRows[idx].split(" ");
      partitionSystem = new RelationalGroupSystem();
      for (let memberIdx = 0; memberIdx < totalElements; memberIdx++) {
        partitionSystem.incorporate(memberIdx);
      }
    } else {
      const [firstCoord, secondCoord, valueParam] = contentRows[idx].split(" ").map((v) => parseInt(v));
      partitionSystem.joinFragments(firstCoord - 1, secondCoord - 1, valueParam);
    }
  }
} catch (anError) {
  console.log("No");
  return;
}
console.log("Yes");