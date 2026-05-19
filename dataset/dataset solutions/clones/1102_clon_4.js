process.stdin.resume();
process.stdin.setEncoding("utf8");
let accumulatedInput = "";
process.stdin.on("data", function(chunk) {
    accumulatedInput += chunk;
});
process.stdin.on("end", function() {
    processCommands(accumulatedInput.split("\n"));
});

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    addValue(val) {
        const newNode = new TreeNode(val);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        let currentPosition = this.root;
        while (true) {
            if (val < currentPosition.value) {
                if (!currentPosition.left) {
                    currentPosition.left = newNode;
                    return;
                }
                currentPosition = currentPosition.left;
            } else {
                if (!currentPosition.right) {
                    currentPosition.right = newNode;
                    return;
                }
                currentPosition = currentPosition.right;
            }
        }
    }

    findValue(val) {
        let currentPosition = this.root;
        while (currentPosition) {
            if (val === currentPosition.value) {
                return currentPosition;
            }
            if (val < currentPosition.value) {
                currentPosition = currentPosition.left;
            } else {
                currentPosition = currentPosition.right;
            }
        }
        return null;
    }

    *generateInOrder(node = this.root) {
        if (node) {
            yield* this.generateInOrder(node.left);
            yield node.value;
            yield* this.generateInOrder(node.right);
        }
    }

    *generatePreOrder(node = this.root) {
        if (node) {
            yield node.value;
            yield* this.generatePreOrder(node.left);
            yield* this.generatePreOrder(node.right);
        }
    }

    produceFormattedOutput(iterator) {
        const collectedValues = Array.from(iterator);
        return collectedValues.map(v => ` ${v}`).join("");
    }
}

function processCommands(inputLines) {
    const totalOperations = Number(inputLines[0]);
    const bstInstance = new BinarySearchTree();

    const operationDispatch = new Map([
        ["i", (params) => {
            const numericValue = Number(params[0]);
            bstInstance.addValue(numericValue);
        }],
        ["p", () => {
            console.log(bstInstance.produceFormattedOutput(bstInstance.generateInOrder()));
            console.log(bstInstance.produceFormattedOutput(bstInstance.generatePreOrder()));
        }],
        ["f", (params) => {
            const numericValue = Number(params[0]);
            if (bstInstance.findValue(numericValue) !== null) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }]
    ]);

    for (let i = 0; i < totalOperations; i++) {
        const currentCommandLine = inputLines[i + 1].split(" ");
        const commandType = currentCommandLine[0];
        const commandArgs = currentCommandLine.slice(1);

        const handler = operationDispatch.get(commandType);
        if (handler) {
            handler(commandArgs);
        }
    }
}
