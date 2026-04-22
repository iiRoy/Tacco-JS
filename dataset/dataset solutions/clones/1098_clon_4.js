function createNodeElement(contentValue, minorChild = null, majorChild = null) {
  return {
    content: contentValue,
    minor: minorChild,
    major: majorChild
  };
}

function createDataVault() {
  let basis = null;

  function placeElementRecursive(currentBranch, contentValue) {
    if (currentBranch === null) {
      return createNodeElement(contentValue);
    }

    if (contentValue < currentBranch.content) {
      currentBranch.minor = placeElementRecursive(currentBranch.minor, contentValue);
    } else if (contentValue > currentBranch.content) {
      currentBranch.major = placeElementRecursive(currentBranch.major, contentValue);
    }
    return currentBranch;
  }

  function addEntry(contentValue) {
    basis = placeElementRecursive(basis, contentValue);
  }

  function showSortedTraversal() {
    let outputBuffer = '';
    let nodeStack = [];
    let currentPoint = basis;

    while (currentPoint !== null || nodeStack.length > 0) {
      while (currentPoint !== null) {
        nodeStack.push(currentPoint);
        currentPoint = currentPoint.minor;
      }
      currentPoint = nodeStack.pop();
      outputBuffer += ` ${currentPoint.content}`;
      currentPoint = currentPoint.major;
    }
    console.log(outputBuffer);
  }

  function showPreOrderedTraversal() {
    let outputBuffer = '';
    if (basis === null) {
      console.log(outputBuffer);
      return;
    }

    let nodeStack = [];
    nodeStack.push(basis);

    while (nodeStack.length > 0) {
      let currentPoint = nodeStack.pop();
      outputBuffer += ` ${currentPoint.content}`;

      if (currentPoint.major !== null) {
        nodeStack.push(currentPoint.major);
      }
      if (currentPoint.minor !== null) {
        nodeStack.push(currentPoint.minor);
      }
    }
    console.log(outputBuffer);
  }

  function displayAll() {
    showSortedTraversal();
    showPreOrderedTraversal();
  }

  return {
    addEntry: addEntry,
    displayAll: displayAll
  };
}

(function executeCore() {
  const fileSystem = require('fs');
  const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const recordCount = Number(inputLines.shift());

  const structure = createDataVault();
  inputLines.forEach(function(directive) {
    const firstChar = directive.charAt(0);
    if (firstChar === 'i') {
      const parts = directive.split(' ');
      structure.addEntry(Number(parts[1]));
    } else {
      structure.displayAll();
    }
  });
})();