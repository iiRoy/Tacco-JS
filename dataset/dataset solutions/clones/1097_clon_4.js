process.stdin.resume();
process.stdin.setEncoding("utf8");
let receivedContent = "";
process.stdin.on("data", function(dataChunk) {
    receivedContent += dataChunk;
});
process.stdin.on("end", function() {
    processCommands(receivedContent.split("\n"));
});

class NodeBlueprint {
    constructor(val, leftBranch = null, rightBranch = null) {
        this.val = val;
        this.leftBranch = leftBranch;
        this.rightBranch = rightBranch;
    }
}

function addValue(currentRoot, valueToInsert) {
    if (currentRoot === null) {
        return new NodeBlueprint(valueToInsert);
    }

    if (valueToInsert < currentRoot.val) {
        return new NodeBlueprint(
            currentRoot.val,
            addValue(currentRoot.leftBranch, valueToInsert),
            currentRoot.rightBranch
        );
    } else {
        return new NodeBlueprint(
            currentRoot.val,
            currentRoot.leftBranch,
            addValue(currentRoot.rightBranch, valueToInsert)
        );
    }
}

function collectInOrder(nodeToVisit) {
    if (nodeToVisit === null) {
        return [];
    }
    return [
        ...collectInOrder(nodeToVisit.leftBranch),
        nodeToVisit.val,
        ...collectInOrder(nodeToVisit.rightBranch)
    ];
}

function collectPreOrder(nodeToVisit) {
    if (nodeToVisit === null) {
        return [];
    }
    return [
        nodeToVisit.val,
        ...collectPreOrder(nodeToVisit.leftBranch),
        ...collectPreOrder(nodeToVisit.rightBranch)
    ];
}

function processCommands(inputRecords) {
    inputRecords.slice(1).reduce((currentTree, commandLine) => {
        if (!commandLine.trim()) {
            return currentTree;
        }
        const parts = commandLine.split(" ");
        const actionType = parts[0][0];

        if (actionType === "i") {
            const numericalValue = Number(parts[1]);
            return addValue(currentTree, numericalValue);
        } else if (actionType === "p") {
            const sortedValues = collectInOrder(currentTree);
            console.log(sortedValues.join(" "));

            const prefixedValues = collectPreOrder(currentTree);
            console.log(prefixedValues.join(" "));
            
            return currentTree;
        }
        return currentTree;
    }, null);
}