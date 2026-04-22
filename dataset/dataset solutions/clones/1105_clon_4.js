function createVertex(val, branchA = null, branchB = null) {
  return {
    label: val,
    leftBranch: branchA,
    rightBranch: branchB
  };
}

let primaryStructure = null; 

function placeElement(val) {
  function recurseInsert(currentBranch) {
    if (!currentBranch) {
      return createVertex(val);
    }
    if (val < currentBranch.label) {
      currentBranch.leftBranch = recurseInsert(currentBranch.leftBranch);
    } else {
      currentBranch.rightBranch = recurseInsert(currentBranch.rightBranch);
    }
    return currentBranch;
  }
  primaryStructure = recurseInsert(primaryStructure);
}

function locateElement(val) {
  function recurseSearch(currentBranch) {
    if (!currentBranch || currentBranch.label === val) {
      return currentBranch;
    }
    if (val < currentBranch.label) {
      return recurseSearch(currentBranch.leftBranch);
    } else {
      return recurseSearch(currentBranch.rightBranch);
    }
  }
  return recurseSearch(primaryStructure);
}

function findMinVertex(branch) {
  if (!branch) return null;
  while (branch.leftBranch) {
    branch = branch.leftBranch;
  }
  return branch;
}

function removeElement(val) {
  function recurseDelete(currentBranch, targetVal) {
    if (!currentBranch) {
      return null;
    }
    if (targetVal < currentBranch.label) {
      currentBranch.leftBranch = recurseDelete(currentBranch.leftBranch, targetVal);
    } else if (targetVal > currentBranch.label) {
      currentBranch.rightBranch = recurseDelete(currentBranch.rightBranch, targetVal);
    } else { 
      if (!currentBranch.leftBranch) {
        return currentBranch.rightBranch;
      }
      if (!currentBranch.rightBranch) {
        return currentBranch.leftBranch;
      }

      const tempVertex = findMinVertex(currentBranch.rightBranch);
      currentBranch.label = tempVertex.label;
      currentBranch.rightBranch = recurseDelete(currentBranch.rightBranch, tempVertex.label);
    }
    return currentBranch;
  }
  primaryStructure = recurseDelete(primaryStructure, val);
}

function collectInOrder(branch, list) {
  if (!branch) return;
  collectInOrder(branch.leftBranch, list);
  list.push(branch.label);
  collectInOrder(branch.rightBranch, list);
}

function collectPreOrder(branch, list) {
  if (!branch) return;
  list.push(branch.label);
  collectPreOrder(branch.leftBranch, list);
  collectPreOrder(branch.rightBranch, list);
}

function outputResult() {
  const inOrderVals = [];
  collectInOrder(primaryStructure, inOrderVals);
  console.log(inOrderVals.join(' '));

  const preOrderVals = [];
  collectPreOrder(primaryStructure, preOrderVals);
  console.log(preOrderVals.join(' '));
}

(function processInput() {
  const readSource = require('fs').readFileSync;
  const sourceText = readSource('/dev/stdin', 'utf8');
  const lineFragments = sourceText.trim().split('\n');
  const totalOps = Number(lineFragments.shift()); 

  const dataset = []; 
  lineFragments.forEach(function(instruction) {
    dataset.push(instruction);
  });

  dataset.forEach(function(instruction) {
    const actionChar = instruction.charAt(0);
    let valuePart;
    if (instruction.length > 1) { 
      valuePart = Number(instruction.split(' ')[1]);
    }

    switch (actionChar) {
      case 'i':
        placeElement(valuePart);
        break;
      case 'f':
        console.log(locateElement(valuePart) ? 'yes' : 'no');
        break;
      case 'd':
        removeElement(valuePart);
        break;
      default: 
        outputResult();
        break;
    }
  });
})();