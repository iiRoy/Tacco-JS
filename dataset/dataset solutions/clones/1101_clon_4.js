const configuration = { input: '/dev/stdin', newline: '\n' };

class StructureOfKeys {
    constructor() {
        this.rootIndex = null;
        this.nodes = [];
        this.existenceTracker = new Set();
    }

    addValue(val) {
        this.existenceTracker.add(val);

        const newNodeIndex = this.nodes.length;
        this.nodes.push({ key: val, left: null, right: null });

        if (this.rootIndex === null) {
            this.rootIndex = newNodeIndex;
            return;
        }

        const _recursivePlacement = (currentIndex, newIndex) => {
            const currentNode = this.nodes[currentIndex];
            const newNode = this.nodes[newIndex];

            if (newNode.key < currentNode.key) {
                if (currentNode.left === null) {
                    currentNode.left = newIndex;
                } else {
                    _recursivePlacement(currentNode.left, newIndex);
                }
            } else {
                if (currentNode.right === null) {
                    currentNode.right = newIndex;
                } else {
                    _recursivePlacement(currentNode.right, newIndex);
                }
            }
        };

        _recursivePlacement(this.rootIndex, newNodeIndex);
    }

    checkExistence(val) {
        return this.existenceTracker.has(val);
    }

    displayStructure() {
        const _renderNode = (currentIndex, depth) => {
            const indentation = '  '.repeat(depth);
            if (currentIndex === null) {
                console.log(indentation + 'NIL');
                return;
            }
            const currentNode = this.nodes[currentIndex];
            console.log(indentation + currentNode.key);
            _renderNode(currentNode.left, depth + 1);
            _renderNode(currentNode.right, depth + 1);
        };
        _renderNode(this.rootIndex, 0);
    }

    outputSequences() {
        const _getInorderSequence = () => {
            const resultList = [];
            const processingStack = [];
            let currentPointer = this.rootIndex;

            while (currentPointer !== null || processingStack.length > 0) {
                while (currentPointer !== null) {
                    processingStack.push(currentPointer);
                    currentPointer = this.nodes[currentPointer].left;
                }
                currentPointer = processingStack.pop();
                resultList.push(this.nodes[currentPointer].key);
                currentPointer = this.nodes[currentPointer].right;
            }
            return resultList;
        };

        const _getPreorderSequence = () => {
            const resultList = [];
            if (this.rootIndex === null) return resultList;

            const processingStack = [this.rootIndex];

            while (processingStack.length > 0) {
                const currentPointer = processingStack.pop();
                resultList.push(this.nodes[currentPointer].key);

                const currentNode = this.nodes[currentPointer];
                if (currentNode.right !== null) {
                    processingStack.push(currentNode.right);
                }
                if (currentNode.left !== null) {
                    processingStack.push(currentNode.left);
                }
            }
            return resultList;
        };

        console.log(' ' + _getInorderSequence().join(' '));
        console.log(' ' + _getPreorderSequence().join(' '));
    }
}

const fileStream = require('fs').createReadStream(configuration.input, {encoding: 'ascii'});
const lineReader = require('readline').createInterface({
  input: fileStream, output: process.stdout});

const keyStructure = new StructureOfKeys();

lineReader.on('line', function (inputLine) {
  const instructionParts = inputLine.split(' ');
  if (instructionParts[0] === 'insert') {
    keyStructure.addValue(parseInt(instructionParts[1], 10));
  } else if (instructionParts[0] === 'find') {
    console.log(keyStructure.checkExistence(parseInt(instructionParts[1], 10)) ? 'yes' : 'no');
  } else if (instructionParts[0] === 'print') {
    //keyStructure.displayStructure();
    keyStructure.outputSequences();
  }
});
