class TreeNode {
    constructor(level, isTerminal = false) {
        this.left = null;
        this.right = null;
        this.depth = level;
        this.isTerminalNode = isTerminal;
    }
}

let treeNodes = [];

function extendBranchToDepth(currentAncestor, targetLevel) {
    const startLevelForNewNodes = currentAncestor.depth + 1;
    const newlyCreatedNodes = [];
    let branchPathBuilder = currentAncestor;

    for (let currentLevel = startLevelForNewNodes; currentLevel <= targetLevel; currentLevel++) {
        const isThisNodeTerminal = (currentLevel === targetLevel);
        const newNode = new TreeNode(currentLevel, isThisNodeTerminal);

        if (branchPathBuilder.left) {
            branchPathBuilder.right = newNode;
        } else {
            branchPathBuilder.left = newNode;
        }
        newlyCreatedNodes.push(newNode);
        branchPathBuilder = newNode;
    }

    treeNodes.push(...newlyCreatedNodes);
    treeNodes.sort((nodeA, nodeB) => nodeA.depth - nodeB.depth);
}

function canAcceptChildren(nodeCandidate) {
    return !nodeCandidate.isTerminalNode && !(nodeCandidate.left && nodeCandidate.right);
}

function attemptNodeInsertion(targetLevel) {
    const suitableAncestor = treeNodes.find(canAcceptChildren);

    if (suitableAncestor) {
        extendBranchToDepth(suitableAncestor, targetLevel);
        return true;
    }
    return false;
}

function initializeRootNode() {
    const rootNode = new TreeNode(0, false);
    treeNodes.push(rootNode);
}

function executeTreeConstruction(inputData) {
    const inputDataLines = inputData.split("\n");
    const firstInputLine = inputDataLines[0];
    const secondInputLine = inputDataLines[1];

    const maxTreeLevel = parseInt(firstInputLine, 10);
    const nodesPerLevelCounts = secondInputLine.split(" ").map(valStr => parseInt(valStr, 10));

    if (nodesPerLevelCounts[0] !== 0) {
        console.log(-1);
        return;
    }

    initializeRootNode();

    for (let currentLevelIndex = 1; currentLevelIndex <= maxTreeLevel; currentLevelIndex++) {
        const requiredNodesAtThisLevel = nodesPerLevelCounts[currentLevelIndex];
        for (let nodeCount = 0; nodeCount < requiredNodesAtThisLevel; nodeCount++) {
            const insertionResult = attemptNodeInsertion(currentLevelIndex);
            if (!insertionResult) {
                console.log(-1);
                return;
            }
        }
    }

    console.log(treeNodes.length);
}

executeTreeConstruction(require("fs").readFileSync("/dev/stdin", "utf8"));
