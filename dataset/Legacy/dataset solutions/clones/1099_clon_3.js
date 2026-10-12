const ioConfig = { inputSource: '/dev/stdin', newlineChar: '\n' };

const createBSTNode = (valueForKey) => ({
  left: null,
  right: null,
  key: valueForKey,
  parent: null
});

function BinarySearchTree() {
  this.treeRoot = null;
}

BinarySearchTree.prototype.insertNode = function (nodeValueToInsert) {
  const newNodeObject = createBSTNode(nodeValueToInsert);
  let parentOfNewNode = null;
  let currentNodePointer = this.treeRoot;

  while (currentNodePointer !== null) {
    parentOfNewNode = currentNodePointer;
    if (newNodeObject.key < currentNodePointer.key) {
      currentNodePointer = currentNodePointer.left;
    } else {
      currentNodePointer = currentNodePointer.right;
    }
  }

  newNodeObject.parent = parentOfNewNode;

  if (parentOfNewNode === null) {
    this.treeRoot = newNodeObject;
  } else {
    const isKeyLessThanParent = newNodeObject.key < parentOfNewNode.key;
    if (isKeyLessThanParent) {
      parentOfNewNode.left = newNodeObject;
    } else {
      parentOfNewNode.right = newNodeObject;
    }
  }
};

BinarySearchTree.prototype.visualizeTree = function() {
  const recursivePrint = (currentTreeNode, currentDepth) => {
    const indentationString = '  '.repeat(currentDepth);

    if (currentTreeNode === null) {
      console.log(indentationString + 'NIL');
      return;
    }

    console.log(indentationString + currentTreeNode.key);
    recursivePrint(currentTreeNode.left, currentDepth + 1);
    recursivePrint(currentTreeNode.right, currentDepth + 1);
  };
  recursivePrint(this.treeRoot, 0);
};

BinarySearchTree.prototype.displayTraversals = function() {
  const getInorderTraversalKeys = (currentTraversalNode) => {
    if (currentTraversalNode === null) {
      return [];
    }
    return [
      ...getInorderTraversalKeys(currentTraversalNode.left),
      currentTraversalNode.key,
      ...getInorderTraversalKeys(currentTraversalNode.right)
    ];
  };

  const getPreorderTraversalKeys = (currentTraversalNode) => {
    if (currentTraversalNode === null) {
      return [];
    }
    return [
      currentTraversalNode.key,
      ...getPreorderTraversalKeys(currentTraversalNode.left),
      ...getPreorderTraversalKeys(currentTraversalNode.right)
    ];
  };

  const formatOutputString = (keysArray) => ' ' + keysArray.join(' ');

  const inorderKeys = getInorderTraversalKeys(this.treeRoot);
  const preorderKeys = getPreorderTraversalKeys(this.treeRoot);

  console.log(formatOutputString(inorderKeys));
  console.log(formatOutputString(preorderKeys));
};

const fileStream = require('fs').createReadStream(ioConfig.inputSource, 'utf8');
const inputLineReader = require('readline').createInterface({
  input: fileStream,
  output: process.stdout
});

const myBinarySearchTree = new BinarySearchTree();

const parseIntegerSafely = (strValue) => parseInt(strValue, 10);

inputLineReader.on('line', (currentInputLine) => {
  const commandAndArgs = currentInputLine.split(' ');
  const primaryCommand = commandAndArgs[0];

  switch (primaryCommand) {
    case 'insert':
      const valueToInsert = parseIntegerSafely(commandAndArgs[1]);
      myBinarySearchTree.insertNode(valueToInsert);
      break;
    case 'print':
      //myBinarySearchTree.visualizeTree();
      myBinarySearchTree.displayTraversals();
      break;
  }
});
