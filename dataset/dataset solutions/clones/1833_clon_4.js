class DataInterpreter {
  #inputTokens;
  #readPosition;

  constructor(sourceString) {
    this.#inputTokens = sourceString.split(/ |\n/).filter(Boolean);
    this.#readPosition = 0;
  }

  fetchInteger() {
    if (this.#readPosition >= this.#inputTokens.length) {
      throw new Error("End of input stream reached.");
    }
    return Number(this.#inputTokens[this.#readPosition++]);
  }

  fetchIntegerSequence(amount) {
    if (this.#readPosition + amount > this.#inputTokens.length) {
      throw new Error("Not enough tokens for sequence.");
    }
    const sequenceValues = this.#inputTokens.slice(this.#readPosition, this.#readPosition + amount).map(Number);
    this.#readPosition += amount;
    return sequenceValues;
  }
}

function analyzeTreeStructure() {
  const rawInputContent = require("node:fs").readFileSync(0, "utf8");
  const dataProcessor = new DataInterpreter(rawInputContent);

  const treeHeight = dataProcessor.fetchInteger();
  const nodeDemandPerLevel = dataProcessor.fetchIntegerSequence(treeHeight + 1);

  if (treeHeight === 0) {
    return nodeDemandPerLevel[0] === 1 ? "1" : "-1";
  }

  if (nodeDemandPerLevel[0] > 0) {
    return "-1";
  }

  const MAX_NODE_COUNT_LIMIT = 100000000 * treeHeight;

  const memoAvailableNodes = new Map();
  const computeAvailableNodesFromRoot = (currentLevel) => {
    if (memoAvailableNodes.has(currentLevel)) {
      return memoAvailableNodes.get(currentLevel);
    }

    if (currentLevel === 0) {
      memoAvailableNodes.set(0, 1);
      return 1;
    }

    const prevLevelAvailable = computeAvailableNodesFromRoot(currentLevel - 1);
    if (prevLevelAvailable === -1) {
      memoAvailableNodes.set(currentLevel, -1);
      return -1;
    }

    let potentialNodes = Math.min(prevLevelAvailable * 2, MAX_NODE_COUNT_LIMIT);
    potentialNodes -= nodeDemandPerLevel[currentLevel];

    if (potentialNodes < 0) {
      memoAvailableNodes.set(currentLevel, -1);
      return -1;
    }
    memoAvailableNodes.set(currentLevel, potentialNodes);
    return potentialNodes;
  };

  const memoRequiredForSubtree = new Map();
  const calculateRequiredForChildren = (currentLevel) => {
    if (memoRequiredForSubtree.has(currentLevel)) {
      return memoRequiredForSubtree.get(currentLevel);
    }

    if (currentLevel === treeHeight) {
      memoRequiredForSubtree.set(treeHeight, 0);
      return 0;
    }

    const nextLevelTotalRequired = calculateRequiredForChildren(currentLevel + 1);
    const requiredForCurrentLevel = nextLevelTotalRequired + nodeDemandPerLevel[currentLevel + 1];
    memoRequiredForSubtree.set(currentLevel, requiredForCurrentLevel);
    return requiredForCurrentLevel;
  };

  let cumulativeNodeTotal = 0n;

  for (let levelIdx = 0; levelIdx <= treeHeight; levelIdx++) {
    const currentLevelAvailable = computeAvailableNodesFromRoot(levelIdx);
    if (currentLevelAvailable === -1) {
      return "-1";
    }
    const currentLevelRequiredBelow = calculateRequiredForChildren(levelIdx);

    const levelContribution = BigInt(Math.min(currentLevelAvailable, currentLevelRequiredBelow) + nodeDemandPerLevel[levelIdx]);
    cumulativeNodeTotal += levelContribution;
  }

  return cumulativeNodeTotal.toString();
}

const computedResult = analyzeTreeStructure();
if (computedResult !== undefined) {
  console.log(computedResult);
}