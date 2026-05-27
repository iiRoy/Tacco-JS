class TreeNode {
    constructor(val) {
        this.value = val;
        this.leftBranch = null;
        this.rightBranch = null;
        this.ancestor = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.rootNode = null;
    }

    addValue(val) {
        const newNode = new TreeNode(val);
        if (!this.rootNode) {
            this.rootNode = newNode;
            return;
        }

        const _recursivePlacement = (current, nodeToInsert) => {
            if (nodeToInsert.value < current.value) {
                if (current.leftBranch === null) {
                    current.leftBranch = nodeToInsert;
                    nodeToInsert.ancestor = current;
                } else {
                    _recursivePlacement(current.leftBranch, nodeToInsert);
                }
            } else {
                if (current.rightBranch === null) {
                    current.rightBranch = nodeToInsert;
                    nodeToInsert.ancestor = current;
                } else {
                    _recursivePlacement(current.rightBranch, nodeToInsert);
                }
            }
        };

        _recursivePlacement(this.rootNode, newNode);
    }

    displayStructure() {
        const traversalStack = [];
        if (this.rootNode) {
            traversalStack.push({ node: this.rootNode, depth: 0 });
        } else {
            console.log('NIL');
            return;
        }

        while (traversalStack.length > 0) {
            const { node: currentElement, depth: currentLevel } = traversalStack.pop();

            const indentation = '  '.repeat(currentLevel);
            console.log(indentation + currentElement.value);

            if (currentElement.rightBranch) {
                traversalStack.push({ node: currentElement.rightBranch, depth: currentLevel + 1 });
            } else {
                traversalStack.push({ node: null, depth: currentLevel + 1 });
            }
            if (currentElement.leftBranch) {
                traversalStack.push({ node: currentElement.leftBranch, depth: currentLevel + 1 });
            } else {
                traversalStack.push({ node: null, depth: currentLevel + 1 });
            }
        }
    }

    * generateInOrder() {
        const stack = [];
        let current = this.rootNode;
        while (current || stack.length > 0) {
            while (current) {
                stack.push(current);
                current = current.leftBranch;
            }
            current = stack.pop();
            yield current.value;
            current = current.rightBranch;
        }
    }

    * generatePreOrder() {
        if (!this.rootNode) return;
        const stack = [this.rootNode];
        while (stack.length > 0) {
            const current = stack.pop();
            yield current.value;
            if (current.rightBranch) stack.push(current.rightBranch);
            if (current.leftBranch) stack.push(current.leftBranch);
        }
    }

    outputTraversals() {
        const inOrderResult = Array.from(this.generateInOrder());
        const preOrderResult = Array.from(this.generatePreOrder());

        console.log(' ' + inOrderResult.join(' '));
        console.log(' ' + preOrderResult.join(' '));
    }
}

const configuration = { inputSource: '/dev/stdin', lineSeparator: '\n' };

const fileStream = require('fs').createReadStream(configuration.inputSource, 'r');
const lineProcessor = require('readline').createInterface({
  input: fileStream, output: process.stdout
});

const dataStructure = new BinarySearchTree();

lineProcessor.on('line', function (inputLine) {
  const commandParts = inputLine.split(' ');
  if (commandParts[0] === 'insert') {
    dataStructure.addValue(parseInt(commandParts[1], 10));
  } else if (commandParts[0] === 'print') {
    //dataStructure.displayStructure();
    dataStructure.outputTraversals();
  }
});
