"use strict";

const processInput = rawInputString => {
    const lines = rawInputString.trim().split("\n");

    const parseNumbers = lineContent => lineContent.split(" ").map(Number);

    const firstLineData = parseNumbers(lines[0]);
    const nodeCount = firstLineData[0];
    const queryCount = firstLineData[1];

    const connectionStrings = lines.slice(1, nodeCount);
    const updateStrings = lines.slice(nodeCount, nodeCount + 1 + queryCount);

    const graphNodes = Array.from({ length: nodeCount }, (_, k) => new GraphNode(k + 1));

    for (let k = 0; k < nodeCount - 1; k++) {
        const connectionPair = parseNumbers(connectionStrings[k]);
        const parentId = connectionPair[0];
        const childId = connectionPair[1];
        const parentNodeRef = graphNodes[parentId - 1];
        const childNodeRef = graphNodes[childId - 1];
        parentNodeRef.addChild(childNodeRef);
    }

    for (let k = 0; k < queryCount; k++) {
        const updatePair = parseNumbers(updateStrings[k]);
        const targetNodeId = updatePair[0];
        const pointsValue = updatePair[1];
        const targetNodeRef = graphNodes[targetNodeId - 1];
        targetNodeRef.addScore(pointsValue);
    }

    for (let k = 0; k < nodeCount; k++) {
        graphNodes[k].propagateScoreToChildren();
    }

    const finalScores = [];
    for (let k = 0; k < nodeCount; k++) {
        finalScores.push(graphNodes[k].currentScore);
    }

    console.log(finalScores.join(" "));
};

class GraphNode {
    constructor(identifier) {
        this.identifier = identifier;
        this.parentNode = null;
        this.directChildren = [];
        this.currentScore = 0;
    }

    addChild(childNodeRef) {
        this.directChildren.push(childNodeRef);
        childNodeRef.parentNode = this;
    }

    addScore(scoreValue) {
        this.currentScore += +scoreValue;
    }

    propagateScoreToChildren() {
        const scoreToPropagate = this.currentScore;
        for (const childNodeRef of this.directChildren) {
            childNodeRef.addScore(scoreToPropagate);
        }
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
