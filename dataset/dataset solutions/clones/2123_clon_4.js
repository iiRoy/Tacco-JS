var input = require("fs").readFileSync("/dev/stdin", "utf8");

class InputProcessor {
    constructor(rawInput) {
        this.dataLines = rawInput.trim().split("\n");
        this.currentLineIndex = 0;
        this.totalLines = this.dataLines.length;
    }

    retrieveNext() {
        if (!this.hasMore()) {
            throw "NoSuchElementException:次に要素は無いよ";
        }
        const line = this.dataLines[this.currentLineIndex];
        this.currentLineIndex++;
        return line;
    }

    hasMore() {
        return this.currentLineIndex < this.totalLines;
    }
}

const inputSource = new InputProcessor(input);

function retrieveNextLine() { return inputSource.retrieveNext(); }
function checkMoreLines() { return inputSource.hasMore(); }

function myout(t){console.log(t);}
function myerr(t){console.error(t);}

const conversionDispatch = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
};

function myconv(value, type) {
    try {
        const converter = conversionDispatch[type];
        return converter ? converter(value) : value;
    } catch (e) {
        return value;
    }
}

let parentRegistry;
let componentMemberCounts;

function initializeDisjointSet(nodeCount) {
    parentRegistry = Array.from({ length: nodeCount }, (_, idx) => idx);
    componentMemberCounts = Array(nodeCount).fill(1);
}

function findSetRepresentative(nodeIdentifier) {
    if (parentRegistry[nodeIdentifier] === nodeIdentifier) {
        return nodeIdentifier;
    }
    return parentRegistry[nodeIdentifier] = findSetRepresentative(parentRegistry[nodeIdentifier]);
}

function uniteComponents(nodeA, nodeB) {
    let rootA = findSetRepresentative(nodeA);
    let rootB = findSetRepresentative(nodeB);

    if (rootA !== rootB) {
        if (componentMemberCounts[rootA] < componentMemberCounts[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }
        parentRegistry[rootB] = rootA;
        componentMemberCounts[rootA] += componentMemberCounts[rootB];
        return true;
    }
    return false;
}

function Main(){
  var problemParams = myconv(retrieveNextLine(), 4);
  var nodeCount = problemParams[0];
  var edgeCount = problemParams[1];
  var exclusionCount = problemParams[2];

  initializeDisjointSet(nodeCount);

  var adjacencyList = Array.from({ length: nodeCount }, () => []);
  var nodeDegrees = Array(nodeCount).fill(0);

  for(let e = 0; e < edgeCount; e++){
    var connection = myconv(retrieveNextLine(), 4);
    var u = connection[0] - 1;
    var v = connection[1] - 1;

    adjacencyList[u].push(v);
    adjacencyList[v].push(u);
    nodeDegrees[u]++;
    nodeDegrees[v]++;

    uniteComponents(u, v);
  }

  var finalResult = Array(nodeCount);
  for(let n = 0; n < nodeCount; n++){
    let root = findSetRepresentative(n);
    let componentSize = componentMemberCounts[root];
    finalResult[n] = componentSize - 1 - nodeDegrees[n];
  }

  for(let k = 0; k < exclusionCount; k++){
    var exclusionPair = myconv(retrieveNextLine(), 4);
    var x = exclusionPair[0] - 1;
    var y = exclusionPair[1] - 1;

    if(findSetRepresentative(x) === findSetRepresentative(y)){
       finalResult[x]--;
       finalResult[y]--;
    }
  }
  myout(myconv(finalResult, 8));
}

Main();
