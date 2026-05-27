process.stdin.resume();
process.stdin.setEncoding("utf8");
let accumulatedInput = "";
process.stdin.on("data", (segment) => {
    accumulatedInput += segment;
});
process.stdin.on("end", () => {
    processCommands(accumulatedInput.split("\n"));
});

class TreeNode {
    constructor(val) {
        this.val = val;
        this.leftNode = null;
        this.rightNode = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.rootNode = null;
    }

    addValue(value) {
        const newNode = new TreeNode(value);
        if (!this.rootNode) {
            this.rootNode = newNode;
            return;
        }

        let current = this.rootNode;
        while (true) {
            if (value < current.val) {
                if (!current.leftNode) {
                    current.leftNode = newNode;
                    return;
                }
                current = current.leftNode;
            } else {
                if (!current.rightNode) {
                    current.rightNode = newNode;
                    return;
                }
                current = current.rightNode;
            }
        }
    }

    retrieveInOrder() {
        const result = [];
        const stack = [];
        let current = this.rootNode;

        while (current || stack.length > 0) {
            while (current) {
                stack.push(current);
                current = current.leftNode;
            }
            current = stack.pop();
            result.push(current.val);
            current = current.rightNode;
        }
        return result;
    }

    retrievePreOrder() {
        const result = [];
        if (!this.rootNode) return result;

        const stack = [this.rootNode];
        while (stack.length > 0) {
            const current = stack.pop();
            result.push(current.val);

            if (current.rightNode) {
                stack.push(current.rightNode);
            }
            if (current.leftNode) {
                stack.push(current.leftNode);
            }
        }
        return result;
    }
}

function processCommands(inputLines) {
    const totalOperations = Number(inputLines[0]);
    const treeInstance = new BinarySearchTree();

    const commandHandlers = {
        "i": (params) => {
            const numericValue = Number(params[0]);
            treeInstance.addValue(numericValue);
        },
        "p": () => {
            console.log(treeInstance.retrieveInOrder().join(" "));
            console.log(treeInstance.retrievePreOrder().join(" "));
        }
    };

    inputLines.slice(1, totalOperations + 1).forEach(lineEntry => {
        const parts = lineEntry.split(" ");
        const operationType = parts[0][0];
        const operationParams = parts.slice(1);

        if (commandHandlers[operationType]) {
            commandHandlers[operationType](operationParams);
        }
    });
}
