const makeNode = (itemValue, ancestorRef = null, lowerBranch = null, higherBranch = null) => ({
  itemValue,
  ancestorRef,
  lowerBranch,
  higherBranch,
});

const isChildOnLeft = (nodeRef) => {
  if (!nodeRef || !nodeRef.ancestorRef) return null;
  return nodeRef.ancestorRef.lowerBranch === nodeRef;
};

const getChildSide = (nodeRef) => {
  if (!nodeRef || !nodeRef.ancestorRef) return null;
  return isChildOnLeft(nodeRef) ? 'lowerBranch' : 'higherBranch';
};

const findInorderSuccessor = (nodeRef) => {
  if (!nodeRef || !nodeRef.higherBranch) return null;
  let current = nodeRef.higherBranch;
  while (current.lowerBranch) {
    current = current.lowerBranch;
  }
  return current;
};

const createSearchTree = () => {
  let treeRoot = null;

  const addValueRecursive = (current, itemValue, parent = null) => {
    if (!current) {
      return makeNode(itemValue, parent);
    }
    if (itemValue < current.itemValue) {
      current.lowerBranch = addValueRecursive(current.lowerBranch, itemValue, current);
    } else {
      current.higherBranch = addValueRecursive(current.higherBranch, itemValue, current);
    }
    return current;
  };

  const addValue = (itemValue) => {
    if (!treeRoot) {
      treeRoot = makeNode(itemValue);
    } else {
      addValueRecursive(treeRoot, itemValue);
    }
  };

  const locateValue = (itemValue) => {
    let current = treeRoot;
    while (current) {
      if (itemValue === current.itemValue) {
        return current;
      }
      current = (itemValue < current.itemValue) ? current.lowerBranch : current.higherBranch;
    }
    return null;
  };

  const removeValue = (itemValue) => {
    let targetNode = locateValue(itemValue);
    if (!targetNode) return;

    const replaceNodeInParent = (nodeToReplace, newNode) => {
      if (!nodeToReplace.ancestorRef) {
        treeRoot = newNode;
        if (newNode) newNode.ancestorRef = null;
      } else {
        const parentLink = getChildSide(nodeToReplace);
        nodeToReplace.ancestorRef[parentLink] = newNode;
        if (newNode) newNode.ancestorRef = nodeToReplace.ancestorRef;
      }
    };

    const hasLeftChild = !!targetNode.lowerBranch;
    const hasRightChild = !!targetNode.higherBranch;

    if (!hasLeftChild && !hasRightChild) {
      replaceNodeInParent(targetNode, null);
    } else if (hasLeftChild && !hasRightChild) {
      replaceNodeInParent(targetNode, targetNode.lowerBranch);
    } else if (!hasLeftChild && hasRightChild) {
      replaceNodeInParent(targetNode, targetNode.higherBranch);
    } else {
      const successor = findInorderSuccessor(targetNode);
      
      replaceNodeInParent(successor, successor.higherBranch);

      successor.lowerBranch = targetNode.lowerBranch;
      if (targetNode.lowerBranch) targetNode.lowerBranch.ancestorRef = successor;
      
      successor.higherBranch = targetNode.higherBranch;
      if (targetNode.higherBranch) targetNode.higherBranch.ancestorRef = successor;

      replaceNodeInParent(targetNode, successor);
    }
  };

  const displayInOrder = () => {
    const result = [];
    const nodeStack = [];
    let current = treeRoot;

    while (current || nodeStack.length > 0) {
      while (current) {
        nodeStack.push(current);
        current = current.lowerBranch;
      }
      current = nodeStack.pop();
      result.push(` ${current.itemValue}`);
      current = current.higherBranch;
    }
    console.log(result.join(''));
  };

  const displayPreOrder = () => {
    const result = [];
    if (!treeRoot) {
      console.log('');
      return;
    }
    const nodeStack = [treeRoot];

    while (nodeStack.length > 0) {
      const current = nodeStack.pop();
      result.push(` ${current.itemValue}`);

      if (current.higherBranch) {
        nodeStack.push(current.higherBranch);
      }
      if (current.lowerBranch) {
        nodeStack.push(current.lowerBranch);
      }
    }
    console.log(result.join(''));
  };

  const showAll = () => {
    displayInOrder();
    displayPreOrder();
  };

  return {
    addValue,
    locateValue,
    removeValue,
    showAll,
  };
};

(function processCommands() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const commandCount = Number(inputLines.shift());

  const myTree = createSearchTree();

  inputLines.forEach(function(commandLine) {
    const firstChar = commandLine.charAt(0);
    const value = Number(commandLine.split(' ')[1]);

    switch (firstChar) {
      case 'i': myTree.addValue(value); break;
      case 'f': console.log(myTree.locateValue(value) ? 'yes' : 'no'); break;
      case 'd': myTree.removeValue(value); break;
      default: myTree.showAll(); break;
    }
  });
})();
