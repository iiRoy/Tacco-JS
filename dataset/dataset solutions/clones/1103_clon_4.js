function NodeUnit(val) {
    this.val = val;
    this.left = null;
    this.right = null;
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    addNode(val) {
        const freshNode = new NodeUnit(val);
        if (this.root === null) {
            this.root = freshNode;
            return;
        }

        let current = this.root;
        while (true) {
            if (val < current.val) {
                if (current.left === null) {
                    current.left = freshNode;
                    return;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = freshNode;
                    return;
                }
                current = current.right;
            }
        }
    }

    locateNode(val) {
        let current = this.root;
        while (current !== null) {
            if (val === current.val) {
                return current;
            } else if (val < current.val) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null;
    }

    traverseInOrder() {
        const collectedValues = [];
        const traversalStack = [];
        let current = this.root;

        while (current !== null || traversalStack.length > 0) {
            while (current !== null) {
                traversalStack.push(current);
                current = current.left;
            }
            current = traversalStack.pop();
            collectedValues.push(current.val);
            current = current.right;
        }
        return collectedValues;
    }

    traversePreOrder() {
        const collectedValues = [];
        if (this.root === null) {
            return collectedValues;
        }

        const traversalStack = [this.root];
        while (traversalStack.length > 0) {
            const current = traversalStack.pop();
            collectedValues.push(current.val);

            if (current.right !== null) {
                traversalStack.push(current.right);
            }
            if (current.left !== null) {
                traversalStack.push(current.left);
            }
        }
        return collectedValues;
    }
}

process.stdin.resume();
process.stdin.setEncoding("utf8");
let inputBuffer = "";
process.stdin.on("data", function(chunk) {inputBuffer += chunk;});
process.stdin.on("end", function() {main(inputBuffer.split("\n"));});

function main(inputLines) {
    const totalOps = Number(inputLines[0]);
    const treeStructure = new BinarySearchTree();

    const commandHandlers = {
        'i': (params) => {
            const numericValue = Number(params[1]);
            treeStructure.addNode(numericValue);
        },
        'p': () => {
            const inOrderValues = treeStructure.traverseInOrder();
            console.log(inOrderValues.map(v => ` ${v}`).join(""));
            const preOrderValues = treeStructure.traversePreOrder();
            console.log(preOrderValues.map(v => ` ${v}`).join(""));
        },
        'f': (params) => {
            const numericValue = Number(params[1]);
            if (treeStructure.locateNode(numericValue) !== null) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }
    };

    for (let k = 0; k < totalOps; k++) {
        const currentLine = inputLines[k + 1].split(" ");
        const operationKey = currentLine[0][0];
        const handler = commandHandlers[operationKey];
        if (handler) {
            handler(currentLine);
        }
    }
}
