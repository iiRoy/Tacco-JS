function buildNumericalGrid(height, width = height) {
  return Array.from({ length: height }, () => Array.from({ length: width }).fill(0));
}

class TextStreamHandler {
  constructor(rawInputString) {
    this.allLines = rawInputString.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    this.currentLineIndex = 0;
    this.parsedTokensForCurrentLine = [];
  }

  #ensureCurrentLineTokens() {
    if (this.parsedTokensForCurrentLine.length === 0 && this.currentLineIndex < this.allLines.length) {
      this.parsedTokensForCurrentLine = this.allLines[this.currentLineIndex].split(" ");
    }
  }

  fetchNextToken(asString = false) {
    this.#ensureCurrentLineTokens();
    if (this.parsedTokensForCurrentLine.length === 0) {
      throw new Error("No more tokens on current line or no more lines.");
    }
    const token = this.parsedTokensForCurrentLine.shift();
    if (this.parsedTokensForCurrentLine.length === 0) {
      this.currentLineIndex++;
    }
    return asString ? token : Number(token);
  }

  retrieveEntireLine(asStrings = false) {
    if (this.currentLineIndex >= this.allLines.length) {
      throw new Error("No more lines to retrieve.");
    }
    this.#ensureCurrentLineTokens();
    const tokens = this.parsedTokensForCurrentLine;
    this.parsedTokensForCurrentLine = [];
    this.currentLineIndex++;

    return asStrings ? tokens : tokens.map(Number);
  }

  captureBlockOfLines(numLines, asStrings = false) {
    const block = [];
    for (let i = 0; i < numLines; i++) {
      block.push(this.retrieveEntireLine(asStrings));
    }
    return block;
  }

  constructFrequencyGrid(numEntries, dimensions) {
    const frequencyGrid = buildNumericalGrid(dimensions + 1, dimensions + 1);
    for (let i = 0; i < numEntries; i++) {
      const pair = this.retrieveEntireLine();
      if (pair.length >= 2) {
        frequencyGrid[pair[0]][pair[1]]++;
      }
    }
    return frequencyGrid;
  }
}

class ConnectivityTracker {
  #parentLinks;
  #ranks;

  constructor(elementCount) {
    this.#parentLinks = new Map();
    this.#ranks = new Map();
    for (let i = 1; i <= elementCount; i++) {
      this.#parentLinks.set(i, i);
      this.#ranks.set(i, 0);
    }
  }

  identifySetHead(elementId) {
    if (!this.#parentLinks.has(elementId)) {
      throw new Error(`Element ${elementId} not initialized in the set.`);
    }
    let current = elementId;
    let path = [];
    while (this.#parentLinks.get(current) !== current) {
      path.push(current);
      current = this.#parentLinks.get(current);
    }
    for (const node of path) {
      this.#parentLinks.set(node, current);
    }
    return current;
  }

  integrateSets(elementA, elementB) {
    let headA = this.identifySetHead(elementA);
    let headB = this.identifySetHead(elementB);

    if (headA === headB) {
      return;
    }

    let rankA = this.#ranks.get(headA);
    let rankB = this.#ranks.get(headB);

    if (rankA < rankB) {
      this.#parentLinks.set(headA, headB);
    } else if (rankB < rankA) {
      this.#parentLinks.set(headB, headA);
    } else {
      this.#parentLinks.set(headB, headA);
      this.#ranks.set(headA, rankA + 1);
    }
  }

  areElementsConnected(elementA, elementB) {
    return this.identifySetHead(elementA) === this.identifySetHead(elementB);
  }
}

class SolverModule {
  constructor(inputString) {
    this.dataStream = new TextStreamHandler(inputString);
  }

  executeSolution() {
    const nodeCount = this.dataStream.fetchNextToken();
    const firstConnectionCount = this.dataStream.fetchNextToken();
    const secondConnectionCount = this.dataStream.fetchNextToken();

    const primaryNetwork = new ConnectivityTracker(nodeCount);
    const secondaryNetwork = new ConnectivityTracker(nodeCount);

    Array.from({ length: firstConnectionCount }).forEach(() => {
      const connectionPair = this.dataStream.retrieveEntireLine();
      primaryNetwork.integrateSets(connectionPair[0], connectionPair[1]);
    });

    Array.from({ length: secondConnectionCount }).forEach(() => {
      const connectionPair = this.dataStream.retrieveEntireLine();
      secondaryNetwork.integrateSets(connectionPair[0], connectionPair[1]);
    });

    const combinedRootIdentifiers = [];
    const frequencyTally = new Map();

    for (let i = 1; i <= nodeCount; i++) {
      const root1 = primaryNetwork.identifySetHead(i);
      const root2 = secondaryNetwork.identifySetHead(i);
      const compositeKey = `${root1},${root2}`;
      combinedRootIdentifiers.push(compositeKey);

      frequencyTally.set(compositeKey, (frequencyTally.get(compositeKey) || 0) + 1);
    }

    const finalCounts = combinedRootIdentifiers.map(key => frequencyTally.get(key));

    return finalCounts.join(" ");
  }
}

const programInput = require("fs").readFileSync("/dev/stdin", "utf8");
const solutionInstance = new SolverModule(programInput);
console.log(solutionInstance.executeSolution());