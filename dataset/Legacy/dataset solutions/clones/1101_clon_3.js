const appConfig = { input: '/dev/stdin', newline: '\n' };

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.treeRoot = null;
        this.nodeExistenceMap = {};
    }

    static createNewNode(nodeValue) {
        return new TreeNode(nodeValue);
    }

    addNode(nodeValue) {
        const newNode = BinarySearchTree.createNewNode(nodeValue);
        this.nodeExistenceMap[nodeValue] = true;

        let parentNode = null;
        let currentNode = this.treeRoot;

        while (currentNode !== null) {
            parentNode = currentNode;
            if (newNode.value < currentNode.value) {
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }
        }

        newNode.parent = parentNode;

        if (parentNode === null) {
            this.treeRoot = newNode;
        } else if (newNode.value < parentNode.value) {
            parentNode.left = newNode;
        } else {
            parentNode.right = newNode;
        }
    }

    checkExistence(nodeValue) {
        return Object.prototype.hasOwnProperty.call(this.nodeExistenceMap, nodeValue);
    }

    displayStructure() {
        const recursiveDisplay = (currentDisplayNode, currentDepth) => {
            let indentationString = '';
            const indentUnit = '  ';
            for (let loopCounter = 0; loopCounter < currentDepth; loopCounter++) {
                indentationString += indentUnit;
            }

            if (currentDisplayNode === null) {
                console.log(indentationString + 'NIL');
                return;
            }
            console.log(indentationString + currentDisplayNode.value);
            recursiveDisplay(currentDisplayNode.left, currentDepth + 1);
            recursiveDisplay(currentDisplayNode.right, currentDepth + 1);
        };
        recursiveDisplay(this.treeRoot, 0);
    }

    outputTraversals() {
        const performInorderTraversal = (node) => {
            let resultArray = [];
            if (node === null) {
                return resultArray;
            }
            resultArray = resultArray.concat(performInorderTraversal(node.left));
            resultArray.push(node.value);
            resultArray = resultArray.concat(performInorderTraversal(node.right));
            return resultArray;
        };

        const performPreorderTraversal = (node) => {
            let resultArray = [];
            if (node === null) {
                return resultArray;
            }
            resultArray.push(node.value);
            resultArray = resultArray.concat(performPreorderTraversal(node.left));
            resultArray = resultArray.concat(performPreorderTraversal(node.right));
            return resultArray;
        };

        const spaceSeparator = ' ';
        console.log(spaceSeparator + performInorderTraversal(this.treeRoot).join(spaceSeparator));
        console.log(spaceSeparator + performPreorderTraversal(this.treeRoot).join(spaceSeparator));
    }
}

(function() {
    const inputStream = require('fs').createReadStream(appConfig.input, { encoding: 'ascii' });
    const lineReader = require('readline').createInterface({
        input: inputStream,
        output: process.stdout
    });

    const bstInstance = new BinarySearchTree();
    const decimalRadix = 10;

    const parseCommandArgument = (argString) => {
        return parseInt(argString, decimalRadix);
    };

    lineReader.on('line', (line) => {
        const commandParts = line.split(' ');
        const commandType = commandParts[0];
        const commandArg = commandParts[1];

        switch (commandType) {
            case 'insert':
                bstInstance.addNode(parseCommandArgument(commandArg));
                break;
            case 'find':
                const foundStatus = bstInstance.checkExistence(parseCommandArgument(commandArg));
                console.log(foundStatus ? 'yes' : 'no');
                break;
            case 'print':
                // bstInstance.displayStructure();
                // bstInstance.outputTraversals();
                break;
        }
    });
})();
